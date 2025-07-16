import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import AddFunds from './components/AddFunds';
import Beneficiaries from './components/Beneficiaries';
import SendMoney from './components/SendMoney';
import Transactions from './components/Transactions';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/add-funds" element={<AddFunds />} />
      <Route path="/beneficiaries" element={<Beneficiaries />} />
      <Route path="/send-money" element={<SendMoney />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
