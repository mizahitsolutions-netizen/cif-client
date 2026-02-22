import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const BestSellers = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // required packageTypes
      const requiredTypes = ["small", "medium", "family"];

      const selectedProducts = [];

      requiredTypes.forEach((type) => {
        const product = allProducts.find(
          (p) => p.packageType && p.packageType.toLowerCase() === type,
        );

        if (product) {
          selectedProducts.push(product);
        }
      });

      setProducts(selectedProducts);
    });

    return unsubscribe;
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-center mb-10">Our Bestsellers</h2>

      <div className="grid md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 text-center"
          >
            {/* PRICE TAG */}
            <div
              className="absolute top-4right-4 bg-green-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow"
            >
              ₹{product.price}
            </div>
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-48 h-48 object-contain mx-auto"
            />

            <h3 className="mt-4 font-semibold text-lg">{product.name}</h3>

            <Link
              to={`/products/${product.slug}`}
              className="inline-block mt-4 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
