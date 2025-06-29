import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { confirmEmail } from '../services/api'; // Adjust path if needed

const ConfirmEmailPage = () => {
  const { uidb64, token } = useParams();
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirm = async () => {
      try {
        const data = await confirmEmail(uidb64, token);
        setMessage('Email confirmat!');
        setSuccess(true);
      } catch (err) {
        setMessage('Link invalid sau expirat.');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    confirm();
  }, [uidb64, token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full text-center">
        {loading ? (
          <p className="text-blue-600">Verificam link-ul...</p>
        ) : (
          <>
            <p className={`text-lg font-semibold ${success ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>

            {success && (
              <Link to="/login">
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Du-te la autentificare
                </button>
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
