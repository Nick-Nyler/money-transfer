"use client"

const WalletCard = ({ wallet }) => {
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
          <span className="amount">{wallet.balance.toLocaleString()}</span>
        </div>
        <div className="wallet-footer">
          <small>Available Balance</small>
        </div>
      </div>
    </div>
  )
}

export default WalletCard
