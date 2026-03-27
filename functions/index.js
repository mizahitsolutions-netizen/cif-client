/* =====================================================
IMPORTS
===================================================== */

const Razorpay = require("razorpay");
const crypto = require("crypto");
const admin = require("firebase-admin");
const axios = require("axios");
const nodemailer = require("nodemailer");

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
EMAIL TRANSPORTER
===================================================== */

const transporter = nodemailer.createTransport({
  host: "mail.smtp2go.com",
  port: 587,
  secure: false,
  auth: {
    user: "crumbellainnovativefoods.in",
    pass: "doQ16vvzbLhHN9nR",
  },
});

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
CUSTOMER EMAIL HELPER FUNCTION
===================================================== */

async function sendOrderEmail(order) {
  try {
    const itemsHTML = order.items
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.qty}</td>
          <td>₹${item.price * item.qty}</td>
        </tr>
      `,
      )
      .join("");

    const isFreeDelivery = order.total > 500;
    const deliveryFee = isFreeDelivery ? 0 : order.deliveryFee;
    const grandTotal = order.total + deliveryFee;

    const html = `
<div style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;">

          <!-- 🔥 HEADER WITH LOGO -->
          <tr>
            <td style="background:#000;padding:25px;text-align:center;">
              <img 
                src="https://crumbellainnovativefoods.in/images/logo.png" 
                alt="Crumbella Logo" 
                width="120" 
                style="margin-bottom:10px;"
              />
            </td>
          </tr>

          <!-- SUCCESS -->
          <tr>
            <td style="padding:30px;text-align:center;">
              <h2 style="color:#28a745;margin-bottom:10px;">🎉 Order Confirmed!</h2>
              <p style="color:#555;">
                Hi ${order.address?.firstName} ${order.address?.lastName || ""}, your order has been placed successfully.
              </p>
            </td>
          </tr>

          <!-- ITEMS -->
          <tr>
            <td style="padding:0 30px 10px;">
              <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse;">
                <thead>
                  <tr style="background:#f8f8f8;">
                    <th align="left">Item</th>
                    <th align="center">Qty</th>
                    <th align="right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items
                    .map(
                      (item) => `
                    <tr style="border-bottom:1px solid #eee;">
                      <td>${item.name}</td>
                      <td align="center">${item.qty}</td>
                      <td align="right">₹${item.price * item.qty}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- 🔥 SPACING (THIS FIXES YOUR ISSUE) -->
          <tr>
            <td style="height:25px;"></td>
          </tr>

          <!-- ORDER DETAILS -->
          <tr>
            <td style="padding:0 30px 10px;">
              <table width="100%" style="font-size:14px;color:#333;">
                
                <tr>
                  <td><strong>Order ID:</strong></td>
                  <td align="right">${order.id}</td>
                </tr>

                <tr>
                  <td><strong>Product Total:</strong></td>
                  <td align="right">₹${order.total}</td>
                </tr>

                ${
                  order.total > 500
                    ? `
                <tr>
                  <td><strong>Delivery:</strong></td>
                  <td align="right" style="color:green;font-weight:bold;">FREE</td>
                </tr>
                `
                    : `
                <tr>
                  <td><strong>Delivery Fee:</strong></td>
                  <td align="right">₹${order.deliveryFee}</td>
                </tr>
                `
                }

                <tr>
                  <td><strong>Grand Total:</strong></td>
                  <td align="right">
                    ₹${order.total > 500 ? order.total : order.grandTotal}
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- ADDRESS -->
          <tr>
            <td style="padding:30px;">
              <h3 style="margin-bottom:10px;">🚚 Delivery Address</h3>
              <p style="margin:0;color:#555;">
                ${order.address?.firstName} ${order.address?.lastName || ""}<br/>
                ${order.address?.line1}${order.address?.line2 ? " - " + order.address.line2 : ""}<br/>
                ${order.address?.city} - ${order.address?.state}<br/>
                ${order.address?.pincode}
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8f8f8;padding:20px;text-align:center;font-size:12px;color:#777;">
              <p style="margin:0;">Thank you for shopping with Crumbella ❤️</p>
              <p style="margin:5px 0 0;">© ${new Date().getFullYear()} Crumbella Innovative Foods</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</div>
`;

    await transporter.sendMail({
      from: '"Crumbella" <no-reply@crumbellainnovativefoods.in>',
      to: order.address.email,
      subject: `Order Confirmed - ${order.id}`,
      html,
    });

    console.log("Email sent successfully");
  } catch (err) {
    console.error("Email Error:", err);
  }
}

