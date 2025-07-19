// src/components/PasswordChanged.jsx
"use client";

import React from "react";
import { Link } from "react-router-dom";

const PasswordChanged = () => {
  return (
    <div className="success-page-container">
      <div className="success-card">
        <div className="icon-success">✅</div>
        <h2>Password Changed!</h2>
        <p>Your password has been updated successfully.</p>
        <Link to="/admin" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PasswordChanged;
