import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import toast from "react-hot-toast";

import { db, functions } from "../firebase";
import { useCart } from "../context/CartContext";

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [courierName, setCourierName] = useState("");
  const [etaDays, setEtaDays] = useState(null);

  const [onlineShipping, setOnlineShipping] = useState(0);
  const [codShipping, setCodShipping] = useState(0);

  const [onlineETA, setOnlineETA] = useState(null);
  const [codETA, setCodETA] = useState(null);

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [codAvailable, setCodAvailable] = useState(true);

  // 🔥 IMPORTANT FIX
  const [paymentMethod, setPaymentMethod] = useState(null);

  /* ---------------- LOAD ORDER ---------------- */
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const ref = doc(db, "orders", orderId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          toast.error("Order not found");
          navigate("/");
          return;
        }

        const data = snap.data();

        if (data.paymentStatus === "paid") {
          navigate(`/order-success/${orderId}`);
          return;
        }

        const orderData = { id: snap.id, ...data };
        setOrder(orderData);

        // 🔥 CONTINUITY FROM CHECKOUT
        setPaymentMethod(orderData.paymentMethod || "online");

        /* SHIPPING */
        if (orderData.address?.pincode) {
          const getShippingRates = httpsCallable(functions, "getShippingRates");

          const [onlineRes, codRes] = await Promise.all([
            getShippingRates({
              pincode: orderData.address.pincode,
              orderValue: orderData.total,
              isCOD: false,
            }),
            getShippingRates({
              pincode: orderData.address.pincode,
              orderValue: orderData.total,
              isCOD: true,
            }),
          ]);

          const FREE_DELIVERY_THRESHOLD = 500;

          let onlineCost = onlineRes.data.shippingCost;
          let codCost = codRes.data.shippingCost;

          if (orderData.total >= FREE_DELIVERY_THRESHOLD) {
            onlineCost = 0;
            codCost = 0;
          }

          setOnlineShipping(onlineCost);
          setCodShipping(codCost);

          setOnlineETA(onlineRes.data.estimatedDays);
          setCodETA(codRes.data.estimatedDays);

          setShippingCost(onlineCost);
          setCourierName(onlineRes.data.courierName);
          setEtaDays(onlineRes.data.estimatedDays);

          setCodAvailable(codRes.data.codAvailable);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load order");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, navigate]);

  /* 🔥 AUTO SWITCH IF COD NOT AVAILABLE */
  useEffect(() => {
    if (!codAvailable && paymentMethod === "cod") {
      setPaymentMethod("online");
    }
  }, [codAvailable]);

  /* ---------------- SWITCH SHIPPING ---------------- */
  useEffect(() => {
    if (!order || !paymentMethod) return;

    if (paymentMethod === "cod") {
      setShippingCost(codShipping);
      setEtaDays(codETA);
    } else {
      setShippingCost(onlineShipping);
      setEtaDays(onlineETA);
    }
  }, [paymentMethod, codShipping, onlineShipping, codETA, onlineETA, order]);

  const grandTotal = (order?.total || 0) + shippingCost;

  /* ---------------- ONLINE PAYMENT ---------------- */
  const handlePay = async () => {
    if (!order || paying) return;

    try {
      setPaying(true);

      const createRazorpayOrder = httpsCallable(
        functions,
        "createRazorpayOrder",
      );

      const res = await createRazorpayOrder({
        amount: grandTotal,
      });

      const razorpayOrder = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "Crumbella Innovative Foods",
        description: "Order Payment",
        order_id: razorpayOrder.id,

        handler: async (response) => {
          try {
            const verifyPayment = httpsCallable(
              functions,
              "verifyRazorpayPayment",
            );

            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order.id,
            });

            clearCart();
            toast.success("Payment successful 🎉");
            navigate(`/order-success/${order.id}`);
          } catch (err) {
            console.error(err);
            toast.error("Payment verification failed");
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false);
            toast("Payment cancelled", { icon: "⚠️" });
          },
        },

        theme: {
          color: "#000000",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Unable to initiate payment");
      setPaying(false);
    }
  };

  /* ---------------- COD ---------------- */
  const handleCOD = async () => {
    if (!order) return;

    try {
      setPaying(true);

      const orderRef = doc(db, "orders", order.id);

      await updateDoc(orderRef, {
        paymentMethod: "cod",
        paymentStatus: "pending",
        status: "placed",
      });

      const createCODOrder = httpsCallable(functions, "createCODOrder");

      await createCODOrder({
        orderId: order.id,
      });

      clearCart();

      toast.success("Order placed with Cash on Delivery 🚚");

      navigate(`/order-success/${order.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place COD order");
      setPaying(false);
    }
  };

  if (loading || !paymentMethod) {
    return <p className="text-center py-32">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      {/* 🔥 UI SAME AS YOUR ORIGINAL */}
      {/* (No changes below) */}

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        <div>
          <h1 className="text-3xl font-bold mb-6">Complete Your Payment</h1>

          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Information</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Order ID</span>
                <span className="font-medium">{order.id}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Partner</span>
                <span className="font-medium">{courierName}</span>
              </div>

              <div className="flex justify-between">
                <span>Payment Status</span>
                <span className="text-yellow-600 font-medium">Pending</span>
              </div>
            </div>
          </div>

          {order.items && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>

              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.qty}</p>
                    </div>

                    <p className="font-semibold">₹{item.price * item.qty}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white rounded-2xl shadow p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

            {/* SAME UI */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Payment Method</h3>

              <div className="space-y-2">
                <label className="flex gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                  />
                  Online Payment
                </label>

                <label
                  className={`flex gap-2 ${
                    !codAvailable
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === "cod"}
                    disabled={!codAvailable}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  Cash on Delivery
                </label>
              </div>

              {!codAvailable && (
                <p className="text-red-500 text-sm mt-2">
                  COD is not available for this pincode
                </p>
              )}

              {codShipping > onlineShipping && (
                <p className="text-green-600 text-sm mt-2 text-center font-medium">
                  💡 Save ₹{codShipping - onlineShipping} by paying online
                </p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Products Total</span>
                <span>₹{order.total}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
              </div>

              {etaDays && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Estimated Delivery</span>
                  <span>
                    🚚 {etaDays}-{etaDays + 1} days
                  </span>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={paymentMethod === "cod" ? handleCOD : handlePay}
              disabled={paying}
              className="w-full bg-black text-white py-4 rounded-xl"
            >
              {paymentMethod === "cod"
                ? "Place Order (COD)"
                : paying
                  ? "Processing..."
                  : `Pay ₹${grandTotal}`}
            </button>

            <p className="text-xs text-gray-600 text-center mt-4">
              {paymentMethod === "cod"
                ? "Pay when your order is delivered"
                : "Powered by Razorpay"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
