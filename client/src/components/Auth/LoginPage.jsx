import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api";
import { useDispatch } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import ForgotPasswordModal from "../Modals/ForgotPasswordModal";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const { email, password } = formData;

    if (!email || !password) {
      setError("Completează toate câmpurile.");
      return;
    }

    try {
        await dispatch(login({ email, password })).unwrap();
        setMessage("Autentificare reușită!");
        navigate("/dashboard");
    } catch (err) {
        console.error(err);
        setError("Datele sunt invalide sau a fost produsă o eroare de server.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-4xl font-semibold text-green-900 mb-6 text-center md:text-left">
        Panou autentificare
      </h2>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-100 text-red-700 rounded border border-red-400">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 px-4 py-3 bg-green-100 text-green-700 rounded border border-green-400">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block mb-2 font-semibold text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block mb-2 font-semibold text-gray-700"
          >
            Parolă
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-sm text-green-600 hover:text-green-800 font-medium"
          >
            Ai uitat parola?
          </button>

          <button
            type="submit"
            className="w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Autentificare
          </button>
        </div>
      </form>
      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
    </div>
  );
};

export default LoginPage;
