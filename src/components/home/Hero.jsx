import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const intervalRef = useRef(null);
  const navigate = useNavigate();

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

  /* Preload images */
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
      setLoaded(false); // reset fade
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [banners]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
    setLoaded(false);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    setLoaded(false);
  };

  /* Handle click */
  const handleBannerClick = (banner) => {
    if (!banner.link) return;

    // External link → same tab
    if (banner.link.startsWith("http")) {
      window.location.href = banner.link;
    } else {
      // Internal route
      navigate(banner.link);
    }
  };

  if (!banners.length) {
    return (
      <section className="w-full animate-pulse">
        <div className="w-full h-[50vh] bg-gray-200" />
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden">
      {/* Slider */}
      <div className="relative w-full aspect-[16/9] md:aspect-auto md:h-[90vh]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={banners[current].id}
            src={banners[current].imageUrl}
            loading={current === 0 ? "eager" : "lazy"}
            onLoad={() => setLoaded(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            onClick={() => handleBannerClick(banners[current])}
            className={`absolute inset-0 w-full h-full object-cover transition cursor-pointer ${
              banners[current].link ? "hover:opacity-90" : ""
            }`}
          />
        </AnimatePresence>
      </div>

      {/* Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <div
              key={i}
              onClick={() => {
                setCurrent(i);
                setLoaded(false);
              }}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                i === current ? "w-8 bg-white" : "w-4 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
