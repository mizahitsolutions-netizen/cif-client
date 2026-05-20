import { useEffect, useState } from "react";
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

  /* -------------------------------- */
  /* STATES */
  /* -------------------------------- */

  const [authMode, setAuthMode] = useState("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(0);

  /* -------------------------------- */
  /* TIMER */
  /* -------------------------------- */

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* -------------------------------- */
  /* ERROR MESSAGES */
  /* -------------------------------- */

  const getErrorMessage = (code) => {
    const errors = {
      "auth/invalid-phone-number": "Invalid phone number",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/code-expired": "OTP expired. Request again.",
      "auth/invalid-verification-code": "Incorrect OTP",
      "auth/email-already-in-use": "Email already registered",
      "auth/weak-password": "Password should be at least 6 characters",
      "auth/invalid-email": "Invalid email address",
    };

    return errors[code] || "Something went wrong";
  };

  /* -------------------------------- */
  /* GOOGLE LOGIN */
  /* -------------------------------- */

  const handleGoogle = async () => {
    try {
      setLoading(true);

      const res = await signInWithPopup(auth, provider);

      const userRef = doc(db, "users", res.user.uid);

      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: res.user.email,
          name: res.user.displayName,
          photo: res.user.photoURL,
          provider: "google",
          createdAt: serverTimestamp(),
        });
      }

      toast.success("Welcome 🎉");

      onSuccess ? onSuccess() : navigate("/profile");
    } catch (err) {
      toast.error(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------- */
  /* EMAIL SIGNUP */
  /* -------------------------------- */

  const handleEmailSignup = async () => {
    try {
      if (!email || !password || !confirmPassword) {
        toast.error("Please fill all fields");
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      setLoading(true);

      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        email,
        provider: "email",
        password,
        createdAt: serverTimestamp(),
      });

      toast.success("Account created 🎉");

      onSuccess ? onSuccess() : navigate("/profile");
    } catch (err) {
      toast.error(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------- */
  /* SETUP RECAPTCHA */
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

  /* -------------------------------- */
  /* SEND OTP */
  /* -------------------------------- */

  const handleSendOTP = async () => {
    try {
      if (loading) return;

      if (!phone || phone.length !== 10) {
        toast.error("Enter valid mobile number");
        return;
      }

      setLoading(true);

      const formattedPhone = `+91${phone}`;

      // CHECK DUPLICATE FIRST

      const existing = await getDoc(doc(db, "phoneUsers", formattedPhone));

      if (existing.exists()) {
        toast.error("Phone number already registered");

        return;
      }

      setupRecaptcha();

      // const formattedPhone = `+91${phone}`;

      const appVerifier = window.recaptchaVerifier;

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier,
      );

      setConfirmationResult(result);

      setOtpSent(true);

      setTimer(30);

      toast.success("OTP sent successfully");
    } catch (err) {
      console.error(err);

      toast.error(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------- */
  /* VERIFY OTP */
  /* -------------------------------- */

  const handleVerifyOTP = async () => {
    try {
      if (!confirmationResult) {
        toast.error("Request OTP again");
        return;
      }

      if (!password || !confirmPassword) {
        toast.error("Enter password");
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      setLoading(true);

      // CHECK IF NUMBER EXISTS

      const phoneRef = doc(db, "phoneUsers", `+91${phone}`);

      const existing = await getDoc(phoneRef);

      if (existing.exists()) {
        toast.error("Phone number already registered");

        setLoading(false);

        return;
      }

      // Verify OTP
      const res = await confirmationResult.confirm(otp);

      // Save user
      await setDoc(
        doc(db, "phoneUsers", res.user.phoneNumber),
        {
          uid: res.user.uid,
          phone: res.user.phoneNumber,
          password,
          provider: "phone",
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

      toast.success("Phone verified 🎉");

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/profile");
      }
    } catch (err) {
      console.error(err);

      toast.error(getErrorMessage(err.code) || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------- */
  /* UI */
  /* -------------------------------- */

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6 transition-all duration-300">
      {/* TOGGLE */}

      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setAuthMode("email")}
          className={`flex-1 py-2 rounded-xl transition-all duration-300 ${
            authMode === "email"
              ? "bg-white shadow font-medium text-black"
              : "text-gray-500"
          }`}
        >
          Email
        </button>

        <button
          onClick={() => setAuthMode("phone")}
          className={`flex-1 py-2 rounded-xl transition-all duration-300 ${
            authMode === "phone"
              ? "bg-white shadow font-medium text-black"
              : "text-gray-500"
          }`}
        >
          Mobile
        </button>
      </div>

      {/* EMAIL LOGIN */}

      {authMode === "email" && (
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-black/10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEmailSignup()}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border p-3 rounded-xl pr-12 outline-none focus:ring-2 focus:ring-black/10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-black/10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEmailSignup()}
          />

          <button
            onClick={handleEmailSignup}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl disabled:opacity-60 active:scale-[0.99] transition-all"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>
      )}

      {/* PHONE LOGIN */}

      {authMode === "phone" && (
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              +91
            </span>

            <input
              type="tel"
              placeholder="9876543210"
              className="w-full border p-3 pl-14 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              disabled={otpSent}
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border p-3 rounded-xl pr-12 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full border p-3 rounded-xl pr-12 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {!otpSent ? (
            <button
              onClick={handleSendOTP}
              disabled={loading || timer > 0}
              className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-60 active:scale-[0.99] transition-all"
            >
              {loading
                ? "Sending OTP..."
                : timer > 0
                  ? `Resend OTP in ${timer}s`
                  : "Send OTP"}
            </button>
          ) : (
            <>
              <input
                type="tel"
                placeholder="Enter 6-digit OTP"
                className="w-full border p-3 rounded-xl tracking-[0.3em] text-center outline-none focus:ring-2 focus:ring-green-100"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);

                  setOtp(value);

                  if (value.length === 6) {
                    handleVerifyOTP();
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
              />

              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-xl disabled:opacity-60 active:scale-[0.99] transition-all"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
                className="text-sm text-blue-600 text-center"
              >
                Change Number
              </button>
            </>
          )}
        </div>
      )}

      {/* GOOGLE LOGIN */}

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 border py-3 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-60"
      >
        <FcGoogle size={20} />
        Continue with Google
      </button>

      {/* RECAPTCHA */}

      <div id="recaptcha-container"></div>
    </div>
  );
}
