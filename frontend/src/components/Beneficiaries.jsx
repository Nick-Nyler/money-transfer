// frontend/src/components/Beneficiaries.jsx
"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  fetchBeneficiaries,
  addBeneficiary,
  removeBeneficiary,
  updateBeneficiary,
} from "../features/beneficiaries/beneficiariesSlice"
import LoadingSpinner from "./common/LoadingSpinner"

const Beneficiaries = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { beneficiaries, status, error } = useSelector(
    (state) => state.beneficiaries
  )

  // Add form
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    accountNumber: "",
    relationship: "",
  })
  const [formErrors, setFormErrors] = useState({})

  // Edit form
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    email: "",
    accountNumber: "",
    relationship: "",
  })

  // Delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)

  useEffect(() => {
    if (user) dispatch(fetchBeneficiaries(user.id))
  }, [dispatch, user])

  const handleChange = (stateSetter, errorsSetter) => (e) => {
    const { name, value } = e.target
    stateSetter((prev) => ({ ...prev, [name]: value }))
    errorsSetter((prev) => ({ ...prev, [name]: "" }))
  }

  const validate = (data, setErrors) => {
    const errors = {}
    if (!data.name.trim()) errors.name = "Name is required"
    if (!data.phone.trim()) errors.phone = "Phone number is required"
    else if (!/^+?\d{10,15}$/.test(data.phone.replace(/\s/g, "")))
      errors.phone = "Phone number is invalid"
    if (data.email && !/\S+@\S+.\S+/.test(data.email))
      errors.email = "Email is invalid"
    setErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddSubmit = (e) => {
    e.preventDefault()
    if (!validate(formData, setFormErrors)) return
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

  const handleEditClick = (b) => {
    setEditingId(b.id)
    setEditData({
      name: b.name,
      phone: b.phone,
      email: b.email || "",
      accountNumber: b.accountNumber || "",
      relationship: b.relationship || "",
    })
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (!validate(editData, setFormErrors)) return
    dispatch(updateBeneficiary({ id: editingId, ...editData }))
      .unwrap()
      .then(() => setEditingId(null))
      .catch(() => {})
  }

  const handleDelete = (id) => setDeleteConfirmation(id)
  const confirmDelete = () => {
    dispatch(removeBeneficiary(deleteConfirmation))
      .unwrap()
      .finally(() => setDeleteConfirmation(null))
  }
  const cancelDelete = () => setDeleteConfirmation(null)

  const handleSendMoney = (b) =>
    navigate(`/send-money?beneficiaryId=${b.id}`)

  if (status === "loading") {
    return <LoadingSpinner />
  }

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
    <form className="add-beneficiary-form" onSubmit={handleAddSubmit}>
      <h2>Add New Beneficiary</h2>

      <input
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange(setFormData, setFormErrors)}
      />
      {formErrors.name && (
        <span className="error">{formErrors.name}</span>
      )}

      <input
        name="phone"
        placeholder="Phone (+254...)"
        value={formData.phone}
        onChange={handleChange(setFormData, setFormErrors)}
      />
      {formErrors.phone && (
        <span className="error">{formErrors.phone}</span>
      )}

      <input
        name="email"
        placeholder="Email (opt)"
        value={formData.email}
        onChange={handleChange(setFormData, setFormErrors)}
      />
      {formErrors.email && (
        <span className="error">{formErrors.email}</span>
      )}

      <input
        name="accountNumber"
        placeholder="Account # (opt)"
        value={formData.accountNumber}
        onChange={(e) =>
          setFormData((p) => ({ ...p, accountNumber: e.target.value }))
        }
      />

      <select
        name="relationship"
        value={formData.relationship}
        onChange={(e) =>
          setFormData((p) => ({ ...p, relationship: e.target.value }))
        }
      >
        <option value="">Relationship (opt)</option>
        <option value="Family">Family</option>
        <option value="Friend">Friend</option>
        <option value="Business">Business</option>
        <option value="Other">Other</option>
      </select>

      <button className="btn btn-primary" type="submit">
        Add Beneficiary
      </button>
    </form>
  )}

  <div className="beneficiaries-list-container">
    <div className="beneficiaries-grid">
      {beneficiaries.map((b) =>
        editingId === b.id ? (
          <form
            key={b.id}
            className="beneficiary-card editing"
            onSubmit={handleEditSubmit}
          >
            <h3>Edit Beneficiary</h3>
            <input
              name="name"
              placeholder="Full Name"
              value={editData.name}
              onChange={handleChange(setEditData, setFormErrors)}
            />
            {formErrors.name && (
              <span className="error">{formErrors.name}</span>
            )}

            <input
              name="phone"
              placeholder="Phone (+254...)"
              value={editData.phone}
              onChange={handleChange(setEditData, setFormErrors)}
            />
            {formErrors.phone && (
              <span className="error">{formErrors.phone}</span>
            )}

            <input
              name="email"
              placeholder="Email (opt)"
              value={editData.email}
              onChange={handleChange(setEditData, setFormErrors)}
            />
            {formErrors.email && (
              <span className="error">{formErrors.email}</span>
            )}

            <input
              name="accountNumber"
              placeholder="Account # (opt)"
              value={editData.accountNumber}
              onChange={(e) =>
                setEditData((p) => ({ ...p, accountNumber: e.target.value }))
              }
            />

            <select
              name="relationship"
              value={editData.relationship}
              onChange={(e) =>
                setEditData((p) => ({ ...p, relationship: e.target.value }))
              }
            >
              <option value="">Relationship (opt)</option>
              <option value="Family">Family</option>
              <option value="Friend">Friend</option>
              <option value="Business">Business</option>
              <option value="Other">Other</option>
            </select>

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
        ) : (
          <div key={b.id} className="beneficiary-card">
            <div className="beneficiary-header">
              <div className="avatar">
                {b.name.charAt(0).toUpperCase()}
              </div>
              <div className="info">
                <h3>{b.name}</h3>
                <p>{b.phone}</p>
              </div>
            </div>
            <div className="details">
              {b.email && <p>Email: {b.email}</p>}
              {b.accountNumber && <p>Account: {b.accountNumber}</p>}
              {b.relationship && <p>Relationship: {b.relationship}</p>}
            </div>
            <div className="beneficiary-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleSendMoney(b)}
              >
                Send Money
              </button>
              <button
                className="btn btn-outline btn-sm"
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
                <p>Remove this beneficiary?</p>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={confirmDelete}
                >
                  Yes
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={cancelDelete}
                >
                  No
                </button>
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