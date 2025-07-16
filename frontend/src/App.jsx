"use client"

import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import Login from "./components/Login"
import Register from "./components/Register"
import Dashboard from "./components/Dashboard"
import Profile from "./components/Profile"
import AddFunds from "./components/AddFunds"
import Beneficiaries from "./components/Beneficiaries"
import SendMoney from "./components/SendMoney"
import Transactions from "./components/Transactions"
import AdminDashboard from "./components/admin/AdminDashboard"
import UserManagement from "./components/admin/UserManagement"
import TransactionMonitoring from "./components/admin/TransactionMonitoring"
import Navigation from "./components/common/Navigation"
import { checkAuth } from "./features/auth/authSlice"
import "./App.css"

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  // Protected route component
  const ProtectedRoute = ({ children, requireAdmin }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />
    }

    if (requireAdmin && user?.role !== "admin") {
      return <Navigate to="/dashboard" />
    }

    return children
  }

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && <Navigation />}
        <div className="content-container">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-funds"
              element={
                <ProtectedRoute>
                  <AddFunds />
                </ProtectedRoute>
              }
            />

            <Route
              path="/beneficiaries"
              element={
                <ProtectedRoute>
                  <Beneficiaries />
                </ProtectedRoute>
              }
            />

            <Route
              path="/send-money"
              element={
                <ProtectedRoute>
                  <SendMoney />
                </ProtectedRoute>
              }
            />

            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/transactions"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <TransactionMonitoring />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
