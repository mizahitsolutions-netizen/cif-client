import { useEffect } from "react";
import { Link } from "react-router-dom";
import { cities } from "../data/cities";

const IndiaPage = () => {
  useEffect(() => {
    document.title = "Best Cookies Delivery in India | Crumbella";

    const meta = document.querySelector("meta[name='description']");
    if (meta) {
      meta.setAttribute(
        "content",
        "Order premium cookies online across India. Crumbella delivers fresh handmade cookies to major cities like Chennai, Mumbai, Delhi, Bangalore and more.",
      );
    }

    // ✅ SEO Schema
    const old = document.getElementById("india-schema");
    if (old) old.remove();

    const schema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Cookies Delivery in India",
      description:
        "Crumbella delivers cookies across India including major cities.",
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "india-schema";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }, []);

  return (
    <div className="pt-24 max-w-6xl mx-auto px-6 py-16">
      {/* HERO */}
      <h1 className="text-4xl font-bold text-center mb-6">
        Cookies Delivery Across India
      </h1>

      <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
        Looking for delicious cookies near you? Crumbella Innovative Foods
        delivers premium handmade cookies across India. Enjoy fresh,
        high-quality cookies delivered to your doorstep in major cities.
      </p>

      {/* 🔥 DELIVERY MESSAGE */}
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mb-10 text-center">
        <p className="font-medium text-gray-800">
          🚚 We deliver across India with fast and reliable shipping
        </p>
      </div>

      {/* 🔥 CITY GRID */}
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Cities We Serve
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {cities.map((city) => (
          <Link
            key={city}
            to={`/cookies-in/${city}`}
            className="bg-white border rounded-lg p-4 text-center hover:shadow-md transition capitalize"
          >
            Cookies in {city}
          </Link>
        ))}
      </div>

      {/* 🔥 EXTRA SEO CONTENT */}
      <div className="mt-16 space-y-6 text-gray-700">
        <h2 className="text-2xl font-semibold text-center">
          Order Cookies Online in India
        </h2>

        <p>
          Crumbella Innovative Foods is a premium cookie brand offering
          innovative and delicious cookies made with high-quality ingredients.
          We deliver across India including metro cities and growing towns.
        </p>

        <p>
          Whether you are in Chennai, Mumbai, Delhi, Bangalore, Hyderabad, or
          anywhere in India, you can enjoy our freshly baked cookies with
          convenient delivery options.
        </p>
      </div>
    </div>
  );
};

export default IndiaPage;
