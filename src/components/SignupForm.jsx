import { useState, useEffect, useRef } from "react";
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
  const [tab, setTab] = useState("email");

  // Email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Phone
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState("phone");
  const [countdown, setCountdown] = useState(0);

  const confirmationRef = useRef(null);
  const recaptchaRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  // Reset when switching tab
  useEffect(() => {
    setErrors({});
    setOtp("");
    setPhone("");
    setOtpStep("phone");
  }, [tab]);

  // Countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recaptchaRef.current) recaptchaRef.current.clear();
    };
  }, []);

  /* ================= GOOGLE ================= */
  const handleGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      const userRef = doc(db, "users", res.user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          email: res.user.email,
          name: res.user.displayName,
          photo: res.user.photoURL,
          createdAt: serverTimestamp(),
        });
      }

      toast.success("Welcome 🎉");
      navigate("/profile");
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ================= EMAIL ================= */
  const validateEmail = () => {
    const err = {};
    if (!email) err.email = "Email required";
    if (!password || password.length < 6)
      err.password = "Min 6 characters required";
    if (password !== confirmPassword)
      err.confirmPassword = "Passwords do not match";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleEmailSignup = async () => {
    if (!validateEmail()) return;

    try {
      setLoading(true);

      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        email,
        createdAt: serverTimestamp(),
      });

      toast.success("Account created 🎉");
      navigate("/profile");
      onSuccess();
    } catch (err) {
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  };

  /* ================= PHONE ================= */
  const setupRecaptcha = async () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.clear();
      recaptchaRef.current = null;
    }

    recaptchaRef.current = new RecaptchaVerifier(
      "recaptcha-signup",
      { size: "normal" },
      auth,
    );

    await recaptchaRef.current.render();
  };

  const handleSendOTP = async () => {
    setErrors({});

    let cleaned = phone.replace(/\D/g, "");

    if (cleaned.length !== 10) {
      setErrors({ phone: "Enter valid 10-digit number" });
      return;
    }

    cleaned = "+91" + cleaned;

    try {
      setLoading(true);

      await setupRecaptcha();

      const confirmation = await signInWithPhoneNumber(
        auth,
        cleaned,
        recaptchaRef.current,
      );

      confirmationRef.current = confirmation;
      setOtpStep("otp");
      setCountdown(30);

      toast.success("OTP sent 🚀");
    } catch (err) {
      console.error(err);

      setErrors({
        phone:
          err.code === "auth/too-many-requests"
            ? "Too many attempts. Try later."
            : err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setErrors({});

    if (!confirmationRef.current) {
      toast.error("Request OTP first");
      return;
    }

    if (otp.length !== 6) {
      setErrors({ otp: "Enter 6-digit OTP" });
      return;
    }

    try {
      setLoading(true);

      const result = await confirmationRef.current.confirm(otp);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          phone: user.phoneNumber,
          createdAt: serverTimestamp(),
        });
      }

      toast.success("Account created 🎉");
      navigate("/profile");
      onSuccess();
    } catch {
      setErrors({ otp: "Invalid OTP" });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg px-8 py-8 space-y-6">
      {/* Tabs */}
      <div className="flex rounded-xl border overflow-hidden">
        <button
          onClick={() => setTab("email")}
          className={`flex-1 py-2 ${
            tab === "email" ? "bg-black text-white" : ""
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setTab("phone")}
          className={`flex-1 py-2 ${
            tab === "phone" ? "bg-black text-white" : ""
          }`}
        >
          Phone
        </button>
      </div>

      {/* EMAIL */}
      {tab === "email" && (
        <>
          <input
            placeholder="Email"
            className="w-full border p-3 rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border p-3 rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full border p-3 rounded-xl"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            onClick={handleEmailSignup}
            className="w-full bg-black text-white py-3 rounded-xl"
          >
            Create Account
          </button>
        </>
      )}

      {/* PHONE */}
      {tab === "phone" && (
        <>
          {otpStep === "phone" && (
            <>
              <div className="flex">
                <span className="px-3 py-3 bg-gray-100 border rounded-l-xl">
                  +91
                </span>
                <input
                  className="w-full border p-3 rounded-r-xl"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter phone"
                />
              </div>

              <div id="recaptcha-signup"></div>

              <button
                onClick={handleSendOTP}
                className="w-full bg-black text-white py-3 rounded-xl"
              >
                Send OTP
              </button>
            </>
          )}

          {otpStep === "otp" && (
            <>
              <input
                className="w-full border p-3 rounded-xl text-center"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter OTP"
              />

              <button
                onClick={handleVerifyOTP}
                className="w-full bg-black text-white py-3 rounded-xl"
              >
                Verify OTP
              </button>
            </>
          )}
        </>
      )}

      {/* Google */}
      <button
        onClick={handleGoogle}
        className="w-full flex justify-center gap-2 border py-3 rounded-xl"
      >
        <FcGoogle /> Continue with Google
      </button>
    </div>
  );
}
