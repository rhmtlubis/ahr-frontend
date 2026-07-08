import { getConsentPreferences } from './consent'
import { syncCssMetaPixelTracking, syncMetaPixelEcommerceEvent, syncMetaPixelStandardEvent } from './metaPixel'
import { isCssStore } from './storeConfig'

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID
const MAX_PENDING_GOOGLE_ADS_CONVERSIONS = 10
const googleAdsDefaultValueIdr = Number(import.meta.env.VITE_GOOGLE_ADS_CONVERSION_DEFAULT_VALUE_IDR) || 150000
const googleAdsConversions = {
  cart_checkout_order_saved: import.meta.env.VITE_GOOGLE_ADS_CONVERSION_CART_CHECKOUT_ORDER_SAVED,
  begin_checkout: import.meta.env.VITE_GOOGLE_ADS_CONVERSION_BEGIN_CHECKOUT,
  purchase: import.meta.env.VITE_GOOGLE_ADS_CONVERSION_PURCHASE,
  product_detail_whatsapp_click: import.meta.env.VITE_GOOGLE_ADS_CONVERSION_PRODUCT_DETAIL_WHATSAPP_CLICK,
  b2b_landing_lead_submitted: import.meta.env.VITE_GOOGLE_ADS_CONVERSION_B2B_LANDING_LEAD_SUBMITTED,
}
let analyticsInitialized = false
const pendingGoogleAdsConversions = []
let enhancedConversionData = null

function flushPendingGoogleAdsConversions() {
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  while (pendingGoogleAdsConversions.length > 0) {
    const { conversionLabel, params } = pendingGoogleAdsConversions.shift()
    window.gtag('event', 'conversion', buildGoogleAdsConversionParams(conversionLabel, params))
  }
}

function trackGoogleAdsConversion(conversionLabel, params = {}) {
  if (!googleAdsId || !conversionLabel || typeof window === 'undefined') {
    return
  }

  if (!window.gtag) {
    pendingGoogleAdsConversions.push({ conversionLabel, params })

    if (pendingGoogleAdsConversions.length > MAX_PENDING_GOOGLE_ADS_CONVERSIONS) {
      pendingGoogleAdsConversions.shift()
    }

    return
  }

  window.gtag('event', 'conversion', buildGoogleAdsConversionParams(conversionLabel, params))
}

function normalizeEnhancedEmail(email) {
  if (!email || typeof email !== 'string') {
    return null
  }

  const trimmed = email.trim().toLowerCase()

  return trimmed.includes('@') ? trimmed : null
}

function normalizeEnhancedPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return null
  }

  const digits = phone.replace(/\D/g, '')

  if (!digits) {
    return null
  }

  if (digits.startsWith('0')) {
    return `+62${digits.slice(1)}`
  }

  if (digits.startsWith('62')) {
    return `+${digits}`
  }

  return `+${digits}`
}

async function sha256Hex(value) {
  if (!value || typeof window === 'undefined' || !window.crypto?.subtle) {
    return null
  }

  const encoded = new TextEncoder().encode(value)
  const digest = await window.crypto.subtle.digest('SHA-256', encoded)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function setEnhancedConversionUserData({ email, phone } = {}) {
  const normalizedEmail = normalizeEnhancedEmail(email)
  const normalizedPhone = normalizeEnhancedPhone(phone)

  if (!normalizedEmail && !normalizedPhone) {
    return
  }

  const userData = {}

  if (normalizedEmail) {
    userData.email = await sha256Hex(normalizedEmail)
  }

  if (normalizedPhone) {
    userData.phone_number = await sha256Hex(normalizedPhone)
  }

  enhancedConversionData = userData

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_data', userData)
  }
}

function applyEnhancedConversionUserData() {
  if (!enhancedConversionData || typeof window === 'undefined' || !window.gtag) {
    return
  }

  window.gtag('set', 'user_data', enhancedConversionData)
}

