// src/components/common/Navigation.jsx
"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { logout } from "../../features/auth/authSlice"
import AdminNav from "./AdminNav"

export default function Navigation() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)

  const firstName = user?.firstName || user?.first_name || ""
  const lastName  = user?.lastName  || user?.last_name   || ""
  const initials  = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const handleLogout = () => { dispatch(logout()); navigate("/login") }
  const toggleMobileMenu = () => setIsMobileMenuOpen((o) => !o)
  const isActive = (path) => location.pathname === path

  const regularNavItems = [
    { path: "/dashboard",     label: "Dashboard",    icon: "🏠" },
    { path: "/send-money",    label: "Send Money",   icon: "💸" },
    { path: "/add-funds",     label: "Add Funds",     icon: "💰" },
    { path: "/beneficiaries", label: "Beneficiaries", icon: "👥" },
    { path: "/transactions",  label: "Transactions",  icon: "📊" },
    { path: "/profile",       label: "Profile",       icon: "👤" },
  ]

  return (
    <>
      <nav className="navigation">
        <div className="nav-container">
          <div className="nav-brand">
            <Link to="/dashboard"><h2>MoneyTransfer</h2></Link>
          </div>

          <div className="nav-mobile-toggle" onClick={toggleMobileMenu}>
            <span></span><span></span><span></span>
          </div>

          <div className={`nav-menu ${isMobileMenuOpen ? "active" : ""}`}>
            <div className="nav-links">
              {regularNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              ))}
              
              <div className="nav-user">
                <div className="user-info">
                  <div className="user-avatar">{initials}</div>
                  <div className="user-details">
                    <span className="user-name">{firstName} {lastName}</span>
                    <span className="user-role">{user?.role}</span>
                  </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>

          
        </div>
      </nav>

      {user?.role === "admin" && <AdminNav />}
    </>
  )
}
