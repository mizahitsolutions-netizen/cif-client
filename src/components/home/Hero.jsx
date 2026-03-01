import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  
  const intervalRef = useRef(null);

  /* Fetch banners */
  useEffect(() => {
    const q = query(collection(db, "heroBanners"), orderBy("order", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBanners(data);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!banners.length) return;

    banners.forEach((banner) => {
      const img = new Image();
      img.src = banner.imageUrl;
    });
  }, [banners]);

  /* Auto slide */
  useEffect(() => {
    if (banners.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [banners]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  if (!banners.length) {
    return (
      <section className="w-full animate-pulse">
        <div className="w-full h-[50vh] bg-gray-200" />
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden ">
      {/* Slider Wrapper */}
      <div className="relative w-full aspect-[16/9] md:aspect-auto md:h-[80vh]">
        <AnimatePresence mode="wait">
          <motion.img
            key={banners[current].id}
            src={banners[current].imageUrl}
            loading="eager"
            transition={{ duration: 0.8 }}
            className="
        absolute inset-0
        w-full 
        h-full 
        object-cover
      "
          />
        </AnimatePresence>
      </div>

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          {/* Indicators */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                  i === current ? "w-8 bg-white" : "w-4 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