export function initializeAnalytics() {
  if ((!measurementId && !googleAdsId) || typeof window === 'undefined') {
    return false
  }

  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments)
    }

  const scriptDatasetKey = measurementId || googleAdsId
  const existingScript =
    document.querySelector(`script[data-google-analytics="${scriptDatasetKey}"]`) ||
    document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${scriptDatasetKey}"]`)

  if (!existingScript) {
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500,
    })

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId || googleAdsId}`
    script.dataset.googleAnalytics = scriptDatasetKey
    document.head.appendChild(script)
  }

  if (analyticsInitialized) {
    return true
  }

  window.gtag('js', new Date())
  if (measurementId) {
    window.gtag('config', measurementId, {
      send_page_view: false,
    })
  }

  if (googleAdsId) {
    window.gtag('config', googleAdsId)
  }

  analyticsInitialized = true
  updateConsent(getConsentPreferences())
  applyEnhancedConversionUserData()

  return true
}

export function updateConsent(preferences = {}) {
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  window.gtag('consent', 'update', {
    ad_storage: preferences.analytics === 'accepted' ? 'granted' : 'denied',
    analytics_storage: preferences.analytics === 'accepted' ? 'granted' : 'denied',
    ad_user_data: preferences.analytics === 'accepted' ? 'granted' : 'denied',
    ad_personalization: preferences.analytics === 'accepted' ? 'granted' : 'denied',
  })

  // Google Ads conversion pings can still be sent under Consent Mode
  // (storage denied) for modeled reporting.
  flushPendingGoogleAdsConversions()

  if (isCssStore()) {
    syncCssMetaPixelTracking(preferences)
  }
}

function buildGoogleAdsConversionParams(conversionLabel, params = {}) {
  const conversionParams = {
    send_to: `${googleAdsId}/${conversionLabel}`,
    currency: params.currency || 'IDR',
  }

  if (params.value !== undefined && params.value !== null) {
    conversionParams.value = params.value
  } else {
    conversionParams.value = googleAdsDefaultValueIdr
  }

  if (params.transaction_id) {
    conversionParams.transaction_id = params.transaction_id
  }

  return conversionParams
}

function normalizeEcommerceValue(amountMinor, currency) {
  if (!Number.isFinite(amountMinor)) {
    return null
  }

  return String(currency || 'IDR').toUpperCase() === 'USD' ? amountMinor / 100 : amountMinor
}

export function getGaClientId() {
  if (typeof document === 'undefined') {
    return ''
  }

  const match = document.cookie.match(/(?:^|; )_ga=GA\d\.\d\.([^;]+)/)

  return match?.[1] || ''
}

export function buildGa4ItemFromProduct(product, quantity = 1) {
  if (!product) {
    return null
  }

  const currency = String(product?.pricing?.currency || 'IDR').toUpperCase()
  const amountMinor =
    product?.pricing?.final_amount_minor ??
    product?.pricing?.unit_net_amount_minor ??
    product?.base_price_amount_idr

  return {
    item_id: product.slug,
    item_name: product.name,
    item_category: product.category || undefined,
    quantity: Number(quantity) || 1,
    price: normalizeEcommerceValue(amountMinor, currency) ?? undefined,
  }
}

export function trackEcommerceEvent(eventName, params = {}) {
  if (typeof window === 'undefined') {
    return
  }

  const payload = {
    currency: params.currency || 'IDR',
    ...params,
  }

  if (window.gtag) {
    window.gtag('event', eventName, payload)
  }

  if (window.dataLayer) {
    window.dataLayer.push({ event: eventName, ...payload })
  }

  if (isCssStore()) {
    syncMetaPixelEcommerceEvent(eventName, payload)
  }
}

export function trackPurchaseConversion(context = {}) {
  if (!context?.transaction_id) {
    return
  }

  applyEnhancedConversionUserData()

  const params = {
    transaction_id: context.transaction_id,
    currency: context.currency || 'IDR',
    value: context.value ?? undefined,
    items: Array.isArray(context.items) ? context.items : undefined,
    source_page: '/payment/success',
    value_source: context.value_source || undefined,
  }

  trackEvent('purchase', params)
  trackEcommerceEvent('purchase', params)
}

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') {
    return
  }

  if (window.gtag) {
    const conversionLabel = googleAdsConversions[name]

    if (googleAdsId && conversionLabel) {
      trackGoogleAdsConversion(conversionLabel, params)
    }

    if (measurementId || !conversionLabel) {
      window.gtag('event', name, params)
    }
  }

  if (window.dataLayer) {
    window.dataLayer.push({ event: name, ...params })
  }

  if (isCssStore()) {
    syncMetaPixelStandardEvent(name, params)
  }
}

export function sanitizeAnalyticsPath(pathname, search = '') {
  if (!search) {
    return pathname
  }

  const params = new URLSearchParams(search)
  ;['token', 'auth', 'needs_phone', 'password', 'code'].forEach((key) => {
    params.delete(key)
  })

  const sanitizedSearch = params.toString()

  return sanitizedSearch ? `${pathname}?${sanitizedSearch}` : pathname
}

export function trackPageView(path = sanitizeAnalyticsPath(window.location.pathname, window.location.search)) {
  if (typeof window === 'undefined' || !window.gtag || !measurementId) {
    return
  }

  window.gtag('config', measurementId, {
    page_path: path,
  })
}

export function initializeAnalyticsAndTrackCurrentPage(
  path = sanitizeAnalyticsPath(window.location.pathname, window.location.search),
) {
  if (!initializeAnalytics()) {
    return false
  }

  updateConsent(getConsentPreferences())
  trackPageView(path)

  return true
}
