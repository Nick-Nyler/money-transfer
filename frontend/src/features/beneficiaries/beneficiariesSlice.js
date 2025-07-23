import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { api } from "../../api"
import { logout } from "../auth/authSlice"


// Async thunks
export const fetchBeneficiaries = createAsyncThunk("beneficiaries/fetchAll", async (userId, { rejectWithValue }) => {
  try {
    return await api.getBeneficiaries(userId)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const addBeneficiary = createAsyncThunk("beneficiaries/add", async (beneficiaryData, { rejectWithValue }) => {
  try {
    return await api.addBeneficiary(beneficiaryData)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const removeBeneficiary = createAsyncThunk("beneficiaries/remove", async (id, { rejectWithValue }) => {
  try {
    const result = await api.removeBeneficiary(id)
    return { id, ...result }
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  beneficiaries: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const beneficiariesSlice = createSlice({
  name: "beneficiaries",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch beneficiaries
      .addCase(fetchBeneficiaries.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchBeneficiaries.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.beneficiaries = action.payload.beneficiaries
      })
      .addCase(fetchBeneficiaries.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Add beneficiary
      .addCase(addBeneficiary.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(addBeneficiary.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.beneficiaries.push(action.payload.beneficiary)
      })
      .addCase(addBeneficiary.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Remove beneficiary
      .addCase(removeBeneficiary.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(removeBeneficiary.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.beneficiaries = state.beneficiaries.filter((beneficiary) => beneficiary.id !== action.payload.id)
      })
      .addCase(removeBeneficiary.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Clear beneficiaries on logout
      .addCase(logout.fulfilled, (state) => {
        state.beneficiaries = []
        state.status = "idle"
        state.error = null
      })
  },
})

export const { clearError } = beneficiariesSlice.actions

export default beneficiariesSlice.reducer
