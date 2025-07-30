// src/features/auth/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api";

// — LOGIN (standard + handles admin OTP skip on frontend)
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await api.login(email, password);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// — OTP STEP 2: verify OTP
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      // ✅ FIXED: Store token as authToken
      localStorage.setItem("authToken", data.token);

      return { user: data.user };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// — REGISTER
export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      return await api.register(userData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// — LOGOUT
export const logout = createAsyncThunk("auth/logout", async () => {
  return await api.logout();
});

// — CHECK AUTH
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const { user } = await api.getProfile();
      return { user };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// — UPDATE PROFILE
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      return await api.updateUserProfile(userData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// — CHANGE PASSWORD
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const res = await api.changePassword({ oldPassword, newPassword });
      if (res.error) throw new Error(res.error);
      return res.message || "Password changed successfully";
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
  success: null,
  otpSent: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // — LOGIN
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.success = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.user = payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
      })

      // — VERIFY OTP
      .addCase(verifyOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.success = null;
      })
      .addCase(verifyOtp.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.user = payload.user;
        state.isAuthenticated = true;
        state.otpSent = false;
        state.success = "Login successful";
      })
      .addCase(verifyOtp.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
        state.isAuthenticated = false;
      })

      // — REGISTER
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.success = null;
      })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.user = payload.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
      })

      // — LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
        state.success = null;
        state.otpSent = false;
      })

      // — CHECK AUTH
      .addCase(checkAuth.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkAuth.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        if (payload.user) {
          state.user = payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(checkAuth.rejected, (state, { payload }) => {
        state.status = "failed";
        state.user = null;
        state.isAuthenticated = false;
        state.error = payload;
      })

      // — UPDATE PROFILE
      .addCase(updateProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.success = null;
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.user = payload.user;
      })
      .addCase(updateProfile.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
      })

      // — CHANGE PASSWORD
      .addCase(changePassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.success = null;
      })
      .addCase(changePassword.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.success = payload;
      })
      .addCase(changePassword.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
        state.success = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
