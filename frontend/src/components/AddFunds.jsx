// src/components/AddFunds.jsx
"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { addFunds, fetchWalletBalance } from "../features/wallet/walletSlice"
import { fetchTransactions } from "../features/transactions/transactionsSlice"
import WalletCard from "./common/WalletCard"
import LoadingSpinner from "./common/LoadingSpinner"

// normalize 07xxxx or +2547xxxx into 2547xxxx
const normalizePhone = (p) => {
  let phone = p.trim()
  if (phone.startsWith("+")) phone = phone.slice(1)
  if (phone.startsWith("0")) phone = "254" + phone.slice(1)
  return phone
}

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
      dispatch(fetchWalletBalance())
    }
  }, [dispatch, user])

  const validateStep1 = () => {
    const errs = {}
    const num = parseFloat(amount)
    if (!amount) errs.amount = "Amount is required"
    else if (isNaN(num)) errs.amount = "Amount must be a number"
    else if (num < 1) errs.amount = "Minimum amount is KES 1"
    else if (num > 300000) errs.amount = "Maximum amount is KES 300,000"
    setFormErrors(errs)
    return !Object.keys(errs).length
  }

  const validateStep2 = () => {
    const errs = {}
    const cleaned = phoneNumber.replace(/\s/g, "")
    const re = /^(?:07\d{8}|\+2547\d{8})$/
    if (!cleaned) errs.phoneNumber = "Phone number is required"
    else if (!re.test(cleaned)) errs.phoneNumber = "Phone number is invalid"
    setFormErrors(errs)
    return !Object.keys(errs).length
  }

  const next = () => {
    if (step === 1 ? validateStep1() : validateStep2()) {
      setFormErrors({})
      setStep((s) => s + 1)
    }
  }

  const back = () => setStep((s) => s - 1)

  const confirm = () => {
    if (!validateStep2()) {
      setStep(2)
      return
    }

    setIsProcessing(true)
    setFormErrors({})

    const num = parseFloat(amount)
    const phone = normalizePhone(phoneNumber)

    dispatch(addFunds({ amount: num, phone_number: phone }))
      .unwrap()
      .then(() => {
        dispatch(fetchWalletBalance())
        dispatch(fetchTransactions())
        setTransactionComplete(true)
      })
      .catch((e) => {
        setFormErrors({ general: e.message || e })
      })
      .finally(() => setIsProcessing(false))
  }

  const finish = () => navigate("/dashboard")

  if (status === "loading" && !isProcessing) return <LoadingSpinner />

  const displayAmt = parseFloat(amount) || 0

  return (
    <div className="add-funds-container">
      <h1>Add Funds</h1>
      {wallet && <WalletCard wallet={wallet} />}

      <div className="stepper">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`step ${step >= n ? "active" : ""}`}>
            <div className="step-number">{n}</div>
            <div className="step-label">{["Amount", "M-Pesa", "Confirm"][n - 1]}</div>
          </div>
        ))}
      </div>

      {(error || formErrors.general) && (
        <div className="error-message">{formErrors.general || error}</div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="step-content">
          <h2>Enter Amount</h2>
          <div className="form-group">
            <label>Amount (KES)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max="300000"
            />
            {formErrors.amount && <span className="error">{formErrors.amount}</span>}
          </div>
          <div className="quick-amounts">
            {["1000", "5000", "10000"].map((val) => (
              <button key={val} onClick={() => setAmount(val)} className="amount-btn">
                KES {Number(val).toLocaleString()}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={next}>Next</button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="step-content">
          <h2>M-Pesa Details</h2>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+2547XXXXXXXX"
            />
            {formErrors.phoneNumber && <span className="error">{formErrors.phoneNumber}</span>}
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={back}>Back</button>
            <button className="btn btn-primary" onClick={next}>Next</button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && !isProcessing && !transactionComplete && (
        <div className="step-content">
          <h2>Confirm Payment</h2>
          <p>Amount: KES {displayAmt.toLocaleString()}</p>
          <p>Phone: {phoneNumber}</p>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={back}>Back</button>
            <button className="btn btn-primary" onClick={confirm}>Confirm</button>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="step-content">
          <LoadingSpinner />
          <p>Sending STK push…</p>
        </div>
      )}

      {transactionComplete && (
        <div className="step-content">
          <h2>Check your phone for the M‑Pesa prompt!</h2>
          <button className="btn btn-primary" onClick={finish}>
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  )
}

export default AddFunds
