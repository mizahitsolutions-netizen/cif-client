import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  /* -------------------------------- */
  /* GOOGLE LOGIN */
  /* -------------------------------- */

  const handleGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, provider);

      const userRef = doc(db, "users", res.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: res.user.email,
          name: res.user.displayName,
          photo: res.user.photoURL,
          createdAt: serverTimestamp(),
        });
      }

      toast.success("Welcome 🎉");
      navigate("/profile", { state: { tab: "password" } });
      onSuccess();
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* -------------------------------- */
  /* VALIDATION */
  /* -------------------------------- */

  const validate = () => {
    const newErrors = {};

    if (!email) newErrors.email = "Email is required";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* -------------------------------- */
  /* EMAIL SIGNUP */
  /* -------------------------------- */

  const handleEmailSignup = async () => {
    if (!validate()) return;

    try {
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
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg px-8 py-8 space-y-6">
      {/* <h2 className="text-xl font-semibold text-center">Create Account</h2> */}

      {/* EMAIL */}

      <div className="space-y-1">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-xl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      {/* PASSWORD */}

      <div className="space-y-1 relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full border p-3 rounded-xl pr-12"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-500 cursor-pointer"
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>

        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}
      </div>

      {/* CONFIRM PASSWORD */}

      <div className="space-y-1 relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm password"
          className="w-full border p-3 rounded-xl pr-12"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-3 text-gray-500 cursor-pointer"
        >
          {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
        </button>

        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
        )}
      </div>

      {/* SIGNUP BUTTON */}

      <button
        onClick={handleEmailSignup}
        className="w-full bg-black text-white py-3 rounded-xl cursor-pointer"
      >
        Create Account
      </button>

      {/* DIVIDER */}

      <div className="flex items-center gap-3 text-gray-400 text-sm">
        <div className="flex-1 h-[1px] bg-gray-200"></div>
        OR
        <div className="flex-1 h-[1px] bg-gray-200"></div>
      </div>

      {/* GOOGLE BUTTON */}

      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 border py-3 rounded-xl hover:bg-gray-50 transition cursor-pointer"
      >
        <FcGoogle size={20} />
        Continue with Google
      </button>
    </div>
  );
}
