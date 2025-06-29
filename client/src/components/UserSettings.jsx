import React, { useEffect, useState } from 'react';
import { getCurrentUserInfo, updateCurrentUser, deleteCurrentUser} from '../services/api';
import API from '../services/api';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const UserSettings = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    city: '',
    country: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUserInfo();
        setFormData(response.data);
      } catch (error) {
        setMessage('Datele nu au fost încărcate.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await updateCurrentUser(formData);
      if (response) setMessage('Utilizatorul a fost actualizat');
    } catch (error) {
      const errorMsg = 'Eroare actualizare.';
      setMessage(errorMsg);
    }
  };
 const dispatch = useDispatch();
 const handleDelete = async () => {
  const confirmed = window.confirm('Ești sigur ca vrei să ștergi contul? Această operație este ireversibilă.');
  if (!confirmed) return;

  try {
        API.interceptors.response.handlers = [];

        await deleteCurrentUser();

        dispatch(logout());

        window.location.replace('/login');

    } catch (error) {
        const errMsg = 'Eroare ștergere cont.';
        setMessage(errMsg);
    }
    };

  if (loading) return <div className="p-6">Încarcare informații...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Setări utilizator</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { name: 'first_name', label: 'Prenume' },
          { name: 'last_name', label: 'Nume' },
          { name: 'address', label: 'Adresă' },
          { name: 'city', label: 'Oraș' },
          { name: 'country', label: 'Țară' },
        ].map(({ name, label }) => (
          <div key={name}>
            <label className="block font-medium">{label}:</label>
            <input
              type="text"
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              required
            />
          </div>
        ))}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Salveză
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Șterge cont
          </button>
        </div>
      </form>

      {message && (
        <p className="mt-4 text-sm">
          {message.startsWith('Utilizatorul') ? (
            <span className="text-green-600">{message}</span>
          ) : (
            <span className="text-red-600">{message}</span>
          )}
        </p>
      )}
    </div>
  );
};

export default UserSettings;
