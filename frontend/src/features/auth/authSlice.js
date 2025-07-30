// src/features/auth/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api";

// — LOGIN
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

// — CHECK AUTH (on app load)
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

// — UPDATE PROFILE (no userId needed—API reads token)
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

// — CHANGE PASSWORD (just old/new)
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      // 🔥 Pass a single object to match api.changePassword signature
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
  success: null, // track success messages
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
      // login
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

      // register
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

      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
        state.success = null;
      })

      // checkAuth
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

      // updateProfile
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

      // changePassword
      .addCase(changePassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.success = null;
      })
      .addCase(changePassword.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.success = payload;  // backend message
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
