import { useCart } from "../../context/CartContext";

export default function CartSummary({ deliveryFee = 0 }) {
  const { cart, updateQty, removeFromCart } = useCart();

  const getMinimumQty = (packageType) => {
    switch (packageType?.toLowerCase()) {
      case "small":
        return 10;
      case "medium":
        return 6;
      case "family":
        return 5;
      default:
        return 1;
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const grandTotal = total + deliveryFee;

  return (
    <div className="bg-white rounded-2xl shadow p-6 h-fit">
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

      <div className="space-y-6">
        {cart.map((item) => {
          const minQty = getMinimumQty(item.packageType);

          return (
            <div key={item.id} className="space-y-2 border-b pb-4">
              <div className="flex justify-between text-sm font-medium">
                <span>{item.name}</span>
                <span>₹{item.price * item.qty}</span>
              </div>

              {/* QTY CONTROLS */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    item.qty > minQty && updateQty(item.id, item.qty - 1)
                  }
                  className={`px-3 py-1 rounded border ${
                    item.qty <= minQty
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-100 cursor-pointer"
                  }`}
                >
                  −
                </button>

                <span className="min-w-[30px] text-center">{item.qty}</span>

                <button
                  onClick={() => updateQty(item.id, item.qty + 1)}
                  className="px-3 py-1 rounded border hover:bg-gray-100 cursor-pointer"
                >
                  +
                </button>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 text-sm ml-4 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {item.qty === minQty && (
                <p className="text-xs text-gray-500">
                  Minimum quantity for {item.packageType} pack is {minQty}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <hr className="my-6" />

      {/* PRODUCT TOTAL */}
      <div className="flex justify-between text-sm mb-2">
        <span>Products Total</span>
        <span>₹{total}</span>
      </div>

      {/* DELIVERY FEE */}
      <div className="flex justify-between text-sm mb-4">
        <span>Delivery Fee</span>
        <span>₹{deliveryFee}</span>
      </div>

      {/* GRAND TOTAL */}
      <div className="flex justify-between font-semibold text-lg">
        <span>Total Payable</span>
        <span>₹{grandTotal}</span>
      </div>

      {total < 150 && cart.length > 0 && (
        <p className="text-red-600 text-sm mt-2">
          Add ₹{150 - total} more to place order
        </p>
      )}
    </div>
  );
}
