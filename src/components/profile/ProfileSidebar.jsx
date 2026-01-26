import { User, MapPin, Package, ShoppingCart } from "lucide-react";

export default function ProfileSidebar({ activeTab, setActiveTab }) {
  const item = (key) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition ${
      activeTab === key ? "bg-black text-white" : "hover:bg-gray-100"
    }`;

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">My Account</h2>

      <div className={item("profile")} onClick={() => setActiveTab("profile")}>
        <User size={18} /> My Profile
      </div>

      <div
        className={item("addresses")}
        onClick={() => setActiveTab("addresses")}
      >
        <MapPin size={18} /> My Addresses
      </div>

      <div className={item("cart")} onClick={() => setActiveTab("cart")}>
        <ShoppingCart size={18} /> My Cart
      </div>

      <div className={item("orders")} onClick={() => setActiveTab("orders")}>
        <Package size={18} /> My Orders
      </div>
    </div>
  );
}
