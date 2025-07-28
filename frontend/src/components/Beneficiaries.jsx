// frontend/src/components/Beneficiaries.jsx
"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  fetchBeneficiaries,
  addBeneficiary,
  removeBeneficiary,
} from "../features/beneficiaries/beneficiariesSlice"
import LoadingSpinner from "./common/LoadingSpinner"

const Beneficiaries = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { beneficiaries, status, error } = useSelector(
    (state) => state.beneficiaries
  )

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    accountNumber: "",
    relationship: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)

  useEffect(() => {
    if (user) {
      dispatch(fetchBeneficiaries(user.id))
    }
  }, [dispatch, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = "Name is required"
    if (!formData.phone.trim()) errors.phone = "Phone number is required"
    else if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/\s/g, "")))
      errors.phone = "Phone number is invalid"
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    dispatch(addBeneficiary({ ...formData, userId: user.id }))
      .unwrap()
      .then(() => {
        setFormData({
          name: "",
          phone: "",
          email: "",
          accountNumber: "",
          relationship: "",
        })
        setShowAddForm(false)
      })
      .catch(() => {})
  }

  const handleDelete = (id) => setDeleteConfirmation(id)
  const confirmDelete = () => {
    dispatch(removeBeneficiary(deleteConfirmation))
      .unwrap()
      .finally(() => setDeleteConfirmation(null))
  }
  const cancelDelete = () => setDeleteConfirmation(null)

  const handleSendMoney = (b) => {
    navigate(`/send-money?beneficiaryId=${b.id}`)
  }

  if (status === "loading") {
    return <LoadingSpinner />
  }

  return (
    <div className="beneficiaries-container">
      <div className="section-header">
        <h1>Manage Beneficiaries</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm((s) => !s)}
        >
          {showAddForm ? "Cancel" : "Add Beneficiary"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showAddForm && (
        <div className="add-beneficiary-form">
          <h2>Add New Beneficiary</h2>
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
              />
              {formErrors.name && <span className="error">{formErrors.name}</span>}
            </div>
            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+254XXXXXXXXX"
              />
              {formErrors.phone && <span className="error">{formErrors.phone}</span>}
            </div>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email (Optional)</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
              {formErrors.email && <span className="error">{formErrors.email}</span>}
            </div>
            {/* Account + Relationship */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="accountNumber">Account Number (Optional)</label>
                <input
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Enter account number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="relationship">Relationship (Optional)</label>
                <select
                  id="relationship"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                >
                  <option value="">Select relationship</option>
                  <option value="Family">Family</option>
                  <option value="Friend">Friend</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Adding..." : "Add Beneficiary"}
              </button>
            </div>
          </form>
        </div>
      )}

      {beneficiaries.length > 0 ? (
        <div className="beneficiaries-list-container">
          <div className="beneficiaries-grid">
            {beneficiaries.map((b) => (
              <div key={b.id} className="beneficiary-card">
                {/* Header */}
                <div className="beneficiary-header">
                  <div className="beneficiary-avatar">
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="beneficiary-info">
                    <h3>{b.name}</h3>
                    <p>{b.phone}</p>
                  </div>
                </div>
                {/* Details */}
                <div className="beneficiary-details">
                  {b.email && (
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span>{b.email}</span>
                    </div>
                  )}
                  {b.accountNumber && (
                    <div className="detail-row">
                      <span className="label">Account:</span>
                      <span>{b.accountNumber}</span>
                    </div>
                  )}
                  {b.relationship && (
                    <div className="detail-row">
                      <span className="label">Relationship:</span>
                      <span>{b.relationship}</span>
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div className="beneficiary-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSendMoney(b)}
                  >
                    Send Money
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(b.id)}
                  >
                    Remove
                  </button>
                </div>
                {deleteConfirmation === b.id && (
                  <div className="delete-confirmation">
                    <p>Are you sure you want to remove this beneficiary?</p>
                    <div className="confirmation-actions">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={confirmDelete}
                      >
                        Yes, Remove
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={cancelDelete}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>You haven't added any beneficiaries yet.</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Add Your First Beneficiary
          </button>
        </div>
      )}
    </div>
  )
}

export default Beneficiaries