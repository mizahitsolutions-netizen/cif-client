import { X } from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { useUI } from "../context/UIContext";

export default function AuthModal({ open, onClose }) {
  const { authMode, setAuthMode } = useUI();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 relative">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
        >
          <X />
        </button>

        {/* TITLE */}
        <h2 className="text-2xl font-bold mb-6 text-center">
          {authMode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        {/* FORM */}
        {authMode === "login" ? (
          <LoginForm onSuccess={onClose} />
        ) : (
          <SignupForm onSuccess={onClose} />
        )}

        {/* SWITCH */}
        <p className="text-sm text-center mt-6">
          {authMode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setAuthMode("signup")}
                className="font-medium underline cursor-pointer"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setAuthMode("login")}
                className="font-medium underline cursor-pointer"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
