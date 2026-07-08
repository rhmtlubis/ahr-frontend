import { getApiUrl } from './api'

let cachedPromo = null
let inflightRequest = null

export async function fetchStorePromo() {
  if (cachedPromo) {
    return cachedPromo
  }

  if (inflightRequest) {
    return inflightRequest
  }

  inflightRequest = fetch(getApiUrl('/api/catalog/store-promo'), {
    headers: {
      Accept: 'application/json',
    },
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((payload) => {
      cachedPromo = payload?.data || {
        free_shipping_threshold_enabled: false,
        free_shipping_threshold_amount_minor: null,
      }

      return cachedPromo
    })
    .catch(() => {
      cachedPromo = {
        free_shipping_threshold_enabled: false,
        free_shipping_threshold_amount_minor: null,
      }

      return cachedPromo
    })
    .finally(() => {
      inflightRequest = null
    })

  return inflightRequest
}

export function getFreeShippingThresholdDiscount({
  storePromo,
  cartTotals,
  fulfillment = 'delivery',
  existingShippingDiscountAmount = 0,
  shippingAmount = 0,
}) {
  const threshold = storePromo?.free_shipping_threshold_amount_minor

  if (!storePromo?.free_shipping_threshold_enabled || !Number.isFinite(threshold) || threshold <= 0) {
    return 0
  }

  if (fulfillment !== 'delivery' || cartTotals?.currency !== 'IDR' || !Number.isFinite(cartTotals?.netAmount)) {
    return 0
  }

  if (cartTotals.netAmount < threshold) {
    return 0
  }

  const shippingFee = Math.max(Number(shippingAmount) || 0, 0)
  const existingDiscount = Math.max(Number(existingShippingDiscountAmount) || 0, 0)

  if (shippingFee <= 0 || existingDiscount >= shippingFee) {
    return 0
  }

  return shippingFee - existingDiscount
}

export function getFreeShippingProgress({ storePromo, cartTotals, fulfillment = 'delivery' }) {
  const threshold = storePromo?.free_shipping_threshold_amount_minor

  if (!storePromo?.free_shipping_threshold_enabled || !Number.isFinite(threshold) || threshold <= 0) {
    return null
  }

  if (fulfillment !== 'delivery' || cartTotals?.currency !== 'IDR' || !Number.isFinite(cartTotals?.netAmount)) {
    return null
  }

  const remaining = Math.max(threshold - cartTotals.netAmount, 0)
  const progress = Math.min(100, Math.round((cartTotals.netAmount / threshold) * 100))

  return {
    threshold,
    current: cartTotals.netAmount,
    remaining,
    progress,
    qualified: remaining === 0,
  }
}
