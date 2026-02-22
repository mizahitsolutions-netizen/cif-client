const WhyChoose = () => {
  return (
    <section className="bg-gray-50 py-16">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-3xl font-bold text-center mb-10">
          Why Choose Crumbella?
        </h2>

        <div className="grid md:grid-cols-4 gap-6 text-center">

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <div className="text-3xl">🌾</div>
            <h3 className="mt-2 font-semibold">
              Multigrain Goodness
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <div className="text-3xl">❤️</div>
            <h3 className="mt-2 font-semibold">
              Healthier Ingredients
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <div className="text-3xl">🏭</div>
            <h3 className="mt-2 font-semibold">
              Hygienic Production
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <div className="text-3xl">💰</div>
            <h3 className="mt-2 font-semibold">
              Affordable Pricing
            </h3>
          </div>

        </div>

      </div>

    </section>
  );
};

export default WhyChoose;