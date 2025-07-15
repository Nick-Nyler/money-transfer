import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBeneficiary } from '../features/beneficiaries/beneficiariesSlice';

export default function Beneficiaries() {
  const [name, setName] = useState('');
  const [ref, setRef] = useState('');
  const beneficiaries = useSelector((s) => s.beneficiaries.list);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addBeneficiary({ name, account_reference: ref }));
  };

  return (
    <div>
      <h2>Beneficiaries</h2>
      <ul>
        {beneficiaries.map((b) => (
          <li key={b.id}>{b.name}: {b.ref}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Account Ref"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          required
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}