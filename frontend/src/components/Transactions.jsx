"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchTransactions, setFilters, setSorting } from "../features/transactions/transactionsSlice"
import TransactionItem from "./common/TransactionItem"
import LoadingSpinner from "./common/LoadingSpinner"

const Transactions = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { transactions, status, error, filters, sorting } = useSelector((state) => state.transactions)

  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "")

  useEffect(() => {
    if (user) {
      dispatch(fetchTransactions(user.id))
    }
  }, [dispatch, user])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    dispatch(setFilters({ [name]: value }))
  }

  const handleSortChange = (e) => {
    const { value } = e.target
    const [field, direction] = value.split("-")
    dispatch(setSorting({ field, direction }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setFilters({ searchTerm }))
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    dispatch(
      setFilters({
        type: "all",
        dateRange: "all",
        searchTerm: "",
      }),
    )
    dispatch(
      setSorting({
        field: "createdAt",
        direction: "desc",
      }),
    )
  }

  // Apply filters and sorting
  const filteredTransactions = transactions.filter((transaction) => {
    // Type filter
    if (filters.type !== "all" && transaction.type !== filters.type) {
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
      const descriptionMatch = transaction.description?.toLowerCase().includes(searchLower)
      const recipientMatch = transaction.recipientName?.toLowerCase().includes(searchLower)
      const amountMatch = transaction.amount.toString().includes(searchLower)

      if (!descriptionMatch && !recipientMatch && !amountMatch) {
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
    }
    return 0
  })

  if (status === "loading") {
    return <LoadingSpinner />
  }

  return (
    <div className="transactions-container">
      <h1>Transaction History</h1>

      {error && <div className="error-message">{error}</div>}

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
            </select>
          </div>

          <button type="button" className="btn btn-outline btn-sm" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {sortedTransactions.length > 0 ? (
        <div className="transactions-list">
          {sortedTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} detailed={true} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No transactions found matching your filters.</p>
          {(filters.type !== "all" || filters.dateRange !== "all" || filters.searchTerm) && (
            <button className="btn btn-outline" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Transactions
