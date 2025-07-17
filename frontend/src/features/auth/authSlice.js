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

// Check if user is already logged in by fetching profile from backend
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const response = await api.getProfile()
    return { user: response.user } // Ensure this matches the payload structure
  } catch (error) {
    // If there's an error (e.g., no token, invalid token), it means user is not authenticated
    return rejectWithValue(error.message)
  }
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
      .addCase(checkAuth.pending, (state) => {
        state.status = "loading" // Set loading state for checkAuth
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = "succeeded"
        if (action.payload.user) {
          state.user = action.payload.user
          state.isAuthenticated = true
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.status = "failed"
        state.user = null // Ensure user is null on failed auth check
        state.isAuthenticated = false
        state.error = action.payload // Store error message
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
