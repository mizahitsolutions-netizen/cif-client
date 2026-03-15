import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";
import { Phone, Mail, MapPin } from "lucide-react";

const BulkOrder = () => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    company: "",
    name: "",
    phone: "",
    email: "",
    purpose: "",
    message: "",
  });

  useEffect(() => {
    document.title = "Bulk Orders | Crumbella Innovative Foods";
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
      await addDoc(collection(db, "bulk_orders"), {
        ...form,
        createdAt: serverTimestamp(),
      });

      toast.success(
        <div>
          <p className="font-semibold">Bulk enquiry submitted!</p>
          <p>We will reach out to you with the best offers soon.</p>
        </div>,
      );
      setForm({
        company: "",
        name: "",
        phone: "",
        email: "",
        purpose: "",
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
        {/* LEFT SIDE - CONTACT DETAILS */}
        <div className="order-2 md:order-1">
          <h2 className="text-4xl font-bold mb-4">Contact Details</h2>

          <p className="text-gray-600 mb-10">
            Find our contact details, phone number and office address.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <Phone className="text-brown-700" />
              <p className="text-lg">+91 86086 04700</p>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="text-brown-700" />
              <p className="text-lg">sale@crumbellainnovativefoods.in</p>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="text-brown-700" />
              <p className="text-lg leading-relaxed">
                Crumbella Innovative Foods
                <br />
                4/1A, Kuttiappar Lane, Aranmanai, Vadagarai,
                <br /> Periyakulam, Tamil Nadu-625601 <br />
                India
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - BULK ORDER FORM */}
        <div className="order-1 md:order-2">
          <h2 className="text-4xl font-bold mb-4">Bulk Order Enquiry</h2>

          <p className="text-gray-600 mb-10">
            Your one stop solution for healthy snacks and corporate gifting.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1">Company Name</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className="w-full bg-gray-100 p-3 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full bg-gray-100 p-3 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-gray-100 p-3 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full bg-gray-100 p-3 rounded"
              />
            </div>

            <div>
              <label className="block mb-2">
                Purpose of Inquiry <span className="text-red-500">*</span>
              </label>

              <div className="space-y-2 bg-gray-100 p-4 rounded">
                <label className="flex gap-2">
                  <input
                    type="radio"
                    name="purpose"
                    value="Festive Gifting"
                    onChange={handleChange}
                    required
                  />
                  Festive Gifting
                </label>

                <label className="flex gap-2">
                  <input
                    type="radio"
                    name="purpose"
                    value="Wholesale / Retail"
                    onChange={handleChange}
                  />
                  Wholesale / Retail
                </label>

                <label className="flex gap-2">
                  <input
                    type="radio"
                    name="purpose"
                    value="Corporate Gifting"
                    onChange={handleChange}
                  />
                  Corporate Gifting
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-1">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="w-full bg-gray-100 p-3 rounded h-32"
              />
            </div>

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

export default BulkOrder;
