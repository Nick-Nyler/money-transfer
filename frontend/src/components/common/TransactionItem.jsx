"use client"

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
    return `${prefix}KES ${amount.toLocaleString()}`
  }

  return (
    <div className={`transaction-item ${getTransactionColor(transaction.type)}`}>
      <div className="transaction-icon">{getTransactionIcon(transaction.type)}</div>

      <div className="transaction-details">
        <div className="transaction-main">
          <h4 className="transaction-description">{transaction.description || `${transaction.type} transaction`}</h4>
          {transaction.recipientName && <p className="transaction-recipient">To: {transaction.recipientName}</p>}
          {transaction.recipientPhone && detailed && <p className="transaction-phone">{transaction.recipientPhone}</p>}
        </div>

        <div className="transaction-meta">
          <span className="transaction-date">{new Date(transaction.createdAt).toLocaleDateString()}</span>
          {detailed && <span className="transaction-time">{new Date(transaction.createdAt).toLocaleTimeString()}</span>}
          <span className={`transaction-status ${transaction.status}`}>{transaction.status}</span>
        </div>
      </div>

      <div className="transaction-amount">
        <span className={`amount ${getTransactionColor(transaction.type)}`}>
          {formatAmount(transaction.amount, transaction.type)}
        </span>
        {transaction.fee > 0 && detailed && <span className="fee">Fee: KES {transaction.fee.toLocaleString()}</span>}
      </div>
    </div>
  )
}

export default TransactionItem
