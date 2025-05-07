import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCurrentUser, loginUser, logoutUser } from '../../services/api';

export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",
    async (_, thunkAPI) => {
      try {
        console.log("Fetching current user...");
        const response = await getCurrentUser(); // API call
        return response.data;
      } catch (err) {
        console.error("User not logged in", err.response?.status);
        return thunkAPI.rejectWithValue(err.response?.data);
      }
    }
  );

export const login = createAsyncThunk("auth/login", async (credentials, thunkAPI) => {
    await loginUser(credentials);
    const result = await thunkAPI.dispatch(fetchCurrentUser());
    return result.payload;
});

export const logout = createAsyncThunk('auth/logout', async () => {
    await logoutUser();
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchCurrentUser.pending, (state) => {
            console.log("🔄 fetchCurrentUser: pending");
            state.loading = true;
        })
        .addCase(fetchCurrentUser.fulfilled, (state, action) => {
            console.log("✅ fetchCurrentUser: success", action.payload);
            state.user = action.payload;
            state.loading = false;
        })
        .addCase(fetchCurrentUser.rejected, (state, action) => {
            console.warn("❌ fetchCurrentUser: failed", action.payload);
            state.user = null;
            state.loading = false;
        })
        .addCase(login.pending, (state) => {
            state.loading = true;
        })
        .addCase(login.fulfilled, (state) => {
            state.loading = false;
        })
        .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(logout.fulfilled, (state) => {
            state.user = null;
        });
    },
});

export default authSlice.reducer;