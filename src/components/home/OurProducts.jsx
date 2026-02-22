import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from "react-router-dom";

const categoryOrder = ["small", "medium", "family"];

const categoryTitles = {
  small: "Small Packs",
  medium: "Medium Packs",
  family: "Family Packs",
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
      const allProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const grouped = {
        small: [],
        medium: [],
        family: [],
      };

      allProducts.forEach((product) => {
        const type = product.packageType?.toLowerCase();

        if (grouped[type]) {
          grouped[type].push(product);
        }
      });

      setGroupedProducts(grouped);
    });

    return unsubscribe;
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

        if (!products.length) return null;

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: index * 0.2,
            }}
            className="mb-20"
          >
            {/* CATEGORY TITLE */}

            <h3 className="text-2xl text-center font-semibold mb-6 capitalize">
              {categoryTitles[category]}
            </h3>

            {/* SLIDER */}

            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              //   navigation
              //   pagination={{ clickable: true }}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              loop
              spaceBetween={20}
              breakpoints={{
                320: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {products.map((product) => (
                <SwiperSlide key={product.id}>
                  <div
                    className="
      relative
      bg-white
      rounded-2xl
      shadow-sm
      hover:shadow-md
      transition-shadow
      p-6
      text-center
    "
                  >
                    {/* PRICE TAG */}
                    <div
                      className="
        absolute
        top-4
        right-4
        bg-green-600
        text-white
        text-sm
        font-semibold
        px-3
        py-1
        rounded-full
        shadow
      "
                    >
                      ₹{product.price}
                    </div>

                    {/* PRODUCT IMAGE */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="
        w-56
        h-56
        object-contain
        mx-auto
      "
                    />

                    {/* PRODUCT NAME */}
                    <h4 className="mt-4 font-semibold text-lg mb-4">
                      {product.name}
                    </h4>

                    {/* BUTTON */}
                    <Link
                      to={`/products/${product.slug}`}
                      className="
        mt-4
        bg-green-600
        text-white
        px-6
        py-2
        rounded-lg
        hover:bg-green-700
        transition
      "
                    >
                      View Product
                    </Link>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        );
      })}
    </section>
  );
};

export default OurProducts;
