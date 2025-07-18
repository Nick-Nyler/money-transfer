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
      return await api.changePassword(oldPassword, newPassword);
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
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b
      // login
      .addCase(login.pending, (s) => { s.status = "loading"; s.error = null })
      .addCase(login.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.user = a.payload.user;
        s.isAuthenticated = true;
      })
      .addCase(login.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload;
      })

      // register
      .addCase(register.pending, (s) => { s.status = "loading"; s.error = null })
      .addCase(register.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.user = a.payload.user;
        s.isAuthenticated = true;
      })
      .addCase(register.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload;
      })

      // logout
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        s.isAuthenticated = false;
        s.status = "idle";
      })

      // checkAuth
      .addCase(checkAuth.pending, (s) => { s.status = "loading" })
      .addCase(checkAuth.fulfilled, (s, a) => {
        s.status = "succeeded";
        if (a.payload.user) {
          s.user = a.payload.user;
          s.isAuthenticated = true;
        }
      })
      .addCase(checkAuth.rejected, (s, a) => {
        s.status = "failed";
        s.user = null;
        s.isAuthenticated = false;
        s.error = a.payload;
      })

      // updateProfile
      .addCase(updateProfile.pending, (s) => { s.status = "loading"; s.error = null })
      .addCase(updateProfile.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.user = a.payload.user;
      })
      .addCase(updateProfile.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload;
      })

      // changePassword
      .addCase(changePassword.pending, (s) => { s.status = "loading"; s.error = null })
      .addCase(changePassword.fulfilled, (s) => {
        s.status = "succeeded";
      })
      .addCase(changePassword.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
