import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import ProductSkeleton from "../components/ProductSkeleton";

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [packageFilter, setPackageFilter] = useState("all");
  const [sortPrice, setSortPrice] = useState("");

  useEffect(() => {
    document.title = "Our Products | Crumbella Innovative Foods";
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(list);
      } catch (err) {
        console.error(err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Optimized filtering
  const filteredProducts = useMemo(() => {
    return [...products]
      .filter((product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .filter((product) =>
        packageFilter === "all" ? true : product.packageType === packageFilter,
      )
      .sort((a, b) => {
        if (sortPrice === "low") return a.price - b.price;
        if (sortPrice === "high") return b.price - a.price;
        return 0;
      });
  }, [products, searchTerm, packageFilter, sortPrice]);

  if (loading) return <ProductSkeleton />;

  if (error)
    return (
      <p className="text-center mt-20 text-red-500 font-medium">{error}</p>
    );

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-3">
        <Link to="/" className="hover:text-black">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black">Products</span>
      </nav>

      <h1 className="text-3xl font-bold text-center mb-10">Our Products</h1>

      <ProductFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        packageFilter={packageFilter}
        setPackageFilter={setPackageFilter}
        sortPrice={sortPrice}
        setSortPrice={setSortPrice}
      />

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductListing;
