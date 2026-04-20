const CONSENT_COOKIE_NAME = 'ahr_consent_preferences'
const CONSENT_STORAGE_KEY = 'ahr_consent_preferences'
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

const defaultConsentPreferences = {
  analytics: 'unknown',
  personalization: 'unknown',
}

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function setCookie(name, value, maxAgeInSeconds = ONE_YEAR_IN_SECONDS) {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeInSeconds}; SameSite=Lax`
}

function getCookie(name) {
  if (typeof document === 'undefined') {
    return null
  }

  const prefix = `${name}=`
  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))

  return match ? decodeURIComponent(match.slice(prefix.length)) : null
}

function normalizeConsentValue(value) {
  return value === 'accepted' || value === 'rejected' ? value : 'unknown'
}

function normalizeConsentPreferences(value) {
  return {
    analytics: normalizeConsentValue(value?.analytics),
    personalization: normalizeConsentValue(value?.personalization),
  }
}

function readStoredConsentPreferences() {
  const cookieValue = getCookie(CONSENT_COOKIE_NAME)

  if (cookieValue) {
    try {
      return normalizeConsentPreferences(JSON.parse(cookieValue))
    } catch {
      return defaultConsentPreferences
    }
  }

  if (!canUseBrowserStorage()) {
    return defaultConsentPreferences
  }

  try {
    const storageValue = window.localStorage.getItem(CONSENT_STORAGE_KEY)

    if (!storageValue) {
      return defaultConsentPreferences
    }

    return normalizeConsentPreferences(JSON.parse(storageValue))
  } catch {
    return defaultConsentPreferences
  }
}

export function getConsentPreferences() {
  return readStoredConsentPreferences()
}

export function setConsentPreferences(nextPreferences) {
  const preferences = normalizeConsentPreferences(nextPreferences)
  const serialized = JSON.stringify(preferences)

  setCookie(CONSENT_COOKIE_NAME, serialized)

  if (!canUseBrowserStorage()) {
    return
  }

  window.localStorage.setItem(CONSENT_STORAGE_KEY, serialized)
}

export function hasAnalyticsConsent() {
  return getConsentPreferences().analytics === 'accepted'
}

export function hasPersonalizationConsent() {
  return getConsentPreferences().personalization === 'accepted'
}

export function isConsentPending() {
  const preferences = getConsentPreferences()

  return preferences.analytics === 'unknown' && preferences.personalization === 'unknown'
}
