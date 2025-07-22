// frontend/src/features/wallet/walletSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { api } from "../../api"
import { logout } from "../auth/authSlice"

// Fetch wallet balance
export const fetchWalletBalance = createAsyncThunk(
  "wallet/fetchBalance",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getWalletBalance()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Add funds (now with phone_number for M‑Pesa)
export const addFunds = createAsyncThunk(
  "wallet/addFunds",
  async ({ amount, phone_number }, { rejectWithValue }) => {
    try {
      return await api.addFunds(amount, phone_number)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

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
      // fetchBalance
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

      // addFunds
      .addCase(addFunds.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(addFunds.fulfilled, (state) => {
        state.status = "succeeded"
        // wallet top‑up happens via callback; don't update here
      })
      .addCase(addFunds.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // clear on logout
      .addCase(logout.fulfilled, (state) => {
        state.wallet = null
        state.status = "idle"
        state.error = null
      })
  },
})

export const { clearError, updateWalletBalance } = walletSlice.actions
export default walletSlice.reducer
