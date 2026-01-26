import CartSummary from "../components/checkout/CartSummary";
import AddressSelector from "../components/checkout/AddressSelector";
import PlaceOrder from "../components/checkout/PlaceOrder";
import { useEffect } from "react";

export default function Checkout() {

  useEffect(() => {
    document.title = "Checkout | Crumbella Innovative Foods";
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          <AddressSelector />
          <PlaceOrder />
        </div>

        {/* RIGHT */}
        <CartSummary />
      </div>
    </section>
  );
}
