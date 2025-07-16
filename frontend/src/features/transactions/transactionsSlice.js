import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { api } from "../../api"
import { logout } from "../auth/authSlice"
import { updateWalletBalance } from "../wallet/walletSlice"

// Async thunks
export const fetchTransactions = createAsyncThunk("transactions/fetchAll", async (userId, { rejectWithValue }) => {
  try {
    return await api.getTransactions(userId)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const sendMoney = createAsyncThunk("transactions/send", async (sendData, { rejectWithValue, dispatch }) => {
  try {
    const result = await api.sendMoney(sendData)
    // Update wallet balance
    dispatch(updateWalletBalance(result.wallet.balance))
    return result
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// For admin
export const fetchAllTransactions = createAsyncThunk(
  "transactions/fetchAllForAdmin",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getAllTransactions()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const initialState = {
  transactions: [],
  allTransactions: [], // For admin
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filters: {
    type: "all",
    dateRange: "all",
    searchTerm: "",
  },
  sorting: {
    field: "createdAt",
    direction: "desc",
  },
}

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setSorting: (state, action) => {
      state.sorting = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.transactions = action.payload.transactions
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Send money
      .addCase(sendMoney.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(sendMoney.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.transactions.unshift(action.payload.transaction)
      })
      .addCase(sendMoney.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Fetch all transactions (admin)
      .addCase(fetchAllTransactions.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.allTransactions = action.payload.transactions
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Clear transactions on logout
      .addCase(logout.fulfilled, (state) => {
        state.transactions = []
        state.allTransactions = []
        state.status = "idle"
        state.error = null
      })
  },
})

export const { clearError, setFilters, setSorting } = transactionsSlice.actions

export default transactionsSlice.reducer
