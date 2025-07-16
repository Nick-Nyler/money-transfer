import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../api';

export const fetchBeneficiaries = createAsyncThunk(
  'beneficiaries/fetch',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    const res = await fetch(`${API_URL}/api/beneficiaries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue('Fetch failed');
    return data;
  }
);

export const addBeneficiary = createAsyncThunk(
  'beneficiaries/add',
  async (b, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    const res = await fetch(`${API_URL}/api/beneficiaries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: b.name, ref: b.account_reference }),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.msg || 'Add failed');
    return b;
  }
);

const beneficiariesSlice = createSlice({
  name: 'beneficiaries',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBeneficiaries.fulfilled, (state, { payload }) => {
        state.list = payload;
      })
      .addCase(addBeneficiary.fulfilled, (state, { payload }) => {
        state.list.push(payload);
      });
  },
});

export default beneficiariesSlice.reducer;