import { useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import toast from "react-hot-toast";

const CartDrawer = ({ open, onClose }) => {
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const isFirstRender = useRef(true);
  const navigate = useNavigate();

  const { user } = useAuth();
  const { openLogin } = useUI();
  const { cart, removeFromCart, updateQty } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const FREE_SHIPPING_LIMIT = 500;

  const remaining = FREE_SHIPPING_LIMIT - total;
  const isFreeShipping = total >= FREE_SHIPPING_LIMIT;

  /* ---------------- BODY SCROLL LOCK ---------------- */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  /* ---------------- GSAP ---------------- */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (open) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.25,
      });
      gsap.to(drawerRef.current, {
        x: 0,
        duration: 0.35,
        ease: "power3.out",
      });
    } else {
      gsap.to(drawerRef.current, {
        x: "100%",
        duration: 0.3,
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.25,
      });
    }
  }, [open]);

  /* ---------------- CHECKOUT ---------------- */
  const handleCheckout = () => {
    onClose();

    const phoneUser = localStorage.getItem("phoneUser");

    const currentUser = user || (phoneUser ? JSON.parse(phoneUser) : null);

    if (!currentUser) {
      openLogin();

      toast("Please login to continue", {
        icon: "🔒",
      });

      return;
    }

    navigate("/checkout");

    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* OVERLAY */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 opacity-0 pointer-events-none z-40"
      />

      {/* DRAWER */}
      <aside
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full sm:w-[420px]
        bg-white z-50 shadow-xl flex flex-col translate-x-full"
      >
        {/* HEADER */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 && (
            <p className="text-center text-gray-500">Your cart is empty</p>
          )}

          {cart.map((item) => {
            return (
              <div key={item.id} className="flex gap-4">
                <div className="bg-[#f8f4ef] w-20 h-20 rounded-lg flex items-center justify-center">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="max-h-full object-contain"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.packageType} Pack
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    {/* QTY CONTROLS */}
                    <div className="flex items-center bg-gray-100 rounded-full px-2">
                      <button
                        onClick={() => {
                          if (item.qty <= 1) return;
                          updateQty(item.id, item.qty - 1);
                        }}
                        className="px-2 cursor-pointer"
                      >
                        −
                      </button>

                      <span className="px-2 text-sm">{item.qty}</span>

                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="px-2 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-red-500 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="font-semibold">₹{item.price * item.qty}</div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t">
          {/* FREE SHIPPING MESSAGE ONLY */}
          {!isFreeShipping && (
            <p className="text-sm text-center text-orange-600 mb-3">
              Add ₹{remaining} more to get FREE delivery 🚚
            </p>
          )}

          {isFreeShipping && (
            <p className="text-sm text-center text-green-600 mb-3">
              🎉 You unlocked FREE delivery!
            </p>
          )}

          {/* TOTAL ONLY */}
          <div className="flex justify-between font-semibold mb-4 text-lg">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full border border-black bg-black text-white py-3 rounded-xl hover:bg-white hover:text-black transition cursor-pointer"
          >
            Proceed to Checkout
          </button>

          {/* 🔥 CONTINUE SHOPPING BUTTON */}
          {!isFreeShipping && (
            <button
              onClick={() => {
                onClose();
                navigate("/products");
              }}
              className="w-full mt-3 border border-black bg-black text-white py-3 rounded-xl hover:bg-white hover:text-black  transition cursor-pointer"
            >
              Continue Shopping
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
