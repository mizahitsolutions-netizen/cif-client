import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [isAuthTransitioning, setIsAuthTransitioning] = useState(false);

  /* ---------------- MERGE HELPER ---------------- */
  const mergeCarts = (a = [], b = []) => {
    const map = new Map();

    [...a, ...b].forEach((item) => {
      if (map.has(item.id)) {
        map.get(item.id).qty += item.qty;
      } else {
        map.set(item.id, { ...item });
      }
    });

    return Array.from(map.values());
  };

  /* ---------------- INITIAL LOAD (ONCE) ---------------- */
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    setCart(stored ? JSON.parse(stored) : []);
    setCartLoaded(true);
  }, []);

  /* ---------------- HANDLE LOGIN ---------------- */
  useEffect(() => {
    if (!user || !cartLoaded) return;

    const syncOnLogin = async () => {
      setIsAuthTransitioning(true);

      const guestCart = JSON.parse(localStorage.getItem("cart") || "[]");

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const userCart = snap.exists() ? snap.data().cart || [] : [];

      const merged = mergeCarts(userCart, guestCart);

      await updateDoc(ref, { cart: merged });
      localStorage.removeItem("cart");

      setCart(merged);
      setIsAuthTransitioning(false);
    };

    syncOnLogin();
  }, [user, cartLoaded]);

  /* ---------------- HANDLE LOGOUT ---------------- */
  useEffect(() => {
    if (user !== null) return;
    if (!cartLoaded) return;

    // 🔐 preserve cart when logging out
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [user, cartLoaded]); // intentionally NOT watching cart

  /* ---------------- SAVE CART ---------------- */
  useEffect(() => {
    if (!cartLoaded || isAuthTransitioning) return;

    if (user) {
      updateDoc(doc(db, "users", user.uid), { cart }).catch(() => {});
    } else {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, user, cartLoaded, isAuthTransitioning]);

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
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));

  const clearCart = () => {
    setCart([]);
    setCartOpen(false);
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
