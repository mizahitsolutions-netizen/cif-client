import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const About = () => {
  useEffect(() => {
    document.title = "About Us | Crumbella Innovative Foods";
  }, []);

  return (
    <div className="pt-18">
      {/* HERO SECTION */}
      <section className="w-full bg-[#f8f4ef]">
        <div className="relative w-full">
          <img
            src="/cookies-hero.png"
            alt="Crumbella Hero"
            className="w-full h-auto"
          />

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <Link
              to="/products"
              className="border border-black hover:bg-black hover:text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
            >
              View Our Products
            </Link>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <img src="/baker.png" alt="Baker" className="rounded-xl shadow-lg" />

        <div>
          <h2 className="text-3xl font-bold text-center md:text-left mb-6">
            Our Story
          </h2>

          <p className="text-gray-700 mb-4">
            Crumbella Innovative Foods was founded with a simple passion – to
            create delicious, high-quality food products that bring joy to every
            bite. What started as a vision to deliver better bakery experiences
            has grown into a brand trusted for taste, quality, and innovation.
          </p>

          <p className="text-gray-700">
            We combine traditional recipes with modern food processing standards
            to ensure every product meets exceptional quality benchmarks.
          </p>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-8">
        {/* Vision */}
        <div className="bg-white rounded-xl shadow p-8">
          <h3 className="text-2xl font-semibold mb-4 text-center">
            Our Vision
          </h3>

          <p className="text-gray-700 text-center mb-6">
            To become a trusted and leading name in the Indian food industry by
            delivering innovative, high-quality, and affordable food products.
          </p>

          <div className="flex justify-around text-center">
            <div>
              <p className="font-semibold">Premium Ingredients</p>
            </div>

            <div>
              <p className="font-semibold">Strict Quality Controls</p>
            </div>

            <div>
              <p className="font-semibold">Continual Innovation</p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-xl shadow p-8">
          <h3 className="text-2xl font-semibold mb-4 text-center">
            Our Mission
          </h3>

          <ul className="space-y-3 text-gray-700">
            <li>✔ Deliver consistent quality and safety in every pack</li>
            <li>✔ Innovate with new flavors and healthy options</li>
            <li>✔ Expand our presence across India</li>
            <li>✔ Build long-term relationships with customers and partners</li>
          </ul>
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h3 className="text-3xl font-semibold mb-6">What We Offer</h3>

          <ul className="space-y-3 text-gray-700 text-lg">
            <li>✔ Premium Cookies</li>
            <li>✔ Wheat & Millet-Based Bakery Products</li>
            <li>✔ Innovative Snack Variants</li>
            <li>✔ Health-Focused Food Options</li>
          </ul>
        </div>

        <img
          src="/cookies-offer.png"
          alt="Cookies"
          className="rounded-xl shadow-lg"
        />
      </section>

      {/* FOOTER MESSAGE */}
      <section className="bg-[#efe5da] py-12 text-center">
        <h2 className="text-3xl font-semibold mb-2">
          Taste the Joy in Every Bite!
        </h2>

        <p className="text-gray-700">
          Explore our products and experience the Crumbella difference today.
        </p>
      </section>
    </div>
  );
};

export default About;
