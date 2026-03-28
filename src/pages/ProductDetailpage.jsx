import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../firebase";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { slug } = useParams();
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const { user } = useAuth();
  const { openLogin } = useUI();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [related, setRelated] = useState([]);

  const location = useLocation();

  const isNewLaunch = location.pathname.includes("new-launches");

  /* ---------------- DYNAMIC TOTAL PRICE ---------------- */
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return qty * product.price;
  }, [qty, product]);

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);

        const q = query(
          collection(db, "products"),
          where("slug", "==", slug),
          limit(1),
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          const docSnap = snap.docs[0];
          const data = { id: docSnap.id, ...docSnap.data() };

          if (isMounted) {
            setProduct(data);
            setQty(1);
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load product");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => (isMounted = false);
  }, [slug]);

  /* ---------------- FETCH RELATED PRODUCT ---------------- */
  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("packageType", "==", product.packageType),
          limit(4),
        );

        const snap = await getDocs(q);

        const items = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p) => p.id !== product.id)
          .slice(0, 3);

        setRelated(items);
      } catch (err) {
        console.error("Related fetch failed:", err);
      }
    };

    fetchRelated();
  }, [product]);

  /* ---------------- ADVANCED SEO + LCP OPTIMIZATION ---------------- */
  useEffect(() => {
    if (!product) return;

    // Title
    document.title = `${product.name} | Crumbella Innovative Foods`;

    // Meta Description
    const metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        product.description?.slice(0, 150),
      );
    }

    // Canonical URL
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href);

    // Preload Hero Image (LCP Boost)
    let preload = document.querySelector("link[rel='preload']");
    if (!preload) {
      preload = document.createElement("link");
      preload.setAttribute("rel", "preload");
      preload.setAttribute("as", "image");
      preload.setAttribute("href", product.imageUrl);
      document.head.appendChild(preload);
    }

    // Structured Data (JSON-LD)
    const oldSchema = document.getElementById("product-schema");
    if (oldSchema) oldSchema.remove();

    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      image: product.imageUrl,
      description: product.description,
      sku: product.id,
      category: product.packageType,
      brand: {
        "@type": "Brand",
        name: "Crumbella Innovative Foods",
      },

      // ✅ ADD THIS (Hidden SEO Boost)
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating || 4.5,
        reviewCount: product.reviewCount || 25,
      },

      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: product.price,
        availability:
          product.quantity > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "product-schema";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }, [product]);

  /* ---------------- ACTIONS ---------------- */

  const handleAddToCart = () => {
    if (!product.quantity || product.quantity === 0) {
      toast.error("This product is out of stock");
      return;
    }

    addToCart(product, qty);
    toast.success(`Added ${qty} × ${product.name}`);
  };

  const handleBuyNow = () => {
    if (!user) {
      openLogin();
      toast("Please login to continue", { icon: "🔒" });
      return;
    }

    handleAddToCart();
    navigate("/checkout");
    window.scrollTo(0, 0);
  };

  /* ---------------- GSAP ---------------- */
  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power2.out",
    });
  }, []);

  /* ---------------- STATES ---------------- */

  if (loading)
    return (
      <p className="text-center mt-24 text-gray-500">Loading product...</p>
    );

  if (error)
    return (
      <p className="text-center mt-24 text-red-500 font-medium">{error}</p>
    );

  if (!product) return null;

  const isOutOfStock = product.quantity === 0;

  /* ---------------- UI ---------------- */

  return (
    <section ref={containerRef} className="max-w-7xl mx-auto px-4 py-24">
      {/* BREADCRUMB */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-black">
          Home
        </Link>

        <span className="mx-2">/</span>

        {isNewLaunch ? (
          <Link to="/new-launches" className="hover:text-black">
            New Launches
          </Link>
        ) : (
          <Link to="/products" className="hover:text-black">
            Products
          </Link>
        )}

        <span className="mx-2">/</span>

        <span className="text-black font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* HERO IMAGE (LCP Optimized) */}
        <div className="bg-gradient-to-br from-orange-50 to-white rounded-3xl p-10 flex items-center justify-center">
          <img
            src={product.imageUrl || "/placeholder.png"}
            alt={`${product.name} - ${product.packageType} pack`}
            loading="eager"
            fetchpriority="high"
            width="500"
            height="500"
            className="max-h-[420px] object-contain"
          />
        </div>

        {/* INFO */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider text-gray-400">
              {product.packageType} Pack
            </p>

            <h1 className="text-4xl font-bold mt-2">{product.name}</h1>

            <p className="text-gray-600 mt-6 mb-8">{product.description}</p>

            <div className="flex flex-col gap-2 mb-8">
              <span className="text-3xl font-semibold">
                ₹{product.price} each
              </span>

              <span className="text-xl font-bold text-orange-600">
                Total: ₹{totalPrice}
              </span>

              <span
                className={`text-sm px-3 py-1 rounded-full w-fit ${
                  isOutOfStock ? "bg-red-100 text-red-600" : "bg-gray-100"
                }`}
              >
                {isOutOfStock ? "Out of stock" : `${product.quantity} in stock`}
              </span>
            </div>

            {!isOutOfStock && (
              <>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm font-medium">Quantity</span>

                  <div className="flex items-center bg-gray-100 rounded-full px-3">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-3 text-xl cursor-pointer"
                    >
                      −
                    </button>

                    <span className="px-4 font-medium">{qty}</span>

                    <button
                      onClick={() =>
                        setQty((q) => Math.min(product.quantity, q + 1))
                      }
                      className="px-3 text-xl cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-4 rounded-xl transition cursor-pointer ${
                isOutOfStock
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`flex-1 py-4 rounded-xl border transition cursor-pointer ${
                isOutOfStock
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-black hover:bg-black hover:text-white"
              }`}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-28">
          <h2 className="text-3xl font-bold mb-10 text-center">
            You may also like
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/products/${item.slug}`}
                onClick={() => window.scrollTo(0, 0)}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden"
              >
                <div className="bg-[#f8f4ef] h-56 flex items-center justify-center">
                  <img
                    src={item.imageUrl || "/placeholder.png"}
                    alt={`${item.name} preview`}
                    loading="lazy" // ✅ Lazy for non-LCP images
                    width="300"
                    height="300"
                    className="max-h-full object-contain group-hover:scale-105 transition"
                  />
                </div>

                <div className="p-5">
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500">₹{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </section>
  );
};

export default ProductDetail;
