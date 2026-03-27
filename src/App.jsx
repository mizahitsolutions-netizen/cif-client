import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout";

import ProductsPage from "./pages/Productlisitng";
import ProductDetail from "./pages/ProductDetailpage";
import CartPage from "./pages/CartPage";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import PaymentPage from "./pages/PaymentPage";
import OrderSuccess from "./pages/OrderSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import About from "./pages/About";
import Home from "./pages/Home";
import BulkOrder from "./pages/BulkEnquiry";
import DistributorEnquiry from "./pages/DistributorPage";
import ContactUs from "./pages/Contact";
import CityPage from "./pages/CityPage";

const HomePage = () => {
  useEffect(() => {
    document.title = "Crumbella Innovative Foods";
  }, []);

  return (
    <>
      <Home />
    </>
  );
};

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/about" element={<About />} />
        <Route path="/distributor-enquiry" element={<DistributorEnquiry />} />
        <Route path="/bulk-enquiry" element={<BulkOrder />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/cookies-in/:city" element={<CityPage />} />
      </Route>
    </Routes>
  );
};

export default App;
