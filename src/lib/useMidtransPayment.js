import { useCallback, useEffect, useRef, useState } from 'react'
import { createPaymentTransaction, createPaymentTransactionForCustomer } from './api'

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || ''
const MIDTRANS_IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
/** @type {'id' | 'en'} */
const MIDTRANS_SNAP_LANGUAGE = import.meta.env.VITE_MIDTRANS_SNAP_LANGUAGE === 'en' ? 'en' : 'id'
const MIDTRANS_SNAP_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

const SNAP_OPEN_GRACE_MS = 400
const SNAP_PAY_MAX_ATTEMPTS = 2

let snapScriptLoaded = false
let snapScriptLoading = false
let loadedSnapClientKey = ''
let loadedSnapIsProduction = null
const snapLoadCallbacks = []

function resetSnapScript() {
  snapScriptLoaded = false
  snapScriptLoading = false
  loadedSnapClientKey = ''
  loadedSnapIsProduction = null
  delete window.snap

  document
    .querySelectorAll('script[src*="midtrans.com/snap/snap.js"]')
    .forEach((script) => script.remove())
}

export function loadMidtransSnapScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'))
      return
    }

    if (!MIDTRANS_CLIENT_KEY) {
      reject(new Error('Midtrans client key belum dikonfigurasi'))
      return
    }

    const snapEnvironmentChanged =
      loadedSnapClientKey !== MIDTRANS_CLIENT_KEY
      || loadedSnapIsProduction !== MIDTRANS_IS_PRODUCTION

    if (snapEnvironmentChanged) {
      resetSnapScript()
    }

    if (window.snap && snapScriptLoaded) {
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
      loadedSnapClientKey = MIDTRANS_CLIENT_KEY
      loadedSnapIsProduction = MIDTRANS_IS_PRODUCTION
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

export function preloadMidtransSnap() {
  if (!MIDTRANS_CLIENT_KEY || typeof window === 'undefined') {
    return Promise.resolve(null)
  }

  return loadMidtransSnapScript().catch(() => null)
}

function waitForNextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve)
    })
  })
}

async function fetchPaymentTransaction(orderNumber, paymentAccessToken, paymentSource) {
  const options = paymentSource ? { paymentSource } : {}

  return paymentAccessToken
    ? createPaymentTransaction(orderNumber, paymentAccessToken, options)
    : createPaymentTransactionForCustomer(orderNumber, options)
}

function resolveSnapLanguage(transaction) {
  return transaction.snap_language === 'en' || transaction.snap_language === 'id'
    ? transaction.snap_language
    : MIDTRANS_SNAP_LANGUAGE
}

function invokeSnapPay(snap, snapToken, snapLanguage, callbacks = {}) {
  const { onSuccess, onPending, onError, onClose } = callbacks

  return new Promise((resolve) => {
    let settled = false
    let snapOpened = false
    const payStartedAt = Date.now()

    const settle = (outcome) => {
      if (settled) {
        return
      }

      settled = true
      clearTimeout(openTimer)
      resolve(outcome)
    }

    const openTimer = setTimeout(() => {
      snapOpened = true
    }, SNAP_OPEN_GRACE_MS)

    snap.pay(snapToken, {
      language: snapLanguage,
      onSuccess: (result) => {
        onSuccess?.(result)
        settle({ type: 'success', result })
      },
      onPending: (result) => {
        onPending?.(result)
        settle({ type: 'pending', result })
      },
      onError: (result) => {
        onError?.(result)
        settle({ type: 'error', result })
      },
      onClose: () => {
        const elapsed = Date.now() - payStartedAt
        const closedBeforeOpen = !snapOpened || elapsed < SNAP_OPEN_GRACE_MS

        if (closedBeforeOpen) {
          settle({ type: 'close_before_open' })
          return
        }

        onClose?.()
        settle({ type: 'close' })
      },
    })
  })
}

export function useMidtransPayment({ preload = false } = {}) {
  const snapRef = useRef(null)
  const [isSnapReady, setIsSnapReady] = useState(Boolean(MIDTRANS_CLIENT_KEY))

  const ensureSnapLoaded = useCallback(async () => {
    if (!snapRef.current) {
      snapRef.current = await loadMidtransSnapScript()
      setIsSnapReady(true)
    }

    if (!snapRef.current) {
      throw new Error('Midtrans Snap belum dimuat. Silakan refresh halaman.')
    }

    return snapRef.current
  }, [])

  useEffect(() => {
    if (!preload) {
      return
    }

    preloadMidtransSnap()
      .then((snap) => {
        if (snap) {
          snapRef.current = snap
          setIsSnapReady(true)
        }
      })
      .catch(() => {})
  }, [preload])

  const payOrder = useCallback(async (orderNumber, paymentAccessToken, callbacks = {}, options = {}) => {
    const { onError } = callbacks
    const paymentSource = options.paymentSource || null

    try {
      const snap = await ensureSnapLoaded()
      await waitForNextPaint()

      let transaction = await fetchPaymentTransaction(orderNumber, paymentAccessToken, paymentSource)

      if (!transaction?.snap_token) {
        throw new Error('Snap token tidak tersedia')
      }

      for (let attempt = 0; attempt < SNAP_PAY_MAX_ATTEMPTS; attempt += 1) {
        if (attempt > 0) {
          transaction = await fetchPaymentTransaction(orderNumber, paymentAccessToken, paymentSource)

          if (!transaction?.snap_token) {
            throw new Error('Snap token tidak tersedia')
          }

          await waitForNextPaint()
        }

        const snapLanguage = resolveSnapLanguage(transaction)
        const outcome = await invokeSnapPay(snap, transaction.snap_token, snapLanguage, callbacks)

        if (outcome.type !== 'close_before_open') {
          return transaction
        }
      }

      throw new Error('Midtrans Snap tidak dapat dibuka. Silakan coba lagi dari detail pesanan.')
    } catch (error) {
      onError?.({ message: error.message })
      throw error
    }
  }, [ensureSnapLoaded])

  return {
    payOrder,
    isSnapReady,
    preloadSnap: ensureSnapLoaded,
  }
}
