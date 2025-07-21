// src/components/admin/UserManagement.jsx
"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout } from "../../features/auth/authSlice"
import { api } from "../../api"
import LoadingSpinner from "../common/LoadingSpinner"

const UserManagement = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
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
  const [updatingUserId, setUpdatingUserId] = useState(null)

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers()
    }
  }, [currentUser])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { users } = await api.getAllUsers()
      setUsers(users || [])
      setError(null)
    } catch {
      setError("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserDetails = async (userId) => {
    setUserDetailsLoading(true)
    try {
      const details = await api.getUserDetails(userId)
      setUserDetails(details)
      setError(null)
    } catch {
      setError("Failed to fetch user details")
    } finally {
      setUserDetailsLoading(false)
    }
  }

  const handleUserSelect = (u) => {
    setSelectedUser(u)
    fetchUserDetails(u.id)
  }

  const toggleUserStatus = async (userId, currentRole) => {
    const isActive = currentRole !== "deactivated"
    const newRole = isActive ? "deactivated" : "user"

    setUpdatingUserId(userId)
    try {
      await api.updateUserStatus(userId, newRole)
      // if you just deactivated yourself, force a logout
      if (userId === currentUser.id && newRole === "deactivated") {
        dispatch(logout())
        navigate("/login")
        return
      }
      await fetchUsers()
      if (selectedUser?.id === userId) {
        fetchUserDetails(userId)
      }
      setError(null)
    } catch {
      setError("Failed to update user status")
    } finally {
      setUpdatingUserId(null)
    }
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
  }

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    const f = (u.firstName || u.first_name || "").toLowerCase()
    const l = (u.lastName  || u.last_name  || "").toLowerCase()
    const e = (u.email      || "").toLowerCase()
    const p = (u.phone      || "").toLowerCase()
    return f.includes(q) || l.includes(q) || e.includes(q) || p.includes(q)
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let cmp = 0
    if (sortField === "name") {
      const aName = ((a.firstName || a.first_name) + " " + (a.lastName || a.last_name)).toLowerCase()
      const bName = ((b.firstName || b.first_name) + " " + (b.lastName || b.last_name)).toLowerCase()
      cmp = aName.localeCompare(bName)
    } else if (sortField === "createdAt") {
      cmp =
        new Date(a.createdAt || a.created_at) -
        new Date(b.createdAt || b.created_at)
    } else {
      cmp = a[sortField] > b[sortField] ? 1 : -1
    }
    return sortDirection === "asc" ? cmp : -cmp
  })

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="user-management-container">
      <h1>User Management</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="user-management-grid">
        {/* Users list & filters */}
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
                    <th onClick={() => handleSort("id")}>
                      ID {sortField === "id" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("name")}>
                      Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("email")}>
                      Email {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("role")}>
                      Role {sortField === "role" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("createdAt")}>
                      Joined {sortField === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((u) => {
                    const fName = u.firstName || u.first_name || ""
                    const lName = u.lastName  || u.last_name  || ""
                    const created = u.createdAt || u.created_at || ""
                    const isUpdating = updatingUserId === u.id
                    const isActive   = u.role !== "deactivated"

                    return (
                      <tr
                        key={u.id}
                        className={selectedUser?.id === u.id ? "selected" : ""}
                        onClick={() => handleUserSelect(u)}
                      >
                        <td>{u.id}</td>
                        <td>{fName} {lName}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>{u.role}</span>
                        </td>
                        <td>{created ? new Date(created).toLocaleDateString() : ""}</td>
                        <td className="flex gap-2">
                          <button
                            className="btn btn-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUserSelect(u)
                            }}
                          >
                            View
                          </button>
                          <button
                            className={`btn btn-sm ${isActive ? "btn-success" : "btn-danger"}`}
                            disabled={isUpdating}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleUserStatus(u.id, u.role)
                            }}
                          >
                            {isUpdating
                              ? "Updating..."
                              : isActive
                                ? "Active"
                                : "Deactivated"}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
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

        {/* Details panel */}
        <div className="user-details-container">
          {selectedUser ? (
            userDetailsLoading ? (
              <div className="loading-container">
                <LoadingSpinner />
                <p>Loading user details...</p>
              </div>
            ) : (
              userDetails && (
                <div className="user-details">
                  <h2>User Details</h2>

                  <div className="user-profile">
                    <div className="user-avatar">
                      {(userDetails.firstName || userDetails.first_name || "").charAt(0)}
                      {(userDetails.lastName  || userDetails.last_name  || "").charAt(0)}
                    </div>
                    <div className="user-info">
                      <h3>
                        {(userDetails.firstName || userDetails.first_name || "")}{" "}
                        {(userDetails.lastName  || userDetails.last_name  || "")}
                      </h3>
                      <p>{userDetails.email}</p>
                      <span className={`role-badge ${userDetails.role}`}>{userDetails.role}</span>
                    </div>
                  </div>

                  <div className="details-section">
                    <h3>Contact Information</h3>
                    <div className="detail-row">
                      <span>Phone:</span>
                      <span>{userDetails.phone || userDetails.phone_number || "—"}</span>
                    </div>
                    <div className="detail-row">
                      <span>Joined:</span>
                      <span>
                        {new Date(userDetails.createdAt || userDetails.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="details-section">
                    <h3>Wallet Information</h3>
                    {userDetails.wallet ? (
                      <div className="detail-row">
                        <span>Balance:</span>
                        <span>
                          {userDetails.wallet.currency}{" "}
                          {userDetails.wallet.balance.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <p>No wallet information available</p>
                    )}
                  </div>

                  <div className="details-section">
                    <h3>Transaction Summary</h3>
                    {userDetails.transactions?.length > 0 ? (
                      <div className="detail-row">
                        <span>Total Transactions:</span>
                        <span>{userDetails.transactions.length}</span>
                      </div>
                    ) : (
                      <p>No transactions yet</p>
                    )}
                  </div>

                  <div className="details-section">
                    <h3>Recent Transactions</h3>
                    {userDetails.transactions?.length > 0 ? (
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
                          {userDetails.transactions.slice(0, 5).map((t) => (
                            <tr key={t.id}>
                              <td>
                                <span className={`transaction-type ${t.type}`}>{t.type}</span>
                              </td>
                              <td>
                                {userDetails.wallet?.currency} {t.amount.toLocaleString()}
                              </td>
                              <td>
                                {new Date(t.createdAt || t.created_at).toLocaleDateString()}
                              </td>
                              <td>
                                <span className={`status-badge ${t.status}`}>{t.status}</span>
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
