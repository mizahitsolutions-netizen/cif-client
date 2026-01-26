import { useCart } from "../../context/CartContext";

export default function CartSummary() {
  const { cart } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="bg-white rounded-2xl shadow p-6 h-fit">
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.qty} × {item.name}
            </span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>

      <hr className="my-4" />

      <div className="flex justify-between font-semibold text-lg">
        <span>Total</span>
        <span>₹{total}</span>
      </div>
    </div>
  );
}
