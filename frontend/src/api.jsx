// Mock API service for data operations
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Demo data
const demoUsers = [
  {
    id: 1,
    email: "admin@example.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    phone: "+254712345678",
    role: "admin",
    createdAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    email: "john@example.com",
    password: "password123",
    firstName: "John",
    lastName: "Doe",
    phone: "+254723456789",
    role: "user",
    createdAt: "2023-01-15T00:00:00Z",
  },
]

const demoWallets = [
  {
    id: 1,
    userId: 1,
    balance: 50000,
    currency: "KES",
  },
  {
    id: 2,
    userId: 2,
    balance: 25000,
    currency: "KES",
  },
]

const demoBeneficiaries = [
  {
    id: 1,
    userId: 2,
    name: "Jane Smith",
    phone: "+254734567890",
    email: "jane@example.com",
    accountNumber: "123456789",
    relationship: "Friend",
    createdAt: "2023-02-01T00:00:00Z",
  },
  {
    id: 2,
    userId: 2,
    name: "Michael Johnson",
    phone: "+254745678901",
    email: "michael@example.com",
    accountNumber: "987654321",
    relationship: "Family",
    createdAt: "2023-02-15T00:00:00Z",
  },
  {
    id: 3,
    userId: 1,
    name: "Sarah Williams",
    phone: "+254756789012",
    email: "sarah@example.com",
    accountNumber: "456789123",
    relationship: "Colleague",
    createdAt: "2023-03-01T00:00:00Z",
  },
]

const demoTransactions = [
  {
    id: 1,
    userId: 2,
    type: "deposit",
    amount: 10000,
    fee: 0,
    status: "completed",
    description: "Deposit via M-Pesa",
    recipientName: null,
    recipientPhone: null,
    createdAt: "2023-03-10T10:30:00Z",
  },
  {
    id: 2,
    userId: 2,
    type: "send",
    amount: 5000,
    fee: 50,
    status: "completed",
    description: "Payment for services",
    recipientName: "Jane Smith",
    recipientPhone: "+254734567890",
    createdAt: "2023-03-15T14:20:00Z",
  },
  {
    id: 3,
    userId: 2,
    type: "receive",
    amount: 20000,
    fee: 0,
    status: "completed",
    description: "Salary payment",
    recipientName: "John Doe",
    recipientPhone: "+254723456789",
    createdAt: "2023-03-20T09:15:00Z",
  },
  {
    id: 4,
    userId: 1,
    type: "deposit",
    amount: 50000,
    fee: 0,
    status: "completed",
    description: "Initial deposit",
    recipientName: null,
    recipientPhone: null,
    createdAt: "2023-01-05T11:45:00Z",
  },
]

// Store data in localStorage
const initializeLocalStorage = () => {
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(demoUsers))
  }
  if (!localStorage.getItem("wallets")) {
    localStorage.setItem("wallets", JSON.stringify(demoWallets))
  }
  if (!localStorage.getItem("beneficiaries")) {
    localStorage.setItem("beneficiaries", JSON.stringify(demoBeneficiaries))
  }
  if (!localStorage.getItem("transactions")) {
    localStorage.setItem("transactions", JSON.stringify(demoTransactions))
  }
}

initializeLocalStorage()

// Helper functions
const getUsers = () => JSON.parse(localStorage.getItem("users") || "[]")
const getWallets = () => JSON.parse(localStorage.getItem("wallets") || "[]")
const getBeneficiaries = () => JSON.parse(localStorage.getItem("beneficiaries") || "[]")
const getTransactions = () => JSON.parse(localStorage.getItem("transactions") || "[]")

const saveUsers = (users) => localStorage.setItem("users", JSON.stringify(users))
const saveWallets = (wallets) => localStorage.setItem("wallets", JSON.stringify(wallets))
const saveBeneficiaries = (beneficiaries) => localStorage.setItem("beneficiaries", JSON.stringify(beneficiaries))
const saveTransactions = (transactions) => localStorage.setItem("transactions", JSON.stringify(transactions))

