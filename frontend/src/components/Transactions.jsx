import React from 'react';
import { useSelector } from 'react-redux';

export default function Transactions() {
  const transactions = useSelector((s) => s.transactions.list);
  return (
    <div>
      <h2>Transactions</h2>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.when}>
            to: {tx.to} — 
t
x
.
a
m
t
(
f
e
e
:
tx.amt(fee:{tx.fee})
          </li>
        ))}
      </ul>
    </div>
  );
}