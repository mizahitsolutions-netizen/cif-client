import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";

export default function ProfileCart() {
  const { cart, removeFromCart, updateQty } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-10 text-center">
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <Link to="/products" className="underline text-sm">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-6">My Cart</h2>

      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-4 border rounded-xl p-4">
            <div className="bg-[#f8f4ef] h-20 w-20 flex items-center justify-center rounded-lg">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="max-h-full object-contain"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-xs text-gray-500">{item.packageType} Pack</p>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center bg-gray-100 rounded-full px-2">
                  <button
                    onClick={() =>
                      updateQty(item.id, Math.max(1, item.qty - 1))
                    }
                    className="px-2"
                  >
                    −
                  </button>
                  <span className="px-2 text-sm">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="px-2"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-xs text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="font-medium">₹{item.price * item.qty}</div>
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="border-t mt-6 pt-4">
        <div className="flex justify-between font-semibold mb-4">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        <Link
          to="/cart"
          className="block text-center border border-black py-3 rounded-xl hover:bg-black hover:text-white transition"
        >
          Go to Full Cart
        </Link>
      </div>
    </div>
  );
}
