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

      // 🔍 Check duplicate email
      const q = query(
        collection(db, "newsletter_emails"),
        where("email", "==", email.toLowerCase()),
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        toast("You’re already subscribed 🍪", {
          icon: "ℹ️",
        });
        setLoading(false);
        return;
      }

      // ✅ Add email
      await addDoc(collection(db, "newsletter_emails"), {
        email: email.toLowerCase(),
        createdAt: serverTimestamp(),
      });

      toast.success("Subscribed successfully 🎉");
      setEmail("");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="footer-section">
      <div className="2xl:h-[110dvh] relative md:pt-[20vh] pt-[10vh]">
        {/* Headline */}
        <div className="overflow-hidden z-10">
          <h1 className="general-title text-center text-milk py-5">
            #BAKEDWITHLOVE
          </h1>
        </div>

        {/* Social Links */}
        <div className="flex-center gap-8 relative z-10 md:mt-20 mt-10 text-milk">
          <a
            href="https://youtube.com/@crumbellainnovativefoods?si=RV4Ba9i9JBRrTsEK"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
            aria-label="YouTube"
          >
            <Youtube size={28} />
          </a>

          <a
            href="https://www.instagram.com/crumbellainnovativefoods2025?igsh=MWEwMnU0bDc1a2lxZg=="
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
            aria-label="Instagram"
          >
            <Instagram size={28} />
          </a>

          <a
            href="https://www.facebook.com/share/1H5qnFnxr8/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
            aria-label="Facebook"
          >
            <Facebook size={28} />
          </a>
        </div>

        {/* Footer Content */}
        <div className="mt-32 md:px-10 px-5 flex gap-10 md:flex-row flex-col justify-between text-milk font-paragraph md:text-lg font-medium">
          {/* Links */}
          <div className="flex items-start md:gap-16 gap-10">
            <div>
              <p className="mb-3 font-bold">Company</p>

              <p className="leading-relaxed">
                Crumbella Innovative Foods
                <br />
                4/1A,Kuttiappar Lane,
                <br />
                Aranmanai,Vadagarai,
                <br />
                Periyakulam, Tamil Nadu
                <br />
                625601 <br />
                India
              </p>

              <p className="mt-3">
                📞{" "}
                <a href="tel:+919876543210" className="hover:underline">
                  +91 78450 35095
                </a>
              </p>

              <p>
                ✉️{" "}
                <a
                  href="mailto:contact@crumbellainnovativefoods.in"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(
                      "https://mail.google.com/mail/?view=cm&fs=1&to=contact@crumbellainnovativefoods.in",
                      "_blank",
                    );
                  }}
                >
                  contact@crumbellainnovativefoods.in{" "}
                </a>
              </p>
            </div>

            <div>
              <p className="mb-3 font-bold">Cookie Flavors</p>
              <p>Chocolate Crunch</p>
              <p>Berry Delight</p>
              <p>Classic Milk</p>
            </div>
          </div>

          {/* Newsletter */}
          <div className="md:max-w-lg">
            <p>
              Join our cookie circle for fresh launches, special offers, and
              sweet updates straight from the oven.
            </p>

            <div className="flex justify-between items-center border-b border-[#D9D9D9] py-5 md:mt-10">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent placeholder:text-[#999999] outline-none"
                disabled={loading}
              />

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="ml-4 font-bold hover:opacity-80 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Subscribing..." : "Subscribe →"}
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="copyright-box">
          <p>
            © {new Date().getFullYear()} Crumbella Cookies. All Rights Reserved.
          </p>

          <div className="flex items-center gap-7">
            <Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)}>
              Privacy Policy
            </Link>
            <Link to="/terms" onClick={() => window.scrollTo(0, 0)}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterSection;
