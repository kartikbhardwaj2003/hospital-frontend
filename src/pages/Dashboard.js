import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [editPatient, setEditPatient] = useState(null);
  const [addPatientMode, setAddPatientMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    contactInfo: { phone: "", email: "" },
    allergies: "",
    medicalHistory: "",
    appointments: [{ date: "", reason: "" }],
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`https://hospital-backend-z8cg.onrender.com/api/patients?q=${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();
  }, [query, token]);

  const resetForm = () =>
    setForm({
      name: "",
      age: "",
      gender: "",
      contactInfo: { phone: "", email: "" },
      allergies: "",
      medicalHistory: "",
      appointments: [{ date: "", reason: "" }],
    });

  const deletePatient = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await axios.delete(`https://hospital-backend-z8cg.onrender.com/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Deleted!");
      setPatients((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert("❌ Failed to delete");
      console.error(err);
    }
  };

  const openEdit = (p) => {
    setEditPatient(p);
    setForm({
      name: p.name,
      age: p.age,
      gender: p.gender,
      contactInfo: p.contactInfo,
      allergies: p.allergies.join(", "),
      medicalHistory: p.medicalHistory.join(", "),
      appointments: p.appointments?.length
        ? p.appointments
        : [{ date: "", reason: "" }],
    });
  };

  const handleAppointmentChange = (i, field, value) => {
    const updated = [...form.appointments];
    updated[i][field] = value;
    setForm({ ...form, appointments: updated });
  };

  const addAppointmentField = () => {
    setForm({
      ...form,
      appointments: [...form.appointments, { date: "", reason: "" }],
    });
  };

  const handleSave = async () => {
    try {
      if (!window.confirm(editPatient ? "Update patient?" : "Add patient?")) return;

      const payload = {
        ...form,
        allergies: form.allergies.split(",").map((s) => s.trim()),
        medicalHistory: form.medicalHistory.split(",").map((s) => s.trim()),
      };

      if (editPatient) {
        await axios.put(`https://hospital-backend-z8cg.onrender.com/api/patients/${editPatient._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        payload.patientId = prompt("Enter unique Patient ID:");
        await axios.post("https://hospital-backend-z8cg.onrender.com/api/patients", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setEditPatient(null);
      setAddPatientMode(false);
      setQuery((q) => q + " ");
    } catch (err) {
      alert("❌ Failed to save");
      console.error(err);
    }
  };

  const sortPatients = (sortBy) => {
    const sorted = [...patients].sort((a, b) =>
      sortBy === "name"
        ? a.name.localeCompare(b.name)
        : Number(a.age) - Number(b.age)
    );
    setPatients(sorted);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex gap-2">
          <Link to="/reports" className="bg-blue-600 text-white px-4 py-2 rounded">
            Reports
          </Link>
          <button onClick={() => { resetForm(); setAddPatientMode(true); }}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            + Add Patient
          </button>
          <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search patients"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 rounded w-2/3"
        />
        <select
          onChange={(e) => sortPatients(e.target.value)}
          className="border p-2 rounded ml-2"
        >
          <option value="">Sort</option>
          <option value="name">Name</option>
          <option value="age">Age</option>
        </select>
      </div>

      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <ul className="space-y-4">
          {patients.map((p) => (
            <li
              key={p._id}
              className={`border p-4 rounded shadow space-y-2 ${
                p.age <= 18
                  ? "bg-blue-100"
                  : p.age <= 35
                  ? "bg-green-100"
                  : p.age <= 60
                  ? "bg-yellow-100"
                  : "bg-red-100"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {p.name} (ID: {p.patientId})
                    {["cancer", "diabetes", "stroke"].some((cond) =>
                      p.medicalHistory.includes(cond)
                    ) && (
                      <span className="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                        Critical
                      </span>
                    )}
                  </p>
                  <p>Age: {p.age} | Gender: {p.gender}</p>
                  <p>Email: {p.contactInfo?.email}</p>
                  <p>Phone: {p.contactInfo?.phone}</p>
                  <p>Allergies: {p.allergies?.join(", ")}</p>
                  <p>History: {p.medicalHistory?.join(", ")}</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-yellow-400 text-white px-3 py-1 rounded" onClick={() => openEdit(p)}>
                    Edit
                  </button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => deletePatient(p._id)}>
                    Delete
                  </button>
                </div>
              </div>
              {Array.isArray(p.appointments) && p.appointments.length > 0 && (
                <div>
                  <p className="font-semibold">Appointments:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {p.appointments.map((appt, index) => (
                      <li key={index}>
                        📅 {appt.date} – {appt.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {(editPatient || addPatientMode) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-lg w-96 space-y-3">
            <h3 className="text-xl font-bold mb-2">
              {editPatient ? `Edit Patient` : "Add New Patient"}
            </h3>

            <input className="border p-2 w-full" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="border p-2 w-full" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            <input className="border p-2 w-full" placeholder="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
            <input className="border p-2 w-full" placeholder="Phone" value={form.contactInfo.phone} onChange={(e) => setForm({ ...form, contactInfo: { ...form.contactInfo, phone: e.target.value } })} />
            <input className="border p-2 w-full" placeholder="Email" value={form.contactInfo.email} onChange={(e) => setForm({ ...form, contactInfo: { ...form.contactInfo, email: e.target.value } })} />
            <input className="border p-2 w-full" placeholder="Allergies (comma separated)" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
            <input className="border p-2 w-full" placeholder="Medical History (comma separated)" value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} />

            <div className="space-y-2">
              <p className="font-semibold">Appointments</p>
              {form.appointments.map((appt, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="border p-2 w-full"
                    type="date"
                    value={appt.date}
                    onChange={(e) => handleAppointmentChange(index, "date", e.target.value)}
                  />
                  <input
                    className="border p-2 w-full"
                    placeholder="Reason"
                    value={appt.reason}
                    onChange={(e) => handleAppointmentChange(index, "reason", e.target.value)}
                  />
                </div>
              ))}
              <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={addAppointmentField}>
                + Add Appointment
              </button>
            </div>

            <div className="flex justify-between pt-3">
              <button className="bg-green-500 text-white px-4 py-1 rounded" onClick={handleSave}>
                Save
              </button>
              <button className="bg-gray-500 text-white px-4 py-1 rounded" onClick={() => {
                setEditPatient(null);
                setAddPatientMode(false);
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
