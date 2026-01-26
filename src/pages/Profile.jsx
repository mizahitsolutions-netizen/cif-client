import { useEffect, useState } from "react";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileInfo from "../components/profile/ProfileInfo";
import AddressBook from "../components/profile/AddressBook";
import OrdersList from "../components/profile/OrdersList";
import ProfileCart from "../components/profile/ProfileCart";
import { useLocation } from "react-router-dom";

export default function Profile() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    document.title ="My Profile | Crumbella Innovative Foods";
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-24">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="md:col-span-3">
          {activeTab === "profile" && <ProfileInfo />}
          {activeTab === "addresses" && <AddressBook />}
          {activeTab === "orders" && <OrdersList />}
          {activeTab === "cart" && <ProfileCart />} {/* ⭐ */}
        </div>
      </div>
    </section>
  );
}
