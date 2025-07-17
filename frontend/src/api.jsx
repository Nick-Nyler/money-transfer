// API service for data operations, now interacting with the Flask backend

const BASE_URL = "http://localhost:5000/api" // Your Flask backend URL

// Helper function to make API calls
const _callApi = async (endpoint, method = "GET", data = null, token = null) => {
  const headers = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const config = {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config)
    const responseData = await response.json()

    if (!response.ok) {
      // If response is not OK, throw an error with the backend's error message
      throw new Error(responseData.error || "Something went wrong")
    }

    return responseData
  } catch (error) {
    console.error("API call failed:", error)
    throw error // Re-throw to be caught by Redux thunks
  }
}

export const api = {
  // Auth
  login: async (email, password) => {
    const response = await _callApi("/auth/login", "POST", { email, password })
    // Store the mock token (user ID) in localStorage for subsequent requests
    localStorage.setItem("authToken", response.token)
    return { user: response.user }
  },

  register: async (userData) => {
    const response = await _callApi("/auth/register", "POST", userData)
    // Store the mock token (user ID) in localStorage for subsequent requests
    localStorage.setItem("authToken", response.token)
    return { user: response.user }
  },

  logout: async () => {
    // In a real app, you might invalidate the token on the server.
    // For this mock, we just remove it client-side.
    localStorage.removeItem("authToken")
    localStorage.removeItem("currentUser") // Clear current user from local storage
    return { success: true }
  },

  // New method to fetch current user profile from backend
  getProfile: async () => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }
    const response = await _callApi("/auth/profile", "GET", null, token)
    // Update currentUser in localStorage after fetching from backend
    localStorage.setItem("currentUser", JSON.stringify(response))
    return { user: response }
  },

  // Wallet
  getWalletBalance: async (userId) => {
    const token = localStorage.getItem("authToken")
    const response = await _callApi(`/wallet/balance`, "GET", null, token)
    return { wallet: response }
  },

  addFunds: async (userId, amount) => {
    const token = localStorage.getItem("authToken")
    const response = await _callApi("/wallet/add-funds", "POST", { amount }, token)
    return { wallet: response }
  },

  // Beneficiaries
  getBeneficiaries: async (userId) => {
    const token = localStorage.getItem("authToken")
    const response = await _callApi("/beneficiaries/", "GET", null, token)
    return { beneficiaries: response.beneficiaries }
  },

  addBeneficiary: async (beneficiaryData) => {
    const token = localStorage.getItem("authToken")
    const response = await _callApi("/beneficiaries/", "POST", beneficiaryData, token)
    return { beneficiary: response }
  },

  removeBeneficiary: async (id) => {
    const token = localStorage.getItem("authToken")
    const response = await _callApi(`/beneficiaries/${id}`, "DELETE", null, token)
    return { id, ...response }
  },

  // Transactions
  getTransactions: async (userId) => {
    const token = localStorage.getItem("authToken")
    const response = await _callApi("/transactions/", "GET", null, token)
    return { transactions: response.transactions }
  },

  sendMoney: async (sendData) => {
    const token = localStorage.getItem("authToken")
    const response = await _callApi("/transactions/send", "POST", sendData, token)
    return { wallet: response.transaction.wallet, transaction: response.transaction }
  },

  // Admin
  getAllUsers: async () => {
    const token = localStorage.getItem("authToken")
    const response = await _callApi("/admin/users", "GET", null, token)
    return { users: response.users }
  },

  getAllTransactions: async () => {
    const token = localStorage.getItem("authToken")
    const response = await _callApi("/admin/transactions", "GET", null, token)
    return { transactions: response.transactions }
  },

  getUserDetails: async (userId) => {
    const token = localStorage.getItem("authToken")
    const response = await _callApi(`/admin/users/${userId}`, "GET", null, token)
    return response // This endpoint returns user, wallet, and transactions directly
  },

  updateUserProfile: async (userId, userData) => {
    const token = localStorage.getItem("authToken")
    const response = await _callApi("/auth/profile", "PUT", userData, token)
    return { user: response }
  },

  changePassword: async (userId, oldPassword, newPassword) => {
    const token = localStorage.getItem("authToken")
    const response = await _callApi("/auth/profile/password", "PUT", { oldPassword, newPassword }, token)
    return response
  },
}
