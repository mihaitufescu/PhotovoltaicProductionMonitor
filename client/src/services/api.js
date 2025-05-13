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

export const createPlant = async (payload) => {
  try {
    const response = await axios.post('api/create-plant/', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Plant created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating plant:', error);
    if (error.response) {
      console.log('Response Error:', error.response);
      alert('There was an issue with the request. Please check the data and try again.');
    } else {
      console.log('Request Error:', error.message);
    }
  }
};

export default API;
