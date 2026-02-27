import { useEffect, useState, useRef, useCallback } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebaseConfig"; // adjust path to your firebase config

const INTERVAL = 5500; // ms per slide

export default function HeroSlider() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState({}); // track which images finished loading
  const [ready, setReady] = useState(false); // show slider only after first image ready
  const autoRef = useRef(null);
  const progressRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  /* ── Fetch banners sorted by `order` field ── */
  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, "heroBanners"), orderBy("order", "asc"));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBanners(data);

        // Pre-load ALL images immediately so there's zero flicker on slide change
        data.forEach((banner, i) => {
          const img = new Image();
          img.src = banner.imageUrl;
          img.onload = () => {
            setLoaded((prev) => {
              const next = { ...prev, [i]: true };
              if (i === 0) setReady(true); // show slider as soon as first is ready
              return next;
            });
          };
          img.onerror = () => setLoaded((prev) => ({ ...prev, [i]: true })); // mark done even on error
        });
      } catch (err) {
        console.error("Failed to load heroBanners:", err);
      }
    };
    fetch();
  }, []);

  /* ── Navigation ── */
  const goTo = useCallback(
    (index) => {
      if (!banners.length) return;
      setCurrent((index + banners.length) % banners.length);
    },
    [banners.length],
  );

  /* ── Auto-play ── */
  const startAuto = useCallback(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(
      () => goTo((c) => (c + 1) % banners.length),
      INTERVAL,
    );
  }, [banners.length, goTo]);

  const stopAuto = useCallback(() => clearInterval(autoRef.current), []);

  useEffect(() => {
    if (banners.length < 2) return;
    startAuto();
    return stopAuto;
  }, [banners.length, startAuto, stopAuto]);

  /* ── Pause when tab hidden ── */
  useEffect(() => {
    const handler = () => {
      if (document.hidden) stopAuto();
      else startAuto();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [startAuto, stopAuto]);

  /* ── Touch / Swipe ── */
  const onTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
    touchStartY.current = e.changedTouches[0].clientY;
  };

  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      goTo(dx < 0 ? current + 1 : current - 1);
      startAuto();
    }
  };

  /* ── Keyboard ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") {
        goTo(current - 1);
        startAuto();
      }
      if (e.key === "ArrowRight") {
        goTo(current + 1);
        startAuto();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, goTo, startAuto]);

  /* ── Skeleton while loading ── */
  if (!ready || !banners.length) {
    return (
      <div className="w-full h-svh bg-neutral-900 flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "100svh" }}
      onMouseEnter={stopAuto}
      onMouseLeave={startAuto}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label="Hero Banner"
    >
      {/* ── Slides ── */}
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          aria-hidden={i !== current}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === current ? 1 : 0,
            // GPU-accelerated opacity crossfade — zero flicker
            transition: "opacity 0.8s cubic-bezier(0.4,0,0.2,1)",
            willChange: "opacity",
            zIndex: i === current ? 1 : 0,
          }}
        >
          {/* Background image */}
          <img
            src={banner.imageUrl}
            alt={`Banner ${i + 1}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              // Ken Burns zoom — only on active
              transform: i === current ? "scale(1)" : "scale(1.06)",
              transition: "transform 6s ease-out",
            }}
            // Images are already preloaded above; these attrs prevent FOUC on first paint
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
          />

          {/* Overlay — desktop: left gradient | mobile: bottom gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.05) 100%)",
            }}
          />
        </div>
      ))}

      {/* ── Dot navigation ── */}
      {banners.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2"
          role="tablist"
          aria-label="Slide navigation"
        >
          {banners.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                goTo(i);
                startAuto();
              }}
              style={{
                width: i === current ? "24px" : "8px",
                height: "8px",
                borderRadius: "9999px",
                background: i === current ? "#e8b86d" : "rgba(255,255,255,0.4)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.35s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Arrow buttons (hidden on very small screens) ── */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => {
              goTo(current - 1);
              startAuto();
            }}
            aria-label="Previous slide"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10
                       w-11 h-11 rounded-full items-center justify-center
                       border border-white/20 bg-white/10 backdrop-blur-sm
                       text-white transition hover:bg-white/25"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => {
              goTo(current + 1);
              startAuto();
            }}
            aria-label="Next slide"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10
                       w-11 h-11 rounded-full items-center justify-center
                       border border-white/20 bg-white/10 backdrop-blur-sm
                       text-white transition hover:bg-white/25"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* ── Progress bar ── */}
      {banners.length > 1 && <ProgressBar key={current} duration={INTERVAL} />}

      {/* ── Slide counter ── */}
      {banners.length > 1 && (
        <div className="absolute top-4 right-4 z-10 text-xs tracking-widest text-white/50 font-medium select-none">
          <span className="text-white/90">
            {String(current + 1).padStart(2, "0")}
          </span>
          {" / "}
          {String(banners.length).padStart(2, "0")}
        </div>
      )}
    </section>
  );
}

/* ── Progress bar animates from 0→100% over `duration` ms, resets on key change ── */
function ProgressBar({ duration }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Next tick so CSS transition fires properly
    const t = requestAnimationFrame(() => setWidth(100));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        height: "3px",
        background: "#e8b86d",
        width: `${width}%`,
        transition: `width ${duration}ms linear`,
        zIndex: 10,
      }}
    />
  );
}
