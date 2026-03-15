import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
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

        /* PREVENT DUPLICATE PAYMENT */
        if (data.paymentStatus === "paid") {
          navigate(`/order-success/${orderId}`);
          return;
        }

        const orderData = { id: snap.id, ...data };
        setOrder(orderData);

        /* GET SHIPPING RATE */
        if (orderData.address?.pincode) {
          const getShippingRates = httpsCallable(functions, "getShippingRates");

          const res = await getShippingRates({
            pincode: orderData.address.pincode,
            orderValue: orderData.total,
          });

          setShippingCost(res.data.shippingCost);
          setCourierName(res.data.courierName);
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

  const grandTotal = (order?.total || 0) + shippingCost;

  /* ---------------- HANDLE PAYMENT ---------------- */
  const handlePay = async () => {
    if (!order || paying) return;

    try {
      setPaying(true);

      /* DOUBLE CHECK ORDER STATUS */
      const orderRef = doc(db, "orders", order.id);
      const snap = await getDoc(orderRef);

      if (snap.data()?.paymentStatus === "paid") {
        toast("Order already paid");
        navigate(`/order-success/${order.id}`);
        return;
      }

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

  /* ---------------- UI ---------------- */

  if (loading) {
    return <p className="text-center py-32">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        {/* LEFT */}
        <div>
          <h1 className="text-3xl font-bold mb-6">Complete Your Payment</h1>

          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Information</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-medium">{order.id}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Partner</span>
                <span className="font-medium">{courierName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status</span>
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

        {/* RIGHT */}
        <div>
          <div className="bg-white rounded-2xl shadow p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Products Total</span>
                <span>₹{order.total}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹{shippingCost}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Payable</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition disabled:opacity-60"
            >
              {paying ? "Processing..." : `Pay ₹${grandTotal}`}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
