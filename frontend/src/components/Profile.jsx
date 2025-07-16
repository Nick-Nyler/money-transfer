"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateProfile, changePassword } from "../features/auth/authSlice"

const Profile = () => {
  const dispatch = useDispatch()
  const { user, status, error } = useSelector((state) => state.auth)

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [activeTab, setActiveTab] = useState("profile")
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      [name]: value,
    })

    // Clear success message when form is changed
    if (profileSuccess) {
      setProfileSuccess(false)
    }

    // Clear specific error
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value,
    })

    // Clear success message when form is changed
    if (passwordSuccess) {
      setPasswordSuccess(false)
    }

    // Clear specific error
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  const validateProfileForm = () => {
    const errors = {}

    if (!profileData.firstName.trim()) {
      errors.firstName = "First name is required"
    }

    if (!profileData.lastName.trim()) {
      errors.lastName = "Last name is required"
    }

    if (!profileData.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!/^\+?\d{10,15}$/.test(profileData.phone.replace(/\s/g, ""))) {
      errors.phone = "Phone number is invalid"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePasswordForm = () => {
    const errors = {}

    if (!passwordData.oldPassword) {
      errors.oldPassword = "Current password is required"
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required"
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters"
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault()

    if (validateProfileForm()) {
      dispatch(updateProfile({ userId: user.id, userData: profileData }))
        .unwrap()
        .then(() => {
          setProfileSuccess(true)
        })
        .catch(() => {
          // Error is handled by the reducer
        })
    }
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()

    if (validatePasswordForm()) {
      dispatch(
        changePassword({
          userId: user.id,
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      )
        .unwrap()
        .then(() => {
          setPasswordSuccess(true)
          setPasswordData({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          })
        })
        .catch(() => {
          // Error is handled by the reducer
        })
    }
  }

  return (
    <div className="profile-container">
      <h1>Profile Settings</h1>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Personal Information
        </button>
        <button
          className={`tab-button ${activeTab === "password" ? "active" : ""}`}
          onClick={() => setActiveTab("password")}
        >
          Change Password
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "profile" && (
          <div className="profile-form-container">
            <h2>Personal Information</h2>

            {profileSuccess && <div className="success-message">Profile updated successfully!</div>}

            {error && activeTab === "profile" && <div className="error-message">{error}</div>}

            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" value={user?.email || ""} disabled className="disabled" />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                  />
                  {formErrors.firstName && <span className="error">{formErrors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                  />
                  {formErrors.lastName && <span className="error">{formErrors.lastName}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="+254XXXXXXXXX"
                />
                {formErrors.phone && <span className="error">{formErrors.phone}</span>}
              </div>

              <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
                {status === "loading" ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "password" && (
          <div className="profile-form-container">
            <h2>Change Password</h2>

            {passwordSuccess && <div className="success-message">Password changed successfully!</div>}

            {error && activeTab === "password" && <div className="error-message">{error}</div>}

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="oldPassword">Current Password</label>
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                />
                {formErrors.oldPassword && <span className="error">{formErrors.oldPassword}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
                {formErrors.newPassword && <span className="error">{formErrors.newPassword}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
                {formErrors.confirmPassword && <span className="error">{formErrors.confirmPassword}</span>}
              </div>

              <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
                {status === "loading" ? "Changing Password..." : "Change Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
