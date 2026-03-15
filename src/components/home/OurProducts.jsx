import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const categoryOrder = ["small", "medium", "family"];

const categoryTitles = {
  small: "Small Packs",
  medium: "Medium Packs",
  family: "Family Packs",
};

// 🔥 Stock Logic
const getStockStatus = (quantity) => {
  if (quantity <= 10) {
    return {
      label: "Out of Stock",
      color: "bg-red-500",
      disabled: true,
    };
  }

  if (quantity <= 15) {
    return {
      label: "Low Stock",
      color: "bg-yellow-500",
      disabled: false,
    };
  }

  return {
    label: "In Stock",
    color: "bg-green-500",
    disabled: false,
  };
};

const OurProducts = () => {
  const [groupedProducts, setGroupedProducts] = useState({
    small: [],
    medium: [],
    family: [],
  });

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const grouped = {
        small: [],
        medium: [],
        family: [],
      };

      snapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() };
        const type = product.packageType?.toLowerCase();

        if (grouped[type]) {
          grouped[type].push(product);
        }
      });

      setGroupedProducts(grouped);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-center mb-16"
      >
        Our Products
      </motion.h2>

      {categoryOrder.map((category, index) => {
        const products = groupedProducts[category];
        if (!products || products.length === 0) return null;

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="mb-20"
          >
            <h3 className="text-2xl text-center font-semibold mb-10">
              {categoryTitles[category]}
            </h3>

            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              loop={false}
              spaceBetween={24}
              breakpoints={{
                320: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {products.map((product) => {
                const quantity = product.quantity || 0;
                const stock = getStockStatus(quantity);

                return (
                  <SwiperSlide key={product.id}>
                    <motion.div
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all p-6 text-center h-full"
                    >
                      {/* PRICE */}
                      <div className="absolute top-4 right-4 bg-green-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">
                        ₹{product.price}
                      </div>

                      {/* STOCK BADGE */}
                      <div
                        className={`absolute top-4 left-4 text-white text-xs font-semibold px-3 py-1 rounded-full ${stock.color}`}
                      >
                        {stock.label}
                      </div>

                      {/* PRODUCT IMAGE */}
                      <div className="h-56 flex items-center justify-center">
                        <img
                          src={product.imageUrl || "/fallback.png"}
                          alt={product.name}
                          loading="lazy"
                          className="max-h-full object-contain"
                        />
                      </div>

                      {/* PRODUCT NAME */}
                      <h4 className="mt-6 font-semibold text-lg mb-2">
                        {product.name}
                      </h4>

                      {/* 🔥 Only X Left Message */}
                      {quantity > 10 && quantity < 20 && (
                        <p className="text-sm text-red-500 font-medium mb-4">
                          🔥 Only {quantity} left in stock!
                        </p>
                      )}

                      {/* BUTTON */}
                      <Link
                        to={`/products/${product.slug}`}
                        className={`inline-block px-6 py-2 rounded-lg transition text-white ${
                          stock.disabled
                            ? "bg-gray-400 cursor-not-allowed pointer-events-none"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {stock.disabled ? "Unavailable" : "View Product"}
                      </Link>

                      {quantity < 10 && (
                        <p className="text-sm text-red-500 font-medium mb-4">
                          🔥 Coming Soon!
                        </p>
                      )}
                    </motion.div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </motion.div>
        );
      })}
    </section>
  );
};

export default OurProducts;
