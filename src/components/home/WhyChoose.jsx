import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const WhyChoose = () => {
  // Detect when section is visible
  const { ref, inView } = useInView({
    triggerOnce: true, // run only once
    threshold: 0.3, // 30% visible
  });

  return (
    <section className="bg-gray-50 py-16" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          Why Choose Crumbella?
        </h2>

        <div className="grid md:grid-cols-4 gap-6 text-center">
          {/* Cookies Sold */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <div className="text-3xl">🍪</div>
            <h3 className="mt-2 font-semibold text-xl">
              {inView && <CountUp end={10000} duration={2} />}+
            </h3>
            <p className="text-sm text-gray-500">Cookies Sold</p>
          </div>

          {/* Orders Delivered */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <div className="text-3xl">📦</div>
            <h3 className="mt-2 font-semibold text-xl">
              {inView && <CountUp end={100} duration={2} />}+
            </h3>
            <p className="text-sm text-gray-500">Orders Delivered</p>
          </div>

          {/* Fresh Quality */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <div className="text-3xl">🔥</div>
            <h3 className="mt-2 font-semibold text-xl">
              {inView && <CountUp end={100} duration={2} />}%
            </h3>
            <p className="text-sm text-gray-500">Freshly Baked</p>
          </div>

          {/* Happy Customers */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <div className="text-3xl">😊</div>
            <h3 className="mt-2 font-semibold text-xl">
              {inView && <CountUp end={500} duration={2} />}+
            </h3>
            <p className="text-sm text-gray-500">Happy Customers</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
