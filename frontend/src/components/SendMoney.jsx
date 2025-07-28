
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
  const { beneficiaries, status: beneficiariesStatus } = useSelector(
    (state) => state.beneficiaries
  )
  const { status: transactionStatus, error } = useSelector(
    (state) => state.transactions
  )

  const [step, setStep] = useState(1)
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionComplete, setTransactionComplete] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState(null)

  // — inline phone normalizer — 
  const normalizePhone = (raw) => {
    let digits = (raw || "").replace(/\D/g, "")
    if (digits.startsWith("0")) digits = digits.slice(1)
    if (!digits.startsWith("254")) digits = "254" + digits
    return "+" + digits
  }

  // load beneficiaries + wallet
  useEffect(() => {
    if (user) {
      dispatch(fetchBeneficiaries(user.id))
      dispatch(fetchWalletBalance(user.id))
    }
  }, [dispatch, user])

  
  useEffect(() => {
    if (preSelectedBeneficiaryId && beneficiaries.length > 0) {
      const found = beneficiaries.find(
        (b) => b.id === +preSelectedBeneficiaryId
      )
      if (found) {
        setSelectedBeneficiary(found)
        setStep(2)
      }
    }
  }, [preSelectedBeneficiaryId, beneficiaries])

 
  const validateStep1 = () => {
    const errs = {}
    if (!selectedBeneficiary)
      errs.beneficiary = "Please select a beneficiary"
    setFormErrors(errs)
    return !Object.keys(errs).length
  }

  const validateStep2 = () => {
    const errs = {}
    const num = parseFloat(amount) || 0
    const fee = num * 0.01
    const total = num + fee

    if (!amount) errs.amount = "Amount is required"
    else if (isNaN(num)) errs.amount = "Amount must be a number"
    else if (num <= 0) errs.amount = "Amount must be greater than 0"
    else if (num < 100) errs.amount = "Minimum amount is KES 100"
    else if (wallet?.balance != null && total > wallet.balance)
      errs.amount = "Insufficient funds (including fee)"

    setFormErrors(errs)
    return !Object.keys(errs).length
  }

  // navigation
  const handleNextStep = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }
  const handlePreviousStep = () => setStep((s) => s - 1)

  // selection
  const handleBeneficiarySelect = (b) => {
    setSelectedBeneficiary(b)
    setFormErrors({})
  }

  // send
  const handleSendMoney = () => {
    setIsProcessing(true)
    const num = parseFloat(amount) || 0
    const toPhone = normalizePhone(selectedBeneficiary.phone)

    dispatch(
      sendMoney({
        userId: user.id,
        beneficiaryId: selectedBeneficiary.id,
        to: toPhone,
        amount: num,
        description:
          description || `Payment to ${selectedBeneficiary.name}`,
      })
    )
      .unwrap()
      .then((res) => {
        setIsProcessing(false)
        setTransactionComplete(true)
        setTransactionDetails(res.transaction)
        dispatch(fetchWalletBalance(user.id))
      })
      .catch(() => setIsProcessing(false))
  }

  const handleFinish = () => navigate("/dashboard")

  // loading
  if (
    beneficiariesStatus === "loading" ||
    walletStatus === "loading"
  )
    return <LoadingSpinner />

  // calculations
  const num = parseFloat(amount) || 0
  const fee = num * 0.01
  const total = num + fee

  // helper to format
  const fmt = (n) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  return (
    <div className="send-money-container">
      <h1>Send Money</h1>

      {wallet && <WalletCard wallet={wallet} />}

      <div className="stepper">
        {["Recipient", "Amount", "Confirm"].map((label, i) => (
          <div
            key={i}
            className={`step ${step >= i + 1 ? "active" : ""}`}
          >
            <div className="step-number">{i + 1}</div>
            <div className="step-label">{label}</div>
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="send-money-form">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="step-content">
            <h2>Select Recipient</h2>
            {beneficiaries.length > 0 ? (
              <div className="beneficiaries-selection">
                {beneficiaries.map((b) => (
                  <div
                    key={b.id}
                    className={`beneficiary-select-card ${
                      selectedBeneficiary?.id === b.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleBeneficiarySelect(b)}
                  >
                    <div className="beneficiary-avatar">
                      {b.name.charAt(0)}
                    </div>
                    <div className="beneficiary-info">
                      <h3>{b.name}</h3>
                      <p>{normalizePhone(b.phone)}</p>
                    </div>
                    {selectedBeneficiary?.id === b.id && (
                      <div className="selected-indicator">✓</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't added any beneficiaries yet.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/beneficiaries")}
                >
                  Add Beneficiary
                </button>
              </div>
            )}

            {formErrors.beneficiary && (
              <div className="error-message">
                {formErrors.beneficiary}
              </div>
            )}
            {beneficiaries.length > 0 && (
              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleNextStep}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="step-content">
            <h2>Enter Amount</h2>
            <div className="recipient-summary">
              <div className="beneficiary-avatar">
                {selectedBeneficiary.name.charAt(0)}
              </div>
              <div className="beneficiary-info">
                <h3>Sending to: {selectedBeneficiary.name}</h3>
                <p>{normalizePhone(selectedBeneficiary.phone)}</p>
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
              {formErrors.amount && (
                <span className="error">{formErrors.amount}</span>
              )}
            </div>
            <div className="fee-calculation">
              <div className="fee-row">
                <span>Amount:</span>
                <span>KES {fmt(num)}</span>
              </div>
              <div className="fee-row">
                <span>Fee (1%):</span>
                <span>KES {fmt(fee)}</span>
              </div>
              <div className="fee-row total">
                <span>Total:</span>
                <span>KES {fmt(total)}</span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="description">
                Description (Optional)
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this payment for?"
              />
            </div>
            <div className="form-actions">
              <button
                className="btn btn-outline"
                onClick={handlePreviousStep}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNextStep}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
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
                <span>{normalizePhone(selectedBeneficiary.phone)}</span>
              </div>
              <div className="detail-row">
                <span>Amount:</span>
                <span>KES {fmt(num)}</span>
              </div>
              <div className="detail-row">
                <span>Fee (1%):</span>
                <span>KES {fmt(fee)}</span>
              </div>
              <div className="detail-row total">
                <span>Total Amount:</span>
                <span>KES {fmt(total)}</span>
              </div>
              {description && (
                <div className="detail-row">
                  <span>Description:</span>
                  <span>{description}</span>
                </div>
              )}
            </div>
            <div className="form-actions">
              <button
                className="btn btn-outline"
                onClick={handlePreviousStep}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSendMoney}
                disabled={transactionStatus === "loading"}
              >
                Confirm & Send
              </button>
            </div>
          </div>
        )}

        {/* PROCESSING */}
        {isProcessing && (  
          <div className="step-content processing">
            <LoadingSpinner />
            <p>Processing transfer…</p>
          </div>
        )}

        {/* SUCCESS */}
        {transactionComplete && (
          <div className="step-content">
            <div className="success">
              <div className="success-icon">✓</div>
              <h2>Transfer Successful!</h2>
              <p>
                KES{" "}
                {fmt(
                  transactionDetails.amount ||
                    parseFloat(amount)
                ).toLocaleString()}{" "}
                has been sent successfully.
              </p>
              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleFinish}
                >
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
