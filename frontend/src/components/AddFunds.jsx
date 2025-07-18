"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { addFunds, fetchWalletBalance } from "../features/wallet/walletSlice"
import { fetchTransactions } from "../features/transactions/transactionsSlice"  // ← added import
import WalletCard from "./common/WalletCard"
import LoadingSpinner from "./common/LoadingSpinner"

const AddFunds = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { wallet, status, error } = useSelector((state) => state.wallet)

  const [amount, setAmount] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [step, setStep] = useState(1)
  const [formErrors, setFormErrors] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionComplete, setTransactionComplete] = useState(false)

  useEffect(() => {
    if (user && user.phone) {
      setPhoneNumber(user.phone)
      dispatch(fetchWalletBalance(user.id))
    }
  }, [dispatch, user])

  const validateStep1 = () => {
    const errors = {}
    const num = Number.parseFloat(amount)

    if (!amount) errors.amount = "Amount is required"
    else if (isNaN(num)) errors.amount = "Amount must be a number"
    else if (num <= 0) errors.amount = "Amount must be greater than 0"
    else if (num < 100) errors.amount = "Minimum amount is KES 100"
    else if (num > 300000) errors.amount = "Maximum amount is KES 300,000"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors = {}
    const cleaned = phoneNumber.replace(/\s/g, "")

    if (!phoneNumber) errors.phoneNumber = "Phone number is required"
    else if (!/^\+?\d{10,15}$/.test(cleaned))
      errors.phoneNumber = "Phone number is invalid"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }

  const handlePreviousStep = () => setStep((s) => s - 1)

  const simulateMpesaPayment = () => {
    setIsProcessing(true)

    // Simulate M-Pesa flow
    setTimeout(() => {
      const numAmount = Number.parseFloat(amount)
      dispatch(addFunds({ userId: user.id, amount: numAmount }))
        .unwrap()
        .then(() => {
          // 🔥 Logic change: refresh both wallet balance AND transactions
          dispatch(fetchWalletBalance(user.id))
          dispatch(fetchTransactions(user.id))
          setIsProcessing(false)
          setTransactionComplete(true)
        })
        .catch(() => setIsProcessing(false))
    }, 3000)
  }

  const handleFinish = () => {
    navigate("/dashboard")
  }

  if (status === "loading" && !isProcessing) {
    return <LoadingSpinner />
  }

  // For display
  const displayAmount = Number.parseFloat(amount) || 0

  return (
    <div className="add-funds-container">
      <h1>Add Funds</h1>

      {wallet && <WalletCard wallet={wallet} />}

      <div className="stepper">
        <div className={`step ${step >= 1 ? "active" : ""}`}>
          <div className="step-number">1</div>
          <div className="step-label">Amount</div>
        </div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <div className="step-label">M-Pesa</div>
        </div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <div className="step-label">Confirm</div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="add-funds-form">
        {step === 1 && (
          <div className="step-content">
            <h2>Enter Amount</h2>
            <p>How much would you like to add to your wallet?</p>

            <div className="form-group">
              <label htmlFor="amount">Amount (KES)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="100"
                max="300000"
              />
              {formErrors.amount && <span className="error">{formErrors.amount}</span>}
            </div>

            <div className="quick-amounts">
              <button type="button" className="amount-btn" onClick={() => setAmount("1000")}>
                KES 1,000
              </button>
              <button type="button" className="amount-btn" onClick={() => setAmount("5000")}>
                KES 5,000
              </button>
              <button type="button" className="amount-btn" onClick={() => setAmount("10000")}>
                KES 10,000
              </button>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2>M-Pesa Details</h2>
            <p>Enter the phone number to receive M-Pesa prompt</p>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+254XXXXXXXXX"
              />
              {formErrors.phoneNumber && <span className="error">{formErrors.phoneNumber}</span>}
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handlePreviousStep}>
                Back
              </button>
              <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && !isProcessing && !transactionComplete && (
          <div className="step-content">
            <h2>Confirm Payment</h2>

            <div className="confirmation-details">
              <div className="detail-row">
                <span>Amount:</span>
                <span>KES {displayAmount.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span>Phone Number:</span>
                <span>{phoneNumber}</span>
              </div>
              <div className="detail-row">
                <span>Payment Method:</span>
                <span>M-Pesa</span>
              </div>
            </div>

            <p className="info-text">
              Click "Confirm" to initiate the M-Pesa payment. You will receive a prompt on your phone.
            </p>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handlePreviousStep}>
                Back
              </button>
              <button type="button" className="btn btn-primary" onClick={simulateMpesaPayment}>
                Confirm
              </button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="step-content">
            <div className="processing">
              <div className="spinner"></div>
              <h2>Processing Payment</h2>
              <p>Please wait while we process your payment...</p>
              <p>Check your phone for the M-Pesa prompt</p>
            </div>
          </div>
        )}

        {transactionComplete && (
          <div className="step-content">
            <div className="success">
              <div className="success-icon">✓</div>
              <h2>Payment Successful!</h2>
              <p>KES {displayAmount.toLocaleString()} has been added to your wallet.</p>

              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={handleFinish}>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddFunds
