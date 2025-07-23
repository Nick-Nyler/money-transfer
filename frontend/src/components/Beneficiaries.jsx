"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchBeneficiaries, addBeneficiary, removeBeneficiary } from "../features/beneficiaries/beneficiariesSlice"
import LoadingSpinner from "./common/LoadingSpinner"


const Beneficiaries = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { beneficiaries, status, error } = useSelector((state) => state.beneficiaries)

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
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear specific error
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      errors.phone = "Phone number is invalid"
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      dispatch(
        addBeneficiary({
          ...formData,
          userId: user.id,
        }),
      )
        .unwrap()
        .then(() => {
          // Reset form and hide it
          setFormData({
            name: "",
            phone: "",
            email: "",
            accountNumber: "",
            relationship: "",
          })
          setShowAddForm(false)
        })
        .catch(() => {
          // Error is handled by the reducer
        })
    }
  }

  const handleDelete = (id) => {
    setDeleteConfirmation(id)
  }

  const confirmDelete = () => {
    if (deleteConfirmation) {
      dispatch(removeBeneficiary(deleteConfirmation))
        .unwrap()
        .then(() => {
          setDeleteConfirmation(null)
        })
        .catch(() => {
          // Error is handled by the reducer
        })
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmation(null)
  }

  if (status === "loading") {
    return <LoadingSpinner />
  }

  return (
    <div className="beneficiaries-container">
      <div className="section-header">
        <h1>Manage Beneficiaries</h1>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "Add Beneficiary"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showAddForm && (
        <div className="add-beneficiary-form">
          <h2>Add New Beneficiary</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
              />
              {formErrors.name && <span className="error">{formErrors.name}</span>}
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
              <label htmlFor="email">Email (Optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
              {formErrors.email && <span className="error">{formErrors.email}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="accountNumber">Account Number (Optional)</label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Enter account number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="relationship">Relationship (Optional)</label>
                <select id="relationship" name="relationship" value={formData.relationship} onChange={handleChange}>
                  <option value="">Select relationship</option>
                  <option value="Family">Family</option>
                  <option value="Friend">Friend</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
                {status === "loading" ? "Adding..." : "Add Beneficiary"}
              </button>
            </div>
          </form>
        </div>
      )}

      {beneficiaries.length > 0 ? (
        <div className="beneficiaries-list-container">
          <div className="beneficiaries-grid">
            {beneficiaries.map((beneficiary) => (
              <div key={beneficiary.id} className="beneficiary-card">
                <div className="beneficiary-header">
                  <div className="beneficiary-avatar">{beneficiary.name.charAt(0)}</div>
                  <div className="beneficiary-info">
                    <h3>{beneficiary.name}</h3>
                    <p>{beneficiary.phone}</p>
                  </div>
                </div>

                <div className="beneficiary-details">
                  {beneficiary.email && (
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span>{beneficiary.email}</span>
                    </div>
                  )}

                  {beneficiary.accountNumber && (
                    <div className="detail-row">
                      <span className="label">Account:</span>
                      <span>{beneficiary.accountNumber}</span>
                    </div>
                  )}

                  {beneficiary.relationship && (
                    <div className="detail-row">
                      <span className="label">Relationship:</span>
                      <span>{beneficiary.relationship}</span>
                    </div>
                  )}
                </div>

                <div className="beneficiary-actions">
                  <a href={`/send-money?beneficiaryId=${beneficiary.id}`} className="btn btn-primary btn-sm">
                    Send Money
                  </a>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(beneficiary.id)}>
                    Remove
                  </button>
                </div>

                {deleteConfirmation === beneficiary.id && (
                  <div className="delete-confirmation">
                    <p>Are you sure you want to remove this beneficiary?</p>
                    <div className="confirmation-actions">
                      <button className="btn btn-danger btn-sm" onClick={confirmDelete}>
                        Yes, Remove
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={cancelDelete}>
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
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            Add Your First Beneficiary
          </button>
        </div>
      )}
    </div>
  )
}

export default Beneficiaries
