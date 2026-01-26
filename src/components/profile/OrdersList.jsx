import { useState } from "react";

const TABS = [
  { key: "orders", label: "My Orders" },
  { key: "cancelled", label: "Cancelled Orders" },
  { key: "returned", label: "Returned Orders" },
];

export default function OrdersList() {
  const [activeTab, setActiveTab] = useState("orders");

  /* 🔥 MOCK DATA (replace with Firestore later) */
  const orders = [
    {
      id: "ORD12345",
      status: "orders",
      items: "2 × Milk Cookies",
      amount: 30,
      date: "Jan 12, 2026",
      state: "Delivered",
      color: "text-green-600",
    },
    {
      id: "ORD12346",
      status: "cancelled",
      items: "1 × Choco Cookies",
      amount: 15,
      date: "Jan 10, 2026",
      state: "Cancelled",
      color: "text-red-600",
    },
    {
      id: "ORD12347",
      status: "returned",
      items: "3 × Butter Cookies",
      amount: 45,
      date: "Jan 05, 2026",
      state: "Returned",
      color: "text-yellow-600",
    },
  ];

  const filtered = orders.filter((o) => o.status === activeTab);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* HEADER */}
      <h2 className="text-xl font-semibold mb-4">My Orders</h2>

      {/* TABS */}
      <div className="flex gap-6 border-b mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ORDER LIST */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="border rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <p className="font-medium">Order #{order.id}</p>
                <span className={`text-sm font-medium ${order.color}`}>
                  {order.state}
                </span>
              </div>

              <p className="text-sm text-gray-600">
                {order.items} • ₹{order.amount}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Ordered on {order.date}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No orders found in this section</p>
      )}
    </div>
  );
}
