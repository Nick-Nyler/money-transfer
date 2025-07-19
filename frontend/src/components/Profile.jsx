// src/components/Profile.jsx
"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, changePassword, clearError } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status, error, success } = useSelector((s) => s.auth);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName:  user?.lastName  || "",
    phone:     user?.phone     || "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword:     "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab]           = useState("profile");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [formErrors, setFormErrors]         = useState({});

  // Clear errors and success when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(clearError());
    setFormErrors({});
    setProfileSuccess(false);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((p) => ({ ...p, [name]: value }));
    if (profileSuccess) setProfileSuccess(false);
    if (formErrors[name])  setFormErrors((f) => ({ ...f, [name]: "" }));
    dispatch(clearError());
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors((f) => ({ ...f, [name]: "" }));
    dispatch(clearError());
  };

  const validateProfileForm = () => {
    const errs = {};
    if (!profileData.firstName.trim()) errs.firstName = "First name is required";
    if (!profileData.lastName.trim())  errs.lastName  = "Last name is required";
    if (!profileData.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^[+\d]{10,15}$/.test(profileData.phone.replace(/\s/g, ""))) {
      errs.phone = "Phone number is invalid";
    }
    setFormErrors(errs);
    return !Object.keys(errs).length;
  };

  const validatePasswordForm = () => {
    const errs = {};
    if (!passwordData.oldPassword)      errs.oldPassword     = "Current password is required";
    if (!passwordData.newPassword)      errs.newPassword     = "New password is required";
    else if (passwordData.newPassword.length < 6)
      errs.newPassword = "Password must be at least 6 characters";
    if (passwordData.newPassword !== passwordData.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setFormErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;
    dispatch(updateProfile(profileData))
      .unwrap()
      .then(() => setProfileSuccess(true))
      .catch(() => {});
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    dispatch(changePassword({
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword,
    }))
      .unwrap()
      .then(() => {
        navigate("/password-changed");
      })
      .catch(() => {});
  };

  return (
    <div className="profile-container">
      <h1>Profile Settings</h1>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => handleTabChange("profile")}
        >
          Personal Information
        </button>
        <button
          className={`tab-button ${activeTab === "password" ? "active" : ""}`}
          onClick={() => handleTabChange("password")}
        >
          Change Password
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "profile" ? (
          <form onSubmit={handleProfileSubmit} className="profile-form-container">
            <h2>Personal Information</h2>
            {profileSuccess && <div className="success-message">Profile updated!</div>}
            {error          && <div className="error-message">{error}</div>}

            {/* Email (read‑only) */}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={user?.email || ""} disabled className="disabled" />
              <small>Email cannot be changed</small>
            </div>

            {/* First & Last Name */}
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                />
                {formErrors.firstName && (
                  <span className="error">{formErrors.firstName}</span>
                )}
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                />
                {formErrors.lastName && (
                  <span className="error">{formErrors.lastName}</span>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                placeholder="+254XXXXXXXXX"
              />
              {formErrors.phone && <span className="error">{formErrors.phone}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Saving..." : "Save Changes"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="profile-form-container">
            <h2>Change Password</h2>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
              />
              {formErrors.oldPassword && (
                <span className="error">{formErrors.oldPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
              {formErrors.newPassword && (
                <span className="error">{formErrors.newPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
              {formErrors.confirmPassword && (
                <span className="error">{formErrors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Changing..." : "Change Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
