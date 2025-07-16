import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { api } from "../../api"
import { logout } from "../auth/authSlice"

// Async thunks
export const fetchWalletBalance = createAsyncThunk("wallet/fetchBalance", async (userId, { rejectWithValue }) => {
  try {
    return await api.getWalletBalance(userId)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const addFunds = createAsyncThunk("wallet/addFunds", async ({ userId, amount }, { rejectWithValue }) => {
  try {
    return await api.addFunds(userId, amount)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  wallet: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateWalletBalance: (state, action) => {
      if (state.wallet) {
        state.wallet.balance = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wallet balance
      .addCase(fetchWalletBalance.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.wallet = action.payload.wallet
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Add funds
      .addCase(addFunds.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(addFunds.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.wallet = action.payload.wallet
      })
      .addCase(addFunds.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Clear wallet on logout
      .addCase(logout.fulfilled, (state) => {
        state.wallet = null
        state.status = "idle"
        state.error = null
      })
  },
})

export const { clearError, updateWalletBalance } = walletSlice.actions

export default walletSlice.reducer
