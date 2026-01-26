import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import HeroSection from "./sections/HeroSection";
import MessageSection from "./sections/MessageSection";
import FlavorSection from "./sections/FlavorSection";
import BenefitSection from "./sections/BenefitSection";
import ProductsPage from "./pages/Productlisitng";
import ProductDetail from "./pages/ProductDetailpage";
import CartPage from "./pages/CartPage";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import PaymentPage from "./pages/PaymentPage";
import OrderSuccess from "./pages/OrderSuccess";

const HomePage = () => (
  <>
    <HeroSection />
    <MessageSection />
    <FlavorSection />
    <BenefitSection />
  </>
);

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
      </Route>
    </Routes>
  );
};

export default App;
