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

      // Fetch all users
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
      // Calculate stats
      const totalVolume = allTransactions.reduce((sum, t) => sum + t.amount, 0)
      const totalFees = allTransactions.reduce((sum, t) => sum + t.fee, 0)

      setStats({
        totalUsers: users.length,
        totalTransactions: allTransactions.length,
        totalVolume,
        totalFees,
      })
    }
  }, [allTransactions, users])

  // Get recent transactions (last 5)
  const recentTransactions = [...allTransactions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  // Get recent users (last 5)
  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

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
                    const user = users.find((u) => u.id === transaction.userId)
                    return (
                      <tr key={transaction.id}>
                        <td>{transaction.id}</td>
                        <td>{user ? `${user.firstName} ${user.lastName}` : "Unknown"}</td>
                        <td>
                          <span className={`transaction-type ${transaction.type}`}>{transaction.type}</span>
                        </td>
                        <td>KES {transaction.amount.toLocaleString()}</td>
                        <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
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
                      <td>
                        {user.firstName} {user.lastName}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>{user.role}</span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
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

      <div className="admin-section">
        <div className="section-header">
          <h2>Transaction Analytics</h2>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Transaction Types</h3>
            <div className="analytics-content">
              <div className="analytics-item">
                <span>Deposits</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill deposit"
                    style={{
                      width: `${(allTransactions.filter((t) => t.type === "deposit").length / allTransactions.length) * 100}%`,
                    }}
                  ></div>
                </div>
                <span>{allTransactions.filter((t) => t.type === "deposit").length}</span>
              </div>

              <div className="analytics-item">
                <span>Sent</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill send"
                    style={{
                      width: `${(allTransactions.filter((t) => t.type === "send").length / allTransactions.length) * 100}%`,
                    }}
                  ></div>
                </div>
                <span>{allTransactions.filter((t) => t.type === "send").length}</span>
              </div>

              <div className="analytics-item">
                <span>Received</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill receive"
                    style={{
                      width: `${(allTransactions.filter((t) => t.type === "receive").length / allTransactions.length) * 100}%`,
                    }}
                  ></div>
                </div>
                <span>{allTransactions.filter((t) => t.type === "receive").length}</span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h3>User Roles</h3>
            <div className="analytics-content">
              <div className="analytics-item">
                <span>Admin</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill admin"
                    style={{
                      width: `${(users.filter((u) => u.role === "admin").length / users.length) * 100}%`,
                    }}
                  ></div>
                </div>
                <span>{users.filter((u) => u.role === "admin").length}</span>
              </div>

              <div className="analytics-item">
                <span>Regular Users</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill user"
                    style={{
                      width: `${(users.filter((u) => u.role === "user").length / users.length) * 100}%`,
                    }}
                  ></div>
                </div>
                <span>{users.filter((u) => u.role === "user").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard