import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  /* ---------------- CART ITEMS ---------------- */
  const [cart, setCart] = useState([]);

  /* ---------------- CART DRAWER ---------------- */
  const [cartOpen, setCartOpen] = useState(false);

  /* ---------------- LOAD CART ---------------- */
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // 🔥 USER CART FROM FIRESTORE
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setCart(snap.data().cart || []);
        } else {
          setCart([]);
        }
      } else {
        // 🧑‍ Guest cart from localStorage
        const stored = localStorage.getItem("cart");
        setCart(stored ? JSON.parse(stored) : []);
      }
    };

    loadCart();
  }, [user]);

  /* ---------------- SAVE CART ---------------- */
  useEffect(() => {
    if (user) {
      updateDoc(doc(db, "users", user.uid), {
        cart,
      }).catch(() => {});
    } else {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, user]);

  /* ---------------- MERGE CART AFTER LOGIN ---------------- */
  useEffect(() => {
    if (!user) return;

    const mergeGuestCart = async () => {
      const guestCart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (guestCart.length === 0) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      const userCart = snap.exists() ? snap.data().cart || [] : [];

      const merged = [...userCart];

      guestCart.forEach((item) => {
        const existing = merged.find((i) => i.id === item.id);
        if (existing) {
          existing.qty += item.qty;
        } else {
          merged.push(item);
        }
      });

      await updateDoc(ref, { cart: merged });
      localStorage.removeItem("cart");
      setCart(merged);
    };

    mergeGuestCart();
  }, [user]);

  /* ---------------- CART ACTIONS ---------------- */
  const addToCart = (product, qty, options = { openDrawer: true }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item,
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          packageType: product.packageType,
          qty,
        },
      ];
    });

    // 🔑 CONTROL DRAWER OPEN
    if (options.openDrawer) {
      setCartOpen(true);
    }
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item)),
    );
  };

  const clearCart = () => {
    setCart([]);
    setCartOpen(false);
  };

  /* ---------------- PROVIDER ---------------- */
  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
