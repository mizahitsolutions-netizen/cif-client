import { useState, useEffect, useRef } from "react";
import {
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "../firebase";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm({ onSuccess }) {
  // ── Tab ──────────────────────────────────────────────
  const [tab, setTab] = useState("email"); // "email" | "phone"

  // ── Email fields ──────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ── Phone / OTP fields ────────────────────────────────
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState("phone"); // "phone" | "otp"
  const [countdown, setCountdown] = useState(0);
  const confirmationRef = useRef(null);
  const recaptchaRef = useRef(null);

  // ── Shared ────────────────────────────────────────────
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset state when switching tabs
  useEffect(() => {
    setErrors({});
    setOtpStep("phone");
    setOtp("");
    setPhone("");
  }, [tab]);

  // Live validation for email tab
  useEffect(() => {
    if (tab !== "email") return;
    const newErrors = {};
    if (email && !/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Enter a valid email address";
    if (password && password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
  }, [email, password, tab]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Cleanup reCAPTCHA
  useEffect(() => {
    return () => {
      if (recaptchaRef.current) recaptchaRef.current.clear();
    };
  }, []);

  /* ─────────────────────────────────────────────────── */
  /* EMAIL LOGIN                                         */
  /* ─────────────────────────────────────────────────── */
  const handleLogin = async () => {
    if (!email || !password) {
      setErrors({ general: "Email and password are required" });
      return;
    }
    if (Object.keys(errors).length > 0) return;
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully 🎉");
      onSuccess();
    } catch (err) {
      setErrors({ general: "Invalid email or password" });
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────── */
  /* PHONE — SEND OTP                                    */
  /* ─────────────────────────────────────────────────── */
  const handleSendOTP = async () => {
    setErrors({});
    const cleaned = phone.trim();
    if (!cleaned || cleaned.length < 10) {
      setErrors({ phone: "Enter a valid number with country code e.g. +91XXXXXXXXXX" });
      return;
    }
    try {
      setLoading(true);
      if (recaptchaRef.current) recaptchaRef.current.clear();
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-login", {
        size: "invisible",
      });
      const confirmation = await signInWithPhoneNumber(
        auth,
        cleaned,
        recaptchaRef.current
      );
      confirmationRef.current = confirmation;
      setOtpStep("otp");
      setCountdown(30);
      toast.success("OTP sent!");
    } catch (err) {
      setErrors({ phone: err.message || "Failed to send OTP. Try again." });
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────── */
  /* PHONE — VERIFY OTP & LOGIN                          */
  /* ─────────────────────────────────────────────────── */
  const handleVerifyOTP = async () => {
    setErrors({});
    if (!otp || otp.length !== 6) {
      setErrors({ otp: "Enter the 6-digit OTP" });
      return;
    }
    try {
      setLoading(true);
      await confirmationRef.current.confirm(otp);
      toast.success("Logged in successfully 🎉");
      onSuccess();
    } catch (err) {
      setErrors({ otp: "Incorrect OTP. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────── */
  /* RENDER                                              */
  /* ─────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">

      {/* ── TAB SWITCHER ── */}
      <div className="flex rounded-xl border overflow-hidden">
        <button
          onClick={() => setTab("email")}
          className={`flex-1 py-2.5 text-sm font-medium transition cursor-pointer ${
            tab === "email"
              ? "bg-black text-white"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setTab("phone")}
          className={`flex-1 py-2.5 text-sm font-medium transition cursor-pointer ${
            tab === "phone"
              ? "bg-black text-white"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          Phone
        </button>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* EMAIL TAB                                      */}
      {/* ══════════════════════════════════════════════ */}
      {tab === "email" && (
        <>
          {/* EMAIL */}
          <div>
            <input
              type="email"
              className={`w-full border p-3 rounded-xl ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
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
            className="w-full bg-black text-white py-3 rounded-xl cursor-pointer disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* PHONE TAB                                      */}
      {/* ══════════════════════════════════════════════ */}
      {tab === "phone" && (
        <>
          {otpStep === "phone" && (
            <>
              <div>
                <input
                  type="tel"
                  placeholder="+91XXXXXXXXXX"
                  className={`w-full border p-3 rounded-xl ${
                    errors.phone ? "border-red-500" : ""
                  }`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Invisible reCAPTCHA anchor — must stay in DOM */}
              <div id="recaptcha-login"></div>

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-xl cursor-pointer disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </>
          )}

          {otpStep === "otp" && (
            <>
              <p className="text-sm text-gray-500 text-center">
                OTP sent to <span className="font-medium">{phone}</span>
              </p>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  className={`w-full border p-3 rounded-xl text-center text-xl tracking-[0.5em] font-mono ${
                    errors.otp ? "border-red-500" : ""
                  }`}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
                {errors.otp && (
                  <p className="text-xs text-red-500 mt-1 text-center">{errors.otp}</p>
                )}
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-xl cursor-pointer disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify & Log In"}
              </button>

              <div className="text-center text-sm text-gray-500">
                {countdown > 0 ? (
                  <span>Resend in {countdown}s</span>
                ) : (
                  <button
                    onClick={() => {
                      setOtpStep("phone");
                      setOtp("");
                      setErrors({});
                    }}
                    className="text-black underline cursor-pointer"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
