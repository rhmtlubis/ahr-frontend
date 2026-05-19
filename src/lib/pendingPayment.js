const STORAGE_KEY = 'ahr-pending-payment-v1'
const MAX_PENDING_AGE_MS = 24 * 60 * 60 * 1000

export function savePendingPayment(orderNumber, paymentAccessToken) {
  if (!orderNumber || !paymentAccessToken) {
    return
  }

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      orderNumber,
      paymentAccessToken,
      savedAt: Date.now(),
    }),
  )
}

export function getPendingPayment(orderNumber) {
  if (!orderNumber) {
    return null
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    const payload = JSON.parse(raw)

    if (payload?.orderNumber !== orderNumber || !payload?.paymentAccessToken) {
      return null
    }

    if (payload?.savedAt && Date.now() - payload.savedAt > MAX_PENDING_AGE_MS) {
      clearPendingPayment()

      return null
    }

    return payload
  } catch {
    return null
  }
}

export function clearPendingPayment() {
  sessionStorage.removeItem(STORAGE_KEY)
}
