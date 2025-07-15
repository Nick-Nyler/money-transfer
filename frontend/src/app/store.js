import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import walletReducer from '../features/wallet/walletSlice';
import beneficiariesReducer from '../features/beneficiaries/beneficiariesSlice';
import transactionsReducer from '../features/transactions/transactionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    beneficiaries: beneficiariesReducer,
    transactions: transactionsReducer,
  },
});
