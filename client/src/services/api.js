import axios from 'axios';

const API = axios.create({
  baseURL: '/',
  withCredentials: true,
});

const MAX_RETRY = 5;

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount < MAX_RETRY) {
        originalRequest._retryCount += 1;

        try {
          await API.post('/api/refresh-cookie/', {}, { withCredentials: true });
          return API(originalRequest); 
        } catch (refreshError) {
          console.error("Refresh token expired or invalid");
        }
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
    const response = await API.post('api/create-plant/', payload, {
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
  if (!file) throw new Error("Nu au fost selectat niciun fisier");

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
    const flattenedPayload = {
      latitude: payload.inputs.location.latitude,
      longitude: payload.inputs.location.longitude,
      elevation: payload.inputs.location.elevation,
      tilt: payload.inputs.mounting_system.fixed.slope,
      azimuth: payload.inputs.mounting_system.fixed.azimuth,
      losses: payload.inputs.pv_module.system_loss,
      peak_power: payload.inputs.pv_module.peak_power
    };
    console.log(flattenedPayload)
    const response = await API.post('/api/get-pv-estimation/', flattenedPayload);
    return {
      pvgisData: response.data.pvgis_data,
      marketPrice: response.data.market_price
    };
  } catch (error) {
    console.error('Error fetching PV estimation:', error);
    throw error;
  }
};

export const getPlantAggregates = async () => {
  try {
    const response = await API.get('/api/aggregated-report/');
    return response.data;
  } catch (error) {
    console.error('Error fetching plant aggregate data:', error);
    throw error;
  }
};

export const getUserNotifications = async () => {
  try {
    const response = await API.get('/api/get-notifications-user/');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markAlertAsViewed = async (id) => {
  const res = await fetch(`/api/mark-alert/${id}/`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to mark alert as read');
  return res.json();
};

export const updateAlarmSettings = async (plantId, data) => {
  const response = await fetch(`/api/update_alarm/${plantId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw { response: { data: errorData } };
  }

  return response.json();
};

export const getCurrentUserInfo = async () => {
  const response = await API.get(`api/user/get/`);
  return response.data;
};

export const updateCurrentUser = async (payload) => {
  const response = await API.put(`api/user/update/`, payload);
  return response.data;
};

export const confirmEmail = async (uidb64, token) => {
  try {
    const response = await API.get(
      `/api/confirm-email/${uidb64}/${token}/`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Eroare server' };
  }
};

export const deleteCurrentUser = async () => {
  try {
    const response = await API.delete('/api/user/delete_current_user/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Something went wrong' };
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await API.post('/api/forgot-password/', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Something went wrong.' };
  }
};

export const resetPassword = async (uidb64, token, newPassword) => {
  const response = await API.post(`/api/reset-password/${uidb64}/${token}/`, {
    new_password: newPassword,
  });
  return response.data;
};

export const fetchSystemAvailability = async () => {
  try {
    const response = await API.get('/api/system-availability/');
    return response.data;
  } catch (error) {
    console.error('Error fetching system availability:', error);
    throw error;
  }
};

export default API;
