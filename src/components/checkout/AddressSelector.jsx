import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";

export default function AddressSelector({
  selectedAddressId,
  setSelectedAddressId,
  onAddressesLoaded,
}) {
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    label: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  };

  const [form, setForm] = useState(emptyForm);

  /* ---------------- LOAD ---------------- */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const list = snap.data().addresses || [];
        setAddresses(list);

        if (typeof onAddressesLoaded === "function") {
          onAddressesLoaded(list);
        }

        const defaultAddr = list.find((a) => a.isDefault) || list[0];

        setSelectedAddressId(defaultAddr?.id || null);
      }
    };

    load();
  }, [user]);

  /* ---------------- SAVE TO FIRESTORE ---------------- */
  const saveToDb = async (updated) => {
    await updateDoc(doc(db, "users", user.uid), {
      addresses: updated,
    });

    setAddresses(updated);

    // 🔥 IMPORTANT: Sync with parent (Checkout)
    if (typeof onAddressesLoaded === "function") {
      onAddressesLoaded(updated);
    }
  };

  /* ---------------- ADD ADDRESS ---------------- */
  const saveAddress = async () => {
    const required = [
      "label",
      "firstName",
      "lastName",
      "email",
      "phone",
      "line1",
      "city",
      "state",
      "pincode",
    ];

    for (const field of required) {
      if (!form[field]) {
        toast.error("Please fill all required fields");
        return;
      }
    }

    try {
      setLoading(true);

      const newEntry = {
        id: uuid(),
        ...form,
        isDefault: true,
      };

      // 👇 Remove previous defaults
      const updated = addresses.map((a) => ({
        ...a,
        isDefault: false,
      }));

      const finalList = [...updated, newEntry];

      await saveToDb(finalList);

      setSelectedAddressId(newEntry.id); // auto select new address
      setShowForm(false);
      setForm(emptyForm);

      toast.success("Address added successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Delivery Address</h2>

      {/* ADDRESS LIST */}
      <div className="space-y-4 mb-6">
        {addresses.map((a) => {
          const isSelected = selectedAddressId === a.id;

          return (
            <label
              key={a.id}
              className={`flex gap-3 border rounded-xl p-4 cursor-pointer transition
                ${isSelected ? "border-black bg-gray-50" : ""}
                ${a.isDefault ? "border-green-400" : ""}
              `}
            >
              <input
                type="radio"
                name="deliveryAddress"
                checked={isSelected}
                onChange={() => setSelectedAddressId(a.id)}
              />

              <div>
                <p className="font-medium flex items-center gap-2">
                  {a.label}
                  {a.isDefault && (
                    <span className="text-xs bg-black text-white px-2 py-1 rounded">
                      Preferred
                    </span>
                  )}
                </p>

                <p className="text-sm text-gray-600">
                  {a.firstName} {a.lastName} • {a.phone}
                </p>

                <p className="text-sm text-gray-500">{a.email}</p>

                <p className="text-sm text-gray-500">
                  {a.line1}
                  {a.line2 && `, ${a.line2}`}, {a.city}, {a.state} - {a.pincode}
                </p>
              </div>
            </label>
          );
        })}

        {addresses.length === 0 && (
          <p className="text-gray-500">No addresses found. Please add one.</p>
        )}
      </div>

      {/* ADD BUTTON */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition"
      >
        Add New
      </button>

      {/* FORM (PROFILE STYLE) */}
      {showForm && (
        <div className="mt-8 border-t pt-6">
          <h3 className="font-semibold mb-4">Add Address</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["label", "Label (Home / Office)"],
              ["firstName", "First Name"],
              ["lastName", "Last Name"],
              ["email", "Email Address"],
              ["phone", "Phone Number"],
              ["line1", "Address Line 1"],
              ["line2", "Address Line 2 (optional)"],
              ["city", "City"],
              ["state", "State"],
              ["pincode", "Pincode"],
            ].map(([key, placeholder]) => (
              <input
                key={key}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="border p-3 rounded-xl"
              />
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={saveAddress}
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-xl"
            >
              {loading ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="border px-6 py-3 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
