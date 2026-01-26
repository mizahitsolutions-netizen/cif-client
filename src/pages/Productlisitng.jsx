import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));

        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(list);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* ---------------- SET PAGE TITLE ---------------- */
  useEffect(() => {
    document.title = "Our Products | Crumbella Innovative Foods";
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-20 text-lg font-medium">
        Loading products...
      </p>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <nav className="text-sm text-gray-400 mt-3 mb-1">
        <Link to="/" className="hover:text-black">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-black">
          Products
        </Link>
      </nav>
      <h1 className="text-3xl font-bold text-center mb-12">Our Products</h1>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
            >
              <div className="bg-[#f8f4ef] h-60 flex items-center justify-center">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Product Info */}
              <div className="p-5">
                <h2 className="text-lg font-semibold mb-1">{product.name}</h2>

                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">₹{product.price}</span>

                  <Link
                    to={`/products/${product.slug}`}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
                  >
                    View
                  </Link>
                </div>

                {/* Optional meta */}
                <div className="mt-3 text-xs text-gray-500 flex justify-between">
                  <span>Pack: {product.packageType}</span>
                  <span>Stock: {product.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductListing;
