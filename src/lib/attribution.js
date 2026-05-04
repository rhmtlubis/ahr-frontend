const ATTRIBUTION_STORAGE_KEY = 'ahr_marketing_attribution'
const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'gbraid',
  'wbraid',
]

function getEmptyAttribution() {
  return ATTRIBUTION_KEYS.reduce((payload, key) => {
    payload[key] = ''
    return payload
  }, {})
}

function sanitizeAttribution(payload = {}) {
  return ATTRIBUTION_KEYS.reduce((normalized, key) => {
    normalized[key] = String(payload?.[key] || '').trim()
    return normalized
  }, getEmptyAttribution())
}

function hasAttributionValue(payload = {}) {
  return ATTRIBUTION_KEYS.some((key) => String(payload?.[key] || '').trim() !== '')
}

export function readStoredAttribution() {
  if (typeof window === 'undefined') {
    return getEmptyAttribution()
  }

  try {
    const rawValue = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)

    if (!rawValue) {
      return getEmptyAttribution()
    }

    return sanitizeAttribution(JSON.parse(rawValue))
  } catch {
    return getEmptyAttribution()
  }
}

export function getAttributionParams() {
  if (typeof window === 'undefined') {
    return getEmptyAttribution()
  }

  const searchParams = new URLSearchParams(window.location.search)
  const paramsFromUrl = ATTRIBUTION_KEYS.reduce((payload, key) => {
    payload[key] = searchParams.get(key) || ''
    return payload
  }, getEmptyAttribution())

  if (hasAttributionValue(paramsFromUrl)) {
    return paramsFromUrl
  }

  return readStoredAttribution()
}

export function captureMarketingAttribution() {
  if (typeof window === 'undefined') {
    return getEmptyAttribution()
  }

  const currentAttribution = getAttributionParams()

  if (!hasAttributionValue(currentAttribution)) {
    return currentAttribution
  }

  try {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(currentAttribution))
  } catch {
    return currentAttribution
  }

  return currentAttribution
}
