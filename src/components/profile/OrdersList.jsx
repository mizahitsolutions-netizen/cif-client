import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

export default function OrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        where("status", "==", "confirmed"),
        orderBy("createdAt", "desc"),
        limit(3), // 🔥 first 3 orders
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setOrders(data);
      setLastDoc(snap.docs[snap.docs.length - 1]);
      setHasMore(snap.docs.length === 3);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const FREE_DELIVERY_THRESHOLD = 500;

  /* 🔥 STATUS BADGE */
  const getStatusBadge = (status) => {
    const map = {
      confirmed: "bg-blue-100 text-blue-700",
      shipped: "bg-purple-100 text-purple-700",
      "out for delivery": "bg-orange-100 text-orange-700",
      delivered: "bg-green-100 text-green-700",
    };

    return map[status?.toLowerCase()] || "bg-gray-100 text-gray-600";
  };

  /* 🔥 PAYMENT BADGE */
  const getPaymentBadge = (method) => {
    if (method === "cod") {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-green-100 text-green-700";
  };

  const getExpectedDelivery = (order) => {
    if (!order.createdAt) return "";

    const baseDate = order.createdAt.toDate();

    if (order.estimatedDays) {
      const deliveryDate = new Date(baseDate);
      deliveryDate.setDate(baseDate.getDate() + order.estimatedDays);

      return deliveryDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    }

    if (order.expecteddeliverydate) {
      const deliveryDate = new Date(baseDate);
      deliveryDate.setDate(
        baseDate.getDate() + Number(order.expecteddeliverydate),
      );

      return deliveryDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    }

    return "";
  };

  const loadMore = async () => {
    if (!lastDoc) return;

    try {
      setLoadingMore(true);

      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        where("status", "==", "confirmed"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(3),
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setOrders((prev) => [...prev, ...data]);
      setLastDoc(snap.docs[snap.docs.length - 1]);
      setHasMore(snap.docs.length === 3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatOrderDateTime = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.toDate();

    const formattedDate = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });

    return `${formattedDate}, ${formattedTime}`;
  };

  const getDeliveryRange = (order) => {
    if (!order.estimatedDays) return null;
    return `Arriving in ${order.estimatedDays}-${order.estimatedDays + 1} days`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">📦 My Orders</h2>
        </div>

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
                  {/* 🔥 TOP BAR */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>

                      <p className="text-xs text-gray-600 mt-1">
                        🗓 Ordered on: {formatOrderDateTime(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {/* STATUS BADGE */}
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(
                          order.shippingStatus || order.status,
                        )}`}
                      >
                        {order.shippingStatus || order.status}
                      </span>

                      {/* PAYMENT BADGE */}
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getPaymentBadge(
                          order.paymentMethod,
                        )}`}
                      >
                        {order.paymentMethod === "cod" ? "COD 💰" : "Paid 💳"}
                      </span>
                    </div>
                  </div>

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

                      <div className="bg-gray-50 rounded-lg p-3 mt-2 space-y-1">
                        <p className="text-sm text-gray-700">
                          🚚 Expected Delivery:{" "}
                          <span className="font-semibold text-green-600">
                            {getExpectedDelivery(order)}
                          </span>
                        </p>

                        {getDeliveryRange(order) && (
                          <p className="text-xs text-green-500">
                            {getDeliveryRange(order)}
                          </p>
                        )}

                        <p className="text-sm text-gray-700">
                          📦 Courier:{" "}
                          <span className="font-medium">
                            {order.courier || "Not Assigned"}
                          </span>
                        </p>

                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-xs text-blue-600 underline"
                          >
                            🔍 Track Order
                          </a>
                        )}
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
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-black text-white rounded-lg"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
