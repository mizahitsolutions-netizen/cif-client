import { useEffect, useState } from "react";
import CartSummary from "../components/checkout/CartSummary";
import AddressSelector from "../components/checkout/AddressSelector";
import PlaceOrder from "../components/checkout/PlaceOrder";
import PaymentOptions from "../components/checkout/PaymentOptions";

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

  // 🔥 NEW STATES
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [onlineFee, setOnlineFee] = useState(0);
  const [codFee, setCodFee] = useState(0);
  const [codAvailable, setCodAvailable] = useState(true);

  /* ---------------- DERIVED ---------------- */
  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId,
  );

  /* ---------------- FETCH SHIPPING ---------------- */
  useEffect(() => {
    if (!selectedAddress?.pincode) return;

    const getRates = httpsCallable(functions, "getShippingRates");

    async function fetchShipping() {
      try {
        const [onlineRes, codRes] = await Promise.all([
          getRates({
            pincode: selectedAddress.pincode,
            orderValue: 500,
            isCOD: false,
          }),
          getRates({
            pincode: selectedAddress.pincode,
            orderValue: 500,
            isCOD: true,
          }),
        ]);

        const onlineCost = onlineRes.data.shippingCost;
        const codCost = codRes.data.shippingCost;

        setOnlineFee(onlineCost);
        setCodFee(codCost);

        setDeliveryFee(onlineCost);
        setexpeddate(onlineRes.data.estimatedDays);

        setCodAvailable(codRes.data.codAvailable);
      } catch (err) {
        console.error("Shipping error:", err);
      }
    }

    fetchShipping();
  }, [selectedAddress]);

  /* ---------------- SWITCH SHIPPING ---------------- */
  useEffect(() => {
    if (paymentMethod === "cod") {
      setDeliveryFee(codFee);
    } else {
      setDeliveryFee(onlineFee);
    }
  }, [paymentMethod, onlineFee, codFee]);

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

          {/* 🔥 PAYMENT OPTIONS */}
          <PaymentOptions
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            codAvailable={codAvailable}
            onlineFee={onlineFee}
            codFee={codFee}
            eta={expeddate}
          />

          <PlaceOrder
            selectedAddress={selectedAddress}
            deliveryFee={deliveryFee}
            expeddate={expeddate}
            paymentMethod={paymentMethod} // 🔥 important
          />
        </div>

        {/* RIGHT */}
        <CartSummary deliveryFee={deliveryFee} expeddate={expeddate} />
      </div>
    </section>
  );
}
