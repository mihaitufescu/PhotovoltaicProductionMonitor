import React, { useState } from 'react';
import { requestPasswordReset } from '../../services/api';

const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Introdu adresa de email.');
      return;
    }

    try {
      const res = await requestPasswordReset(email);
      setMessage(res.message || 'Email-ul a fost trimis.');
    } catch (err) {
      setError(err.error || err.message || 'Email-ul nu a fost trimis..');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm relative">
        <button className="absolute top-2 right-2 text-gray-600" onClick={onClose}>×</button>
        <h2 className="text-xl font-bold mb-4">Resetează parola</h2>

        {message && <div className="text-green-600 mb-3">{message}</div>}
        {error && <div className="text-red-600 mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Trimite
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