/* =====================================================
ADMIN EMAIL HELPER FUNCTION
===================================================== */

async function sendAdminEmail(order) {
  try {
    const isFreeDelivery = order.total > 500;
    const deliveryFee = isFreeDelivery ? 0 : order.deliveryFee;
    const grandTotal = order.total + deliveryFee;

    const itemsList = order.items
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td align="center">${item.qty}</td>
          <td align="right">₹${item.price * item.qty}</td>
        </tr>
      `,
      )
      .join("");

    const html = `
      <div style="font-family:Arial;padding:20px;">
        
        <h2>🛒 New Order Received!</h2>

        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Customer:</strong> ${order.address?.firstName} ${order.address?.lastName || ""}</p>
        <p><strong>Phone:</strong> ${order.address?.phone}</p>
        <p><strong>Email:</strong> ${order.address?.email}</p>

        <h3>📦 Items</h3>
        <table border="1" cellpadding="8" cellspacing="0" width="100%">
          <tr>
            <th align="left">Item</th>
            <th>Qty</th>
            <th align="right">Price</th>
          </tr>
          ${itemsList}
        </table>

        <h3 style="margin-top:20px;">💰 Payment Details</h3>
        <table width="100%" style="font-size:14px;">
          
          <tr>
            <td><strong>Product Total:</strong></td>
            <td align="right">₹${order.total}</td>
          </tr>

          ${
            isFreeDelivery
              ? `
          <tr>
            <td><strong>Delivery:</strong></td>
            <td align="right" style="color:green;font-weight:bold;">FREE</td>
          </tr>
          `
              : `
          <tr>
            <td><strong>Delivery Fee:</strong></td>
            <td align="right">₹${deliveryFee}</td>
          </tr>
          `
          }

          <tr>
            <td><strong>Grand Total:</strong></td>
            <td align="right">₹${grandTotal}</td>
          </tr>

        </table>

        <h3 style="margin-top:20px;">🚚 Address</h3>
        <p>
          ${order.address?.line1}<br/>
          ${order.address?.city} - ${order.address?.state}<br/>
          ${order.address?.pincode}
        </p>

        <br/>
        <p style="color:red;font-weight:bold;">
          ⚡ Action Required: Process this order immediately
        </p>

      </div>
    `;

    await transporter.sendMail({
      from: '"Crumbella Orders" <no-reply@crumbellainnovativefoods.in>',
      to: "admin@crumbellainnovativefoods.in", // 🔥 change this
      subject: `🛒 New Order - ${order.id}`,
      html,
    });

    console.log("Admin email sent");
  } catch (err) {
    console.error("Admin Email Error:", err);
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

    await sendOrderEmail(orderData);
    await sendAdminEmail(orderData);

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

/* =====================================================
CONTACT FORM EMAIL NOTIFICATION
===================================================== */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");

exports.sendContactNotification = onDocumentCreated(
  {
    document: "contacts/{docId}",
    region: "asia-south1",
  },
  async (event) => {
    try {
      const data = event.data.data();

      const html = `
        <div style="font-family:Arial;padding:20px;">
          <h2>📩 New Contact Form Submission</h2>

          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Message:</strong></p>
          <p style="background:#f5f5f5;padding:10px;border-radius:6px;">
            ${data.message}
          </p>

          <br/>

          <p style="color:#888;font-size:12px;">
            Submitted at: ${new Date().toLocaleString()}
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: '"Crumbella Contact" <no-reply@crumbellainnovativefoods.in>',
        to: "contact@crumbellainnovativefoods.in", // 👉 your email
        subject: "📩 New Contact Message - Crumbella",
        html,
      });

      await transporter.sendMail({
        from: '"Crumbella" <no-reply@crumbellainnovativefoods.in>',
        to: data.email,
        subject: "We received your message ✅",
        html: `
        <h3>Hi ${data.name},</h3>
        <p>Thanks for contacting Crumbella Innovative Foods.</p>
        <p>We’ll get back to you shortly 🍪</p>
  `,
      });

      console.log("Contact email sent successfully");
    } catch (error) {
      console.error("Contact Email Error:", error);
    }
  },
);
