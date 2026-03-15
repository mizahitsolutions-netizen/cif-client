/* =====================================================
IMPORTS
===================================================== */

const Razorpay = require("razorpay");
const crypto = require("crypto");
const admin = require("firebase-admin");
const axios = require("axios");

const {
  onCall,
  HttpsError,
  onRequest,
} = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");

/* =====================================================
INIT FIREBASE
===================================================== */

admin.initializeApp();
const db = admin.firestore();

/* =====================================================
ENV VARIABLES
===================================================== */

const RAZORPAY_KEY_ID = defineString("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = defineString("RAZORPAY_KEY_SECRET");

const SHIPROCKET_EMAIL = defineString("SHIPROCKET_EMAIL");
const SHIPROCKET_PASSWORD = defineString("SHIPROCKET_PASSWORD");

/* =====================================================
DEFAULT PACKAGE SIZE
===================================================== */

const DEFAULT_WEIGHT = 0.5;
const DEFAULT_LENGTH = 10;
const DEFAULT_BREADTH = 10;
const DEFAULT_HEIGHT = 5;

/* =====================================================
SHIPROCKET TOKEN CACHE
===================================================== */

let shiprocketToken = null;
let shiprocketExpiry = 0;

async function getShiprocketToken() {
  try {
    if (shiprocketToken && shiprocketExpiry > Date.now()) {
      return shiprocketToken;
    }

    const tokenRef = db.collection("system").doc("shiprocket");
    const snap = await tokenRef.get();

    if (snap.exists) {
      const data = snap.data();

      if (data.token && data.expiry > Date.now()) {
        shiprocketToken = data.token;
        shiprocketExpiry = data.expiry;
        return shiprocketToken;
      }
    }

    console.log("Logging into Shiprocket API...");

    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: SHIPROCKET_EMAIL.value(),
        password: SHIPROCKET_PASSWORD.value(),
      },
    );

    const token = res.data.token;

    const expiry = Date.now() + 8 * 24 * 60 * 60 * 1000;

    shiprocketToken = token;
    shiprocketExpiry = expiry;

    await tokenRef.set({
      token,
      expiry,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return token;
  } catch (err) {
    console.error("Shiprocket Login Error:", err.response?.data || err.message);
    throw new Error("Shiprocket authentication failed");
  }
}

/* =====================================================
GET SHIPPING RATES
===================================================== */

exports.getShippingRates = onCall(
  { region: "asia-south1" },
  async ({ data }) => {
    try {
      const { pincode, orderValue } = data;

      if (!pincode) {
        throw new HttpsError("invalid-argument", "Pincode required");
      }

      const token = await getShiprocketToken();

      const res = await axios.get(
        "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
        {
          params: {
            pickup_postcode: "625601",
            delivery_postcode: String(pincode),
            weight: DEFAULT_WEIGHT,
            cod: 0,
            declared_value: orderValue || 500,
            length: DEFAULT_LENGTH,
            breadth: DEFAULT_BREADTH,
            height: DEFAULT_HEIGHT,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const couriers = res.data?.data?.available_courier_companies || [];

      if (!couriers.length) {
        throw new HttpsError("failed-precondition", "No courier available");
      }

      const cheapest = couriers.reduce((prev, curr) =>
        prev.rate < curr.rate ? prev : curr,
      );

      return {
        shippingCost: cheapest.rate,
        courierName: cheapest.courier_name,
        courierId: cheapest.courier_company_id,
        estimatedDays: cheapest.estimated_delivery_days,
      };
    } catch (err) {
      console.error(
        "Shiprocket Rate Error:",
        err.response?.data || err.message,
      );
      throw new HttpsError("internal", "Unable to fetch shipping rates");
    }
  },
);

/* =====================================================
CREATE RAZORPAY ORDER
===================================================== */

exports.createRazorpayOrder = onCall(
  { region: "asia-south1" },
  async ({ data }) => {
    const { amount } = data;

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID.value(),
      key_secret: RAZORPAY_KEY_SECRET.value(),
    });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return order;
  },
);

/* =====================================================
SHIPROCKET ORDER CREATION
===================================================== */

async function createShiprocketOrder(order) {
  try {
    const token = await getShiprocketToken();
    const addr = order.address;

    const payload = {
      order_id: order.id,
      order_date: new Date().toISOString().split("T")[0],
      pickup_location: "warehouse-1",

      billing_customer_name: addr.firstName,
      billing_last_name: addr.lastName || "",
      billing_phone: addr.phone,
      billing_email: addr.email || "contact@crumbellainnovativefoods.in",
      billing_address: addr.line1,
      billing_address_2: addr.line2 || "",
      billing_city: addr.city,
      billing_pincode: String(addr.pincode),
      billing_state: addr.state,
      billing_country: "India",

      shipping_is_billing: true,

      order_items: order.items.map((item) => ({
        name: item.name,
        sku: String(item.id),
        units: item.qty,
        selling_price: item.price,
      })),

      payment_method: "Prepaid",
      sub_total: order.total,

      length: DEFAULT_LENGTH,
      breadth: DEFAULT_BREADTH,
      height: DEFAULT_HEIGHT,
      weight: DEFAULT_WEIGHT,
    };

    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Shiprocket Order:", res.data);

    return res.data;
  } catch (err) {
    console.error("Shiprocket Error:", err.response?.data || err.message);
    throw err;
  }
}

/* =====================================================
ASSIGN COURIER
===================================================== */

async function assignCourier(shipmentId) {
  try {
    const token = await getShiprocketToken();

    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
      {
        shipment_id: shipmentId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("ASSIGN COURIER RESPONSE:", res.data);

    return res.data;
  } catch (err) {
    console.error("ASSIGN COURIER ERROR:", err.response?.data || err.message);
    throw err;
  }
}

/* =====================================================
GENERATE LABEL
===================================================== */

async function generateLabel(shipmentId) {
  const token = await getShiprocketToken();

  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/courier/generate/label",
    { shipment_id: [shipmentId] },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return res.data;
}

/* =====================================================
GENERATE INVOICE
===================================================== */

async function generateInvoice(orderId) {
  try {
    const token = await getShiprocketToken();

    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/print/invoice",
      {
        ids: [orderId], // Shiprocket order_id
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.data;
  } catch (err) {
    console.error(
      "Shiprocket Invoice Error:",
      err.response?.data || err.message,
    );
    throw err;
  }
}

/* =====================================================
SCHEDULE PICKUP
===================================================== */

async function schedulePickup(shipmentId) {
  try {
    const token = await getShiprocketToken();

    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup",
      {
        shipment_id: [shipmentId],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("PICKUP RESPONSE:", res.data);

    return res.data;
  } catch (err) {
    console.error("PICKUP ERROR:", err.response?.data || err.message);
    throw err;
  }
}

/* =====================================================
VERIFY RAZORPAY PAYMENT + SHIP ORDER
===================================================== */

exports.verifyRazorpayPayment = onCall(
  { region: "asia-south1" },
  async ({ data }) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
      data;

    console.log("OrderID:", razorpayOrderId);
    console.log("PaymentID:", razorpayPaymentId);
    console.log("Signature:", razorpaySignature);

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature = crypto
      .createHmac("sha256", String(RAZORPAY_KEY_SECRET.value()))
      .update(body)
      .digest("hex");

    console.log("Generated Signature:", expectedSignature);

    if (expectedSignature !== razorpaySignature) {
      console.error("Signature mismatch");
      throw new HttpsError("permission-denied", "Payment not verified");
    }

    console.log("Payment verified successfully");

    const orderRef = db.collection("orders").doc(orderId);
    const snap = await orderRef.get();

    if (!snap.exists) {
      throw new HttpsError("not-found", "Order not found");
    }

    const orderData = { id: orderId, ...snap.data() };

    /* PREVENT DUPLICATE PROCESSING */
    if (orderData.paymentStatus === "paid") {
      console.log("Order already processed");
      return { success: true };
    }

    /* ---------------- CREATE SHIPROCKET ORDER ---------------- */

    const shipment = await createShiprocketOrder(orderData);

    console.log("Shiprocket Order:", shipment);

    const shipmentId = shipment.shipment_id;
    const shiprocketOrderId = shipment.order_id;

    /* ---------------- ASSIGN COURIER ---------------- */

    let awbData = null;

    try {
      const awb = await assignCourier(shipmentId);
      console.log("ASSIGN COURIER RESPONSE:", awb);

      awbData = awb.response.data;
    } catch (err) {
      console.error("ASSIGN COURIER ERROR:", err.response?.data);
    }

    /* ---------------- GENERATE LABEL ---------------- */

    let label = null;

    try {
      label = await generateLabel(shipmentId);
    } catch (err) {
      console.error("LABEL ERROR:", err.response?.data);
    }

    /* ---------------- GENERATE INVOICE ---------------- */

    let invoice = null;

    try {
      invoice = await generateInvoice(shiprocketOrderId);
    } catch (err) {
      console.error("INVOICE ERROR:", err.response?.data);
    }

    /* ---------------- SCHEDULE PICKUP ---------------- */

    let pickup = null;

    try {
      pickup = await schedulePickup(shipmentId);
    } catch (err) {
      const msg = err.response?.data?.message;

      if (msg === "Already in Pickup Queue.") {
        console.log("Pickup already scheduled");
      } else {
        console.error("PICKUP ERROR:", err.response?.data);
      }
    }

    /* ---------------- UPDATE FIRESTORE ---------------- */

    await orderRef.update({
      paymentStatus: "paid",
      status: "confirmed",

      shiprocketOrderId: shiprocketOrderId,
      shipmentId: shipmentId,

      awb: awbData?.awb_code || "",
      courier: awbData?.courier_name || "",

      shippingLabel: label?.label_url || "",
      shippingInvoice: invoice?.invoice_url || "",

      pickupToken: pickup?.pickup_token_number || "",

      shippingStatus: "pickup_scheduled",

      paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  },
);

/* =====================================================
SHIPROCKET WEBHOOK
===================================================== */

exports.shiprocketWebhook = onRequest(
  { region: "asia-south1" },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(200).send("Webhook active");
      }

      const data = req.body;

      console.log("Shiprocket Webhook:", data);

      const awb = data?.awb;
      const status = data?.current_status;
      const courier = data?.courier_name;
      const trackingUrl = data?.tracking_url;
      const location = data?.location;
      const activity = data?.activity;

      if (!awb) {
        return res.status(400).send("Missing AWB");
      }

      const snapshot = await db
        .collection("orders")
        .where("awb", "==", awb)
        .limit(1)
        .get();

      if (snapshot.empty) {
        console.log("Order not found for AWB:", awb);
        return res.status(404).send("Order not found");
      }

      const orderDoc = snapshot.docs[0];

      /* TRACKING HISTORY ENTRY */

      const trackingUpdate = {
        status: status || "unknown",
        location: location || "",
        activity: activity || "",
        time: admin.firestore.FieldValue.serverTimestamp(),
      };

      await orderDoc.ref.update({
        shippingStatus: status || "unknown",
        courierName: courier || "",
        trackingUrl: trackingUrl || "",
        lastTrackingUpdate: admin.firestore.FieldValue.serverTimestamp(),

        trackingHistory: admin.firestore.FieldValue.arrayUnion(trackingUpdate),
      });

      console.log("Tracking updated:", status);

      return res.status(200).send("Webhook processed");
    } catch (err) {
      console.error("Shiprocket Webhook Error:", err);
      return res.status(500).send("Server error");
    }
  },
);
