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
      setError("Passwords don't match!");
      return;
    }

    const payload = { ...formData };
    delete payload.password2;

    try {
      await registerUser(payload);
      setMessage('✅ Registered successfully! Please check your email for confirmation.');
    } catch (err) {
      if (err.response && err.response.data) {
        setError('❌ ' + JSON.stringify(err.response.data));
      } else {
        setError('❌ Registration failed. Try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-4xl font-bold mb-8 text-center text-green-700">Create Your Account</h2>

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
            { name: 'first_name', label: 'First Name', type: 'text' },
            { name: 'last_name', label: 'Last Name', type: 'text' },
            { name: 'address', label: 'Address', type: 'text' },
            { name: 'city', label: 'City', type: 'text' },
            { name: 'country', label: 'Country', type: 'text' },
            { name: 'password', label: 'Password', type: 'password' },
            { name: 'password2', label: 'Confirm Password', type: 'password' },
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
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
