import { User, LogOut, Package } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import toast from "react-hot-toast";

export default function ProfileDropdown({ onClose }) {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const tl = useRef(null);

  /* 🎬 GSAP ENTER ANIMATION */
  useEffect(() => {
    tl.current = gsap.timeline({ paused: true });

    tl.current.fromTo(
      dropdownRef.current,
      {
        opacity: 0,
        scale: 0.96,
        y: -8,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.18,
        ease: "power2.out",
      },
    );

    tl.current.play();

    return () => {
      tl.current?.kill();
    };
  }, []);

  /* 🔒 CLOSE WITH ANIMATION */
  const handleClose = async (action) => {
    if (tl.current) {
      await tl.current.reverse();
    }

    if (action) {
      await action();
    }

    onClose();
  };

  /* 🚪 LOGOUT HANDLER */
  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");

    // 👉 Redirect ONLY if user was in profile section
    if (location.pathname.startsWith("/profile")) {
      navigate("/");
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="
        absolute right-0 mt-3 w-48
        bg-white/95 backdrop-blur
        rounded-xl border shadow-xl
        overflow-hidden z-50
        origin-top-right
      "
    >
      {/* PROFILE */}
      <Link
        to="/profile"
        onClick={() => handleClose()}
        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
      >
        <User size={18} />
        My Profile
      </Link>

      {/* ORDERS */}
      <Link
        to="/profile"
        state={{ tab: "orders" }}
        onClick={() => handleClose()}
        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
      >
        <Package size={18} />
        Orders
      </Link>

      <hr className="border-gray-200" />

      {/* LOGOUT */}
      <button
        onClick={() =>
          handleClose(async () => {
            await handleLogout();
          })
        }
        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition w-full text-left"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
