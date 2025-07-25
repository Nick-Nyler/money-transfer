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
    // connect to your backend SocketIO endpoint
    const socket = io(import.meta.env.VITE_API_URL, {
      path: "/socket.io",
      transports: ["websocket"],
    })

    socket.on("mpesa_status", (msg) => {
      if (msg.checkoutRequestID === pendingCheckoutId) {
        // stop any polling, clear errors, refresh data
        dispatch(clearError())
        dispatch(stopPolling())
        dispatch(fetchWalletBalance())
        dispatch(fetchTransactions())
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [dispatch, pendingCheckoutId])
}
