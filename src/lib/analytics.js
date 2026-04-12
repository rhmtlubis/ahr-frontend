const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

export function initializeAnalytics() {
  if (!measurementId || typeof window === 'undefined') {
    return
  }

  if (window.gtag) {
    return
  }

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    page_path: window.location.pathname + window.location.search,
  })
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
