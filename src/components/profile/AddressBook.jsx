import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuid } from "uuid";

export default function AddressBook() {
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    label: "",
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  };

  const [form, setForm] = useState(emptyForm);

  /* ---------------- LOAD ADDRESSES ---------------- */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setAddresses(snap.data().addresses || []);
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
  };

  /* ---------------- ADD / UPDATE ---------------- */
  const saveAddress = async () => {
    const required = [
      "label",
      "name",
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

    let updated;

    if (editingId) {
      updated = addresses.map((a) =>
        a.id === editingId ? { ...a, ...form } : a,
      );
      toast.success("Address updated");
    } else {
      updated = [
        ...addresses,
        {
          id: uuid(),
          ...form,
          isDefault: addresses.length === 0,
        },
      ];
      toast.success("Address added");
    }

    await saveToDb(updated);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  /* ---------------- DELETE ---------------- */
  const deleteAddress = async (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    await saveToDb(updated);
    toast.success("Address deleted");
  };

  /* ---------------- SET DEFAULT ---------------- */
  const setDefault = async (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    await saveToDb(updated);
    toast.success("Default address updated");
  };

  /* ---------------- EDIT ---------------- */
  const editAddress = (addr) => {
    setForm(addr);
    setEditingId(addr.id);
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">My Addresses</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm);
          }}
          className="border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition"
        >
          Add New
        </button>
      </div>

      {/* ADDRESS LIST */}
      <div className="space-y-4">
        {addresses.map((a) => (
          <div key={a.id} className="border rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <p className="font-medium">{a.label}</p>
              {a.isDefault && (
                <span className="text-xs bg-black text-white px-2 py-1 rounded">
                  Preferred
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600">
              {a.name} • {a.phone}
            </p>

            <p className="text-sm text-gray-500">
              {a.line1}
              {a.line2 && `, ${a.line2}`}, {a.city}, {a.state} - {a.pincode}
            </p>

            <div className="flex gap-4 text-sm mt-2">
              <button onClick={() => editAddress(a)} className="underline">
                Edit
              </button>
              <button
                onClick={() => deleteAddress(a.id)}
                className="underline text-red-600"
              >
                Delete
              </button>
              {!a.isDefault && (
                <button onClick={() => setDefault(a.id)} className="underline">
                  Set Preferred
                </button>
              )}
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <p className="text-gray-500">No addresses added yet</p>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="mt-8 border-t pt-6">
          <h3 className="font-semibold mb-4">
            {editingId ? "Edit Address" : "Add Address"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["label", "Label (Home / Office)"],
              ["name", "Full Name"],
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
              className="bg-black text-white px-6 py-3 rounded-xl"
            >
              Save
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
