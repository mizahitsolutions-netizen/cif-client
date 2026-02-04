const axios = require("axios");
const admin = require("firebase-admin");
const { getShiprocketToken } = require("./shiprocket");

admin.initializeApp();

/* =====================================================
   CREATE SHIPROCKET ORDER
===================================================== */
async function createShiprocketOrder(orderId) {
  const db = admin.firestore();

  // 🔥 Fetch order from Firestore
  const orderSnap = await db.collection("orders").doc(orderId).get();
  if (!orderSnap.exists) throw new Error("Order not found");

  const order = orderSnap.data();

  const token = await getShiprocketToken();

  /* ---------------- SHIPROCKET PAYLOAD ---------------- */
  const payload = {
    order_id: orderId,
    order_date: new Date().toISOString(),
    pickup_location: "Primary", // Shiprocket dashboard pickup name

    billing_customer_name: order.address.name,
    billing_last_name: "",
    billing_address: order.address.addressLine,
    billing_city: order.address.city,
    billing_pincode: order.address.pincode,
    billing_state: order.address.state,
    billing_country: "India",
    billing_email: order.address.email || order.email,
    billing_phone: order.address.phone,

    shipping_is_billing: true,

    order_items: order.items.map((item) => ({
      name: item.name,
      sku: item.id,
      units: item.qty,
      selling_price: item.price,
    })),

    payment_method: "Prepaid",
    sub_total: order.total,

    length: 20,
    breadth: 15,
    height: 10,
    weight: 0.5,
  };

  /* ---------------- CREATE ORDER ---------------- */
  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = res.data;

  /* ---------------- SAVE TRACKING ---------------- */
  await db
    .collection("orders")
    .doc(orderId)
    .update({
      shipmentId: data.shipment_id,
      shiprocketOrderId: data.order_id,
      awbCode: data.awb_code || null,
      courier: data.courier_name || null,
      shippingStatus: "created",
      shippedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  return data;
}

module.exports = {
  createShiprocketOrder,
};
