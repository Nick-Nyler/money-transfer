import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../api';

export const fetchTransactions = createAsyncThunk(
  'transactions/fetch',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    const res = await fetch(`${API_URL}/api/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue('Fetch txns failed');
    return data;
  }
);

export const sendMoney = createAsyncThunk(
  'transactions/send',
  async ({ beneficiary_id, amount }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    const res = await fetch(`${API_URL}/api/transactions/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ beneficiary_id, amount }),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.msg || 'Send failed');
    return data;
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.fulfilled, (state, { payload }) => {
        state.list = payload;
      })
      .addCase(sendMoney.fulfilled, (state, { payload }) => {
        state.list.push(payload);
      });
  },
});

export default transactionsSlice.reducer;
