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
  const { wallet } = useSelector((state) => state.wallet)
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

  useEffect(() => {
    if (user) {
      dispatch(fetchBeneficiaries(user.id))
      dispatch(fetchWalletBalance(user.id))
    }
  }, [dispatch, user])

  useEffect(() => {
    if (preSelectedBeneficiaryId && beneficiaries.length > 0) {
      const beneficiary = beneficiaries.find((b) => b.id === Number.parseInt(preSelectedBeneficiaryId))
      if (beneficiary) {
        setSelectedBeneficiary(beneficiary)
        setStep(2)
      }
    }
  }, [preSelectedBeneficiaryId, beneficiaries])

  const validateStep1 = () => {
    const errors = {}

    if (!selectedBeneficiary) {
      errors.beneficiary = "Please select a beneficiary"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors = {}
    const numAmount = Number.parseFloat(amount)
    const fee = numAmount * 0.01 // 1% fee
    const totalAmount = numAmount + fee

    if (!amount) {
      errors.amount = "Amount is required"
    } else if (isNaN(numAmount)) {
      errors.amount = "Amount must be a number"
    } else if (numAmount <= 0) {
      errors.amount = "Amount must be greater than 0"
    } else if (numAmount < 100) {
      errors.amount = "Minimum amount is KES 100"
    } else if (wallet && totalAmount > wallet.balance) {
      errors.amount = "Insufficient funds (including fee)"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handlePreviousStep = () => {
    setStep(step - 1)
  }

  const handleBeneficiarySelect = (beneficiary) => {
    setSelectedBeneficiary(beneficiary)
    setFormErrors({})
  }

  const handleSendMoney = () => {
    setIsProcessing(true)

    const numAmount = Number.parseFloat(amount)

    dispatch(
      sendMoney({
        // userId: user.id, // Removed: userId is derived from token on backend
        beneficiary_id: selectedBeneficiary.id, // Changed from beneficiaryId
        amount: numAmount,
        description: description || `Payment to ${selectedBeneficiary.name}`,
      }),
    )
      .unwrap()
      .then((result) => {
        setIsProcessing(false)
        setTransactionComplete(true)
        setTransactionDetails(result.transaction)
      })
      .catch(() => {
        setIsProcessing(false)
      })
  }

  const handleFinish = () => {
    navigate("/dashboard")
  }

  if (beneficiariesStatus === "loading") {
    return <LoadingSpinner />
  }

  // Calculate fee and total
  const numAmount = Number.parseFloat(amount) || 0
  const fee = numAmount * 0.01 // 1% fee
  const totalAmount = numAmount + fee

  return (
    <div className="send-money-container">
      <h1>Send Money</h1>

      {wallet && <WalletCard wallet={wallet} />}

      <div className="stepper">
        <div className={`step ${step >= 1 ? "active" : ""}`}>
          <div className="step-number">1</div>
          <div className="step-label">Recipient</div>
        </div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <div className="step-label">Amount</div>
        </div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <div className="step-label">Confirm</div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="send-money-form">
        {step === 1 && (
          <div className="step-content">
            <h2>Select Recipient</h2>

            {beneficiaries.length > 0 ? (
              <div className="beneficiaries-selection">
                {beneficiaries.map((beneficiary) => (
                  <div
                    key={beneficiary.id}
                    className={`beneficiary-select-card ${selectedBeneficiary?.id === beneficiary.id ? "selected" : ""}`}
                    onClick={() => handleBeneficiarySelect(beneficiary)}
                  >
                    <div className="beneficiary-avatar">{beneficiary.name.charAt(0)}</div>
                    <div className="beneficiary-info">
                      <h3>{beneficiary.name}</h3>
                      <p>{beneficiary.phone}</p>
                    </div>
                    {selectedBeneficiary?.id === beneficiary.id && <div className="selected-indicator">✓</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't added any beneficiaries yet.</p>
                <a href="/beneficiaries" className="btn btn-primary">
                  Add Beneficiary
                </a>
              </div>
            )}

            {formErrors.beneficiary && <div className="error-message">{formErrors.beneficiary}</div>}

            {beneficiaries.length > 0 && (
              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2>Enter Amount</h2>

            <div className="recipient-summary">
              <div className="beneficiary-avatar">{selectedBeneficiary.name.charAt(0)}</div>
              <div className="beneficiary-info">
                <h3>Sending to: {selectedBeneficiary.name}</h3>
                <p>{selectedBeneficiary.phone}</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (KES)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="100"
              />
              {formErrors.amount && <span className="error">{formErrors.amount}</span>}
            </div>

            <div className="fee-calculation">
              <div className="fee-row">
                <span>Amount:</span>
                <span>
                  KES {numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="fee-row">
                <span>Fee (1%):</span>
                <span>KES {fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="fee-row total">
                <span>Total:</span>
                <span>
                  KES {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this payment for?"
              />
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
            <h2>Confirm Transfer</h2>

            <div className="confirmation-details">
              <div className="detail-row">
                <span>Recipient:</span>
                <span>{selectedBeneficiary.name}</span>
              </div>
              <div className="detail-row">
                <span>Phone Number:</span>
                <span>{selectedBeneficiary.phone}</span>
              </div>
              <div className="detail-row">
                <span>Amount:</span>
                <span>KES {numAmount.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span>Fee (1%):</span>
                <span>KES {fee.toLocaleString()}</span>
              </div>
              <div className="detail-row total">
                <span>Total Amount:</span>
                <span>KES {totalAmount.toLocaleString()}</span>
              </div>
              {description && (
                <div className="detail-row">
                  <span>Description:</span>
                  <span>{description}</span>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handlePreviousStep}>
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendMoney}
                disabled={transactionStatus === "loading"}
              >
                Confirm & Send
              </button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="step-content">
            <div className="processing">
              <div className="spinner"></div>
              <h2>Processing Transfer</h2>
              <p>Please wait while we process your transfer...</p>
            </div>
          </div>
        )}

        {transactionComplete && (
          <div className="step-content">
            <div className="success">
              <div className="success-icon">✓</div>
              <h2>Transfer Successful!</h2>

              <div className="transaction-receipt">
                <div className="receipt-header">
                  <h3>Transaction Receipt</h3>
                  <p>Transaction ID: {transactionDetails.id}</p>
                  <p>Date: {new Date(transactionDetails.createdAt).toLocaleString()}</p>
                </div>

                <div className="receipt-details">
                  <div className="detail-row">
                    <span>Recipient:</span>
                    <span>{transactionDetails.recipientName}</span>
                  </div>
                  <div className="detail-row">
                    <span>Phone Number:</span>
                    <span>{transactionDetails.recipientPhone}</span>
                  </div>
                  <div className="detail-row">
                    <span>Amount:</span>
                    <span>KES {transactionDetails.amount.toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span>Fee:</span>
                    <span>KES {transactionDetails.fee.toLocaleString()}</span>
                  </div>
                  <div className="detail-row total">
                    <span>Total Amount:</span>
                    <span>KES {(transactionDetails.amount + transactionDetails.fee).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span>Status:</span>
                    <span className="status-completed">{transactionDetails.status}</span>
                  </div>
                  {transactionDetails.description && (
                    <div className="detail-row">
                      <span>Description:</span>
                      <span>{transactionDetails.description}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setStep(1)
                    setSelectedBeneficiary(null)
                    setAmount("")
                    setDescription("")
                    setTransactionComplete(false)
                    setTransactionDetails(null)
                  }}
                >
                  Send Another
                </button>
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

export default SendMoney
