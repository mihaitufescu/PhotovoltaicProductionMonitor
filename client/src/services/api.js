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


export const logoutUser = async () => {
  return await API.post('/api/logout/');
};

export default API;
