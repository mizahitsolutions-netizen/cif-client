import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

const TABS = [
  { key: "confirmed", label: "My Orders" },
  { key: "cancelled", label: "Cancelled Orders" },
  { key: "returned", label: "Returned Orders" },
];

const STATUS_UI = {
  confirmed: {
    label: "Confirmed",
    color: "text-green-700 bg-green-100",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700 bg-red-100",
  },
  returned: {
    label: "Returned",
    color: "text-yellow-700 bg-yellow-100",
  },
};

export default function OrdersList() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("confirmed");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      where("status", "==", activeTab),
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
  }, [user, activeTab]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">My Orders</h2>

        {/* TABS */}
        <div className="flex gap-6 border-b mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 text-sm font-medium cursor-pointer ${
                activeTab === tab.key
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {loading ? (
          <p className="text-gray-500 text-sm">Loading orders...</p>
        ) : orders.length ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_UI[order.status] || {
                label: order.status || "Unknown",
                color: "text-gray-600 bg-gray-100",
              };

              return (
                <div
                  key={order.id}
                  className="border rounded-xl p-4 hover:shadow-sm transition"
                >
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-medium">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* PRODUCT PREVIEW */}
                  <div className="flex gap-4 items-center">
                    <img
                      src={order.items?.[0]?.imageUrl}
                      alt={order.items?.[0]?.name}
                      className="w-14 h-14 rounded-lg object-cover border"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {order.items?.[0]?.name} × {order.items?.[0]?.qty}
                        {order.items?.length > 1 && (
                          <span className="text-gray-400">
                            {" "}
                            + {order.items.length - 1} more
                          </span>
                        )}
                      </p>

                      <p className="text-sm text-gray-600">
                        Total: ₹{order.total}
                      </p>
                    </div>
                  </div>

                  {/* ACTION */}
                  {/* <button
                    onClick={() => setSelectedOrder(order)}
                    className="mt-4 inline-block px-4 py-2 border rounded-lg cursor-pointer
                               text-sm font-medium hover:bg-gray-100 transition"
                  >
                    View Order Details
                  </button> */}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No orders found in this section
          </p>
        )}
      </div>

      {/* MODAL */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}

/* ================= MODAL ================= */

function OrderDetailsModal({ order, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleUpdateStatus = async (status) => {
    try {
      await updateDoc(doc(db, "orders", order.id), { status });
      toast.success(
        status === "cancelled" ? "Order cancelled" : "Return requested",
      );
      onClose();
    } catch {
      toast.error("Action failed");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg p-6 relative
                   max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h3 className="text-xl font-semibold mb-1">Order Details</h3>
        <p className="text-xs text-gray-500 mb-4">Order ID: {order.id}</p>

        {/* ADDRESS */}
        <div className="mb-4">
          <h4 className="font-medium mb-1">Delivery Address</h4>
          <p className="text-sm text-gray-600">
            {order.address?.name} • {order.address?.phone}
          </p>
          <p className="text-sm text-gray-500">{order.address?.address}</p>
        </div>

        {/* ITEMS */}
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 items-center border rounded-lg p-3"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">
                  Qty: {item.qty} • ₹{item.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="mt-4 flex justify-between font-semibold">
          <span>Total</span>
          <span>₹{order.total}</span>
        </div>

        {/* ACTIONS */}
        {order.status === "confirmed" && (
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => handleUpdateStatus("cancelled")}
              className="flex-1 border border-red-500 text-red-600 py-2 rounded-lg hover:bg-red-50 cursor-pointer"
            >
              Cancel Order
            </button>

            <button
              onClick={() => handleUpdateStatus("returned")}
              className="flex-1 border border-yellow-500 text-yellow-600 py-2 rounded-lg hover:bg-yellow-50 cursor-pointer"
            >
              Return Order
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body, // 🔥 THIS IS THE KEY
  );
}
