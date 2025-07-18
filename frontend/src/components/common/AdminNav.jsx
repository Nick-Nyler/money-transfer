// src/components/common/AdminNav.jsx
"use client"

import React from "react"
import { Link, useLocation } from "react-router-dom"

const adminNavItems = [
  { path: "/admin",               label: "Admin Dashboard",      icon: "⚡" },
  { path: "/admin/users",         label: "User Management",      icon: "👥" },
  { path: "/admin/transactions",  label: "Transaction Monitoring",icon: "📈" },
]

export default function AdminNav() {
  const location = useLocation()
  const isActive = (p) => location.pathname === p

  return (
    <nav className="navigation admin-nav">
      <div className="nav-container">
        <div className="nav-links">
          {adminNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link admin ${isActive(item.path) ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
