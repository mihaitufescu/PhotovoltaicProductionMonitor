import React, { useState } from 'react';
import { registerUser } from '../../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    address: '',
    city: '',
    country: '',
    password: '',
    password2: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.password2) {
      setError("Parolele nu se potrivesc!");
      return;
    }

    if (formData.password.length < 8) {
      setError("Parola trebuie să aibă cel puțin 8 caractere.");
      return;
    }

    const hasNumber = /\d/.test(formData.password);
    const hasUpper = /[A-Z]/.test(formData.password);
    const hasLower = /[a-z]/.test(formData.password);

    if (!hasNumber || !hasUpper || !hasLower) {
      setError("Parola trebuie să conțină litere mari, litere mici și cel puțin o cifră.");
      return;
    }

    const payload = { ...formData };
    delete payload.password2;

    try {
      await registerUser(payload);
      setMessage('Inregistrat cu succes. Verifica email-ul pentru a confirma contul.');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError('Inregistrarea a eșuat. Încearcă mai târziu!');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-4xl font-semibold text-green-900 mb-6 text-center md:text-left">Creează cont</h2>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-100 text-red-700 rounded-lg border border-red-300 text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 px-4 py-3 bg-green-100 text-green-700 rounded-lg border border-green-300 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {[
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'first_name', label: 'Prenume', type: 'text' },
            { name: 'last_name', label: 'Nume', type: 'text' },
            { name: 'address', label: 'Adresă', type: 'text' },
            { name: 'city', label: 'Oraș', type: 'text' },
            { name: 'country', label: 'Țară', type: 'text' },
            { name: 'password', label: 'Parola', type: 'password' },
            { name: 'password2', label: 'Confirma parolă', type: 'password' },
          ].map(({ name, label, type }) => (
            <div key={name} className="flex flex-col">
              <label htmlFor={name} className="mb-2 text-gray-700 font-semibold">
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition"
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition font-semibold shadow-md"
          >
            Inregistrare
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
