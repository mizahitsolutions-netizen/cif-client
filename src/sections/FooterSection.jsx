import { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube } from "lucide-react";

const FooterSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const q = query(
        collection(db, "newsletter_emails"),
        where("email", "==", email.toLowerCase()),
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        toast("You’re already subscribed 🍪", { icon: "ℹ️" });
        return;
      }

      await addDoc(collection(db, "newsletter_emails"), {
        email: email.toLowerCase(),
        createdAt: serverTimestamp(),
      });

      toast.success("Subscribed successfully 🎉");
      setEmail("");
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#1C1C1F] text-[#E5E5E5] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-16 py-20">
        {/* BIG TAGLINE */}
        <h1 className="text-center text-5xl md:text-7xl font-light tracking-widest mb-16">
          #BAKEDWITHLOVE
        </h1>

        {/* SOCIAL ICONS */}
        <div className="flex justify-center gap-8 mb-24">
          {[
            {
              icon: <Youtube size={22} />,
              link: "https://youtube.com/@crumbellainnovativefoods?si=RV4Ba9i9JBRrTsEK",
            },
            {
              icon: <Instagram size={22} />,
              link: "https://www.instagram.com/crumbellainnovativefoods2025",
            },
            {
              icon: <Facebook size={22} />,
              link: "https://www.facebook.com/share/1H5qnFnxr8/",
            },
          ].map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full border border-gray-600 flex items-center justify-center hover:border-white transition"
            >
              {item.icon}
            </a>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="grid md:grid-cols-2 gap-16">
          {/* LEFT - COMPANY INFO */}
          <div>
            <p className="font-semibold mb-4 text-lg">Company</p>

            <p className="leading-8 text-gray-300">
              Crumbella Innovative Foods <br />
              4/1A, Kuttiappar Lane, <br />
              Aranmanai, Vadagarai, <br />
              Periyakulam, Tamil Nadu <br />
              625601 <br />
              India
            </p>

            <p className="mt-6">
              <a
                href="tel:+918608604700"
                className="hover:text-white transition"
              >
                📞 +91 86086 04700
              </a>
            </p>

            <p className="mt-2">
              <a
                href="mailto:contact@crumbellainnovativefoods.in"
                className="hover:text-white transition"
              >
                ✉️ contact@crumbellainnovativefoods.in
              </a>
            </p>
          </div>

          {/* RIGHT - NEWSLETTER */}
          <div className="flex flex-col justify-center">
            <p className="text-xl leading-8 text-gray-300 mb-12 max-w-xl">
              Join our cookie circle for fresh launches, special offers, and
              sweet updates straight from the oven.
            </p>

            <div className="flex items-center border-b border-gray-600 pb-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="flex-1 bg-transparent outline-none text-lg placeholder:text-gray-500"
              />

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="ml-6 font-semibold hover:opacity-80 transition disabled:opacity-50"
              >
                {loading ? "Subscribing..." : "Subscribe →"}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-24 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>
            © {new Date().getFullYear()} Crumbella Cookies. All Rights Reserved.
          </p>

          <Link to="/cookies-in-india">Cookies Delivery Across India</Link>

          <div className="flex gap-8 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterSection;
