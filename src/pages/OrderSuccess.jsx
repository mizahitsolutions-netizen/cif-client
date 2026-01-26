import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "orders", orderId));
      if (snap.exists()) setOrder(snap.data());
    };
    load();
  }, [orderId]);

  if (!order) return null;

  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div className="bg-white rounded-2xl shadow p-10 max-w-md">
        <h1 className="text-3xl font-bold mb-4">Order Successful 🎉</h1>
        <p className="text-gray-600 mb-6">
          Your order has been placed successfully.
        </p>

        <p className="font-semibold mb-6">
          Total Paid: ₹{order.total}
        </p>

        <Link
          to="/profile"
          className="underline text-black"
        >
          View My Orders
        </Link>
      </div>
    </div>
  );
}
