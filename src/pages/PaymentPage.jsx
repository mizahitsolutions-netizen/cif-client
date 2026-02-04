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
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

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

        // 🔐 Prevent re-payment
        if (data.paymentStatus === "paid") {
          navigate(`/order-success/${orderId}`);
          return;
        }

        setOrder({ id: snap.id, ...data });
      } catch (err) {
        toast.error("Failed to load order");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, navigate]);

  /* ---------------- HANDLE PAYMENT ---------------- */
  const handlePay = async () => {
    if (!order || paying) return;

    try {
      setPaying(true);

      const createRazorpayOrder = httpsCallable(
        functions,
        "createRazorpayOrder",
      );

      const res = await createRazorpayOrder({
        amount: order.total,
      });

      const razorpayOrder = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // public key only
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

            await updateDoc(doc(db, "orders", order.id), {
              paymentStatus: "paid",
              status: "confirmed",
            });

            clearCart();
            toast.success("Payment successful 🎉");
            navigate(`/order-success/${order.id}`);
          } catch (err) {
            console.error(err);
            toast.error("Payment verification failed");
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

  /* ---------------- UI ---------------- */
  if (loading) {
    return <p className="text-center py-32">Loading...</p>;
  }

  return (
    <div className="max-w-xl mx-auto py-32 px-4">
      <h1 className="text-3xl font-bold mb-6">Payment</h1>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <p className="font-medium mb-2">Order ID</p>
        <p className="text-sm text-gray-500 mb-4">{order.id}</p>

        <div className="flex justify-between font-semibold">
          <span>Total Amount</span>
          <span>₹{order.total}</span>
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={paying}
        className="w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800 disabled:opacity-60"
      >
        {paying ? "Processing..." : `Pay ₹${order.total}`}
      </button>
    </div>
  );
}
