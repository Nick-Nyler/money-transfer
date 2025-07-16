"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { api } from "../../api"
import LoadingSpinner from "../common/LoadingSpinner"

const UserManagement = () => {
  const { user: currentUser } = useSelector((state) => state.auth)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [userDetailsLoading, setUserDetailsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("id")
  const [sortDirection, setSortDirection] = useState("asc")

  useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      fetchUsers()
    }
  }, [currentUser])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.getAllUsers()
      setUsers(response.users)
      setError(null)
    } catch (err) {
      setError("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserDetails = async (userId) => {
    setUserDetailsLoading(true)
    try {
      const response = await api.getUserDetails(userId)
      setUserDetails(response)
      setError(null)
    } catch (err) {
      setError("Failed to fetch user details")
    } finally {
      setUserDetailsLoading(false)
    }
  }

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    fetchUserDetails(user.id)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is handled in the filtered users logic below
  }

  // Apply search and sorting
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.phone.toLowerCase().includes(searchLower)
    )
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0

    if (sortField === "name") {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
      comparison = nameA.localeCompare(nameB)
    } else if (sortField === "createdAt") {
      comparison = new Date(a.createdAt) - new Date(b.createdAt)
    } else {
      comparison = a[sortField] > b[sortField] ? 1 : -1
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="user-management-container">
      <h1>User Management</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="user-management-grid">
        <div className="users-list-container">
          <div className="filters-container">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
            </form>
          </div>

          {sortedUsers.length > 0 ? (
            <div className="users-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("id")} className="sortable">
                      ID {sortField === "id" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("name")} className="sortable">
                      Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("email")} className="sortable">
                      Email {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("role")} className="sortable">
                      Role {sortField === "role" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("createdAt")} className="sortable">
                      Joined {sortField === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={selectedUser?.id === user.id ? "selected" : ""}
                      onClick={() => handleUserSelect(user)}
                    >
                      <td>{user.id}</td>
                      <td>
                        {user.firstName} {user.lastName}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>{user.role}</span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUserSelect(user)
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No users found matching your search.</p>
              {searchTerm && (
                <button className="btn btn-outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        <div className="user-details-container">
          {selectedUser ? (
            userDetailsLoading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading user details...</p>
              </div>
            ) : (
              userDetails && (
                <div className="user-details">
                  <h2>User Details</h2>

                  <div className="user-profile">
                    <div className="user-avatar">
                      {selectedUser.firstName.charAt(0)}
                      {selectedUser.lastName.charAt(0)}
                    </div>
                    <div className="user-info">
                      <h3>
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p>{selectedUser.email}</p>
                      <span className={`role-badge ${selectedUser.role}`}>{selectedUser.role}</span>
                    </div>
                  </div>

                  <div className="details-section">
                    <h3>Contact Information</h3>
                    <div className="detail-row">
                      <span>Phone:</span>
                      <span>{selectedUser.phone}</span>
                    </div>
                    <div className="detail-row">
                      <span>Joined:</span>
                      <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="details-section">
                    <h3>Wallet Information</h3>
                    {userDetails.wallet ? (
                      <>
                        <div className="detail-row">
                          <span>Balance:</span>
                          <span>
                            {userDetails.wallet.currency} {userDetails.wallet.balance.toLocaleString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p>No wallet information available</p>
                    )}
                  </div>

                  <div className="details-section">
                    <h3>Transaction Summary</h3>
                    {userDetails.transactions && userDetails.transactions.length > 0 ? (
                      <>
                        <div className="detail-row">
                          <span>Total Transactions:</span>
                          <span>{userDetails.transactions.length}</span>
                        </div>
                        <div className="detail-row">
                          <span>Total Sent:</span>
                          <span>
                            {userDetails.wallet?.currency}{" "}
                            {userDetails.transactions
                              .filter((t) => t.type === "send")
                              .reduce((sum, t) => sum + t.amount, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span>Total Received:</span>
                          <span>
                            {userDetails.wallet?.currency}{" "}
                            {userDetails.transactions
                              .filter((t) => t.type === "receive")
                              .reduce((sum, t) => sum + t.amount, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span>Total Deposits:</span>
                          <span>
                            {userDetails.wallet?.currency}{" "}
                            {userDetails.transactions
                              .filter((t) => t.type === "deposit")
                              .reduce((sum, t) => sum + t.amount, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p>No transactions yet</p>
                    )}
                  </div>

                  <div className="details-section">
                    <h3>Recent Transactions</h3>
                    {userDetails.transactions && userDetails.transactions.length > 0 ? (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userDetails.transactions.slice(0, 5).map((transaction) => (
                            <tr key={transaction.id}>
                              <td>
                                <span className={`transaction-type ${transaction.type}`}>{transaction.type}</span>
                              </td>
                              <td>
                                {userDetails.wallet?.currency} {transaction.amount.toLocaleString()}
                              </td>
                              <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                              <td>
                                <span className={`status-badge ${transaction.status}`}>{transaction.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>No transactions yet</p>
                    )}
                  </div>
                </div>
              )
            )
          ) : (
            <div className="empty-state">
              <p>Select a user to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserManagement
