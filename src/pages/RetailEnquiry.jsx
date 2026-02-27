import { useEffect, useState } from "react";

const RetailEnquiry = () => {
  const [form, setForm] = useState({
    name: "",
    business: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    document.title = "Retail Enquiry | Crumbella Innovative Foods";
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(form);

    alert("Retail enquiry submitted!");

    setForm({
      name: "",
      business: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  return (
    <div className="pt-24 max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-4 text-center">Retail Enquiry</h1>

      <p className="text-gray-600 text-center mb-10">
        Interested in selling Crumbella products? Contact us below.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white shadow-md p-8 rounded-xl"
      >
        <input
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded"
        />

        <input
          name="business"
          placeholder="Business Name"
          value={form.business}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded"
        />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded"
        />

        <textarea
          name="message"
          placeholder="Message"
          value={form.message}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded h-32"
        />

        <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-800">
          Submit Enquiry
        </button>
      </form>
    </div>
  );
};

export default RetailEnquiry;
