import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({ username: "", password: "", role: "doctor" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://hospital-backend-z8cg.onrender.com/api/auth/register", form);
      alert("Registered successfully!");
      navigate("/");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl mb-4 font-bold text-center">Register</h2>
        <input
          className="w-full p-2 mb-3 border rounded"
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 mb-3 border rounded"
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <select
          name="role"
          onChange={handleChange}
          className="w-full p-2 mb-3 border rounded"
        >
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>
        <button className="w-full bg-green-600 text-white p-2 rounded" type="submit">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
