import { useCallback, useEffect, useRef, useState } from 'react'
import { createPaymentTransaction, createPaymentTransactionForCustomer } from './api'

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || ''
const MIDTRANS_IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
const MIDTRANS_SNAP_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

let snapScriptLoaded = false
let snapScriptLoading = false
const snapLoadCallbacks = []

function loadSnapScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'))
      return
    }

    if (window.snap) {
      resolve(window.snap)
      return
    }

    if (snapScriptLoaded) {
      resolve(window.snap)
      return
    }

    snapLoadCallbacks.push({ resolve, reject })

    if (snapScriptLoading) {
      return
    }

    snapScriptLoading = true

    const script = document.createElement('script')
    script.src = MIDTRANS_SNAP_URL
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY)
    script.async = true

    script.onload = () => {
      snapScriptLoaded = true
      snapScriptLoading = false
      snapLoadCallbacks.forEach((cb) => cb.resolve(window.snap))
      snapLoadCallbacks.length = 0
    }

    script.onerror = () => {
      snapScriptLoading = false
      const error = new Error('Failed to load Midtrans Snap.js')
      snapLoadCallbacks.forEach((cb) => cb.reject(error))
      snapLoadCallbacks.length = 0
    }

    document.head.appendChild(script)
  })
}

export function useMidtransPayment() {
  const snapRef = useRef(null)
  const [isSnapReady, setIsSnapReady] = useState(false)

  useEffect(() => {
    if (!MIDTRANS_CLIENT_KEY) {
      console.warn('VITE_MIDTRANS_CLIENT_KEY is not set. Payment will not work.')
      return
    }

    loadSnapScript()
      .then((snap) => {
        snapRef.current = snap
        setIsSnapReady(true)
      })
      .catch((error) => {
        console.error('Failed to load Midtrans Snap:', error)
        setIsSnapReady(false)
      })
  }, [])

  const payOrder = useCallback(async (orderNumber, paymentAccessToken, callbacks = {}) => {
    const { onSuccess, onPending, onError, onClose } = callbacks

    try {
      const transaction = paymentAccessToken
        ? await createPaymentTransaction(orderNumber, paymentAccessToken)
        : await createPaymentTransactionForCustomer(orderNumber)

      if (!transaction?.snap_token) {
        throw new Error('Snap token tidak tersedia')
      }

      if (!snapRef.current) {
        snapRef.current = await loadSnapScript()
      }

      if (!snapRef.current) {
        throw new Error('Midtrans Snap belum dimuat. Silakan refresh halaman.')
      }

      snapRef.current.pay(transaction.snap_token, {
        onSuccess: (result) => {
          if (onSuccess) onSuccess(result)
        },
        onPending: (result) => {
          if (onPending) onPending(result)
        },
        onError: (result) => {
          if (onError) onError(result)
        },
        onClose: () => {
          if (onClose) onClose()
        },
      })

      return transaction
    } catch (error) {
      if (onError) onError({ message: error.message })
      throw error
    }
  }, [])

  return {
    payOrder,
    isSnapReady,
  }
}
