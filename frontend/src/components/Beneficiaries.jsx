// frontend/src/components/Beneficiaries.jsx
"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  fetchBeneficiaries,
  addBeneficiary,
  updateBeneficiary,
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

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    accountNumber: "",
    relationship: "",
  })
  // Edit form state
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    email: "",
    accountNumber: "",
    relationship: "",
  })

  const [formErrors, setFormErrors] = useState({})
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)

  useEffect(() => {
    if (user) dispatch(fetchBeneficiaries(user.id))
  }, [dispatch, user])

  const phoneRe = /^\+?\d{10,15}$/
  const validate = (data) => {
    const errs = {}
    if (!data.name.trim()) errs.name = "Name is required"
    if (!data.phone.trim()) errs.phone = "Phone number is required"
    else if (!phoneRe.test(data.phone.replace(/\s/g, "")))
      errs.phone = "Phone number is invalid"
    if (data.email && !/\S+@\S+\.\S+/.test(data.email))
      errs.email = "Email is invalid"
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Add handlers
  const handleAddChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }))
  }
  const handleAddSubmit = (e) => {
    e.preventDefault()
    if (!validate(formData)) return
    dispatch(addBeneficiary({ ...formData, userId: user.id }))
      .unwrap()
      .then(() => {
        setFormData({ name: "", phone: "", email: "", accountNumber: "", relationship: "" })
        setShowAddForm(false)
      })
  }

  // Edit handlers
  const handleEditClick = (b) => {
    setEditingId(b.id)
    setEditData({
      name: b.name,
      phone: b.phone,
      email: b.email || "",
      accountNumber: b.accountNumber || "",
      relationship: b.relationship || "",
    })
    setFormErrors({})
    setShowAddForm(false)
  }
  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData((p) => ({ ...p, [name]: value }))
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }))
  }
  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (!validate(editData)) return
    dispatch(updateBeneficiary({ id: editingId, ...editData }))
      .unwrap()
      .then(() => setEditingId(null))
  }

  // Delete handlers
  const handleDelete = (id) => setDeleteConfirmation(id)
  const confirmDelete = () => {
    dispatch(removeBeneficiary(deleteConfirmation))
      .unwrap()
      .finally(() => setDeleteConfirmation(null))
  }
  const cancelDelete = () => setDeleteConfirmation(null)

  // Send money
  const handleSendMoney = (b) => {
    navigate(`/send-money?beneficiaryId=${b.id}`)
  }

  if (status === "loading") return <LoadingSpinner />

  return (
    <div className="beneficiaries-container">
      <div className="section-header">
        <h1>Manage Beneficiaries</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowAddForm((s) => !s)
            setEditingId(null)
            setFormErrors({})
          }}
        >
          {showAddForm ? "Cancel" : "Add Beneficiary"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showAddForm && (
        <div className="add-beneficiary-form">
          <h2>Add New Beneficiary</h2>
          <form onSubmit={handleAddSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleAddChange}
                placeholder="Enter full name"
              />
              {formErrors.name && <span className="error">{formErrors.name}</span>}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleAddChange}
                placeholder="+254XXXXXXXXX"
              />
              {formErrors.phone && <span className="error">{formErrors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Email (Optional)</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleAddChange}
                placeholder="Enter email address"
              />
              {formErrors.email && <span className="error">{formErrors.email}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Account Number (Optional)</label>
                <input
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleAddChange}
                  placeholder="Enter account number"
                />
              </div>
              <div className="form-group">
                <label>Relationship (Optional)</label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleAddChange}
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
              <button type="submit" className="btn btn-primary">
                Add Beneficiary
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="beneficiaries-list-container">
        <div className="beneficiaries-grid">
          {beneficiaries.map((b) =>
            editingId === b.id ? (
              <div key={b.id} className="beneficiary-card">
                <form onSubmit={handleEditSubmit}>
                  <h3>Edit Beneficiary</h3>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                    />
                    {formErrors.name && <span className="error">{formErrors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      name="phone"
                      value={editData.phone}
                      onChange={handleEditChange}
                    />
                    {formErrors.phone && <span className="error">{formErrors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label>Email (Optional)</label>
                    <input
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                    />
                    {formErrors.email && <span className="error">{formErrors.email}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Account Number (Optional)</label>
                      <input
                        name="accountNumber"
                        value={editData.accountNumber}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Relationship (Optional)</label>
                      <select
                        name="relationship"
                        value={editData.relationship}
                        onChange={handleEditChange}
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
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div key={b.id} className="beneficiary-card">
                <div className="beneficiary-header">
                  <div className="beneficiary-avatar">
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="beneficiary-info">
                    <h3>{b.name}</h3>
                    <p>{b.phone}</p>
                  </div>
                </div>
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
                <div className="beneficiary-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSendMoney(b)}
                  >
                    Send Money
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEditClick(b)}
                  >
                    Edit
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
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default Beneficiaries
