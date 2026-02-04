import { useEffect, useState } from "react";
import CartSummary from "../components/checkout/CartSummary";
import AddressSelector from "../components/checkout/AddressSelector";
import PlaceOrder from "../components/checkout/PlaceOrder";

export default function Checkout() {
  /* ---------------- SET PAGE TITLE ---------------- */
  useEffect(() => {
    document.title = "Checkout | Crumbella Innovative Foods";
  }, []);

  /* ---------------- STATE ---------------- */
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  /* ---------------- DERIVED DATA ---------------- */
  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId,
  );

  return (
    <section className="max-w-7xl mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          <AddressSelector
            selectedAddressId={selectedAddressId}
            setSelectedAddressId={setSelectedAddressId}
            onAddressesLoaded={setAddresses}
          />

          <PlaceOrder selectedAddress={selectedAddress} />
        </div>

        {/* RIGHT */}
        <CartSummary />
      </div>
    </section>
  );
}
