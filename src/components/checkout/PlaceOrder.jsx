import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { db } from "../../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function PlaceOrder({ selectedAddress }) {
  const { user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast("Please login to continue", { icon: "🔒" });
      return;
    }

    if (!cart.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select delivery address");
      return;
    }

    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items: cart,
        total,
        address: selectedAddress,

        status: "created", // 🔥 important
        paymentStatus: "pending", // 🔥 important
        createdAt: serverTimestamp(),
      });

      // ❌ DO NOT clear cart here

      navigate(`/payment/${orderRef.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order");
    }
  };

  return (
    <button
      onClick={handlePlaceOrder}
      className="w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800 cursor-pointer"
    >
      Place Order
    </button>
  );
}
