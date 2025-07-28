import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { api } from "../../api"
import { logout } from "../auth/authSlice"

// Async thunks
export const fetchBeneficiaries = createAsyncThunk(
  "beneficiaries/fetchAll",
  async (userId, { rejectWithValue }) => {
    try {
      return await api.getBeneficiaries(userId) // { beneficiaries }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addBeneficiary = createAsyncThunk(
  "beneficiaries/add",
  async (beneficiaryData, { rejectWithValue }) => {
    try {
      return await api.addBeneficiary(beneficiaryData) // { beneficiary }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateBeneficiary = createAsyncThunk(
  "beneficiaries/update",
  async ({ id, ...updateData }, { rejectWithValue }) => {
    try {
      return await api.updateBeneficiary(id, updateData) // { beneficiary }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const removeBeneficiary = createAsyncThunk(
  "beneficiaries/remove",
  async (id, { rejectWithValue }) => {
    try {
      return await api.removeBeneficiary(id) // { id }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

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
      // Fetch
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

      // Add
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

      // Update
      .addCase(updateBeneficiary.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(updateBeneficiary.fulfilled, (state, action) => {
        state.status = "succeeded"
        const updated = action.payload.beneficiary
        state.beneficiaries = state.beneficiaries.map((b) =>
          b.id === updated.id ? updated : b
        )
      })
      .addCase(updateBeneficiary.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Remove
      .addCase(removeBeneficiary.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(removeBeneficiary.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.beneficiaries = state.beneficiaries.filter(
          (b) => b.id !== action.payload.id
        )
      })
      .addCase(removeBeneficiary.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })

      // Clear on logout
      .addCase(logout.fulfilled, (state) => {
        state.beneficiaries = []
        state.status = "idle"
        state.error = null
      })
  },
})

export const { clearError } = beneficiariesSlice.actions
export default beneficiariesSlice.reducer


