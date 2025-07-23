// src/api.js
// Centralized API client. Prod → Render URL (VITE_API_BASE_URL), Dev → localhost.
// Prevents double "/api" and handles tokens + CSV downloads cleanly.

// ---------- Base URL ----------
const raw =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL || // legacy name
  "";

const stripTrailing = (s) => s.replace(/\/+$/, "");
const hasApiSuffix = (s) => /\/api\/?$/.test(s);

const baseRoot = raw ? stripTrailing(raw) : "http://localhost:5000";
export const BASE_URL = hasApiSuffix(baseRoot) ? stripTrailing(baseRoot) : `${baseRoot}/api`;

// ---------- Helpers ----------
const _getToken = () => localStorage.getItem("authToken");
const _storeAuth = ({ token, user }) => {
  if (token) localStorage.setItem("authToken", token);
  if (user) localStorage.setItem("currentUser", JSON.stringify(user));
};

const _callApi = async (endpoint, method = "GET", data = null, token = null, extraHeaders = {}) => {
  const headers = { "Content-Type": "application/json", ...extraHeaders };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => ({})) : await res.blob();

  if (!res.ok) {
    const msg = isJson ? payload?.error || payload?.message : res.statusText;
    throw new Error(msg || "Request failed");
  }
  return payload;
};

// ---------- API surface ----------
export const api = {
  // Auth
  async login(email, password) {
    const { token, user } = await _callApi("/auth/login", "POST", { email, password });
    _storeAuth({ token, user });
    return { user };
  },

  async register(userData) {
    const { token, user } = await _callApi("/auth/register", "POST", userData);
    _storeAuth({ token, user });
    return { user };
  },

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    return { success: true };
  },

  async getProfile() {
    const user = await _callApi("/auth/profile", "GET", null, _getToken());
    localStorage.setItem("currentUser", JSON.stringify(user));
    return { user };
  },

  async updateUserProfile(userData) {
    const user = await _callApi("/auth/profile", "PUT", userData, _getToken());
    return { user };
  },

  async changePassword({ oldPassword, newPassword }) {
    return await _callApi("/auth/profile/password", "PUT", { oldPassword, newPassword }, _getToken());
  },

  // Wallet
  async getWalletBalance() {
    const wallet = await _callApi("/wallet/balance", "GET", null, _getToken());
    return { wallet };
  },

  async addFunds(amount, phone_number) {
    const wallet = await _callApi("/wallet/add-funds", "POST", { amount, phone_number }, _getToken());
    return { wallet };
  },

  async downloadStatement() {
    const res = await fetch(`${BASE_URL}/wallet/statement`, {
      method: "GET",
      headers: { Authorization: `Bearer ${_getToken()}` },
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || "Failed to download statement");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "statement.csv";
    a.click();
    URL.revokeObjectURL(url);
    return true;
  },

  // Beneficiaries
  async getBeneficiaries() {
    const { beneficiaries } = await _callApi("/beneficiaries/", "GET", null, _getToken());
    return { beneficiaries };
  },

  async addBeneficiary(beneficiaryData) {
    const beneficiary = await _callApi("/beneficiaries/", "POST", beneficiaryData, _getToken());
    return { beneficiary };
  },

  async removeBeneficiary(id) {
    await _callApi(`/beneficiaries/${id}`, "DELETE", null, _getToken());
    return { id };
  },

  // Transactions
  async getTransactions() {
    const { transactions } = await _callApi("/transactions/", "GET", null, _getToken());
    return { transactions };
  },

  async sendMoney(sendData) {
    const transaction = await _callApi("/transactions/send", "POST", sendData, _getToken());
    const { wallet } = await this.getWalletBalance();
    return { wallet, transaction };
  },

  // Admin
  async getAllUsers() {
    const { users } = await _callApi("/admin/users", "GET", null, _getToken());
    return { users };
  },

  async getAllTransactions() {
    const { transactions } = await _callApi("/admin/transactions", "GET", null, _getToken());
    return { transactions };
  },

  async getUserDetails(userId) {
    return await _callApi(`/admin/users/${userId}`, "GET", null, _getToken());
    },
  
  async updateUserStatus(userId, role) {
    return await _callApi(`/admin/users/${userId}/status`, "PATCH", { role }, _getToken());
  },

  async reverseTransaction(transactionId) {
    const { transaction } = await _callApi(
      `/admin/transactions/${transactionId}/reverse`,
      "POST",
      null,
      _getToken()
    );
    return { transaction };
  },
};

export default api;
