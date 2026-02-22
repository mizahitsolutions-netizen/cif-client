import React from "react";

const About = () => {
  return (
    <div className="pt-24">

      {/* HERO */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About Crumbella
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Crafting premium cookies with passion, innovation, and love.
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">

        <img
          src="/images/about.jpg"
          alt="Crumbella"
          className="rounded-xl shadow-md"
        />

        <div>
          <h2 className="text-3xl font-semibold mb-4">
            Our Story
          </h2>

          <p className="text-gray-600 mb-4">
            Crumbella was founded with a simple mission — to create cookies
            that bring joy to every bite. We blend premium ingredients with
            innovative recipes to deliver unforgettable taste experiences.
          </p>

          <p className="text-gray-600">
            From classic favorites to unique creations, every Crumbella cookie
            is crafted with care, precision, and passion.
          </p>

        </div>

      </section>

      {/* VALUES */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">

          <div>
            <h3 className="text-xl font-semibold mb-2">
              Premium Quality
            </h3>
            <p className="text-gray-600">
              Only the finest ingredients go into our cookies.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">
              Innovation
            </h3>
            <p className="text-gray-600">
              Unique flavors crafted for modern taste.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">
              Customer Love
            </h3>
            <p className="text-gray-600">
              Our customers are at the heart of everything.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default About;