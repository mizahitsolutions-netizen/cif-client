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

  const isDisabled =
    !user || !selectedAddress || cart.length === 0 || total < 150;

  const handlePlaceOrder = async () => {
    if (isDisabled) return; // extra safety

    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items: cart,
        total,
        address: selectedAddress,
        status: "created",
        paymentStatus: "pending",
        createdAt: serverTimestamp(),
      });

      navigate(`/payment/${orderRef.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order");
    }
  };

  return (
    <div>

      <button
        onClick={handlePlaceOrder}
        disabled={isDisabled}
        className={`w-full py-4 rounded-xl transition 
          ${
            isDisabled
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
      >
        Place Order
      </button>
    </div>
  );
}
