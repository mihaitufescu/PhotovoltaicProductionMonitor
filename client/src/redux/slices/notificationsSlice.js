import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserNotifications, markAlertAsViewed } from '../../services/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async () => {
    const response = await getUserNotifications();
    return response.alerts || [];
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (id) => {
    await markAlertAsViewed(id);
    return id;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    alerts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.alerts = action.payload;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = 'Failed to fetch notifications';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.alerts = state.alerts.map(alert =>
          alert.id === action.payload ? { ...alert, unread: false, read_date: new Date().toISOString() } : alert
        );
      });
  },
});

export default notificationsSlice.reducer;
