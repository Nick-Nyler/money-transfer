"use client"

import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { fetchAllTransactions } from "../../features/transactions/transactionsSlice"
import { api } from "../../api"
import LoadingSpinner from "../common/LoadingSpinner"

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { allTransactions, status } = useSelector((state) => state.transactions)

  const [users, setUsers] = React.useState([])
  const [usersLoading, setUsersLoading] = React.useState(true)
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    totalFees: 0,
  })

  useEffect(() => {
    if (user && user.role === "admin") {
      dispatch(fetchAllTransactions())
      setUsersLoading(true)
      api
        .getAllUsers()
        .then((response) => {
          setUsers(response.users)
          setUsersLoading(false)
        })
        .catch(() => {
          setUsersLoading(false)
        })
    }
  }, [dispatch, user])

  useEffect(() => {
    if (allTransactions.length > 0 && users.length > 0) {
      const totalVolume = allTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
      const totalFees = allTransactions.reduce((sum, t) => sum + (t.fee || 0), 0)
      setStats({
        totalUsers: users.length,
        totalTransactions: allTransactions.length,
        totalVolume,
        totalFees,
      })
    }
  }, [allTransactions, users])

  // Helper to get a user's display name (handles camel/snake)
  const getUserName = (u) =>
    (u?.firstName || u?.first_name || "") + " " + (u?.lastName || u?.last_name || "")

  // Helper to get a displayable date (handles camel/snake)
  const getDateString = (obj) => {
    const dt = obj?.createdAt || obj?.created_at
    return dt ? new Date(dt).toLocaleDateString() : ""
  }

  // Helper to get transaction's userId (handles camel/snake)
  const getUserId = (t) => t.userId || t.user_id

  // Get recent transactions (last 5)
  const recentTransactions = [...allTransactions]
    .sort((a, b) =>
      new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
    )
    .slice(0, 5)

  // Get recent users (last 5)
  const recentUsers = [...users]
    .sort((a, b) =>
      new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
    )
    .slice(0, 5)

  if (status === "loading" || usersLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.totalUsers}</p>
          <Link to="/admin/users" className="stat-link">
            View All
          </Link>
        </div>
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <p className="stat-value">{stats.totalTransactions}</p>
          <Link to="/admin/transactions" className="stat-link">
            View All
          </Link>
        </div>
        <div className="stat-card">
          <h3>Transaction Volume</h3>
          <p className="stat-value">KES {stats.totalVolume.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Total Fees</h3>
          <p className="stat-value">KES {stats.totalFees.toLocaleString()}</p>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-section">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <Link to="/admin/transactions" className="view-all">
              View All
            </Link>
          </div>
          {recentTransactions.length > 0 ? (
            <div className="admin-transactions-list">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => {
                    // Robust user lookup: camel or snake case
                    const user = users.find(u => u.id === getUserId(transaction))
                    return (
                      <tr key={transaction.id}>
                        <td>{transaction.id}</td>
                        <td>{user ? getUserName(user) : "Unknown"}</td>
                        <td>
                          <span className={`transaction-type ${transaction.type}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td>
                          KES {(transaction.amount !== undefined ? transaction.amount : 0).toLocaleString()}
                        </td>
                        <td>{getDateString(transaction) || "—"}</td>
                        <td>
                          <span className={`status-badge ${transaction.status}`}>{transaction.status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No transactions yet</p>
            </div>
          )}
        </div>
        <div className="admin-section">
          <div className="section-header">
            <h2>Recent Users</h2>
            <Link to="/admin/users" className="view-all">
              View All
            </Link>
          </div>
          {recentUsers.length > 0 ? (
            <div className="admin-users-list">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{getUserName(user)}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>{user.role}</span>
                      </td>
                      <td>{getDateString(user) || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No users yet</p>
            </div>
          )}
        </div>
      </div>
      {/* Analytics section unchanged, keep as before */}
    </div>
  )
}

export default AdminDashboard
