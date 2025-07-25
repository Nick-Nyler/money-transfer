// frontend/src/features/wallet/walletSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { api } from "../../api"
import { logout } from "../auth/authSlice"

// ─────────── THUNKS ───────────

// 1) Get wallet balance
export const fetchWalletBalance = createAsyncThunk(
  "wallet/fetchBalance",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getWalletBalance()
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch balance")
    }
  }
)

// 2) Initiate STK push (amount + phone_number)
export const initiateStk = createAsyncThunk(
  "wallet/initiateStk",
  async ({ amount, phone_number }, { rejectWithValue }) => {
    try {
      // api.addFunds returns the raw STK push response, including CheckoutRequestID
      return await api.addFunds(amount, phone_number)
    } catch (err) {
      return rejectWithValue(err.message || "Failed to initiate STK")
    }
  }
)

// 3) Poll transaction status (CheckoutRequestID)
export const pollTxnStatus = createAsyncThunk(
  "wallet/pollTxnStatus",
  async (checkoutRequestID, { rejectWithValue }) => {
    try {
      return await api.getTxnStatus(checkoutRequestID)
    } catch (err) {
      return rejectWithValue(err.message || "Poll failed")
    }
  }
)

// ─────────── SLICE ───────────
const initialState = {
  wallet: null,

  status: "idle",          // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,

  // STK flow state
  pendingCheckoutId: null,
  polling: false,
  pollError: null,
}

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
      state.pollError = null
    },
    stopPolling(state) {
      state.polling = false
      state.pendingCheckoutId = null
    },
    updateWalletBalance(state, action) {
      if (state.wallet) state.wallet.balance = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchWalletBalance ──
      .addCase(fetchWalletBalance.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.wallet = action.payload.wallet || action.payload
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // ── initiateStk ──
      .addCase(initiateStk.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(initiateStk.fulfilled, (state, action) => {
        state.status = "succeeded"
        // store the CheckoutRequestID for polling
        state.pendingCheckoutId = action.payload.CheckoutRequestID || action.payload.checkoutRequestID
        state.polling = true
      })
      .addCase(initiateStk.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // ── pollTxnStatus ──
      .addCase(pollTxnStatus.pending, (state) => {
        // keep polling=true until we see a result
        state.pollError = null
      })
      .addCase(pollTxnStatus.fulfilled, (state, action) => {
        const st = action.payload?.status
        if (st && st !== "pending") {
          state.polling = false
          state.pendingCheckoutId = null
        }
      })
      .addCase(pollTxnStatus.rejected, (state, action) => {
        state.pollError = action.payload
        state.polling = false
        state.pendingCheckoutId = null
      })

      // ── logout cleanup ──
      .addCase(logout.fulfilled, (state) => {
        Object.assign(state, initialState)
      })
  },
})

export const { clearError, stopPolling, updateWalletBalance } = walletSlice.actions
export default walletSlice.reducer
