const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
let analyticsInitialized = false

export function initializeAnalytics() {
  if (!measurementId || typeof window === 'undefined') {
    return false
  }

  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments)
    }

  const existingScript = document.querySelector(`script[data-google-analytics="${measurementId}"]`)

  if (!existingScript) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    script.dataset.googleAnalytics = measurementId
    document.head.appendChild(script)
  }

  if (analyticsInitialized) {
    return true
  }

  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    send_page_view: false,
  })

  analyticsInitialized = true
  return true
}

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') {
    return
  }

  if (window.gtag) {
    window.gtag('event', name, params)
  }

  if (window.dataLayer) {
    window.dataLayer.push({ event: name, ...params })
  }
}

export function trackPageView(path = window.location.pathname + window.location.search) {
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  window.gtag('config', measurementId, {
    page_path: path,
  })
}
