export default function PaymentOptions({
  paymentMethod,
  setPaymentMethod,
  codAvailable,
  onlineFee,
  codFee,
  eta,
}) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="font-semibold mb-3">Payment Method</h3>

      <div className="space-y-2">
        {/* ONLINE */}
        <label className="flex gap-2 cursor-pointer">
          <input
            type="radio"
            checked={paymentMethod === "online"}
            onChange={() => setPaymentMethod("online")}
          />
          Online Payment
        </label>

        {/* COD */}
        <label
          className={`flex gap-2 ${
            !codAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <input
            type="radio"
            checked={paymentMethod === "cod"}
            disabled={!codAvailable}
            onChange={() => setPaymentMethod("cod")}
          />
          Cash on Delivery
        </label>
      </div>

      {/* ❌ COD NOT AVAILABLE */}
      {!codAvailable && (
        <p className="text-red-500 text-sm mt-2">
          COD is not available for this pincode
        </p>
      )}

      {/* 💡 SAVE MONEY */}
      {codFee > onlineFee && (
        <p className="text-green-600 text-sm mt-2">
          💡 Save ₹{codFee - onlineFee} by paying online
        </p>
      )}

      {/* 🚚 ETA */}
      {eta && (
        <p className="text-sm text-green-600 mt-2">
          🚚 Delivery in {eta}-{eta + 1} days
        </p>
      )}
    </div>
  );
}
