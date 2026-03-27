import { useParams } from "react-router-dom";
import { useEffect } from "react";

const CityPage = () => {
  const { city } = useParams();

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);

  useEffect(() => {
    document.title = `Best Cookies in ${cityName} | Crumbella`;

    const meta = document.querySelector("meta[name='description']");
    if (meta) {
      meta.setAttribute(
        "content",
        `Order premium cookies in ${cityName}. Fresh handmade cookies delivered across India.`,
      );
    }

    // 🔥 Dynamic Schema
    const old = document.getElementById("city-schema");
    if (old) old.remove();

    const schema = {
      "@context": "https://schema.org",
      "@type": "FoodEstablishment",
      name: `Cookies in ${cityName}`,
      areaServed: cityName,
      servesCuisine: "Cookies",
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "city-schema";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }, [cityName]);

  return (
    <div className="pt-24 max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-center mb-6">
        Best Cookies in {cityName}
      </h1>

      <p className="text-center text-gray-600 mb-10">
        Looking for cookies in {cityName}? Crumbella delivers premium handmade
        cookies across {cityName} with fast and reliable delivery.
      </p>

      <div className="space-y-4 text-gray-700">
        <p>
          Crumbella Innovative Foods is a premium bakery brand delivering across
          India. Now available in {cityName}.
        </p>

        <p>
          Order cookies online in {cityName} and enjoy high-quality ingredients,
          innovative recipes, and fresh baking.
        </p>
      </div>
    </div>
  );
};

export default CityPage;
