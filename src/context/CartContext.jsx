import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { useRef } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);
  const isMerging = useRef(false);

  /* ---------------- MERGE HELPER ---------------- */
  const mergeCarts = (firestoreCart = [], localCart = []) => {
    const map = new Map();

    [...firestoreCart, ...localCart].forEach((item) => {
      if (map.has(item.id)) {
        map.get(item.id).qty += item.qty;
      } else {
        map.set(item.id, { ...item });
      }
    });

    return Array.from(map.values());
  };

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    setCart(stored ? JSON.parse(stored) : []);
    setCartLoaded(true);
  }, []);

  /* ---------------- LOGIN LOGIC ---------------- */
  useEffect(() => {
    if (!user || !cartLoaded) return;

    const handleLogin = async () => {
      try {
        isMerging.current = true;

        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        const firestoreCart = snap.exists() ? snap.data().cart || [] : [];

        const merged = mergeCarts(firestoreCart, localCart);

        await updateDoc(ref, { cart: merged });

        setCart(merged);
        localStorage.removeItem("cart");
      } catch (err) {
        console.error("Cart merge failed:", err);
      } finally {
        isMerging.current = false;
      }
    };

    handleLogin();
  }, [user, cartLoaded]);

  /* ---------------- LOGOUT LOGIC ---------------- */
  useEffect(() => {
    if (!cartLoaded) return;

    if (user === null) {
      // 🔥 Clear everything on logout
      setCart([]);
      localStorage.removeItem("cart");
    }
  }, [user, cartLoaded]);

  /* ---------------- SAVE CART ---------------- */
  useEffect(() => {
    if (!cartLoaded) return;
    if (isMerging.current) return;

    const saveCart = async () => {
      try {
        if (user) {
          await updateDoc(doc(db, "users", user.uid), { cart });
        } else {
          localStorage.setItem("cart", JSON.stringify(cart));
        }
      } catch (err) {
        console.error("Cart save failed:", err);
      }
    };

    saveCart();
  }, [cart, user, cartLoaded]);

  /* ---------------- CART ACTIONS ---------------- */
  const addToCart = (product, qty, options = { openDrawer: true }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);

      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i,
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

    if (options.openDrawer) setCartOpen(true);
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id, qty) =>
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
    );

  const clearCart = async () => {
    setCart([]);
    setCartOpen(false);

    if (user) {
      await updateDoc(doc(db, "users", user.uid), { cart: [] });
    }

    localStorage.removeItem("cart");
  };

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
