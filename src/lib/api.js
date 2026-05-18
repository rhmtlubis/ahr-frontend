import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

export function getApiUrl(path) {
  return `${apiBaseUrl}${path}`
}

export function getBackendUrl(path) {
  if (apiBaseUrl) {
    return `${apiBaseUrl}${path}`
  }

  return `http://127.0.0.1:8000${path}`
}

export async function ensureCsrfCookie() {
  await apiClient.get('/sanctum/csrf-cookie')
}

export function getPreferredCurrency(locale = 'id') {
  return locale === 'en' ? 'USD' : 'IDR'
}

export async function fetchCatalogPriceQuote({
  productSlug,
  quantity = 1,
  locale = 'id',
  currency = getPreferredCurrency(locale),
  expectedTotalAmountMinor,
}) {
  const response = await fetch(getApiUrl('/api/catalog/pricing/quote'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      product_slug: productSlug,
      quantity,
      locale,
      currency,
      expected_total_amount_minor: expectedTotalAmountMinor,
    }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message || 'Gagal memvalidasi amount produk')
  }

  const payload = await response.json()

  return payload?.data || null
}

export async function saveCatalogOrder(payload) {
  const response = await fetch(getApiUrl('/api/catalog/orders'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responsePayload = await response.json().catch(() => null)

  if (!response.ok) {
    const errorMessage =
      responsePayload?.message ||
      Object.values(responsePayload?.errors || {}).flat()[0] ||
      'Gagal menyimpan order'

    throw new Error(errorMessage)
  }

  return responsePayload?.data || null
}

async function fetchCatalogLocationOptions(path, params = {}) {
  const searchParams = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
  const response = await fetch(getApiUrl(`${path}${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`), {
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.message || 'Gagal memuat data wilayah')
  }

  return payload?.data || []
}

export function fetchCatalogProvinces() {
  return fetchCatalogLocationOptions('/api/catalog/locations/provinces')
}

export function fetchCatalogCities(provinceCode) {
  return fetchCatalogLocationOptions('/api/catalog/locations/cities', { province_code: provinceCode })
}

export function fetchCatalogDistricts(cityCode) {
  return fetchCatalogLocationOptions('/api/catalog/locations/districts', { city_code: cityCode })
}

export async function createPaymentTransaction(orderNumber, paymentAccessToken) {
  const searchParams = new URLSearchParams({ token: paymentAccessToken })

  const response = await fetch(getApiUrl(`/api/catalog/orders/${orderNumber}/pay?${searchParams.toString()}`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  const responsePayload = await response.json().catch(() => null)

  if (!response.ok) {
    const errorMessage =
      responsePayload?.message ||
      Object.values(responsePayload?.errors || {}).flat()[0] ||
      'Gagal membuat transaksi pembayaran'

    throw new Error(errorMessage)
  }

  return responsePayload?.data || null
}

export async function fetchPaymentStatus(orderNumber, paymentAccessToken) {
  const searchParams = new URLSearchParams({ token: paymentAccessToken })

  const response = await fetch(getApiUrl(`/api/catalog/orders/${orderNumber}/payment-status?${searchParams.toString()}`), {
    headers: {
      Accept: 'application/json',
    },
  })

  const responsePayload = await response.json().catch(() => null)

  if (!response.ok) {
    const errorMessage =
      responsePayload?.message ||
      Object.values(responsePayload?.errors || {}).flat()[0] ||
      'Gagal memuat status pembayaran'

    throw new Error(errorMessage)
  }

  return responsePayload?.data || null
}

function resolveApiError(error, fallbackMessage) {
  const responsePayload = error?.response?.data

  return (
    responsePayload?.message ||
    Object.values(responsePayload?.errors || {}).flat()[0] ||
    error?.message ||
    fallbackMessage
  )
}

export async function fetchCurrentCustomer() {
  try {
    const response = await apiClient.get('/api/customer/auth/me')

    return response.data?.data || null
  } catch (error) {
    if (error?.response?.status === 401) {
      return null
    }

    throw new Error(resolveApiError(error, 'Gagal memuat sesi customer'))
  }
}

export async function registerCustomer(payload) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post('/api/customer/auth/register', payload)

    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal membuat akun customer'))
  }
}

export async function loginCustomer(payload) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post('/api/customer/auth/login', payload)

    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal login customer'))
  }
}

export async function updateCustomerProfile(payload) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.put('/api/customer/auth/profile', payload)

    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal menyimpan profil customer'))
  }
}

export async function logoutCustomer() {
  await ensureCsrfCookie()

  try {
    await apiClient.post('/api/customer/auth/logout')
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal logout customer'))
  }
}
