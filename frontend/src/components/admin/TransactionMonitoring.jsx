"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllTransactions } from "../../features/transactions/transactionsSlice"
import { api } from "../../api"
import LoadingSpinner from "../common/LoadingSpinner"

const TransactionMonitoring = () => {
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)
  const { allTransactions, status, error } = useSelector((state) => state.transactions)

  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [filters, setLocalFilters] = useState({
    type: "all",
    status: "all",
    dateRange: "all",
    searchTerm: "",
    userId: "all",
  })
  const [sorting, setLocalSorting] = useState({
    field: "createdAt",
    direction: "desc",
  })
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      dispatch(fetchAllTransactions())

      // Fetch all users for filtering
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
  }, [dispatch, currentUser])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setLocalFilters({
      ...filters,
      [name]: value,
    })
  }

  const handleSortChange = (e) => {
    const { value } = e.target
    const [field, direction] = value.split("-")
    setLocalSorting({ field, direction })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setLocalFilters({
      ...filters,
      searchTerm,
    })
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setLocalFilters({
      type: "all",
      status: "all",
      dateRange: "all",
      searchTerm: "",
      userId: "all",
    })
    setLocalSorting({
      field: "createdAt",
      direction: "desc",
    })
  }

  // Apply filters
  const filteredTransactions = allTransactions.filter((transaction) => {
    // Type filter
    if (filters.type !== "all" && transaction.type !== filters.type) {
      return false
    }

    // Status filter
    if (filters.status !== "all" && transaction.status !== filters.status) {
      return false
    }

    // User filter
    if (filters.userId !== "all" && transaction.userId !== Number.parseInt(filters.userId)) {
      return false
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const transactionDate = new Date(transaction.createdAt)
      const today = new Date()

      if (filters.dateRange === "today") {
        const isToday =
          transactionDate.getDate() === today.getDate() &&
          transactionDate.getMonth() === today.getMonth() &&
          transactionDate.getFullYear() === today.getFullYear()

        if (!isToday) return false
      } else if (filters.dateRange === "week") {
        const weekAgo = new Date()
        weekAgo.setDate(today.getDate() - 7)

        if (transactionDate < weekAgo) return false
      } else if (filters.dateRange === "month") {
        const monthAgo = new Date()
        monthAgo.setMonth(today.getMonth() - 1)

        if (transactionDate < monthAgo) return false
      }
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const user = users.find((u) => u.id === transaction.userId)
      const userName = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : ""
      const descriptionMatch = transaction.description?.toLowerCase().includes(searchLower)
      const recipientMatch = transaction.recipientName?.toLowerCase().includes(searchLower)
      const amountMatch = transaction.amount.toString().includes(searchLower)
      const userMatch = userName.includes(searchLower)

      if (!descriptionMatch && !recipientMatch && !amountMatch && !userMatch) {
        return false
      }
    }

    return true
  })

  // Apply sorting
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sorting.field === "createdAt") {
      return sorting.direction === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    } else if (sorting.field === "amount") {
      return sorting.direction === "asc" ? a.amount - b.amount : b.amount - a.amount
    } else if (sorting.field === "userId") {
      return sorting.direction === "asc" ? a.userId - b.userId : b.userId - a.userId
    }
    return 0
  })

  if (status === "loading" || usersLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="transaction-monitoring-container">
      <h1>Transaction Monitoring</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="monitoring-stats">
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <p className="stat-value">{allTransactions.length}</p>
        </div>

        <div className="stat-card">
          <h3>Total Volume</h3>
          <p className="stat-value">KES {allTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</p>
        </div>

        <div className="stat-card">
          <h3>Total Fees</h3>
          <p className="stat-value">KES {allTransactions.reduce((sum, t) => sum + t.fee, 0).toLocaleString()}</p>
        </div>

        <div className="stat-card">
          <h3>Filtered Results</h3>
          <p className="stat-value">{sortedTransactions.length}</p>
        </div>
      </div>

      <div className="filters-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="type">Type:</label>
            <select id="type" name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="all">All Types</option>
              <option value="send">Sent</option>
              <option value="receive">Received</option>
              <option value="deposit">Deposits</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status">Status:</label>
            <select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="userId">User:</label>
            <select id="userId" name="userId" value={filters.userId} onChange={handleFilterChange}>
              <option value="all">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="dateRange">Date:</label>
            <select id="dateRange" name="dateRange" value={filters.dateRange} onChange={handleFilterChange}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort">Sort By:</label>
            <select id="sort" value={`${sorting.field}-${sorting.direction}`} onChange={handleSortChange}>
              <option value="createdAt-desc">Date (Newest First)</option>
              <option value="createdAt-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="userId-asc">User ID (A-Z)</option>
              <option value="userId-desc">User ID (Z-A)</option>
            </select>
          </div>

          <button type="button" className="btn btn-outline btn-sm" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {sortedTransactions.length > 0 ? (
        <div className="transactions-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Fee</th>
                <th>Recipient</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((transaction) => {
                const user = users.find((u) => u.id === transaction.userId)
                return (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>{user ? `${user.firstName} ${user.lastName}` : "Unknown"}</td>
                    <td>
                      <span className={`transaction-type ${transaction.type}`}>{transaction.type}</span>
                    </td>
                    <td>KES {transaction.amount.toLocaleString()}</td>
                    <td>KES {transaction.fee.toLocaleString()}</td>
                    <td>
                      {transaction.recipientName ? (
                        <div>
                          <div>{transaction.recipientName}</div>
                          <small>{transaction.recipientPhone}</small>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{transaction.description || "-"}</td>
                    <td>{new Date(transaction.createdAt).toLocaleString()}</td>
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
          <p>No transactions found matching your filters.</p>
          {(filters.type !== "all" ||
            filters.status !== "all" ||
            filters.dateRange !== "all" ||
            filters.userId !== "all" ||
            filters.searchTerm) && (
            <button className="btn btn-outline" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default TransactionMonitoring