// API methods
export const api = {
  // Auth
  login: async (email, password) => {
    await delay(800) // Simulate network delay
    const users = getUsers()
    const user = users.find((u) => u.email === email && u.password === password)

    if (user) {
      const { password, ...userWithoutPassword } = user
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
      return { user: userWithoutPassword }
    }

    throw new Error("Invalid email or password")
  },

  register: async (userData) => {
    await delay(1000)
    const users = getUsers()

    if (users.some((u) => u.email === userData.email)) {
      throw new Error("Email already exists")
    }

    const newUser = {
      id: users.length + 1,
      ...userData,
      role: "user",
      createdAt: new Date().toISOString(),
    }

    const newWallet = {
      id: getWallets().length + 1,
      userId: newUser.id,
      balance: 0,
      currency: "KES",
    }

    const { password, ...userWithoutPassword } = newUser

    saveUsers([...users, newUser])
    saveWallets([...getWallets(), newWallet])

    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

    return { user: userWithoutPassword }
  },

  logout: async () => {
    await delay(300)
    localStorage.removeItem("currentUser")
    return { success: true }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("currentUser")
    return user ? JSON.parse(user) : null
  },

  // Wallet
  getWalletBalance: async (userId) => {
    await delay(500)
    const wallets = getWallets()
    const wallet = wallets.find((w) => w.userId === userId)

    if (!wallet) {
      throw new Error("Wallet not found")
    }

    return { wallet }
  },

  addFunds: async (userId, amount) => {
    await delay(1000)
    const wallets = getWallets()
    const walletIndex = wallets.findIndex((w) => w.userId === userId)

    if (walletIndex === -1) {
      throw new Error("Wallet not found")
    }

    // Update wallet
    wallets[walletIndex] = {
      ...wallets[walletIndex],
      balance: wallets[walletIndex].balance + amount,
    }

    // Create transaction
    const transactions = getTransactions()
    const newTransaction = {
      id: transactions.length + 1,
      userId,
      type: "deposit",
      amount,
      fee: 0,
      status: "completed",
      description: "Deposit via M-Pesa",
      recipientName: null,
      recipientPhone: null,
      createdAt: new Date().toISOString(),
    }

    saveWallets(wallets)
    saveTransactions([...transactions, newTransaction])

    return {
      wallet: wallets[walletIndex],
      transaction: newTransaction,
    }
  },

  // Beneficiaries
  getBeneficiaries: async (userId) => {
    await delay(600)
    const beneficiaries = getBeneficiaries()
    const userBeneficiaries = beneficiaries.filter((b) => b.userId === userId)

    return { beneficiaries: userBeneficiaries }
  },

  addBeneficiary: async (beneficiaryData) => {
    await delay(800)
    const beneficiaries = getBeneficiaries()
    const newBeneficiary = {
      id: beneficiaries.length + 1,
      ...beneficiaryData,
      createdAt: new Date().toISOString(),
    }

    saveBeneficiaries([...beneficiaries, newBeneficiary])

    return { beneficiary: newBeneficiary }
  },

  removeBeneficiary: async (id) => {
    await delay(600)
    const beneficiaries = getBeneficiaries()
    const updatedBeneficiaries = beneficiaries.filter((b) => b.id !== id)

    saveBeneficiaries(updatedBeneficiaries)

    return { success: true }
  },

  // Transactions
  getTransactions: async (userId) => {
    await delay(700)
    const transactions = getTransactions()
    const userTransactions = transactions.filter((t) => t.userId === userId)

    return { transactions: userTransactions }
  },

  sendMoney: async (sendData) => {
    await delay(1200)
    const { userId, beneficiaryId, amount, description } = sendData

    // Calculate fee (1%)
    const fee = Math.round(amount * 0.01)
    const totalAmount = amount + fee

    // Check wallet balance
    const wallets = getWallets()
    const walletIndex = wallets.findIndex((w) => w.userId === userId)

    if (walletIndex === -1) {
      throw new Error("Wallet not found")
    }

    if (wallets[walletIndex].balance < totalAmount) {
      throw new Error("Insufficient funds")
    }

    // Get beneficiary details
    const beneficiaries = getBeneficiaries()
    const beneficiary = beneficiaries.find((b) => b.id === beneficiaryId)

    if (!beneficiary) {
      throw new Error("Beneficiary not found")
    }

    // Update wallet
    wallets[walletIndex] = {
      ...wallets[walletIndex],
      balance: wallets[walletIndex].balance - totalAmount,
    }

    // Create transaction
    const transactions = getTransactions()
    const newTransaction = {
      id: transactions.length + 1,
      userId,
      type: "send",
      amount,
      fee,
      status: "completed",
      description,
      recipientName: beneficiary.name,
      recipientPhone: beneficiary.phone,
      createdAt: new Date().toISOString(),
    }

    saveWallets(wallets)
    saveTransactions([...transactions, newTransaction])

    return {
      wallet: wallets[walletIndex],
      transaction: newTransaction,
    }
  },

  // Admin
  getAllUsers: async () => {
    await delay(800)
    const users = getUsers().map(({ password, ...user }) => user)
    return { users }
  },

  getAllTransactions: async () => {
    await delay(900)
    const transactions = getTransactions()
    return { transactions }
  },

  getUserDetails: async (userId) => {
    await delay(500)
    const users = getUsers()
    const user = users.find((u) => u.id === userId)

    if (!user) {
      throw new Error("User not found")
    }

    const { password, ...userWithoutPassword } = user

    const wallets = getWallets()
    const wallet = wallets.find((w) => w.userId === userId)

    const transactions = getTransactions()
    const userTransactions = transactions.filter((t) => t.userId === userId)

    return {
      user: userWithoutPassword,
      wallet,
      transactions: userTransactions,
    }
  },

  updateUserProfile: async (userId, userData) => {
    await delay(800)
    const users = getUsers()
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      throw new Error("User not found")
    }

    // Don't allow changing email or role through this method
    const { email, role, password, ...updatableFields } = userData

    users[userIndex] = {
      ...users[userIndex],
      ...updatableFields,
    }

    saveUsers(users)

    const { password: userPassword, ...userWithoutPassword } = users[userIndex]

    // Update current user if it's the same user
    const currentUser = api.getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
    }

    return { user: userWithoutPassword }
  },

  changePassword: async (userId, oldPassword, newPassword) => {
    await delay(1000)
    const users = getUsers()
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      throw new Error("User not found")
    }

    if (users[userIndex].password !== oldPassword) {
      throw new Error("Incorrect password")
    }

    users[userIndex] = {
      ...users[userIndex],
      password: newPassword,
    }

    saveUsers(users)

    return { success: true }
  },
}
