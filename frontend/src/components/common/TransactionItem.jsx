// src/components/common/TransactionItem.jsx
"use client"

import React from "react"

const TransactionItem = ({ transaction, detailed = false }) => {
  // icon
  const getTransactionIcon = (type) => {
    switch (type) {
      case "send":
        return "↗️"
      case "receive":
        return "↙️"
      case "deposit":
        return "💰"
      default:
        return "💳"
    }
  }

  // color class
  const getTransactionColor = (type) => {
    switch (type) {
      case "send":
        return "send"
      case "receive":
        return "receive"
      case "deposit":
        return "deposit"
      default:
        return "default"
    }
  }

  // amount formatting
  const formatAmount = (amount, type) => {
    const prefix = type === "send" ? "-" : type === "receive" ? "+" : ""
    return `${prefix}KES ${Number(amount).toLocaleString()}`
  }

  // parse date/time
  const rawDate = transaction.created_at ?? transaction.createdAt
  const dateObj = rawDate ? new Date(rawDate) : null
  const dateStr = dateObj?.toLocaleDateString() ?? "—"
  const timeStr = detailed && dateObj ? dateObj.toLocaleTimeString() : null

  // description line
  const desc =
    transaction.type === "deposit"
      ? "Deposit via M-Pesa"
      : transaction.type === "send"
      ? `Payment to ${transaction.recipient_name}`
      : `Received from ${transaction.recipient_name}`

  return (
    <div className="transaction-item">
      <div className="transaction-header">
        <span className="transaction-icon">{getTransactionIcon(transaction.type)}</span>
        <div className="transaction-info">
          <p className="transaction-desc">{desc}</p>
          <div className="transaction-meta">
            <span className="transaction-date">{dateStr}</span>
            {timeStr && <span className="transaction-time">{timeStr}</span>}
          </div>
        </div>
      </div>

      <div className="transaction-amount">
        <span className={`amount ${getTransactionColor(transaction.type)}`}>
          {formatAmount(transaction.amount, transaction.type)}
        </span>
        {transaction.fee > 0 && detailed && (
          <span className="fee">Fee: KES {transaction.fee.toLocaleString()}</span>
        )}
      </div>

      <span className={`status ${transaction.status}`}>{transaction.status}</span>
    </div>
  )
}

export default TransactionItem
