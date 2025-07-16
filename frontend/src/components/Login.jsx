"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { login, clearError } from "../features/auth/authSlice"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const dispatch = useDispatch()
  const { status, error } = useSelector((state) => state.auth)

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError())
  }, [dispatch])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(login({ email, password }))
  }

  const handleDemoLogin = (e) => {
    e.preventDefault()
    // Regular user demo
    dispatch(login({ email: "john@example.com", password: "password123" }))
  }

  const handleAdminLogin = (e) => {
    e.preventDefault()
    // Admin user demo
    dispatch(login({ email: "admin@example.com", password: "admin123" }))
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Money Transfer</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={status === "loading"}>
            {status === "loading" ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>

        <div className="demo-accounts">
          <h3>Demo Accounts</h3>
          <div className="demo-buttons">
            <button onClick={handleDemoLogin} className="btn btn-outline" disabled={status === "loading"}>
              Regular User Demo
            </button>
            <button onClick={handleAdminLogin} className="btn btn-outline" disabled={status === "loading"}>
              Admin User Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
