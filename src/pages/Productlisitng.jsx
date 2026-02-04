import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔎 Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [packageFilter, setPackageFilter] = useState("all");
  const [sortPrice, setSortPrice] = useState("");

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

  useEffect(() => {
    document.title = "Our Products | Crumbella Innovative Foods";
  }, []);

  // 🧠 Filter logic
  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((product) =>
      packageFilter === "all" ? true : product.packageType === packageFilter,
    )
    .sort((a, b) => {
      if (sortPrice === "low") return a.price - b.price;
      if (sortPrice === "high") return b.price - a.price;
      return 0;
    });

  if (loading) {
    return (
      <p className="text-center mt-20 text-lg font-medium">
        Loading products...
      </p>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-3">
        <Link to="/" className="hover:text-black">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black">Products</span>
      </nav>

      <h1 className="text-3xl font-bold text-center mb-10">Our Products</h1>

      {/* 🔍 SEARCH & FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-12 justify-between">
        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* Package Filter */}
        <select
          value={packageFilter}
          onChange={(e) => setPackageFilter(e.target.value)}
          className="w-full md:w-1/4 border rounded-lg px-4 py-2 cursor-pointer"
        >
          <option value="all">All Packages</option>
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Family">Family</option>
        </select>

        {/* Price Sort */}
        <select
          value={sortPrice}
          onChange={(e) => setSortPrice(e.target.value)}
          className="w-full md:w-1/4 border rounded-lg px-4 py-2 cursor-pointer"
        >
          <option value="">Sort by Price</option>
          <option value="low">Low → High</option>
          <option value="high">High → Low</option>
        </select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">No products found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
            >
              <div className="bg-[#f8f4ef] h-60 flex items-center justify-center">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain hover:scale-105 transition"
                />
              </div>

              <div className="p-5">
                <h2 className="text-lg font-semibold mb-1">{product.name}</h2>

                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {product.description}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">₹{product.price}</span>

                  <Link
                    to={`/products/${product.slug}`}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
                  >
                    View
                  </Link>
                </div>

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
