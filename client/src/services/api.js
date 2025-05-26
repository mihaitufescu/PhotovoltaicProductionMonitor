import axios from 'axios';

const API = axios.create({
  baseURL: '/',
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await axios.post('/api/refresh-cookie/', {}, { withCredentials: true });
        return API(originalRequest); // retry original request
      } catch (refreshError) {
        console.error("Refresh token expired or invalid");
        // Redirect to login if refresh fails
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

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

export const getPlantOverview = async () => {
  try {
    const response = await API.get('/api/get-plants-overview/');
    return response.data;
  } catch (error) {
    console.error('Error fetching plant overview:', error);
    throw error;
  }
};

export const deletePlant = async (plantId) => {
  try {
    const response = await API.delete(`/api/delete-plant/${plantId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting plant:', error);
    throw error;
  }
};

export const updatePlant = async (plantId, payload) => {
  const response = await API.patch(`/api/update-plant/${plantId}/`, payload);
  return response.data;
};

export const getDevicesByPlant = async (plantId) => {
  const response = await API.get(`/api/get-devices-by-plant/${plantId}/`);
  return response.data;
};

export const addDevice = async (deviceData) => {
  const response = await API.post(`/api/add-device/`, deviceData);
  return response.data;
};

export const updateDevice = async (deviceId, deviceData) => {
  const response = await API.put(`/api/update-device/${deviceId}/`, deviceData);
  return response.data;
};

export const deleteDevice = async (deviceId) => {
  const response = await API.delete(`/api/delete-device/${deviceId}/`);
  return response.data;
};

export const uploadPlantData = async (plantId, file) => {
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append('file', file);

  const response = await API.post(`/api/plants/${plantId}/ingest/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getPlantDashboardData = async (plantId) => {
  try {
    const response = await API.get(`/api/plants/${plantId}/get_data/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching plant dashboard data:', error);
    throw error;
  }
};

export const getPvEstimation = async (payload) => {
  try {
    const response = await API.post('/api/get-pv-estimation/', payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching PV estimation:', error);
    throw error;
  }
};

export default API;
