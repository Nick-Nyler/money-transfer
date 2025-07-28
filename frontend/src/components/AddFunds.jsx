
"use client"

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
  fetchWalletBalance,
  initiateStk,
  pollTxnStatus,
  stopPolling,
  clearError,
} from "../features/wallet/walletSlice"
import { fetchTransactions } from "../features/transactions/transactionsSlice"
import WalletCard from "./common/WalletCard"
import LoadingSpinner from "./common/LoadingSpinner"
import useMpesaSocket from "../hooks/useMpesaSocket"  


const normalizePhone = (p) => {
  let phone = p.trim()
  if (phone.startsWith("+")) phone = phone.slice(1)
  if (phone.startsWith("0")) phone = "254" + phone.slice(1)
  return phone
}

const QUICK_AMOUNTS = [1000, 5000, 10000]

const AddFunds = () => {
  useMpesaSocket()  // ← start listening for callback events

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user } = useSelector((s) => s.auth)
  const { wallet, status, error, polling, pendingCheckoutId } = useSelector((s) => s.wallet)

  const [amount, setAmount] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [step, setStep] = useState(1)
  const [formErrors, setFormErrors] = useState({})
  const [localProcessing, setLocalProcessing] = useState(false)
  const [transactionComplete, setTransactionComplete] = useState(false)

  // refs to avoid re-renders
  const startBalanceRef = useRef(null)
  const triesRef = useRef(0)
  const timeoutRef = useRef(null)

  // initial load
  useEffect(() => {
    if (!user) return
    if (user.phone) setPhoneNumber(user.phone)
    dispatch(fetchWalletBalance())
  }, [dispatch, user])

  // poll every 1s (fallback)
  useEffect(() => {
    if (!polling || !pendingCheckoutId) return

    const id = setInterval(() => {
      triesRef.current += 1
      dispatch(pollTxnStatus(pendingCheckoutId)).then((res) => {
        const st = res?.payload?.status
        if (st && st !== "pending") finishSuccess()
      })
      if (triesRef.current > 10) {
        dispatch(stopPolling())
        setLocalProcessing(false)
        setFormErrors({
          general:
            "Still waiting for M‑Pesa. If you approved, your wallet should update shortly.",
        })
        clearTimeout(timeoutRef.current)
      }
    }, 1000)

    return () => clearInterval(id)
  }, [polling, pendingCheckoutId, dispatch])

  // fallback on balance change
  useEffect(() => {
    if (!polling || startBalanceRef.current == null || !wallet) return
    const startBal = Number(startBalanceRef.current)
    const nowBal = Number(wallet.balance)
    if (nowBal > startBal) finishSuccess()
  }, [wallet, polling])

  // validation
  const validateStep1 = () => {
    const errs = {}
    const num = parseFloat(amount)
    if (!amount) errs.amount = "Amount is required"
    else if (isNaN(num)) errs.amount = "Amount must be a number"
    else if (num < 1) errs.amount = "Minimum amount is KES 1"
    else if (num > 300000) errs.amount = "Maximum amount is KES 300,000"
    setFormErrors(errs)
    return !Object.keys(errs).length
  }

  const validateStep2 = () => {
    const errs = {}
    const cleaned = phoneNumber.replace(/\s/g, "")
    const re = /^(?:0(7\d{8}|11\d{7})|254(7\d{8}|11\d{7})|\+254(7\d{8}|11\d{7}))$/
    if (!cleaned) errs.phoneNumber = "Phone number is required"
    else if (!re.test(cleaned)) errs.phoneNumber = "Phone number is invalid"
    setFormErrors(errs)
    return !Object.keys(errs).length
  }

  // navigation
  const next = () => {
    if (step === 1 ? validateStep1() : validateStep2()) {
      setFormErrors({})
      setStep((s) => s + 1)
    }
  }
  const back = () => setStep((s) => s - 1)

  // confirm
  const confirm = () => {
    if (!validateStep2()) {
      setStep(2)
      return
    }
    setLocalProcessing(true)
    dispatch(clearError())

    startBalanceRef.current = wallet ? Number(wallet.balance) : 0
    triesRef.current = 0

    const amt = parseFloat(amount)
    const phone = normalizePhone(phoneNumber)

    dispatch(initiateStk({ amount: amt, phone_number: phone }))
      .unwrap()
      .then(() => {
        toast.info("✅ STK Push sent! Check your phone.")
        timeoutRef.current = setTimeout(() => finishSuccess(), 15000)
      })
      .catch((e) => {
        setFormErrors({ general: e.message || "Failed to initiate STK" })
        setLocalProcessing(false)
      })
  }

  const finishSuccess = () => {
    clearTimeout(timeoutRef.current)
    dispatch(stopPolling())
    dispatch(fetchWalletBalance())
    dispatch(fetchTransactions(user.id))
    setTransactionComplete(true)
    setLocalProcessing(false)
    triesRef.current = 0
  }

  const finish = () => navigate("/dashboard")

  const displayAmt = parseFloat(amount) || 0
  const firstLoad =
    status === "loading" && !localProcessing && !polling && !transactionComplete

  if (firstLoad) return <LoadingSpinner />

  return (
    <div className="add-funds-container">
      <h1>Add Funds</h1>
      {wallet && <WalletCard wallet={wallet} />}

      <div className="stepper">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`step ${step >= n ? "active" : ""}`}>
            <div className="step-number">{n}</div>
            <div className="step-label">
              {["Amount", "M‑Pesa", "Confirm"][n - 1]}
            </div>
          </div>
        ))}
      </div>

      {(error || formErrors.general) && (
        <div className="error-message">{formErrors.general || error}</div>
      )}

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
            {formErrors.amount && (
              <span className="error">{formErrors.amount}</span>
            )}
          </div>
          <div className="quick-amounts">
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                onClick={() => setAmount(String(val))}
                className="amount-btn"
              >
                KES {val.toLocaleString()}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={next}>
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <h2>M‑Pesa Details</h2>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+2547XXXXXXXX"
            />
            {formErrors.phoneNumber && (
              <span className="error">{formErrors.phoneNumber}</span>
            )}
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={back}>
              Back
            </button>
            <button className="btn btn-primary" onClick={next}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && !localProcessing && !polling && !transactionComplete && (
        <div className="step-content">
          <h2>Confirm Payment</h2>
          <p>Amount: KES {displayAmt.toLocaleString()}</p>
          <p>Phone: {phoneNumber}</p>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={back}>
              Back
            </button>
            <button className="btn btn-primary" onClick={confirm}>
              Confirm
            </button>
          </div>
        </div>
      )}

      {(localProcessing || polling) && !transactionComplete && (
        <div className="step-content">
          <LoadingSpinner />
          <p>
            {polling
              ? "Waiting for M‑Pesa confirmation…"
              : "Sending STK push…"}
          </p>
          <p>Approve the prompt on your phone.</p>
        </div>
      )}

      {transactionComplete && (
        <div className="step-content">
          <h2>Payment Successful 🎉</h2>
          <p>Your wallet has been updated.</p>
          <button className="btn btn-primary" onClick={finish}>
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  )
}

export default AddFunds
