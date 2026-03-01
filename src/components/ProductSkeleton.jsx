const ProductSkeleton = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md p-5 animate-pulse"
          >
            <div className="bg-gray-200 h-60 rounded mb-4"></div>
            <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
            <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductSkeleton;
