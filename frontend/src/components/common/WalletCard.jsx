// src/components/common/WalletCard.jsx
"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Download } from "lucide-react"
import { api } from "../../api"

const WalletCard = ({ wallet }) => {
  const [showBalance, setShowBalance] = useState(() => {
    // Read from localStorage on first load
    const saved = localStorage.getItem("showBalance")
    return saved !== null ? JSON.parse(saved) : true
  })

  const toggleBalance = () => {
    setShowBalance(prev => {
      const updated = !prev
      localStorage.setItem("showBalance", JSON.stringify(updated))
      return updated
    })
  }

  const handleDownload = () => {
    api.downloadStatement()
      .catch(err => alert("Could not download statement: " + err.message))
  }

  if (!wallet) {
    return (
      <div className="wallet-card loading">
        <div className="wallet-content">
          <div className="wallet-balance">
            <h3>Wallet Balance</h3>
            <div className="balance-loading">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wallet-card">
      <div className="wallet-content">
        <div className="wallet-header">
          <h3>Wallet Balance</h3>
          <div className="wallet-icon">💳</div>
        </div>

        <div className="wallet-balance">
          <span className="currency">{wallet.currency}</span>
          <span className={`amount ${!showBalance ? "blurred" : ""}`}>
            {wallet.balance.toLocaleString()}
          </span>
          <button
            className="toggle-visibility"
            onClick={toggleBalance}
            aria-label="Toggle Balance Visibility"
          >
            {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        <div className="wallet-footer">
          <small>Available Balance</small>
          <button className="btn btn-outline" onClick={handleDownload}>
            <Download size={16} style={{ marginRight: '4px' }} /> Download Statement
          </button>
        </div>
      </div>
    </div>
  )
}

export default WalletCard
