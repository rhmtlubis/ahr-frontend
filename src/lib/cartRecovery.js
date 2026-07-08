const CHECKOUT_ABANDONED_KEY = 'ahr-checkout-abandoned-v1'
const RECOVERY_DISMISSED_KEY = 'ahr-cart-recovery-dismissed-v1'

export function getCartFingerprint(items = []) {
  return items.map((item) => `${item.id}:${item.quantity}`).join('|')
}

export function markCheckoutAbandoned(items = []) {
  if (typeof sessionStorage === 'undefined' || items.length === 0) {
    return
  }

  try {
    sessionStorage.setItem(
      CHECKOUT_ABANDONED_KEY,
      JSON.stringify({
        fingerprint: getCartFingerprint(items),
        savedAt: Date.now(),
      }),
    )
  } catch {
    // Ignore storage errors.
  }
}

export function clearCheckoutAbandoned() {
  if (typeof sessionStorage === 'undefined') {
    return
  }

  sessionStorage.removeItem(CHECKOUT_ABANDONED_KEY)
}

export function readCheckoutAbandonedState() {
  if (typeof sessionStorage === 'undefined') {
    return null
  }

  try {
    const raw = sessionStorage.getItem(CHECKOUT_ABANDONED_KEY)

    if (!raw) {
      return null
    }

    const payload = JSON.parse(raw)

    if (!payload?.fingerprint) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function dismissCartRecoveryBanner(items = []) {
  if (typeof sessionStorage === 'undefined') {
    return
  }

  sessionStorage.setItem(RECOVERY_DISMISSED_KEY, getCartFingerprint(items))
}

export function isCartRecoveryDismissed(items = []) {
  if (typeof sessionStorage === 'undefined') {
    return false
  }

  return sessionStorage.getItem(RECOVERY_DISMISSED_KEY) === getCartFingerprint(items)
}

export function shouldShowCartRecoveryBanner(items = [], pathname = '') {
  if (!items.length) {
    return false
  }

  if (pathname.startsWith('/cart') || pathname.startsWith('/payment')) {
    return false
  }

  if (isCartRecoveryDismissed(items)) {
    return false
  }

  const abandoned = readCheckoutAbandonedState()

  if (!abandoned) {
    return false
  }

  return abandoned.fingerprint === getCartFingerprint(items)
}
