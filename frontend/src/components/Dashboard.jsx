import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallet } from '../features/wallet/walletSlice';
import { fetchTransactions } from '../features/transactions/transactionsSlice';
import { fetchBeneficiaries } from '../features/beneficiaries/beneficiariesSlice';
import { logout } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { balance } = useSelector((s) => s.wallet);
  const transactions = useSelector((s) => s.transactions.list);
  const beneficiaries = useSelector((s) => s.beneficiaries.list);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions());
    dispatch(fetchBeneficiaries());
  }, [dispatch]);

  return (
    <div>
      <h1>Balance: ${balance}</h1>
      <button onClick={() => navigate('/profile')}>Profile</button>
      <button onClick={() => navigate('/add-funds')}>Add Funds</button>
      <button onClick={() => navigate('/beneficiaries')}>Beneficiaries</button>
      <button onClick={() => navigate('/send-money')}>Send Money</button>
      <button onClick={() => { dispatch(logout()); navigate('/login'); }}>
        Logout
      </button>
      <h2>Transactions</h2>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.when}>
            to: {tx.to} — ${tx.amt} (fee: ${tx.fee})
          </li>
        ))}
      </ul>
    </div>
  );
}
