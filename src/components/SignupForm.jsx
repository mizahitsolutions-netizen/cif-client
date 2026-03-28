import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import { auth, db } from "../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function SignupForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loadingOTP, setLoadingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  /* ---------------- VALIDATION ---------------- */

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[6-9]\d{9}$/;

  const validate = () => {
    const newErrors = {};

    if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- GOOGLE LOGIN ---------------- */

  const handleGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, provider);

      const userRef = doc(db, "users", res.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: res.user.email,
          name: res.user.displayName,
          createdAt: serverTimestamp(),
        });
      }

      toast.success("Welcome 🎉");
      onSuccess();
    } catch (error) {
      toast.error("Google login failed");
    }
  };

  /* ---------------- EMAIL SIGNUP ---------------- */

  const handleEmailSignup = async () => {
    if (!validate()) return;

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        email,
        createdAt: serverTimestamp(),
      });

      toast.success("Account created 🎉");
      onSuccess();
    } catch (err) {
      toast.error("Signup failed");
    }
  };

  /* ---------------- PHONE AUTH ---------------- */

  const setupRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            console.log("Recaptcha solved");
          },
          "expired-callback": () => {
            console.log("Recaptcha expired");
            window.recaptchaVerifier = null;
          },
        },
        auth,
      );
    } catch (err) {
      console.error("Recaptcha init error", err);
    }
  };

  const formatPhone = (phone) => {
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("91")) cleaned = cleaned.slice(2);
    return "+91" + cleaned;
  };

  /* ---------------- SEND OTP ---------------- */

  const handleSendOTP = async () => {
    if (loadingOTP || cooldown > 0) return;

    if (!phoneRegex.test(phone)) {
      toast.error("Enter valid 10-digit Indian number");
      return;
    }

    try {
      setLoadingOTP(true);
      setupRecaptcha();

      const appVerifier = window.recaptchaVerifier;

      await appVerifier.render();

      const result = await signInWithPhoneNumber(
        auth,
        formatPhone(phone),
        window.recaptchaVerifier,
      );

      setConfirmationResult(result);
      toast.success("OTP sent!");

      // cooldown
      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error(error);

      if (error.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Try later.");
      } else {
        toast.error("Failed to send OTP");
      }
    }

    setLoadingOTP(false);
  };

  /* ---------------- VERIFY OTP ---------------- */

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      toast.error("Enter valid OTP");
      return;
    }

    try {
      setVerifyingOTP(true);

      const res = await confirmationResult.confirm(otp);

      await setDoc(doc(db, "users", res.user.uid), {
        phone: res.user.phoneNumber,
        createdAt: serverTimestamp(),
      });

      toast.success("Phone verified 🎉");
      onSuccess();
    } catch (error) {
      toast.error("Invalid OTP");
    }

    setVerifyingOTP(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg px-8 py-8 space-y-6">
      {/* EMAIL */}
      <input
        type="email"
        placeholder="Email"
        className="w-full border p-3 rounded-xl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email && <p className="text-red-500">{errors.email}</p>}

      {/* PASSWORD */}
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

      {/* CONFIRM PASSWORD */}
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm password"
          className="w-full border p-3 rounded-xl pr-10"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-3"
        >
          {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>

      {/* EMAIL SIGNUP */}
      <button
        onClick={handleEmailSignup}
        className="w-full bg-black text-white py-3 rounded-xl"
      >
        Create Account
      </button>

      {/* GOOGLE */}
      <button
        onClick={handleGoogle}
        className="w-full border py-3 rounded-xl flex justify-center gap-2"
      >
        <FcGoogle /> Google
      </button>

      {/* PHONE */}
      <input
        type="text"
        placeholder="Phone number"
        className="w-full border p-3 rounded-xl"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button
        onClick={handleSendOTP}
        disabled={loadingOTP || cooldown > 0}
        className="w-full bg-blue-500 text-white py-2 rounded-xl"
      >
        {loadingOTP
          ? "Sending..."
          : cooldown > 0
            ? `Retry in ${cooldown}s`
            : "Send OTP"}
      </button>

      {/* OTP */}
      {confirmationResult && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full border p-3 rounded-xl"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            onClick={handleVerifyOTP}
            disabled={verifyingOTP}
            className="w-full bg-green-500 text-white py-2 rounded-xl"
          >
            {verifyingOTP ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
}
