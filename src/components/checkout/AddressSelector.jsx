import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function AddressSelector({
  selectedAddressId,
  setSelectedAddressId,
  onAddressesLoaded, // optional
}) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (!user) return;

    const loadAddresses = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          const list = snap.data().addresses || [];
          setAddresses(list);

          // ✅ Call only if function exists
          if (typeof onAddressesLoaded === "function") {
            onAddressesLoaded(list);
          }

          // ✅ Auto-select default or first
          const defaultAddr = list.find((a) => a.isDefault) || list[0];

          setSelectedAddressId(defaultAddr?.id || null);
        }
      } catch (err) {
        console.error("Failed to load addresses", err);
      }
    };

    loadAddresses();
  }, [user, onAddressesLoaded, setSelectedAddressId]);

  if (!addresses.length) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-gray-600">
          No address found. Please add an address in profile.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Delivery Address</h2>

      <div className="space-y-4">
        {addresses.map((addr) => {
          const isSelected = selectedAddressId === addr.id;

          return (
            <label
              key={addr.id}
              className={`flex gap-3 border rounded-xl p-4 cursor-pointer transition
                ${isSelected ? "border-black bg-gray-50" : ""}
                ${addr.isDefault ? "border-green-400" : ""}
              `}
            >
              <input
                type="radio"
                name="deliveryAddress"
                checked={isSelected}
                onChange={() => setSelectedAddressId(addr.id)}
              />

              <div>
                <p className="font-medium flex items-center gap-2">
                  {addr.label}

                  {addr.isDefault && (
                    <span
                      className="px-2 py-0.5 text-xs font-semibold rounded-full
                      bg-green-100 text-green-700 border border-green-200"
                    >
                      DEFAULT
                    </span>
                  )}
                </p>

                <p className="text-sm text-gray-600">
                  {addr.name} • {addr.phone}
                </p>

                <p className="text-sm text-gray-500">{addr.address}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
