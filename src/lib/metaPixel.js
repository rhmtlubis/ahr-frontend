import { getConsentPreferences } from './consent'
import { isCssStore } from './storeConfig'

const loadedPixelIds = new Set()

export function getCssMetaPixelId() {
  return String(import.meta.env.VITE_META_PIXEL_CSS_ID || '').trim()
}

export function getAhrMetaPixelId() {
  return String(import.meta.env.VITE_META_PIXEL_AHR_ID || '').trim()
}

export function getActiveStoreMetaPixelId() {
  return isCssStore() ? getCssMetaPixelId() : getAhrMetaPixelId()
}

function canTrackStoreMetaPixel() {
  return (
    Boolean(getActiveStoreMetaPixelId()) &&
    getConsentPreferences().analytics === 'accepted' &&
    typeof window !== 'undefined'
  )
}

function ensureStoreMetaPixelReady() {
  if (!canTrackStoreMetaPixel()) {
    return false
  }

  initializeMetaPixel(getActiveStoreMetaPixelId())

  return Boolean(window.fbq)
}

function parseTrackingValue(value) {
  if (value === undefined || value === null) {
    return undefined
  }

  if (Number.isFinite(value)) {
    return value
  }

  const digits = String(value).replace(/[^\d]/g, '')

  return digits ? Number(digits) : undefined
}

function mapItemsToMetaContents(items = []) {
  return items
    .map((item) => {
      const id = item?.item_id || item?.id || item?.product_slug || item?.slug

      if (!id) {
        return null
      }

      const entry = {
        id: String(id),
        quantity: Number(item?.quantity) || 1,
      }

      const price = parseTrackingValue(item?.price)

      if (price !== undefined) {
        entry.item_price = price
      }

      return entry
    })
    .filter(Boolean)
}

function buildMetaCommerceParams(params = {}) {
  const items = Array.isArray(params.items) ? params.items : []
  const contents = mapItemsToMetaContents(items)
  const meta = {
    currency: String(params.currency || 'IDR').toUpperCase(),
    content_type: 'product',
  }

  if (contents.length > 0) {
    meta.contents = contents
    meta.content_ids = contents.map((entry) => entry.id)
    meta.num_items = contents.reduce((sum, entry) => sum + entry.quantity, 0)
  }

  const value = parseTrackingValue(params.value)

  if (value !== undefined) {
    meta.value = value
  }

  if (params.transaction_id) {
    meta.order_id = String(params.transaction_id)
  }

  if (items[0]?.item_name) {
    meta.content_name = items[0].item_name
  }

  return meta
}

export function initializeMetaPixel(pixelId) {
  if (!pixelId || typeof window === 'undefined' || loadedPixelIds.has(pixelId)) {
    return false
  }

  if (!window.fbq) {
    /* eslint-disable */
    ;(function (f, b, e, v, n, t, s) {
      if (f.fbq) return
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = !0
      n.version = '2.0'
      n.queue = []
      t = b.createElement(e)
      t.async = !0
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    /* eslint-enable */
  }

  window.fbq('init', pixelId)
  window.fbq('track', 'PageView')

  loadedPixelIds.add(pixelId)

  return true
}

export function trackMetaPixelEvent(eventName, params = {}, options = {}) {
  if (!eventName || typeof window === 'undefined') {
    return
  }

  const targetPixelId = String(options.pixelId || '').trim()

  if (targetPixelId) {
    initializeMetaPixel(targetPixelId)

    if (!window.fbq) {
      return
    }

    if (typeof window.fbq === 'function') {
      window.fbq('trackSingle', targetPixelId, eventName, params)
    }

    return
  }

  if (!ensureStoreMetaPixelReady()) {
    return
  }

  window.fbq('track', eventName, params)
}

export function syncMetaPixelEcommerceEvent(eventName, params = {}) {
  if (!ensureStoreMetaPixelReady()) {
    return
  }

  const metaParams = buildMetaCommerceParams(params)

  switch (eventName) {
    case 'add_to_cart':
      trackMetaPixelEvent('AddToCart', metaParams)
      break
    case 'view_item':
      trackMetaPixelEvent('ViewContent', metaParams)
      break
    case 'purchase':
      trackMetaPixelEvent('Purchase', metaParams)
      break
    default:
      break
  }
}

export function syncMetaPixelStandardEvent(eventName, params = {}) {
  if (!ensureStoreMetaPixelReady()) {
    return
  }

  switch (eventName) {
    case 'begin_checkout':
      trackMetaPixelEvent('InitiateCheckout', buildMetaCommerceParams(params))
      break
    case 'cart_checkout_order_saved':
      trackMetaPixelEvent('AddPaymentInfo', buildMetaCommerceParams(params))
      break
    case 'product_detail_whatsapp_click':
      trackMetaPixelEvent('Lead', {
        content_name: params.product_name || undefined,
        content_category: params.product_category || undefined,
        currency: 'IDR',
        value: parseTrackingValue(params.product_price),
      })
      break
    case 'b2b_landing_lead_submitted':
      trackMetaPixelEvent('Lead', {
        content_name: 'B2B Landing Lead',
        content_category: params.buyer_type || 'b2b',
        currency: 'IDR',
      })
      break
    default:
      break
  }
}

export function syncStoreMetaPixelTracking(consentPreferences = {}) {
  const pixelId = getActiveStoreMetaPixelId()

  if (!pixelId || consentPreferences.analytics !== 'accepted') {
    return false
  }

  const isNew = initializeMetaPixel(pixelId)

  if (!isNew && window.fbq) {
    window.fbq('track', 'PageView')
  }

  return true
}

/** @deprecated Prefer syncStoreMetaPixelTracking */
export function syncCssMetaPixelTracking(consentPreferences = {}) {
  if (!isCssStore()) {
    return false
  }

  return syncStoreMetaPixelTracking(consentPreferences)
}
