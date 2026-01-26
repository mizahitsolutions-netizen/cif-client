import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
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
  const { user } = useAuth();
  const { openLogin } = useUI();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    const fetchProduct = async () => {
      const q = query(collection(db, "products"), where("slug", "==", slug));

      const snap = await getDocs(q);

      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setProduct({ id: docSnap.id, ...docSnap.data() });
      }

      setLoading(false);
    };

    fetchProduct();
  }, [slug]);

  /* ---------------- SET PAGE TITLE ---------------- */
  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} | Crumbella Innovative Foods`;
    }
  }, [product]);

  /* ---------------- FETCH RELATED ---------------- */
  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (p) => p.id !== product.id && p.packageType === product.packageType,
        )
        .slice(0, 3);

      setRelated(items);
    };

    fetchRelated();
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product, qty);

    toast.success(`Added ${qty} × ${product.name}`);
  };

  const handleBuyNow = () => {
    if (!user) {
      openLogin(); // 🔐 OPEN LOGIN MODAL
      toast("Please login to continue", {
        icon: "🔒",
      });
      return;
    }
    addToCart(product, qty, { openDrawer: false });
    // ✅ USER IS LOGGED IN → GO TO CHECKOUT
    navigate("/checkout");
    window.scrollTo(0, 0);
  };

  /* ---------------- GSAP ANIMATION ---------------- */
  useGSAP(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power2.out",
    });
  }, []);

  if (loading) {
    return <p className="text-center mt-24">Loading...</p>;
  }

  if (!product) {
    return <p className="text-center mt-24">Product not found</p>;
  }

  return (
    <section ref={containerRef} className="max-w-7xl mx-auto px-4 py-25">
      {/* ================= BREADCRUMB ================= */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-black">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-black">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black font-medium">{product.name}</span>
      </nav>

      {/* ================= PRODUCT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* IMAGE */}
        <div className="bg-gradient-to-br from-orange-50 to-white rounded-3xl p-10 flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-[420px] object-contain"
          />
        </div>

        {/* INFO */}
        <div className="flex flex-col justify-between">
          <div className="mb-14">
            <p className="text-sm uppercase tracking-wider text-gray-400">
              {product.packageType} Pack
            </p>

            <h1 className="text-4xl md:text-5xl font-bold mt-2">
              {product.name}
            </h1>
          </div>
          <div>
            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="flex items-center gap-6 mb-8">
              <span className="text-3xl font-semibold">₹{product.price}</span>

              <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                {product.quantity} in stock
              </span>
            </div>

            {/* QUANTITY */}
            <div className="flex items-center gap-4 mb-10">
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
          </div>

          {/* CTA */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black cursor-pointer text-white py-4 rounded-xl hover:bg-gray-800 transition"
            >
              Add {qty} to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 border cursor-pointer border-black py-4 rounded-xl hover:bg-black hover:text-white transition"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* ================= RELATED ================= */}
      {related.length > 0 && (
        <section className="mt-32">
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
                    src={item.imageUrl}
                    alt={item.name}
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
