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
        setMessage('Failed to load user data.');
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
      setMessage(response.message);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Update failed.';
      setMessage(errorMsg);
    }
  };
 const dispatch = useDispatch();
 const handleDelete = async () => {
  const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
  if (!confirmed) return;

  try {
        // 🔒 Immediately disable axios interceptor retries
        API.interceptors.response.handlers = [];

        await deleteCurrentUser();

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Optional: clear redux or context
        dispatch(logout());

        window.location.replace('/login');

    } catch (error) {
        const errMsg = error?.response?.data?.detail || 'Failed to delete account.';
        setMessage(errMsg);
    }
    };

  if (loading) return <div className="p-6">Loading user info...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">User Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {['first_name', 'last_name', 'address', 'city', 'country'].map((field) => (
          <div key={field}>
            <label className="block font-medium capitalize">{field.replace('_', ' ')}:</label>
            <input
              type="text"
              name={field}
              value={formData[field]}
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
            Save Changes
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Delete Account
          </button>
        </div>
      </form>

      {message && (
        <p className="mt-4 text-sm">
          {message.startsWith('User') ? (
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
