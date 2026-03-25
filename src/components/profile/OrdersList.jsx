import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

export default function OrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      where("status", "==", "confirmed"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setOrders(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const FREE_DELIVERY_THRESHOLD = 500;

  const getExpectedDelivery = (order) => {
    if (!order.createdAt || !order.expecteddeliverydate) return "";

    const baseDate = order.createdAt.toDate();
    const daysToAdd = Number(order.expecteddeliverydate);

    const deliveryDate = new Date(baseDate);
    deliveryDate.setDate(baseDate.getDate() + daysToAdd);

    return deliveryDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">📦 My Orders</h2>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : orders.length ? (
          <div className="space-y-5">
            {orders.map((order) => {
              const isFree = order.total >= FREE_DELIVERY_THRESHOLD;
              const deliveryFee = isFree ? 0 : order.deliveryFee;
              const grandTotal = order.total + deliveryFee;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border"
                >
                  {/* TOP BAR */}
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-semibold text-gray-800">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>

                    <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                      ✔ Confirmed
                    </span>
                  </div>

                  {/* MAIN CONTENT */}
                  <div className="flex gap-4">
                    <img
                      src={order.items?.[0]?.imageUrl}
                      alt={order.items?.[0]?.name}
                      className="w-20 h-20 rounded-xl object-cover border"
                    />

                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-gray-800">
                        {order.items?.[0]?.name} × {order.items?.[0]?.qty}
                        {order.items?.length > 1 && (
                          <span className="text-gray-400 text-sm">
                            {" "}
                            + {order.items.length - 1} more items
                          </span>
                        )}
                      </p>

                      {/* PRICE GRID */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <p className="text-gray-600">
                          Product Total: <b>₹{order.total}</b>
                        </p>

                        <p className="text-gray-600">
                          Delivery:{" "}
                          <span
                            className={
                              isFree ? "text-green-600 font-semibold" : ""
                            }
                          >
                            {isFree ? "FREE 🎉" : `₹${deliveryFee}`}
                          </span>
                        </p>

                        <p className="text-gray-800 font-semibold">
                          Grand Total: ₹{grandTotal}
                        </p>
                      </div>

                      {/* DELIVERY INFO */}
                      <div className="bg-gray-50 rounded-lg p-3 mt-2 space-y-1">
                        <p className="text-sm text-gray-700">
                          🚚 Expected Delivery:{" "}
                          <span className="font-semibold text-green-600">
                            {getExpectedDelivery(order)}
                          </span>
                        </p>

                        <p className="text-sm text-gray-700">
                          📦 Courier:{" "}
                          <span className="font-medium">
                            {order.courier || "Not Assigned"}
                          </span>
                        </p>
                      </div>

                      {isFree && (
                        <p className="text-xs text-green-600">
                          🎉 Free delivery applied
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center mt-20 text-gray-500">
            <p className="text-lg">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
