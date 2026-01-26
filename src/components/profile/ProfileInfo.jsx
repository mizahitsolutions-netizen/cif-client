import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProfileInfo() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    dob: "",
  });

  /* 🔥 LOAD PROFILE */
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setForm({
          username: data.username || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          dob: data.dob || "",
        });
      }
    };
    load();
  }, [user]);

  /* 💾 SAVE PROFILE */
  const save = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        username: form.username,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        dob: form.dob,
      });

      toast.success("Profile updated");
      setEditing(false);
    } catch {
      toast.error("Update failed");
    }
  };

  const inputClass = (editable) =>
    `w-full border p-3 rounded-xl ${editable ? "bg-white" : "bg-gray-100"}`;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">My Profile</h2>
        <button
          onClick={() => setEditing(!editing)}
          className="underline text-sm cursor-pointer"
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FIRST NAME */}
        <div>
          <label className="text-sm text-gray-500">First Name</label>
          <input
            disabled={!editing}
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            placeholder="First name"
            className={inputClass(editing)}
          />
        </div>

        {/* LAST NAME */}
        <div>
          <label className="text-sm text-gray-500">Last Name</label>
          <input
            disabled={!editing}
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            placeholder="Last name"
            className={inputClass(editing)}
          />
        </div>

        {/* USERNAME */}
        <div>
          <label className="text-sm text-gray-500">Username</label>
          <input
            disabled={!editing}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Username"
            className={inputClass(editing)}
          />
        </div>

        {/* DOB */}
        <div>
          <label className="text-sm text-gray-500">Date of Birth</label>
          <input
            type="date"
            disabled={!editing}
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
            className={inputClass(editing)}
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="text-sm text-gray-500">Phone Number</label>
          <input
            disabled={!editing}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone number"
            className={inputClass(editing)}
          />
        </div>

        {/* EMAIL (READ ONLY) */}
        <div>
          <label className="text-sm text-gray-500">Email</label>
          <input
            disabled
            value={user.email}
            className="w-full border p-3 rounded-xl bg-gray-100"
          />
        </div>
      </div>

      {/* SAVE */}
      {editing && (
        <button
          onClick={save}
          className="bg-black text-white px-6 py-3 rounded-xl mt-6 cursor-pointer"
        >
          Save Changes
        </button>
      )}
    </div>
  );
}
