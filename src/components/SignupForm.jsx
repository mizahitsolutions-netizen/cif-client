import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

/* 🔐 Regex */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

export default function SignupForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------- LIVE VALIDATION ---------- */
  const emailValid = email === "" || emailRegex.test(email);
  const passwordValid = password === "" || passwordRegex.test(password);
  const confirmValid = confirmPassword === "" || password === confirmPassword;

  const formValid =
    emailRegex.test(email) &&
    passwordRegex.test(password) &&
    password === confirmPassword;

  const handleSignup = async () => {
    if (!formValid) {
      toast.error("Please fix the errors before continuing");
      return;
    }

    try {
      setLoading(true);

      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        email,
        createdAt: serverTimestamp(),
      });

      toast.success("Account created 🎉");
      onSuccess();
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        toast.error("Email already registered");
      } else {
        toast.error("Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* EMAIL */}
      <div>
        <input
          className={`w-full border p-3 rounded-xl ${
            !emailValid ? "border-red-500" : ""
          }`}
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!emailValid && (
          <p className="text-xs text-red-500 mt-1">
            Enter a valid email address
          </p>
        )}
      </div>

      {/* PASSWORD */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className={`w-full border p-3 rounded-xl pr-10 ${
            !passwordValid ? "border-red-500" : ""
          }`}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        {!passwordValid && (
          <p className="text-xs text-red-500 mt-1">
            Min 6 chars, 1 uppercase, 1 lowercase, 1 number
          </p>
        )}
      </div>

      {/* CONFIRM PASSWORD */}
      <div className="relative">
        <input
          type={showConfirm ? "text" : "password"}
          className={`w-full border p-3 rounded-xl pr-10 ${
            !confirmValid ? "border-red-500" : ""
          }`}
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowConfirm((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        {!confirmValid && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
        )}
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSignup}
        disabled={!formValid || loading}
        className={`w-full py-3 rounded-xl font-semibold transition cursor-pointer ${
          formValid
            ? "bg-black text-white hover:bg-gray-800"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </div>
  );
}
