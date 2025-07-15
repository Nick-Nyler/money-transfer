import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMoney } from '../features/transactions/transactionsSlice';

export default function SendMoney() {
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [amount, setAmount] = useState('');
  const beneficiaries = useSelector((s) => s.beneficiaries.list);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(sendMoney({ beneficiary_id: beneficiaryId, amount: Number(amount) }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Send Money</h2>
      <select
        value={beneficiaryId}
        onChange={(e) => setBeneficiaryId(e.target.value)}
        required
      >
        <option value="">Select Beneficiary</option>
        {beneficiaries.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <button type="submit">Send</button>
    </form>
  );
}