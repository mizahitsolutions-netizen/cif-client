import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const CartPage = () => {
  const { cart, removeFromCart, updateQty } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="text-center py-32">
        <h2 className="text-2xl font-bold mb-4">
          Your cart is empty
        </h2>
        <Link
          to="/products"
          className="text-black underline"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-10">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* ITEMS */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex gap-6 bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="bg-[#f8f4ef] h-32 w-32 flex items-center justify-center rounded-xl">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="max-h-full object-contain"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {item.packageType} Pack
                </p>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center bg-gray-100 rounded-full px-3">
                    <button
                      onClick={() =>
                        updateQty(item.id, Math.max(1, item.qty - 1))
                      }
                      className="px-2"
                    >
                      −
                    </button>

                    <span className="px-3">{item.qty}</span>

                    <button
                      onClick={() =>
                        updateQty(item.id, item.qty + 1)
                      }
                      className="px-2"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="font-semibold text-lg">
                ₹{item.price * item.qty}
              </div>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="bg-white rounded-2xl shadow-sm p-8 h-fit">
          <h2 className="text-xl font-semibold mb-6">
            Order Summary
          </h2>

          <div className="flex justify-between mb-4">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>

          <div className="flex justify-between mb-6">
            <span>Delivery</span>
            <span>Free</span>
          </div>

          <div className="flex justify-between font-bold text-lg mb-8">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <button className="w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
