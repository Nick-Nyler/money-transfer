"use client"

import { useState, useEffect } from "react"
import Login from "@/components/Login"
import Dashboard from "@/components/Dashboard"
import Profile from "@/components/Profile"
import AddFunds from "@/components/AddFunds"
import Beneficiaries from "@/components/Beneficiaries"
import SendMoney from "@/components/SendMoney"
import Transactions from "@/components/Transactions"
import AdminPanel from "@/components/AdminPanel"

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      balance: 2500.0,
      isAdmin: false,
      beneficiaries: [
        { id: 1, name: "Jane Smith", email: "jane@example.com", accountNumber: "1234567890" },
        { id: 2, name: "Bob Johnson", email: "bob@example.com", accountNumber: "0987654321" },
      ],
      transactions: [
        { id: 1, type: "send", amount: -150.0, recipient: "Jane Smith", date: "2024-01-15", status: "completed" },
        { id: 2, type: "receive", amount: 300.0, sender: "Bob Johnson", date: "2024-01-14", status: "completed" },
        { id: 3, type: "deposit", amount: 500.0, date: "2024-01-13", status: "completed" },
      ],
    },
    {
      id: 2,
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      balance: 10000.0,
      isAdmin: true,
      beneficiaries: [],
      transactions: [],
    },
  ])

  const [allTransactions, setAllTransactions] = useState([
    {
      id: 1,
      userId: 1,
      type: "send",
      amount: -150.0,
      recipient: "Jane Smith",
      date: "2024-01-15",
      status: "completed",
      fee: 2.5,
    },
    {
      id: 2,
      userId: 1,
      type: "receive",
      amount: 300.0,
      sender: "Bob Johnson",
      date: "2024-01-14",
      status: "completed",
      fee: 0,
    },
    { id: 3, userId: 1, type: "deposit", amount: 500.0, date: "2024-01-13", status: "completed", fee: 0 },
  ])

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (email, password) => {
    const user = users.find((u) => u.email === email && u.password === password)
    if (user) {
      setCurrentUser(user)
      localStorage.setItem("currentUser", JSON.stringify(user))
      return { success: true }
    }
    return { success: false, message: "Invalid credentials" }
  }

  const handleRegister = (userData) => {
    const existingUser = users.find((u) => u.email === userData.email)
    if (existingUser) {
      return { success: false, message: "User already exists" }
    }

    const newUser = {
      id: users.length + 1,
      ...userData,
      balance: 0,
      isAdmin: false,
      beneficiaries: [],
      transactions: [],
    }

    setUsers([...users, newUser])
    setCurrentUser(newUser)
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    return { success: true }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem("currentUser")
    setCurrentPage("dashboard")
  }

  const updateUser = (updatedUser) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
    setCurrentUser(updatedUser)
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
  }

  const addTransaction = (transaction) => {
    const newTransaction = {
      id: allTransactions.length + 1,
      userId: currentUser.id,
      date: new Date().toISOString().split("T")[0],
      status: "completed",
      ...transaction,
    }
    setAllTransactions([...allTransactions, newTransaction])

    // Update user's transactions
    const updatedUser = {
      ...currentUser,
      transactions: [...currentUser.transactions, newTransaction],
    }
    updateUser(updatedUser)
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard user={currentUser} transactions={currentUser.transactions} />
      case "profile":
        return <Profile user={currentUser} onUpdate={updateUser} />
      case "add-funds":
        return <AddFunds user={currentUser} onUpdate={updateUser} onTransaction={addTransaction} />
      case "beneficiaries":
        return <Beneficiaries user={currentUser} onUpdate={updateUser} />
      case "send-money":
        return <SendMoney user={currentUser} onUpdate={updateUser} onTransaction={addTransaction} />
      case "transactions":
        return <Transactions transactions={currentUser.transactions} />
      case "admin":
        return currentUser.isAdmin ? (
          <AdminPanel users={users} transactions={allTransactions} onUpdateUsers={setUsers} />
        ) : (
          <Dashboard user={currentUser} transactions={currentUser.transactions} />
        )
      default:
        return <Dashboard user={currentUser} transactions={currentUser.transactions} />
    }
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <div className="navbar-brand">MoneyTransfer</div>
            <div className="navbar-nav">
              <a
                href="#"
                className={`nav-link ${currentPage === "dashboard" ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage("dashboard")
                }}
              >
                Dashboard
              </a>
              <a
                href="#"
                className={`nav-link ${currentPage === "add-funds" ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage("add-funds")
                }}
              >
                Add Funds
              </a>
              <a
                href="#"
                className={`nav-link ${currentPage === "beneficiaries" ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage("beneficiaries")
                }}
              >
                Beneficiaries
              </a>
              <a
                href="#"
                className={`nav-link ${currentPage === "send-money" ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage("send-money")
                }}
              >
                Send Money
              </a>
              <a
                href="#"
                className={`nav-link ${currentPage === "transactions" ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage("transactions")
                }}
              >
                Transactions
              </a>
              {currentUser.isAdmin && (
                <a
                  href="#"
                  className={`nav-link ${currentPage === "admin" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage("admin")
                  }}
                >
                  Admin
                </a>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div className="user-avatar" onClick={() => setCurrentPage("profile")}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <button
                className="btn btn-secondary"
                onClick={handleLogout}
                style={{ padding: "8px 16px", fontSize: "14px" }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container">{renderPage()}</div>
    </div>
  )
}