import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);

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

      preloadImages(data);
    });

    return () => unsub();
  }, []);

  /* Preload images */
  const preloadImages = async (bannerList) => {
    const promises = bannerList.map((banner) => {
      return new Promise((resolve) => {
        const img = new Image();

        img.src = banner.imageUrl;

        img.onload = () => resolve(banner.imageUrl);
      });
    });

    const results = await Promise.all(promises);

    const loadedMap = {};

    results.forEach((url) => {
      loadedMap[url] = true;
    });

    setLoadedImages(loadedMap);

    setReady(true);
  };

  /* Auto slide */
  useEffect(() => {
    if (!ready || banners.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [ready, banners]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const currentBanner = banners[current]?.imageUrl;

  return (
    <section className="relative w-full h-screen bg-black overflow-hidden">
      {/* Skeleton while loading */}
      {!ready && <div className="absolute inset-0 bg-gray-900 animate-pulse" />}

      {/* Slider */}
      {ready && (
        <>
          <div className="absolute inset-0">
            {banners.map((banner, index) => (
              <motion.img
                key={banner.id}
                src={banner.imageUrl}
                className="absolute w-full h-full object-cover"
                initial={false}
                animate={{
                  opacity: index === current ? 1 : 0,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 p-3 rounded-full backdrop-blur-sm hover:bg-white/50 transition"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 p-3 rounded-full backdrop-blur-sm hover:bg-white/50 transition"
          >
            <ChevronRight />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-10 bg-white" : "w-4 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
