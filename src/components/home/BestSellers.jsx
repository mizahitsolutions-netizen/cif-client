import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

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
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const newProducts = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((p) => p.isNew === true && p.quantity > 0); // ✅ ONLY NEW + IN STOCK

      setProducts(newProducts);
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


const displayProducts =
  products.length > 10
    ? [...products, ...products] // for smooth scroll
    : products;

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-16 overflow-hidden bg-gradient-to-br from-green-100 via-yellow-50 to-white">
      {/* Background Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/images/logo.png"
          alt="logo"
          className="w-[250px] md:w-[450px] opacity-20 blur-[1px] object-contain"
        />
      </div>

      <div className="absolute inset-0 z-[1]" />

      <div className="relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          New Launches
        </h2>

        <div className="overflow-hidden">
          <div
            className={`
              flex gap-6 
              ${
                products.length > 3
                  ? "animate-scroll"
                  : "justify-center flex-wrap"
              }
            `}
          >
            {displayProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.slug}`)}
                className="
                  min-w-[250px] 
                  relative 
                  bg-white/30 
                  backdrop-blur-2xl 
                  border border-white/40 
                  rounded-2xl 
                  shadow-xl 
                  hover:shadow-2xl 
                  transition-all duration-300 
                  p-6 
                  text-center 
                  cursor-pointer 
                  group
                "
                onMouseEnter={(e) =>
                  (e.currentTarget.parentElement.style.animationPlayState =
                    "paused")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.parentElement.style.animationPlayState =
                    "running")
                }
              >
                {/* NEW BADGE */}
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow">
                  NEW
                </span>

                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-36 h-36 object-contain mx-auto group-hover:scale-105 transition"
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
        </div>

        <div className="text-center mt-12">
          <Link
            to="/new-launches"
            className="inline-block border border-black px-8 py-3 rounded-full hover:bg-black hover:text-white transition"
          >
            View All New Launches
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
