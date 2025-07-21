"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchTransactions, setFilters, setSorting } from "../features/transactions/transactionsSlice"
import TransactionItem from "./common/TransactionItem"
import LoadingSpinner from "./common/LoadingSpinner"
import { Download } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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
    const [field, direction] = e.target.value.split("-")
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
        field: "created_at_formatted",
        direction: "desc",
      }),
    )
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (filters.type !== "all" && transaction.type !== filters.type) return false
    if (filters.searchTerm && !transaction.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false
    }
    return true
  })

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sorting.field === "created_at_formatted") {
      // Handle missing or invalid created_at_formatted for sorting
      const dateA = a.created_at_formatted
        ? new Date(a.created_at_formatted.replace(" ", "T") + "Z")
        : new Date(0)
      const dateB = b.created_at_formatted
        ? new Date(b.created_at_formatted.replace(" ", "T") + "Z")
        : new Date(0)
      return sorting.direction === "asc" ? dateA - dateB : dateB - dateA
    } else if (sorting.field === "amount") {
      return sorting.direction === "asc" ? a.amount - b.amount : b.amount - a.amount
    }
    return 0
  })

  const handleDownload = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Transaction Statement", 14, 22)
    doc.setFontSize(12)
    doc.text(`User: ${user?.fullName || user?.email || "Unknown"}`, 14, 30)

    // Debug log to inspect full transaction data
    console.log("Transaction Data:", sortedTransactions.map(txn => ({
      id: txn.id,
      type: txn.type,
      amount: txn.amount,
      description: txn.description,
      created_at_formatted: txn.created_at_formatted
    })))

    const tableData = sortedTransactions.map((txn, index) => {
      let formattedDate
      if (!txn.created_at_formatted) {
        console.warn(`Transaction ${txn.id} has no created_at_formatted value`)
        formattedDate = "Missing Date"
      } else {
        const date = new Date(txn.created_at_formatted.replace(" ", "T") + "Z")
        if (isNaN(date.getTime())) {
          console.error(`Invalid date format for transaction ${txn.id}: ${txn.created_at_formatted}`)
          formattedDate = "Invalid Date"
        } else {
          formattedDate = date.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "Africa/Nairobi"
          })
        }
      }

      return [
        index + 1,
        txn.type,
        txn.amount.toFixed(2),
        txn.description || "N/A",
        formattedDate
      ]
    })

    autoTable(doc, {
      startY: 36,
      head: [["#", "Type", "Amount", "Description", "Date"]],
      body: tableData,
    })

    doc.save("transaction_statement.pdf")
  }

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
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

 Habits & Planning Dashboard
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
              <option value="created_at_formatted-desc">Date (Newest First)</option>
              <option value="created_at_formatted-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
            </select>
          </div>

          <div className="filter-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={handleClearFilters}>
              Clear Filters
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={handleDownload}>
              <Download size={16} style={{ marginRight: '4px' }} />
              Download Statement
            </button>
          </div>
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