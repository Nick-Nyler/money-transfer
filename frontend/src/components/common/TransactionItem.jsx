"use client"

import React from "react"

const TransactionItem = ({ transaction, detailed = false }) => {
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

  const formatAmount = (amount, type) => {
    const prefix = type === "send" ? "-" : type === "receive" ? "+" : ""
    return `${prefix}KES ${Number(amount).toLocaleString()}`
  }

  const rawDate = transaction.created_at_formatted ?? transaction.createdAt
  const dateObj = rawDate ? new Date(rawDate.replace(" ", "T") + "Z") : null
  const dateStr = dateObj?.toLocaleDateString("en-US", { timeZone: "Africa/Nairobi" }) ?? "—"
  const timeStr = detailed && dateObj ? dateObj.toLocaleTimeString("en-US", { timeZone: "Africa/Nairobi", hour12: false }) : null

  const desc =
    transaction.description?.trim() !== ""
      ? transaction.description
      : transaction.type === "deposit"
      ? "Deposit via M-Pesa"
      : transaction.type === "send"
      ? `Payment to ${transaction.recipient_name}`
      : `Received from ${transaction.recipient_name}`

  return (
    <div className={`transaction-item ${getTransactionColor(transaction.type)}`}>
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
          <span className="fee">Fee: KES {transaction.fee.toLocaleString()}</span>
        )}
      </div>

      <span className={`status ${transaction.status}`}>{transaction.status}</span>
    </div>
  )
}

export default TransactionItem