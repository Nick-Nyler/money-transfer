import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { api } from "../../api"

// Async thunks
export const login = createAsyncThunk("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    return await api.login(email, password)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    return await api.register(userData)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const logout = createAsyncThunk("auth/logout", async () => {
  return await api.logout()
})

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      return await api.updateUserProfile(userId, userData)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ userId, oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      return await api.changePassword(userId, oldPassword, newPassword)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Check if user is already logged in
export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
  const user = api.getCurrentUser()
  return { user }
})

const initialState = {
  user: null,
  isAuthenticated: false,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Register
      .addCase(register.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.status = "idle"
      })

      // Check Auth
      .addCase(checkAuth.fulfilled, (state, action) => {
        if (action.payload.user) {
          state.user = action.payload.user
          state.isAuthenticated = true
        }
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.user = action.payload.user
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = "succeeded"
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })
  },
})

export const { clearError } = authSlice.actions

export default authSlice.reducer
