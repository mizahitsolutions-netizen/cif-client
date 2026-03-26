import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";
import { Phone, Mail } from "lucide-react";

const DistributorEnquiry = () => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    message: "",
  });

  // ✅ Area Sales Managers (LIVE)
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    document.title = "Distributor Enquiry | Crumbella Innovative Foods";
  }, []);

  // ✅ Fetch live managers
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "area_sales_managers"),
      (snapshot) => {
        setManagers(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        );
      },
    );

    return () => unsub();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "distributor_enquiries"), {
        ...form,
        createdAt: serverTimestamp(),
      });

      toast.success(
        <div>
          <p className="font-semibold">Distributor enquiry submitted!</p>
          <p>We will reach out to you with the best offers soon.</p>
        </div>,
      );

      setForm({
        name: "",
        company: "",
        phone: "",
        email: "",
        city: "",
        state: "",
        message: "",
      });
    } catch (error) {
      toast.error("Something went wrong.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="pt-10 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 pb-10 md:py-16 grid md:grid-cols-2 gap-16">
        {/* ================= LEFT SIDE ================= */}
        <div className="order-1">
          <h2 className="text-4xl font-bold mb-4">Area Sales Managers</h2>

          <p className="text-gray-600 mb-10">
            You can also contact our Area Sales Managers directly.
          </p>

          {/* ✅ LIVE DATA */}
          <div className="space-y-6">
            {managers.map((item) => {
              const cleanPhone = item.phone?.replace(/\D/g, "");

              const cleanEmail = item.email?.replace(/\D/g, "");

              return (
                <div key={item.id} className="border p-5 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{item.region}</h3>

                  {/* PHONE */}
                  <div className="flex items-center gap-3">
                    <Phone size={18} />
                    <a href={`tel:${cleanPhone}`} className="hover:underline">
                      {item.phone}
                    </a>
                  </div>

                  {/* EMAIL */}
                  <div className="flex items-center gap-3 mt-1">
                    <Mail size={18} />

                    {item.email ? (
                      <a
                        href={`mailto:${item.email}?subject=${encodeURIComponent(
                          "Distributor Enquiry - Crumbella",
                        )}&body=${encodeURIComponent(
                          `Hi,\n\nI am interested in becoming a distributor for your products.\n\nRegion: ${item.region}\n\nPlease share more details.\n\nThanks`,
                        )}`}
                        className="hover:underline"
                      >
                        {item.email}
                      </a>
                    ) : (
                      <span className="text-gray-400">No email available</span>
                    )}
                  </div>

                  {/* WHATSAPP BUTTON */}
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="order-2">
          <h2 className="text-4xl font-bold mb-4">Distributor Enquiry</h2>

          <p className="text-gray-600 mb-10">
            Interested in becoming a Crumbella distributor? Fill the form below
            and our team will contact you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-100 p-3 rounded"
            />

            <input
              name="company"
              placeholder="Company / Shop Name"
              value={form.company}
              onChange={handleChange}
              required
              className="w-full bg-gray-100 p-3 rounded"
            />

            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full bg-gray-100 p-3 rounded"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded"
            />

            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              required
              className="w-full bg-gray-100 p-3 rounded"
            />

            <input
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              required
              className="w-full bg-gray-100 p-3 rounded"
            />

            <textarea
              name="message"
              placeholder="Message"
              value={form.message}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded h-32"
            />

            <button
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded hover:bg-gray-800"
            >
              {loading ? "Submitting..." : "Submit Enquiry"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DistributorEnquiry;
