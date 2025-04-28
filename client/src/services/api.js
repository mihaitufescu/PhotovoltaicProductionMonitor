import axios from 'axios';

const API = axios.create({
  baseURL: '/',
  withCredentials: true,
});

export const registerUser = async (userData) => {
  return await API.post('/api/register/', userData);
};

export default API;
