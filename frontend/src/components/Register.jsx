"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { register, clearError } from "../features/auth/authSlice"

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "", // Changed from firstName
    last_name: "", // Changed from lastName
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [formErrors, setFormErrors] = useState({})
  const dispatch = useDispatch()
  const { status, error } = useSelector((state) => state.auth)

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError())
  }, [dispatch])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear specific error when field is changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.first_name.trim()) {
      // Changed from firstName
      errors.first_name = "First name is required"
    }

    if (!formData.last_name.trim()) {
      // Changed from lastName
      errors.last_name = "Last name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      errors.phone = "Phone number is invalid"
    }

    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      const { confirmPassword, ...userData } = formData
      dispatch(register(userData))
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Money Transfer</h1>
          <p>Create a new account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label> {/* Changed from firstName */}
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />{" "}
              {/* Changed from firstName */}
              {formErrors.first_name && <span className="error">{formErrors.first_name}</span>}{" "}
              {/* Changed from firstName */}
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label> {/* Changed from lastName */}
              <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} />{" "}
              {/* Changed from lastName */}
              {formErrors.last_name && <span className="error">{formErrors.last_name}</span>}{" "}
              {/* Changed from lastName */}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
            {formErrors.email && <span className="error">{formErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254XXXXXXXXX"
            />
            {formErrors.phone && <span className="error">{formErrors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
            {formErrors.password && <span className="error">{formErrors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {formErrors.confirmPassword && <span className="error">{formErrors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={status === "loading"}>
            {status === "loading" ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
