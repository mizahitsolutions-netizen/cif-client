const ProductFilters = ({
  searchTerm,
  setSearchTerm,
  packageFilter,
  setPackageFilter,
  sortPrice,
  setSortPrice,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-12 justify-between">
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:w-1/3 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
      />

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
  );
};

export default ProductFilters;
