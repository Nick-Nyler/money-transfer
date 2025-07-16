"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { fetchWalletBalance } from "../features/wallet/walletSlice"
import { fetchTransactions } from "../features/transactions/transactionsSlice"
import { fetchBeneficiaries } from "../features/beneficiaries/beneficiariesSlice"
import TransactionItem from "./common/TransactionItem"
import WalletCard from "./common/WalletCard"
import LoadingSpinner from "./common/LoadingSpinner"

const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { wallet, status: walletStatus } = useSelector((state) => state.wallet)
  const { transactions, status: transactionsStatus } = useSelector((state) => state.transactions)
  const { beneficiaries, status: beneficiariesStatus } = useSelector((state) => state.beneficiaries)

  useEffect(() => {
    if (user) {
      dispatch(fetchWalletBalance(user.id))
      dispatch(fetchTransactions(user.id))
      dispatch(fetchBeneficiaries(user.id))
    }
  }, [dispatch, user])

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5)

  // Loading state
  const isLoading = walletStatus === "loading" || transactionsStatus === "loading" || beneficiariesStatus === "loading"

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user?.firstName}!</h1>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <WalletCard wallet={wallet} />

          <div className="action-buttons">
            <Link to="/send-money" className="btn btn-primary">
              Send Money
            </Link>
            <Link to="/add-funds" className="btn btn-outline">
              Add Funds
            </Link>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Transactions</h2>
              <Link to="/transactions" className="view-all">
                View All
              </Link>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="transactions-list">
                {recentTransactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No transactions yet</p>
                <Link to="/add-funds" className="btn btn-sm">
                  Add Funds
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Beneficiaries</h2>
              <Link to="/beneficiaries" className="view-all">
                Manage
              </Link>
            </div>

            {beneficiaries.length > 0 ? (
              <div className="beneficiaries-list">
                {beneficiaries.slice(0, 5).map((beneficiary) => (
                  <div key={beneficiary.id} className="beneficiary-item">
                    <div className="beneficiary-avatar">{beneficiary.name.charAt(0)}</div>
                    <div className="beneficiary-info">
                      <h3>{beneficiary.name}</h3>
                      <p>{beneficiary.phone}</p>
                    </div>
                    <Link to={`/send-money?beneficiaryId=${beneficiary.id}`} className="btn btn-sm">
                      Send
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No beneficiaries yet</p>
                <Link to="/beneficiaries" className="btn btn-sm">
                  Add Beneficiary
                </Link>
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Stats</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Sent</h3>
                <p className="stat-value">
                  {wallet?.currency}{" "}
                  {transactions
                    .filter((t) => t.type === "send")
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </p>
              </div>

              <div className="stat-card">
                <h3>Total Received</h3>
                <p className="stat-value">
                  {wallet?.currency}{" "}
                  {transactions
                    .filter((t) => t.type === "receive")
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </p>
              </div>

              <div className="stat-card">
                <h3>Transactions</h3>
                <p className="stat-value">{transactions.length}</p>
              </div>

              <div className="stat-card">
                <h3>Beneficiaries</h3>
                <p className="stat-value">{beneficiaries.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
