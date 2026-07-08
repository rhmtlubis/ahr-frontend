const PURCHASE_CONTEXT_KEY = 'ahr-purchase-context-v1'
const PURCHASE_TRACKED_PREFIX = 'ahr-purchase-tracked:'
const MAX_CONTEXT_AGE_MS = 7 * 24 * 60 * 60 * 1000

function normalizeGoogleAdsConversionValue(amountMinor, currency) {
  if (!Number.isFinite(amountMinor)) {
    return null
  }

  return String(currency || 'IDR').toUpperCase() === 'USD' ? amountMinor / 100 : amountMinor
}

function resolveItemUnitPrice(item, language) {
  const currency = String(item?.product?.pricing?.currency || 'IDR').toUpperCase()
  const amountMinor =
    item?.product?.pricing?.final_amount_minor ??
    item?.product?.pricing?.unit_net_amount_minor ??
    item?.product?.base_price_amount_idr

  if (!Number.isFinite(amountMinor)) {
    return null
  }

  return normalizeGoogleAdsConversionValue(amountMinor, currency)
}

function buildGa4ItemsFromCartItems(cartItems = []) {
  return cartItems
    .map((item) => {
      const price = resolveItemUnitPrice(item)

      return {
        item_id: item?.product?.slug || item?.id,
        item_name: item?.product?.name || 'Product',
        item_category: item?.product?.category || undefined,
        quantity: Number(item?.quantity) || 1,
        price: price ?? undefined,
      }
    })
    .filter((entry) => entry.item_id)
}

function buildGa4ItemsFromApiItems(items = []) {
  return items
    .map((item) => ({
      item_id: item?.item_id,
      item_name: item?.item_name || 'Product',
      item_category: item?.item_category || undefined,
      quantity: Number(item?.quantity) || 1,
      price: Number.isFinite(item?.price) ? item.price : undefined,
    }))
    .filter((entry) => entry.item_id)
}

export function resolveCheckoutConversionValue(savedOrder) {
  const orderCurrency = String(savedOrder?.summary?.currency || 'IDR').toUpperCase()
  const orderNetAmountMinor =
    savedOrder?.summary?.grand_total_amount_minor ?? savedOrder?.summary?.net_total_amount_minor

  if (Number.isFinite(orderNetAmountMinor)) {
    return {
      currency: orderCurrency,
      value: normalizeGoogleAdsConversionValue(orderNetAmountMinor, orderCurrency),
      source: 'order_total',
    }
  }

  return {
    currency: 'IDR',
    value: null,
    source: 'unknown',
  }
}

export function buildPurchaseContext(savedOrder, cartItems = [], customer = {}) {
  const conversion = resolveCheckoutConversionValue(savedOrder)
  const orderNumber = savedOrder?.order_number

  if (!orderNumber) {
    return null
  }

  return {
    orderNumber,
    transaction_id: orderNumber,
    currency: conversion.currency,
    value: conversion.value,
    value_source: conversion.source,
    items: buildGa4ItemsFromCartItems(cartItems),
    customer: {
      email: customer?.email || savedOrder?.customer?.email || null,
      phone: customer?.phone || savedOrder?.customer?.phone || null,
    },
    savedAt: Date.now(),
  }
}

export function buildPurchaseContextFromApi(payload = {}) {
  const orderNumber = payload?.transaction_id

  if (!orderNumber) {
    return null
  }

  const currency = String(payload?.currency || 'IDR').toUpperCase()

  return {
    orderNumber,
    transaction_id: orderNumber,
    currency,
    value: normalizeGoogleAdsConversionValue(payload?.value_minor, currency),
    value_source: 'order_api',
    items: buildGa4ItemsFromApiItems(payload?.items),
    customer: {
      email: payload?.customer?.email || null,
      phone: payload?.customer?.phone || null,
    },
    savedAt: Date.now(),
  }
}

export async function resolvePurchaseContext(orderNumber, { getStoredContext, getPaymentToken, fetchConversionContext }) {
  const storedContext = getStoredContext?.(orderNumber)

  if (storedContext) {
    return storedContext
  }

  const paymentAccessToken = getPaymentToken?.(orderNumber)

  if (!paymentAccessToken || !fetchConversionContext) {
    return null
  }

  try {
    const payload = await fetchConversionContext(orderNumber, paymentAccessToken)

    return buildPurchaseContextFromApi(payload)
  } catch {
    return null
  }
}

export function savePurchaseContext(context) {
  if (!context?.orderNumber || typeof sessionStorage === 'undefined') {
    return
  }

  try {
    sessionStorage.setItem(PURCHASE_CONTEXT_KEY, JSON.stringify(context))
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function getPurchaseContext(orderNumber) {
  if (!orderNumber || typeof sessionStorage === 'undefined') {
    return null
  }

  try {
    const raw = sessionStorage.getItem(PURCHASE_CONTEXT_KEY)

    if (!raw) {
      return null
    }

    const context = JSON.parse(raw)

    if (context?.orderNumber !== orderNumber) {
      return null
    }

    if (context?.savedAt && Date.now() - context.savedAt > MAX_CONTEXT_AGE_MS) {
      clearPurchaseContext()
      return null
    }

    return context
  } catch {
    return null
  }
}

export function clearPurchaseContext() {
  if (typeof sessionStorage === 'undefined') {
    return
  }

  sessionStorage.removeItem(PURCHASE_CONTEXT_KEY)
}

export function isPurchaseTracked(orderNumber) {
  if (!orderNumber || typeof localStorage === 'undefined') {
    return false
  }

  return localStorage.getItem(`${PURCHASE_TRACKED_PREFIX}${orderNumber}`) === '1'
}

export function markPurchaseTracked(orderNumber) {
  if (!orderNumber || typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(`${PURCHASE_TRACKED_PREFIX}${orderNumber}`, '1')
}
