import { useState, useEffect } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../firebase";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function ChangePassword() {
  const user = auth.currentUser;

  const [hasPassword, setHasPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- CHECK PROVIDER ---------- */

  useEffect(() => {
    const provider = user?.providerData?.some(
      (p) => p.providerId === "password",
    );

    setHasPassword(provider);
  }, [user]);

  /* ---------- UPDATE PASSWORD ---------- */

  const handleUpdate = async () => {
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      if (hasPassword) {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword,
        );

        await reauthenticateWithCredential(user, credential);
      }

      await updatePassword(user, newPassword);

      toast.success("Password updated successfully 🎉");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        setError("Current password is incorrect");
      } else if (err.code === "auth/requires-recent-login") {
        setError("Please logout and login again before updating password");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-md">
      <h2 className="text-lg font-semibold mb-4">
        {hasPassword ? "Change Password" : "Set Password"}
      </h2>

      {/* CURRENT PASSWORD */}

      {hasPassword && (
        <div className="mb-4 relative">
          <input
            type={showCurrent ? "text" : "password"}
            placeholder="Current Password"
            className="w-full border p-3 rounded-xl pr-10"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      )}

      {/* NEW PASSWORD */}

      <div className="mb-4 relative">
        <input
          type={showNew ? "text" : "password"}
          placeholder="New Password"
          className="w-full border p-3 rounded-xl pr-10"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* CONFIRM PASSWORD */}

      <div className="mb-4 relative">
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm Password"
          className="w-full border p-3 rounded-xl pr-10"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <p className="text-sm text-red-500 mb-3 text-center">{error}</p>
      )}

      {/* BUTTON */}

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-xl"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
}
