import { ShoppingCart, UserCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";

import CartDrawer from "./CartDrawer";
import AuthModal from "./AuthModal";
import ProfileDropdown from "./ProfileDropdown";
import { Link } from "react-router-dom";

const NavBar = () => {
  const { cart, cartOpen, setCartOpen } = useCart();
  const { authOpen, closeAuth, openLogin } = useUI();
  const { user } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  /* 🔒 CLOSE PROFILE DROPDOWN ON OUTSIDE CLICK */
  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-7 py-3">
        {/* LOGO */}
        <Link to="/" aria-label="Go to home">
          <img
            src="/images/logo.png"
            alt="Crumbella"
            className="max-h-[56px] object-contain cursor-pointer"
          />
        </Link>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-5 relative">
          {/* AUTH / PROFILE */}
          {!user ? (
            <button
              onClick={openLogin}
              className="flex items-center gap-2 border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition"
            >
              <UserCircle size={20} />
              <span className="hidden sm:block">Login</span>
            </button>
          ) : (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className={`flex items-center gap-2 cursor-pointer transition-transform ${profileOpen ? "rotate-180" : ""}`}
                aria-label="Profile menu"
              >
                <UserCircle size={28} />
              </button>

              {profileOpen && (
                <ProfileDropdown onClose={() => setProfileOpen(false)} />
              )}
            </div>
          )}

          {/* CART ICON */}
          {cartCount > 0 && (
            <button
              onClick={() => setCartOpen(true)}
              className="relative cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingCart size={28} />
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* ================= DRAWERS / MODALS ================= */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <AuthModal open={authOpen} onClose={closeAuth} />
    </>
  );
};

export default NavBar;
