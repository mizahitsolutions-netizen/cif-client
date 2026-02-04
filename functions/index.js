/* =====================================================
   IMPORTS
===================================================== */
const Razorpay = require("razorpay");
const crypto = require("crypto");
const admin = require("firebase-admin");
const axios = require("axios");

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");

/* =====================================================
   INIT FIREBASE
===================================================== */
admin.initializeApp();

/* =====================================================
   ENV PARAMS (GEN-2 SAFE)
===================================================== */
const RAZORPAY_KEY_ID = defineString("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = defineString("RAZORPAY_KEY_SECRET");

const SHIPROCKET_EMAIL = defineString("SHIPROCKET_EMAIL");
const SHIPROCKET_PASSWORD = defineString("SHIPROCKET_PASSWORD");

/* =====================================================
   SHIPROCKET TOKEN CACHE
===================================================== */
let shiprocketToken = null;
let shiprocketTokenExpiry = 0;

/* =====================================================
   GET SHIPROCKET TOKEN
===================================================== */
async function getShiprocketToken() {
  if (shiprocketToken && shiprocketTokenExpiry > Date.now()) {
    return shiprocketToken;
  }

  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: SHIPROCKET_EMAIL.value(),
      password: SHIPROCKET_PASSWORD.value(),
    },
  );

  shiprocketToken = res.data.token;
  shiprocketTokenExpiry = Date.now() + 8 * 24 * 60 * 60 * 1000; // ~8 days

  return shiprocketToken;
}

/* =====================================================
   CREATE SHIPROCKET ORDER (SAFE)
===================================================== */
async function createShiprocketOrder(order) {
  const token = await getShiprocketToken();

  const addr = order.address;

  if (
    !addr ||
    !addr.name ||
    !addr.phone ||
    !addr.line1 ||
    !addr.city ||
    !addr.state ||
    !addr.pincode
  ) {
    throw new Error("Incomplete address for shipping");
  }

  const payload = {
    order_id: order.id,
    order_date: new Date().toISOString().split("T")[0],
    pickup_location: "warehouse-1",

    billing_customer_name: addr.name,
    billing_last_name: "",
    billing_phone: addr.phone,
    billing_address: `${addr.line1}`.slice(0, 95),
    billing_address_2: `${addr.line2 || ""}`.slice(0, 95),
    billing_city: addr.city,
    billing_state: addr.state,
    billing_country: addr.country || "India",
    billing_pincode: addr.pincode,

    shipping_is_billing: true,

    order_items: order.items.map((item) => ({
      name: item.name,
      sku: item.id,
      units: item.qty,
      selling_price: item.price,
      discount: "",
      tax: "",
      hsn: "",
    })),

    payment_method: "Prepaid",
    sub_total: order.total,

    length: 10,
    breadth: 10,
    height: 5,
    weight: 0.5,
  };

  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
}

/* =====================================================
   1️⃣ CREATE RAZORPAY ORDER
===================================================== */
exports.createRazorpayOrder = onCall(
  { region: "asia-south1" },
  async ({ data }) => {
    try {
      const { amount } = data;

      if (!amount || amount <= 0) {
        throw new HttpsError("invalid-argument", "Invalid amount");
      }

      const razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID.value(),
        key_secret: RAZORPAY_KEY_SECRET.value(),
      });

      const order = await razorpay.orders.create({
        amount: amount * 100, // paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      return order;
    } catch (err) {
      console.error("Create Razorpay Order Error:", err);
      throw new HttpsError("internal", "Unable to create payment order");
    }
  },
);

/* =====================================================
   2️⃣ VERIFY PAYMENT + SHIPROCKET
===================================================== */
exports.verifyRazorpayPayment = onCall(
  { region: "asia-south1" },
  async ({ data }) => {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
        data;

      if (
        !razorpayOrderId ||
        !razorpayPaymentId ||
        !razorpaySignature ||
        !orderId
      ) {
        throw new HttpsError("invalid-argument", "Missing payment data");
      }

      /* 🔐 VERIFY SIGNATURE */
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET.value())
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        throw new HttpsError("permission-denied", "Invalid payment signature");
      }

      /* 🔎 FETCH ORDER */
      const orderRef = admin.firestore().collection("orders").doc(orderId);
      const snap = await orderRef.get();

      if (!snap.exists) {
        throw new HttpsError("not-found", "Order not found");
      }

      const orderData = { id: orderId, ...snap.data() };

      /* 🚚 TRY SHIPROCKET (NON-BLOCKING) */
      let shipment = null;
      try {
        shipment = await createShiprocketOrder(orderData);
      } catch (shipErr) {
        console.error("Shiprocket Error:", shipErr.message);
      }

      /* ✅ UPDATE FIRESTORE */
      await orderRef.update({
        paymentStatus: "paid",
        status: "confirmed",

        razorpayOrderId,
        razorpayPaymentId,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),

        shiprocketOrderId: shipment?.order_id || null,
        shipmentId: shipment?.shipment_id || null,
        awb: shipment?.awb_code || null,
        courier: shipment?.courier_name || null,
      });

      return { success: true };
    } catch (err) {
      console.error("Verify Payment Error:", err);
      throw new HttpsError("internal", err.message);
    }
  },
);
