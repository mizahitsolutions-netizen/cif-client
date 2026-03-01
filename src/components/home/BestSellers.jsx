import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useUI } from "../../context/UIContext";

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { openLogin } = useUI();

  const getMinimumQty = (packageType) => {
    if (!packageType) return 1;

    const type = packageType.toLowerCase();
    if (type === "small") return 1;
    if (type === "medium") return 2;
    if (type === "family") return 3;

    return 1;
  };

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("price", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 🔥 Group products by price
      const priceGroups = {};

      allProducts.forEach((product) => {
        const price = Number(product.price);

        if (!priceGroups[price]) {
          priceGroups[price] = [];
        }

        priceGroups[price].push(product);
      });

      const finalProducts = [];

      Object.values(priceGroups).forEach((group) => {
        // 🔥 Find first in-stock product
        const availableProduct = group.find(
          (p) => p.quantity > 0, // change this if your stock field name is different
        );

        if (availableProduct) {
          finalProducts.push(availableProduct);
        }
      });

      setProducts(finalProducts);
    });

    return unsubscribe;
  }, []);

  const handleBuyNow = (product) => {
    const minQty = getMinimumQty(product.packageType);
    const qty = minQty;

    if (!user) {
      openLogin();
      toast("Please login to continue", { icon: "🔒" });
      return;
    }

    addToCart(product, qty, { openDrawer: false });
    navigate("/checkout");
    window.scrollTo(0, 0);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-center mb-10">Best Sellers</h2>

      <div
        className="grid gap-8 justify-center"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        }}
      >
        {" "}
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/products/${product.slug}`)}
            className="relative bg-white rounded-xl shadow hover:shadow-lg transition p-6 text-center cursor-pointer group"
          >
            <div className="absolute top-4 right-4 bg-green-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">
              ₹{product.price}
            </div>

            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-40 h-40 object-contain mx-auto group-hover:scale-105 transition"
            />

            <h3 className="mt-4 font-semibold text-lg">{product.name}</h3>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBuyNow(product);
              }}
              className="mt-4 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          to="/products"
          className="inline-block border border-black px-8 py-3 rounded-full hover:bg-black hover:text-white transition"
        >
          View All Products
        </Link>
      </div>
    </section>
  );
};

export default BestSellers;
