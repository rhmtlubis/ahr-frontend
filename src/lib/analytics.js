const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID
const googleAdsConversions = {
  cart_checkout_order_saved: import.meta.env.VITE_GOOGLE_ADS_CONVERSION_CART_CHECKOUT_ORDER_SAVED,
  product_detail_whatsapp_click: import.meta.env.VITE_GOOGLE_ADS_CONVERSION_PRODUCT_DETAIL_WHATSAPP_CLICK,
}
let analyticsInitialized = false

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
  const existingScript = document.querySelector(`script[data-google-analytics="${scriptDatasetKey}"]`)

  if (!existingScript) {
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
  return true
}

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') {
    return
  }

  if (window.gtag) {
    const conversionLabel = googleAdsConversions[name]

    window.gtag('event', name, {
      ...params,
      ...(googleAdsId && conversionLabel
        ? {
            send_to: `${googleAdsId}/${conversionLabel}`,
          }
        : {}),
    })
  }

  if (window.dataLayer) {
    window.dataLayer.push({ event: name, ...params })
  }
}

export function trackPageView(path = window.location.pathname + window.location.search) {
  if (typeof window === 'undefined' || !window.gtag || !measurementId) {
    return
  }

  window.gtag('config', measurementId, {
    page_path: path,
  })
}
