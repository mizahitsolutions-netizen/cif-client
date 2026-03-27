import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  /* ---------------- SEO + SCHEMA ---------------- */
  useEffect(() => {
    document.title = "Contact Us | Crumbella Innovative Foods";

    const schema = {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact Crumbella Innovative Foods",
      url: window.location.href,
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "contact-schema";
    script.text = JSON.stringify(schema);

    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById("contact-schema");
      if (existing) existing.remove();
    };
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await addDoc(collection(db, "contacts"), {
        ...form,
        createdAt: serverTimestamp(),
      });

      toast.success("Message sent successfully 🎉");

      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 max-w-6xl mx-auto px-6 py-16">
      {/* TITLE */}
      <h1 className="text-4xl font-bold text-center mb-4">Contact Us</h1>

      {/* LOCAL SEO TEXT */}
      <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
        Looking for cookies near you in Periyakulam or Tamil Nadu? Get in touch
        with Crumbella Innovative Foods for premium handmade cookies.
      </p>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white shadow-md p-8 rounded-2xl"
        >
          <input
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            name="email"
            type="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <textarea
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 p-3 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

        {/* ================= INFO ================= */}
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold">
            Bakery in Periyakulam, Tamil Nadu
          </h2>

          {/* ADDRESS */}
          <p className="text-gray-600 leading-relaxed">
            📍 4/1A, Kuttiappar Lane,
            <br />
            Aranmanai, Vadagarai,
            <br />
            Periyakulam, Tamil Nadu – 625601, India
          </p>

          {/* PHONE */}
          <p className="text-gray-600">
            📞{" "}
            <a href="tel:+918608604700" className="hover:underline font-medium">
              +91 86086 04700
            </a>
          </p>

          {/* EMAIL */}
          <p className="text-gray-600">
            📧{" "}
            <a
              href="mailto:contact@crumbellainnovativefoods.in"
              className="hover:underline font-medium"
            >
              contact@crumbellainnovativefoods.in
            </a>
          </p>

          {/* MAP */}
          <div className="rounded-xl overflow-hidden shadow-sm">
            <iframe
              src="https://www.google.com/maps?q=4/1A,Kuttiappar+Lane,Periyakulam,Tamil+Nadu,625601&output=embed"
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
