// frontend/src/hooks/useMpesaSocket.js

import { useEffect } from "react"
import { io } from "socket.io-client"
import { useDispatch, useSelector } from "react-redux"
import {
  stopPolling,
  clearError,
  fetchWalletBalance,
} from "../features/wallet/walletSlice"
import { fetchTransactions } from "../features/transactions/transactionsSlice"

export default function useMpesaSocket() {
  const dispatch = useDispatch()
  const { pendingCheckoutId } = useSelector((s) => s.wallet)

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"
    const socket = io(backendUrl, {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
    })

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
    })

    socket.on("mpesa_status", (msg) => {
      if (msg.checkoutRequestID === pendingCheckoutId) {
        // Stop polling and clear any errors
        dispatch(clearError())
        dispatch(stopPolling())
        // Refresh wallet balance and transaction history
        dispatch(fetchWalletBalance())
        dispatch(fetchTransactions())
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [dispatch, pendingCheckoutId])
}
