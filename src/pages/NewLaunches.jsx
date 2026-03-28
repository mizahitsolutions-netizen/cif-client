import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import ProductSkeleton from "../components/ProductSkeleton";
import { useSearchParams } from "react-router-dom";

const NewLaunches = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  const [packageFilter, setPackageFilter] = useState(
    searchParams.get("package") || "all",
  );

  const [sortPrice, setSortPrice] = useState(searchParams.get("sort") || "");

  useEffect(() => {
    document.title = "New Launches | Crumbella Innovative Foods";
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

  useEffect(() => {
    const delay = setTimeout(() => {
      const params = {};

      if (searchTerm) params.search = searchTerm;
      if (packageFilter !== "all") params.package = packageFilter;
      if (sortPrice) params.sort = sortPrice;

      setSearchParams(params);
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm, packageFilter, sortPrice]);

  // ✅ ONLY CHANGE HERE (filter isNew)
  const filteredProducts = useMemo(() => {
    return [...products]
      .filter((product) => product.isNew === true) // 🔥 ONLY NEW
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

  const basePath = products.isNew ? "new-launches" : "products";

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-3">
        <Link to="/" className="hover:text-black">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black">New Launches</span>
      </nav>

      <h1 className="text-3xl font-bold text-center mb-10">New Launches 🔥</h1>

      <ProductFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        packageFilter={packageFilter}
        setPackageFilter={setPackageFilter}
        sortPrice={sortPrice}
        setSortPrice={setSortPrice}
      />

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No new products available.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              basePath="new-launches" // ✅ ALWAYS new-launches in this page
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default NewLaunches;
