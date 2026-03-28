import { Link } from "react-router-dom";

const ProductCard = ({ product, basePath = "products" }) => {
  const isOutOfStock = product.quantity === 0;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden">
      <div className="bg-[#f8f4ef] h-60 flex items-center justify-center">
        <img
          src={product.imageUrl || "/placeholder.png"}
          alt={product.name}
          onError={(e) => (e.target.src = "/placeholder.png")}
          loading="lazy"
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
          {/* ✅ DYNAMIC ROUTE */}
          <Link
            to={`/${basePath}/${product.slug}`}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              isOutOfStock
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            View
          </Link>
        </div>

        <div className="mt-3 text-xs flex justify-between">
          <span>Pack: {product.packageType}</span>
          <span className={isOutOfStock ? "text-red-500" : "text-gray-500"}>
            {isOutOfStock ? "Out of Stock" : `Stock: ${product.quantity}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
