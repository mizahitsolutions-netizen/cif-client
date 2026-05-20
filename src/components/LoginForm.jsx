import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase";

import toast from "react-hot-toast";

import { Eye, EyeOff } from "lucide-react";

export default function LoginForm({ onSuccess }) {
  const [loginMode, setLoginMode] = useState("email");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  /* ---------------------- */
  /* VALIDATION */
  /* ---------------------- */

  useEffect(() => {
    const newErrors = {};

    if (loginMode === "email" && email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter valid email";
    }

    if (loginMode === "phone" && phone && phone.length !== 10) {
      newErrors.phone = "Enter valid mobile number";
    }

    if (password && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
  }, [email, phone, password, loginMode]);

  /* ---------------------- */
  /* EMAIL LOGIN */
  /* ---------------------- */

  const handleEmailLogin = async () => {
    try {
      setErrors({});

      if (!email.trim() || !password.trim()) {
        setErrors({
          general: "Email and password are required",
        });

        return;
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        setErrors({
          email: "Enter valid email",
        });

        return;
      }

      setLoading(true);

      const user = await signInWithEmailAndPassword(auth, email, password);

      console.log(user);

      toast.success("Logged in successfully 🎉");

      onSuccess?.();
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      let message = "Login failed";

      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          message = "Invalid email or password";
          break;

        case "auth/invalid-email":
          message = "Invalid email";
          break;

        case "auth/too-many-requests":
          message = "Too many attempts";
          break;

        default:
          message = err.message;
      }

      setErrors({
        general: message,
      });

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------- */
  /* PHONE LOGIN */
  /* ---------------------- */

  const handlePhoneLogin = async () => {
    try {
      setErrors({});

      if (!phone || !password) {
        setErrors({
          general: "Mobile and password required",
        });

        return;
      }

      setLoading(true);

      // FIX
      const phoneNumber = `+91${phone}`;

      const snap = await getDoc(doc(db, "phoneUsers", phoneNumber));

      if (!snap.exists()) {
        throw new Error("Account not found");
      }

      const user = snap.data();

      if (user.password !== password) {
        throw new Error("Incorrect password");
      }

      localStorage.setItem(
        "phoneUser",
        JSON.stringify({
          uid: user.uid,
          phone: phoneNumber,
          provider: "phone",
        }),
      );

      toast.success("Logged in successfully 🎉");

      onSuccess?.();
    } catch (err) {
      setErrors({
        general: err.message || "Login failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!email.trim()) {
        toast.error("Enter email address first");

        return;
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        toast.error("Enter valid email");

        return;
      }

      setLoading(true);

      await sendPasswordResetEmail(auth, email);

      toast.success("Password reset email sent 📩");
    } catch (err) {
      console.error(err);

      let msg = "Failed to send reset email";

      switch (err.code) {
        case "auth/user-not-found":
          msg = "Account not found";
          break;

        case "auth/invalid-email":
          msg = "Invalid email";
          break;

        default:
          msg = err.message;
      }

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------- */
  /* UI */
  /* ---------------------- */

  return (
    <div className="space-y-4">
      {/* MODE */}

      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setLoginMode("email")}
          className={`flex-1 py-2 rounded-xl ${
            loginMode === "email" ? "bg-white shadow" : ""
          }`}
        >
          Email
        </button>

        <button
          onClick={() => setLoginMode("phone")}
          className={`flex-1 py-2 rounded-xl ${
            loginMode === "phone" ? "bg-white shadow" : ""
          }`}
        >
          Mobile
        </button>
      </div>

      {/* EMAIL / PHONE */}

      {loginMode === "email" ? (
        <div>
          <input
            type="email"
            value={email}
            placeholder="Email"
            className={`w-full border p-3 rounded-xl ${
              errors.email ? "border-red-500" : ""
            }`}
            onChange={(e) => setEmail(e.target.value)}
          />

          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>
      ) : (
        <div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2">
              +91
            </span>

            <input
              type="tel"
              value={phone}
              placeholder="9876543210"
              className={`w-full border p-3 pl-14 rounded-xl ${
                errors.phone ? "border-red-500" : ""
              }`}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
            />
          </div>

          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>
      )}

      {/* PASSWORD */}

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          placeholder="Password"
          className={`w-full border p-3 rounded-xl pr-12 ${
            errors.password ? "border-red-500" : ""
          }`}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            (loginMode === "email" ? handleEmailLogin() : handlePhoneLogin())
          }
        />

        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {loginMode === "email" && (
        <div className="text-right">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-blue-600 hover:underline"
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>
      )}

      {errors.password && (
        <p className="text-xs text-red-500">{errors.password}</p>
      )}

      {/* GENERAL */}

      {errors.general && (
        <p className="text-red-500 text-sm text-center">{errors.general}</p>
      )}

      {/* BUTTON */}

      <button
        disabled={loading}
        onClick={() =>
          loginMode === "email" ? handleEmailLogin() : handlePhoneLogin()
        }
        className="w-full bg-black text-white py-3 rounded-xl"
      >
        {loading ? "Logging in..." : "Log In"}
      </button>
    </div>
  );
}
