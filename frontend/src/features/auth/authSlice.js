import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../api';

export const login = createAsyncThunk(
  'auth/login',
  async (creds, { rejectWithValue }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.msg || 'Login failed');
    return data;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (info, { rejectWithValue }) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    });
    if (!res.ok) return rejectWithValue('Register failed');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: localStorage.getItem('token') || null, status: 'idle', error: null },
  reducers: {
    logout: (state) => {
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.status = 'loading'; })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        state.token = payload.token;
        localStorage.setItem('token', payload.token);
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

