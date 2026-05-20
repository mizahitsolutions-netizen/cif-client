import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- AUTH LISTENER ---------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const ref = doc(db, "users", firebaseUser.uid);

        const snap = await getDoc(ref);

        if (!snap.exists()) {
          await setDoc(ref, {
            email: firebaseUser.email,
            createdAt: serverTimestamp(),
            cart: [],
          });
        }

        setUser(firebaseUser);
      } else {
        // CHECK PHONE LOGIN

        const phoneUser = localStorage.getItem("phoneUser");

        if (phoneUser) {
          setUser(JSON.parse(phoneUser));
        } else {
          setUser(null);
        }
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* ---------------- LOGOUT ---------------- */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}

    localStorage.removeItem("phoneUser");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        isAuthenticated: !!user, // ✅ useful everywhere
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
