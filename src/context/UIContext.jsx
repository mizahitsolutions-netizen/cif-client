import { createContext, useContext, useState } from "react";

const UIContext = createContext();
export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const openLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  const openSignup = () => {
    setAuthMode("signup");
    setAuthOpen(true);
  };

  const closeAuth = () => setAuthOpen(false);

  return (
    <UIContext.Provider
      value={{
        authOpen,
        authMode,
        openLogin,
        openSignup,
        closeAuth,
        setAuthMode, // ✅ IMPORTANT
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
