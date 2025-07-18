// src/api.js
// API service for data operations, now interacting with the Flask backend

// Reads VITE_API_URL from .env; falls back to localhost
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";

// Helper to make API calls
const _callApi = async (endpoint, method = "GET", data = null, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Something went wrong");
    return json;
  } catch (err) {
    console.error("API call failed:", err);
    throw err;
  }
};

export const api = {
  // — Auth —
  login: async (email, password) => {
    const { token, user } = await _callApi("/auth/login", "POST", { email, password });
    localStorage.setItem("authToken", token);
    return { user };
  },

  register: async (userData) => {
    const { token, user } = await _callApi("/auth/register", "POST", userData);
    localStorage.setItem("authToken", token);
    return { user };
  },

  logout: async () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    return { success: true };
  },

  getProfile: async () => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No authentication token found");
    const user = await _callApi("/auth/profile", "GET", null, token);
    localStorage.setItem("currentUser", JSON.stringify(user));
    return { user };
  },

  // — Wallet —
  getWalletBalance: async (userId) => {
    const token = localStorage.getItem("authToken");
    const response = await _callApi("/wallet/balance", "GET", null, token);
    return { wallet: response };
  },

  addFunds: async (userId, amount) => {
    const token = localStorage.getItem("authToken");
    // now correctly sends { amount } instead of mis‐positioned args
    const response = await _callApi("/wallet/add-funds", "POST", { amount }, token);
    return { wallet: response };
  },

  // — Beneficiaries —
  getBeneficiaries: async () => {
    const token = localStorage.getItem("authToken");
    const { beneficiaries } = await _callApi("/beneficiaries/", "GET", null, token);
    return { beneficiaries };
  },

  addBeneficiary: async (beneficiaryData) => {
    const token = localStorage.getItem("authToken");
    const response = await _callApi("/beneficiaries/", "POST", beneficiaryData, token);
    return { beneficiary: response };
  },

  removeBeneficiary: async (id) => {
    const token = localStorage.getItem("authToken");
    await _callApi(`/beneficiaries/${id}`, "DELETE", null, token);
    return { id };
  },

  // — Transactions —
  getTransactions: async () => {
    const token = localStorage.getItem("authToken");
    const { transactions } = await _callApi("/transactions/", "GET", null, token);
    return { transactions };
  },

  sendMoney: async (sendData) => {
    const token = localStorage.getItem("authToken");
    const transaction = await _callApi("/transactions/send", "POST", sendData, token);
    const { wallet } = await api.getWalletBalance(sendData.userId);
    return { wallet, transaction };
  },

  // — Admin —
  getAllUsers: async () => {
    const token = localStorage.getItem("authToken");
    const { users } = await _callApi("/admin/users", "GET", null, token);
    return { users };
  },

  getAllTransactions: async () => {
    const token = localStorage.getItem("authToken");
    const { transactions } = await _callApi("/admin/transactions", "GET", null, token);
    return { transactions };
  },

  getUserDetails: async (userId) => {
    const token = localStorage.getItem("authToken");
    return await _callApi(`/admin/users/${userId}`, "GET", null, token);
  },

  updateUserProfile: async (userData) => {
    const token = localStorage.getItem("authToken");
    const user = await _callApi("/auth/profile", "PUT", userData, token);
    return { user };
  },

  changePassword: async (oldPassword, newPassword) => {
    const token = localStorage.getItem("authToken");
    return await _callApi(
      "/auth/profile/password",
      "PUT",
      { oldPassword, newPassword },
      token
    );
  },
};
