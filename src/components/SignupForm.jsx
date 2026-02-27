import { useState, useEffect, useRef } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  getDocs,
  query,
  collection,
  where,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const phoneRegex = /^[6-9]\d{9}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

export default function SignupForm({ onSuccess }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [timer, setTimer] = useState(0);
  const [otpVisibleTimer, setOtpVisibleTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const otpRefs = useRef([]);

  /* ---------- LIVE VALIDATION ---------- */
  useEffect(() => {
    let newErrors = {};

    if (mobile && !phoneRegex.test(mobile)) {
      newErrors.mobile = "Enter valid 10-digit mobile number";
    }

    if (password && !passwordRegex.test(password)) {
      newErrors.password =
        "Min 6 chars, 1 uppercase, 1 lowercase, 1 number required";
    }

    if (confirmPassword && confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
  }, [mobile, password, confirmPassword]);

  /* ---------- OTP EXPIRY TIMER ---------- */
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  /* ---------- OTP VISIBLE TIMER ---------- */
  useEffect(() => {
    let interval;
    if (otpVisibleTimer > 0) {
      interval = setInterval(
        () => setOtpVisibleTimer((prev) => prev - 1),
        1000,
      );
    }
    return () => clearInterval(interval);
  }, [otpVisibleTimer]);

  const checkDuplicateMobile = async () => {
    const q = query(
      collection(db, "users"),
      where("mobile", "==", `+91${mobile}`),
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  };

  const handleSendOtp = async () => {
    if (Object.keys(errors).length > 0) return;

    const duplicate = await checkDuplicateMobile();
    if (duplicate) {
      setErrors({ mobile: "Mobile number already registered" });
      return;
    }

    const randomOtp = Math.floor(1000 + Math.random() * 9000);

    setGeneratedOtp(randomOtp.toString());
    setTimer(60);
    setOtpVisibleTimer(10);
    setAttempts(0);
    setOtpValues(["", "", "", ""]);

    toast.success("OTP generated successfully");
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otpValues];
    updatedOtp[index] = value;
    setOtpValues(updatedOtp);

    if (value && index < 3) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otpValues.join("");

    if (timer === 0) {
      setErrors({ otp: "OTP expired. Please resend." });
      return;
    }

    if (attempts >= 3) {
      setErrors({ otp: "Maximum attempts reached" });
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setAttempts((prev) => prev + 1);
      setErrors({ otp: "Invalid OTP" });
      return;
    }

    try {
      setLoading(true);

      const fakeEmail = `91${mobile}@mobile.app`;

      const res = await createUserWithEmailAndPassword(
        auth,
        fakeEmail,
        password,
      );

      await setDoc(doc(db, "users", res.user.uid), {
        mobile: `+91${mobile}`,
        createdAt: serverTimestamp(),
      });

      toast.success("Account created successfully 🎉");
      onSuccess();
    } catch {
      toast.error("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile */}
      <input
        type="tel"
        maxLength={10}
        className="w-full border p-3 rounded-xl"
        placeholder="Mobile number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
      />

      {/* Password */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className="w-full border p-3 rounded-xl pr-10"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          className="w-full border p-3 rounded-xl pr-10"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {!generatedOtp && (
        <button
          onClick={handleSendOtp}
          className="w-full py-3 bg-black text-white rounded-xl"
        >
          Send OTP
        </button>
      )}

      {generatedOtp && (
        <>
          {otpVisibleTimer > 0 && (
            <div className="text-center text-green-600 font-semibold">
              Your OTP: {generatedOtp} ({otpVisibleTimer}s)
            </div>
          )}

          {/* 4 OTP Boxes */}
          <div className="flex justify-center gap-3">
            {otpValues.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                className="w-12 h-12 text-center border rounded-lg text-lg font-semibold"
              />
            ))}
          </div>

          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-xl"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center text-sm text-gray-500">
            {timer > 0 ? `Resend OTP in ${timer}s` : "You can resend OTP now"}
          </div>
        </>
      )}
    </div>
  );
}
