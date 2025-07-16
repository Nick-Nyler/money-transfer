import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../api';

export const fetchWallet = createAsyncThunk(
  'wallet/fetch',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    const res = await fetch(`${API_URL}/api/wallet`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue('Fetch wallet failed');
    return data.balance;
  }
);

export const addFunds = createAsyncThunk(
  'wallet/add',
  async (amount, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    const res = await fetch(`${API_URL}/api/wallet/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue('Add funds failed');
    return data.balance;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: { balance: 0, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.fulfilled, (state, { payload }) => {
        state.balance = payload;
      })
      .addCase(addFunds.fulfilled, (state, { payload }) => {
        state.balance = payload;
      });
  },
});

export default walletSlice.reducer;
