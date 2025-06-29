import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificationsReducer from './slices/notificationsSlice';

const store = configureStore({
    reducer: {
      auth: authReducer,
      notifications: notificationsReducer,
    },
  });
  
  export default store;