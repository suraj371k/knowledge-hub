import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

//register user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/user/register`, userData);
      return res.data;
          } catch (error) {
        return rejectWithValue(
          error.response?.data?.error || "Registration failed"
        );
      }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/user/login`, userData);
      return res.data;
          } catch (error) {
        return rejectWithValue(error.response?.data?.error || "Login failed");
      }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/user/logout`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "logout failed");
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching profile...')
      const res = await api.get(`/api/user/profile`);
      console.log('Profile response:', res.data)
      return res.data;
    } catch (error) {
      console.error('Profile fetch error:', error.response || error)
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch profile"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.newUser;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })
      // FETCH PROFILE
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
             .addCase(fetchProfile.fulfilled, (state, action) => {
         state.loading = false;
         state.user = action.payload.user;
       })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;