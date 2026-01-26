import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const payNow = async () => {
    const options = {
      key: "RAZORPAY_KEY_ID",
      amount: 500 * 100,
      currency: "INR",
      name: "Crumbella",
      description: "Order Payment",
      handler: async function (response) {
        await updateDoc(doc(db, "orders", orderId), {
          payment: "success",
          status: "paid",
          razorpay: response,
        });

        navigate(`/order-success/${orderId}`);
      },
      theme: { color: "#000" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={payNow}
        className="bg-black text-white px-8 py-4 rounded-xl"
      >
        Pay Now
      </button>
    </div>
  );
}
