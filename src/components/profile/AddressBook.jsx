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

  const [form, setForm] = useState({
    label: "",
    name: "",
    phone: "",
    address: "",
  });

  /* 🔥 LOAD ADDRESSES */
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setAddresses(snap.data().addresses || []);
      }
    };
    load();
  }, [user]);

  /* 💾 SAVE TO FIRESTORE */
  const saveToDb = async (updated) => {
    await updateDoc(doc(db, "users", user.uid), {
      addresses: updated,
    });
    setAddresses(updated);
  };

  /* ➕ ADD / ✏️ UPDATE */
  const saveAddress = async () => {
    if (!form.label || !form.name || !form.phone || !form.address) {
      toast.error("All fields required");
      return;
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
          isDefault: addresses.length === 0, // first address default
        },
      ];
      toast.success("Address added");
    }

    await saveToDb(updated);
    setShowForm(false);
    setEditingId(null);
    setForm({ label: "", name: "", phone: "", address: "" });
  };

  /* 🗑️ DELETE */
  const deleteAddress = async (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    await saveToDb(updated);
    toast.success("Address deleted");
  };

  /* ⭐ SET DEFAULT */
  const setDefault = async (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    await saveToDb(updated);
    toast.success("Default address updated");
  };

  /* ✏️ EDIT */
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
            setForm({ label: "", name: "", phone: "", address: "" });
          }}
          className="border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition cursor-pointer"
        >
          Add New
        </button>
      </div>

      {/* ADDRESS LIST */}
      <div className="space-y-4">
        {addresses.map((a) => (
          <div key={a.id} className="border rounded-xl p-4 flex flex-col gap-2">
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

            <p className="text-sm text-gray-500">{a.address}</p>

            <div className="flex gap-4 mt-3 text-sm">
              <button onClick={() => editAddress(a)} className="underline cursor-pointer">
                Edit
              </button>
              <button
                onClick={() => deleteAddress(a.id)}
                className="underline text-red-600 cursor-pointer"
              >
                Delete
              </button>
              {!a.isDefault && (
                <button onClick={() => setDefault(a.id)} className="underline cursor-pointer">
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

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="mt-8 border-t pt-6">
          <h3 className="font-semibold mb-4">
            {editingId ? "Edit Address" : "Add Address"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Label (Home / Office)"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="border p-3 rounded-xl"
            />

            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border p-3 rounded-xl"
            />

            <input
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border p-3 rounded-xl"
            />

            <textarea
              placeholder="Full Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="border p-3 rounded-xl md:col-span-2"
              rows="3"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={saveAddress}
              className="bg-black text-white px-6 py-3 rounded-xl cursor-pointer"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="border px-6 py-3 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
