import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addFunds } from "../features/wallet/walletSlice";

export default function AddFunds() {
  const [amount, setAmount] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addFunds(Number(amount)));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Funds</h2>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <button type="submit">Add</button>
    </form>
  );
}
