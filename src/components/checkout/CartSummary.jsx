import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function CartSummary({ deliveryFee = 0 }) {
  const { cart, updateQty, removeFromCart } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const finalDeliveryFee = total > 500 ? 0 : deliveryFee;
  const grandTotal = total + finalDeliveryFee;

  return (
    <div className="bg-white rounded-2xl shadow p-6 h-fit">
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

      <div className="space-y-6">
        {cart.map((item) => (
          <div key={item.id} className="space-y-2 border-b pb-4">
            <div className="flex justify-between text-sm font-medium">
              <span>{item.name}</span>
              <span>₹{item.price * item.qty}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => item.qty > 1 && updateQty(item.id, item.qty - 1)}
                className={`px-3 py-1 rounded border ${
                  item.qty <= 1
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
          </div>
        ))}
      </div>

      <hr className="my-6" />

      {/* PRODUCT TOTAL */}
      <div className="flex justify-between text-sm mb-2">
        <span>Products Total</span>
        <span>₹{total}</span>
      </div>

      {/* DELIVERY */}
      <div className="flex justify-between text-sm mb-4">
        <span>Delivery Fee</span>
        <span>
          {finalDeliveryFee === 0 ? (
            <span className="text-green-600 font-medium">FREE</span>
          ) : (
            `₹${finalDeliveryFee}`
          )}
        </span>
      </div>

      {/* GRAND TOTAL */}
      <div className="flex justify-between font-semibold text-lg mb-4">
        <span>Total Payable</span>
        <span>₹{grandTotal}</span>
      </div>

      {total < 150 && cart.length > 0 && (
        <p className="text-red-600 text-center text-sm mt-2">
          {" "}
          Add ₹{150 - total} more to place order{" "}
        </p>
      )}

      {/* BELOW 500 MESSAGE */}
      {total > 140 && total < 500 && cart.length > 0 && (
        <>
          <p className="text-red-600 text-sm mb-3 text-center">
            Add ₹{500 - total} more to get FREE delivery
          </p>

          {/* ✅ CONTINUE SHOPPING BUTTON */}
          <button
            onClick={() => navigate("/products")}
            className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Continue Shopping
          </button>
        </>
      )}
    </div>
  );
}
