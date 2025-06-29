import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCurrentUser, loginUser, logoutUser } from '../../services/api';

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const response = await getCurrentUser(); // uses cookies
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Unauthorized");
    }
  }
);

export const login = createAsyncThunk("auth/login", async (credentials, thunkAPI) => {
  try {
    await loginUser(credentials); // sets cookies server-side
    const result = await thunkAPI.dispatch(fetchCurrentUser());
    return result.payload;
  } catch (err) {
    return thunkAPI.rejectWithValue("Invalid credentials");
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await logoutUser(); // clears cookies
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false, 
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        localStorage.removeItem('user');
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('user');
      });
  },
});

export default authSlice.reducer;