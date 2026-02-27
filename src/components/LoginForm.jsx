import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const phoneRegex = /^[6-9]\d{9}$/;

export default function LoginForm({ onSuccess }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ---------- LIVE VALIDATION ---------- */
  useEffect(() => {
    let newErrors = {};

    if (mobile && !phoneRegex.test(mobile)) {
      newErrors.mobile = "Enter valid 10-digit mobile number";
    }

    if (password && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
  }, [mobile, password]);

  /* ---------- LOGIN ---------- */
  const handleLogin = async () => {
    if (!mobile || !password) {
      toast.error("All fields are required");
      return;
    }

    if (Object.keys(errors).length > 0) return;

    try {
      setLoading(true);

      const fakeEmail = `91${mobile}@mobile.app`;

      await signInWithEmailAndPassword(auth, fakeEmail, password);

      toast.success("Logged in successfully 🎉");
      onSuccess();
    } catch (err) {
      setErrors({ general: "Invalid mobile number or password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* MOBILE */}
      <div>
        <input
          type="tel"
          maxLength={10}
          className={`w-full border p-3 rounded-xl ${
            errors.mobile ? "border-red-500" : ""
          }`}
          placeholder="Mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
        />
        {errors.mobile && (
          <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>
        )}
      </div>

      {/* PASSWORD WITH EYE TOGGLE */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className={`w-full border p-3 rounded-xl pr-10 ${
            errors.password ? "border-red-500" : ""
          }`}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password}</p>
        )}
      </div>

      {/* GENERAL ERROR */}
      {errors.general && (
        <p className="text-sm text-red-500 text-center">{errors.general}</p>
      )}

      {/* LOGIN BUTTON */}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-xl cursor-pointer"
      >
        {loading ? "Logging in..." : "Log In"}
      </button>
    </div>
  );
}
