import React, { useState, useEffect } from 'react';
import { API_URL } from '../api';
import { useSelector } from 'react-redux';

export default function Profile() {
  const [profile, setProfile] = useState({});
  const token = useSelector((s) => s.auth.token);

  useEffect(() => {
    fetch(`${API_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setProfile);
  }, [token]);

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Profile</h2>
      <input
        name="name"
        value={profile.name || ''}
        onChange={handleChange}
      />
      <input
        name="email"
        value={profile.email || ''}
        onChange={handleChange}
      />
      <button type="submit">Update</button>
    </form>
  );
}