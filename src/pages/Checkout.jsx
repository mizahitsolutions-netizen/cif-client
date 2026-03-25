import { useEffect, useState } from "react";
import CartSummary from "../components/checkout/CartSummary";
import AddressSelector from "../components/checkout/AddressSelector";
import PlaceOrder from "../components/checkout/PlaceOrder";

import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export default function Checkout() {
  /* ---------------- PAGE TITLE ---------------- */
  useEffect(() => {
    document.title = "Checkout | Crumbella Innovative Foods";
  }, []);

  /* ---------------- STATE ---------------- */
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [expeddate, setexpeddate] = useState(null);

  /* ---------------- DERIVED DATA ---------------- */
  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId,
  );

  /* ---------------- FETCH SHIPPING ---------------- */
  useEffect(() => {
    if (!selectedAddress?.pincode) return;

    const getRates = httpsCallable(functions, "getShippingRates");

    async function fetchShipping() {
      try {
        const res = await getRates({
          pincode: selectedAddress.pincode,
          orderValue: 500,
        });

        setDeliveryFee(res.data.shippingCost);
        setexpeddate(res.data.estimatedDays);
      } catch (err) {
        console.error("Shipping error:", err);
      }
    }

    fetchShipping();
  }, [selectedAddress]);

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

          <PlaceOrder
            selectedAddress={selectedAddress}
            deliveryFee={deliveryFee}
            expeddate={expeddate}
          />
        </div>

        {/* RIGHT */}
        <CartSummary deliveryFee={deliveryFee} expeddate={expeddate} />
      </div>
    </section>
  );
}
