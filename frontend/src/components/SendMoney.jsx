"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import { fetchBeneficiaries } from "../features/beneficiaries/beneficiariesSlice"
import { sendMoney } from "../features/transactions/transactionsSlice"
import { fetchWalletBalance } from "../features/wallet/walletSlice"
import WalletCard from "./common/WalletCard"
import LoadingSpinner from "./common/LoadingSpinner"

const SendMoney = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const preSelectedBeneficiaryId = queryParams.get("beneficiaryId")

  const { user } = useSelector((state) => state.auth)
  const { wallet, status: walletStatus } = useSelector((state) => state.wallet)
  const { beneficiaries, status: beneficiariesStatus } = useSelector((state) => state.beneficiaries)
  const { status: transactionStatus, error } = useSelector((state) => state.transactions)

  const [step, setStep] = useState(1)
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionComplete, setTransactionComplete] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState(null)

  // load beneficiaries + wallet
  useEffect(() => {
    if (user) {
      dispatch(fetchBeneficiaries(user.id))
      dispatch(fetchWalletBalance(user.id))
    }
  }, [dispatch, user])

  // auto-select via query param
  useEffect(() => {
    if (preSelectedBeneficiaryId && beneficiaries.length) {
      const found = beneficiaries.find((b) => b.id === +preSelectedBeneficiaryId)
      if (found) {
        setSelectedBeneficiary(found)
        setStep(2)
      }
    }
  }, [preSelectedBeneficiaryId, beneficiaries])

  const validateStep1 = () => {
    const errs = {}
    if (!selectedBeneficiary) errs.beneficiary = "Please select a beneficiary"
    setFormErrors(errs)
    return !Object.keys(errs).length
  }

  const validateStep2 = () => {
    const errs = {}
    const num = parseFloat(amount)
    const fee = num * 0.01
    const total = num + fee

    if (!amount) errs.amount = "Amount required"
    else if (isNaN(num)) errs.amount = "Must be a number"
    else if (num <= 0) errs.amount = "Must be > 0"
    else if (num < 100) errs.amount = "Minimum KES 100"
    else if (wallet?.balance != null && total > wallet.balance)
      errs.amount = "Insufficient funds"

    setFormErrors(errs)
    return !Object.keys(errs).length
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }
  const handleBack = () => setStep((s) => s - 1)

  const handleSend = () => {
    setIsProcessing(true)
    const num = parseFloat(amount)

    dispatch(
      sendMoney({
        userId: user.id,
        beneficiaryId: selectedBeneficiary.id,
        amount: num,
        description: description || `Payment to ${selectedBeneficiary.name}`,
      })
    )
      .unwrap()
      .then((res) => {
        setIsProcessing(false)
        setTransactionDetails(res.transaction)
        setTransactionComplete(true)
        // refresh wallet
        dispatch(fetchWalletBalance(user.id))
      })
      .catch(() => setIsProcessing(false))
  }

  const handleFinish = () => navigate("/dashboard")

  if (beneficiariesStatus === "loading" || walletStatus === "loading")
    return <LoadingSpinner />

  // calculations
  const num = parseFloat(amount) || 0
  const fee = num * 0.01
  const total = num + fee

  return (
    <div className="send-money-container">
      <h1>Send Money</h1>

      {wallet && <WalletCard wallet={wallet} />}

      <div className="stepper">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`step ${step >= n ? "active" : ""}`}>
            <div className="step-number">{n}</div>
            <div className="step-label">
              {n === 1 ? "Recipient" : n === 2 ? "Amount" : "Confirm"}
            </div>
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="send-money-form">
        {step === 1 && (
          <div className="step-content">
            <h2>Select Recipient</h2>
            {beneficiaries.length ? (
              <div className="beneficiaries-selection">
                {beneficiaries.map((b) => (
                  <div
                    key={b.id}
                    className={`beneficiary-card ${
                      selectedBeneficiary?.id === b.id ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedBeneficiary(b)
                      setFormErrors({})
                    }}
                  >
                    <div className="avatar">{b.name.charAt(0)}</div>
                    <div className="info">
                      <h3>{b.name}</h3>
                      <p>{b.phone}</p>
                    </div>
                    {selectedBeneficiary?.id === b.id && <span>✓</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">
                <p>No beneficiaries yet.</p>
                <button onClick={() => navigate("/beneficiaries")}>Add One</button>
              </div>
            )}
            {formErrors.beneficiary && (
              <div className="error">{formErrors.beneficiary}</div>
            )}
            {beneficiaries.length > 0 && (
              <button onClick={handleNext} className="btn btn-primary">
                Next
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2>Enter Amount</h2>
            <div className="recipient-summary">
              <div className="avatar">{selectedBeneficiary.name.charAt(0)}</div>
              <div>
                <h3>{selectedBeneficiary.name}</h3>
                <p>{selectedBeneficiary.phone}</p>
              </div>
            </div>
            <label>
              Amount (KES)
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                min="100"
              />
            </label>
            {formErrors.amount && <div className="error">{formErrors.amount}</div>}
            <div className="fee-details">
              <div>
                <span>Amount:</span>{" "}
                <span>
                  KES {num.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span>Fee (1%):</span>{" "}
                <span>
                  KES {fee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="total">
                <span>Total:</span>{" "}
                <span>
                  KES {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <label>
              Description (opt.)
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why are you sending?"
              />
            </label>
            <div className="actions">
              <button onClick={handleBack} className="btn btn-outline">
                Back
              </button>
              <button onClick={handleNext} className="btn btn-primary">
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && !isProcessing && !transactionComplete && (
          <div className="step-content">
            <h2>Confirm Transfer</h2>
            <div className="detail-row">
              <span>Recipient:</span> <span>{selectedBeneficiary.name}</span>
            </div>
            <div className="detail-row">
              <span>Phone:</span> <span>{selectedBeneficiary.phone}</span>
            </div>
            <div className="detail-row">
              <span>Amount:</span>{" "}
              <span>KES {num.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span>Fee:</span> <span>KES {fee.toLocaleString()}</span>
            </div>
            <div className="detail-row total">
              <span>Total:</span>{" "}
              <span>KES {total.toLocaleString()}</span>
            </div>
            <div className="actions">
              <button onClick={handleBack} className="btn btn-outline">
                Back
              </button>
              <button
                onClick={handleSend}
                className="btn btn-primary"
                disabled={transactionStatus === "loading"}
              >
                Confirm & Send
              </button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="step-content">
            <LoadingSpinner />
            <p>Processing your transfer…</p>
          </div>
        )}

        {transactionComplete && (
          <div className="step-content">
            <h2>Success!</h2>
            <p>Txn ID: {transactionDetails?.id}</p>
            <p>
              Date:{" "}
              {transactionDetails?.createdAt &&
                new Date(transactionDetails.createdAt).toLocaleString()}
            </p>
            <div className="actions">
              <button
                onClick={() => {
                  setStep(1)
                  setSelectedBeneficiary(null)
                  setAmount("")
                  setDescription("")
                  setTransactionComplete(false)
                  setTransactionDetails(null)
                }}
                className="btn btn-outline"
              >
                Send Another
              </button>
              <button onClick={handleFinish} className="btn btn-primary">
                Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SendMoney
