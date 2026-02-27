import { useEffect, useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    document.title = "Contact Us | Crumbella Innovative Foods";
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Message sent!");

    setForm({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="pt-24 max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-4 text-center">Contact Us</h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white shadow-md p-8 rounded-xl"
        >
          <input
            name="name"
            placeholder="Name"
            value={form.name}
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
fffff
          <textarea
            name="message"
            placeholder="Message"
            value={form.message}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded h-32"
          />

          <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-800">
            Send Message
          </button>
        </form>

        {/* INFO */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Get in touch</h2>

          <p className="text-gray-600 mb-2">📍 Tamil Nadu, India</p>

          <p className="text-gray-600 mb-2">📞 +91 9876543210</p>

          <p className="text-gray-600 mb-2">📧 contact@crumbella.com</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
