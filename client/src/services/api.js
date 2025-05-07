import axios from 'axios';

const API = axios.create({
  baseURL: '/',
  withCredentials: true,
});

export const registerUser = async (userData) => {
  return await API.post('/api/register/', userData);
};

export const loginUser = async (credentials) => {
  return await API.post('/api/login/', credentials);
};

export const getCurrentUser = async () => {
  return await API.get('/api/get-jwt/');
};

export const logoutUser = async (navigateCallback) => {
  try {
    await API.post('/api/logout/');

    if (navigateCallback) {
      navigateCallback('/login');
    }

    return { success: true };
  } catch (err) {
    console.error("Logout failed:", err);
    return { success: false, error: err };
  }
};

export default API;
