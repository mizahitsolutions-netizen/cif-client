import { ShoppingCart, UserCircle, Menu, X } from "lucide-react";

import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";

import { useState, useRef, useEffect } from "react";

import CartDrawer from "./CartDrawer";
import AuthModal from "./AuthModal";
import ProfileDropdown from "./ProfileDropdown";

import { Link, NavLink } from "react-router-dom";

const NavBar = () => {
  const { cart, cartOpen, setCartOpen } = useCart();
  const { authOpen, closeAuth, openLogin } = useUI();
  const { user } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const profileRef = useRef(null);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  /* CLOSE PROFILE ON OUTSIDE CLICK */
  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  /* NAV LINK STYLE */
  const navLinkClass = ({ isActive }) =>
    `relative font-medium transition duration-300 
    after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-black 
    after:transition-all after:duration-300
    ${
      isActive
        ? "after:w-full text-black"
        : "after:w-0 hover:after:w-full text-gray-700 hover:text-black"
    }`;

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          {/* LOGO */}
          <Link to="/">
            <img
              src="/images/logo.png"
              alt="Crumbella"
              className="h-12 object-contain"
            />
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>

            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>

            <NavLink to="/about" className={navLinkClass}>
              About Us
            </NavLink>

            <NavLink to="/retail-enquiry" className={navLinkClass}>
              Retail Enquiry
            </NavLink>

            <NavLink to="/contact" className={navLinkClass}>
              Contact Us
            </NavLink>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-4">
            {/* LOGIN / PROFILE */}
            {!user ? (
              <button
                onClick={openLogin}
                className="hidden md:flex items-center gap-2 border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition"
              >
                <UserCircle size={20} />
                Login
              </button>
            ) : (
              <div ref={profileRef} className="relative hidden md:block">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="cursor-pointer"
                >
                  <UserCircle size={28} />
                </button>

                {profileOpen && (
                  <ProfileDropdown onClose={() => setProfileOpen(false)} />
                )}
              </div>
            )}

            {/* CART */}
            <button onClick={() => setCartOpen(true)} className="relative">
              <ShoppingCart size={28} />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* MOBILE MENU BUTTON */}
            <button className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* CLOSE BUTTON */}
          <div className="flex justify-end p-4">
            <button onClick={() => setMobileOpen(false)}>
              <X size={28} />
            </button>
          </div>

          {/* MOBILE LINKS */}
          <div className="flex flex-col gap-6 px-6 text-lg">
            <NavLink
              to="/"
              onClick={() => setMobileOpen(false)}
              className={navLinkClass}
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              onClick={() => setMobileOpen(false)}
              className={navLinkClass}
            >
              Products
            </NavLink>

            <NavLink
              to="/about"
              onClick={() => setMobileOpen(false)}
              className={navLinkClass}
            >
              About Us
            </NavLink>

            <NavLink
              to="/retail-enquiry"
              onClick={() => setMobileOpen(false)}
              className={navLinkClass}
            >
              Retail Enquiry
            </NavLink>

            <NavLink
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className={navLinkClass}
            >
              Contact Us
            </NavLink>

            <NavLink
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className={navLinkClass}
            >
              Profile
            </NavLink>

            {!user && (
              <button
                onClick={() => {
                  openLogin();
                  setMobileOpen(false);
                }}
                className="border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DRAWERS */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <AuthModal open={authOpen} onClose={closeAuth} />
    </>
  );
};

export default NavBar;
