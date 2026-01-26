import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AddressSelector() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const list = snap.data().addresses || [];
        setAddresses(list);
        setSelected(list.find((a) => a.isDefault)?.id);
      }
    };
    load();
  }, [user]);

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
        {addresses.map((addr) => (
          <label
            key={addr.id}
            className="flex gap-3 border rounded-xl p-4 cursor-pointer"
          >
            <input
              type="radio"
              checked={selected === addr.id}
              onChange={() => setSelected(addr.id)}
            />

            <div>
              <p className="font-medium">{addr.label}</p>
              <p className="text-sm text-gray-600">
                {addr.name} • {addr.phone}
              </p>
              <p className="text-sm text-gray-500">{addr.address}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
