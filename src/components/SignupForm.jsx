import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  signInWithPopup,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function SignupForm({ onSuccess }) {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const [authMode, setAuthMode] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* -------------------------------- */
  /* GOOGLE LOGIN */
  /* -------------------------------- */

  const handleGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      const ref = doc(db, "users", res.user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          email: res.user.email,
          name: res.user.displayName,
          photo: res.user.photoURL,
          createdAt: serverTimestamp(),
        });
      }

      toast.success("Welcome 🎉");
      navigate("/profile");
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* -------------------------------- */
  /* EMAIL SIGNUP */
  /* -------------------------------- */

  const handleEmailSignup = async () => {
    if (!email || !password || password !== confirmPassword) {
      toast.error("Check your inputs");
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
      onSuccess ? onSuccess() : navigate("/profile");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------- */
  /* FORMAT PHONE */
  /* -------------------------------- */

  const formatPhone = (num) => {
    let cleaned = num.replace(/\D/g, "");
    if (cleaned.length === 10) return "+91" + cleaned;
    if (cleaned.length === 12 && cleaned.startsWith("91")) return "+" + cleaned;
    return null;
  };

  /* -------------------------------- */
  /* SEND OTP */
  /* -------------------------------- */

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        },
      );
    }
  };

  const handleSendOTP = async () => {
    try {
      setLoading(true);

      if (!phone || phone.length !== 10) {
        toast.error("Enter valid mobile number");
        return;
      }

      setupRecaptcha();

      const appVerifier = window.recaptchaVerifier;

      const formattedPhone = `+91${phone}`;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier,
      );

      setConfirmationResult(confirmationResult);

      setOtpSent(true);

      toast.success("OTP sent successfully");
    } catch (err) {
      console.error(err);

      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  /* -------------------------------- */
  /* VERIFY OTP */
  /* -------------------------------- */

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      if (!confirmationResult) {
        toast.error("Please request OTP again");
        return;
      }

      const res = await confirmationResult.confirm(otp);

      await setDoc(doc(db, "users", res.user.uid), {
        phone: res.user.phoneNumber,
        createdAt: serverTimestamp(),
      });

      toast.success("Phone verified 🎉");
      navigate("/profile");
    } catch {
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------- */
  /* UI */
  /* -------------------------------- */

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
      {/* TOGGLE */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setAuthMode("email")}
          className={`flex-1 py-2 rounded-xl transition-all ${
            authMode === "email"
              ? "bg-white shadow font-medium"
              : "text-gray-500"
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setAuthMode("phone")}
          className={`flex-1 py-2 rounded-xl transition-all ${
            authMode === "phone"
              ? "bg-white shadow font-medium"
              : "text-gray-500"
          }`}
        >
          Mobile
        </button>
      </div>

      {/* EMAIL */}
      {authMode === "email" && (
        <>
          <input
            placeholder="Email"
            className="w-full border p-3 rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border p-3 rounded-xl pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border p-3 rounded-xl"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            onClick={handleEmailSignup}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl disabled:opacity-60"
          >
            {loading ? "Loading..." : "Create Account"}
          </button>
        </>
      )}

      {/* PHONE */}
      {authMode === "phone" && (
        <>
          <input
            placeholder="9876543210"
            className="w-full border p-3 rounded-xl"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {!otpSent ? (
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <>
              <input
                placeholder="Enter OTP"
                className="w-full border p-3 rounded-xl"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-xl disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}
        </>
      )}

      {/* GOOGLE */}
      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 border py-3 rounded-xl hover:bg-gray-50 transition-all"
      >
        <FcGoogle size={20} />
        Continue with Google
      </button>

      <div id="recaptcha-container"></div>
    </div>
  );
}
