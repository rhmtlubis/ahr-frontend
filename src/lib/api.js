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

let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      unauthorizedHandler?.(error)
    }

    return Promise.reject(error)
  },
)

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
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post('/api/catalog/orders', payload)
    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal menyimpan order'))
  }
}

export async function fetchCatalogShippingRates(payload) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post('/api/catalog/shipping/rates', payload)

    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal memuat opsi pengiriman'))
  }
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
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post(`/api/catalog/orders/${orderNumber}/pay`, {
      token: paymentAccessToken,
    })
    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal membuat transaksi pembayaran'))
  }
}

export async function fetchPaymentStatus(orderNumber, paymentAccessToken) {
  try {
    const response = await apiClient.get(`/api/catalog/orders/${orderNumber}/payment-status`, {
      headers: {
        'X-Payment-Access-Token': paymentAccessToken,
      },
    })
    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal memuat status pembayaran'))
  }
}

function resolveApiError(error, fallbackMessage) {
  const responsePayload = error?.response?.data
  const firstFieldError = Object.values(responsePayload?.errors || {}).flat()[0]

  if (typeof firstFieldError === 'string' && !firstFieldError.startsWith('validation.')) {
    return firstFieldError
  }

  return responsePayload?.message || error?.message || fallbackMessage
}

function parseApiFieldErrors(error) {
  const errors = error?.response?.data?.errors

  if (!errors || typeof errors !== 'object') {
    return {}
  }

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => {
      const message = Array.isArray(messages) ? messages[0] : messages

      return [field, typeof message === 'string' && message.startsWith('validation.') ? null : message]
    }).filter(([, message]) => message),
  )
}

function createApiError(error, fallbackMessage) {
  const apiError = new Error(resolveApiError(error, fallbackMessage))
  apiError.fieldErrors = parseApiFieldErrors(error)

  return apiError
}

function isUnauthorizedError(error) {
  return error?.response?.status === 401
}

async function retryCustomerRequest(request, fallbackMessage) {
  await ensureCsrfCookie()

  const currentCustomer = await fetchCurrentCustomer()

  if (!currentCustomer) {
    throw new Error('Unauthenticated.')
  }

  try {
    return await request()
  } catch (error) {
    throw new Error(resolveApiError(error, fallbackMessage))
  }
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

export async function loginCustomer({ email, password, remember = true }) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post('/api/customer/auth/login', {
      email,
      password,
      remember,
    })

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
    throw createApiError(error, 'Gagal menyimpan profil customer')
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

export async function fetchCustomerOrders() {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.get('/api/customer/auth/orders')
    return response.data?.data || []
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return retryCustomerRequest(
        async () => {
          const response = await apiClient.get('/api/customer/auth/orders')
          return response.data?.data || []
        },
        'Gagal memuat daftar pesanan',
      )
    }

    throw new Error(resolveApiError(error, 'Gagal memuat daftar pesanan'))
  }
}

export async function fetchCustomerOrder(orderNumber) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.get(`/api/customer/auth/orders/${encodeURIComponent(orderNumber)}`)
    return response.data?.data || null
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return retryCustomerRequest(
        async () => {
          const response = await apiClient.get(`/api/customer/auth/orders/${encodeURIComponent(orderNumber)}`)
          return response.data?.data || null
        },
        'Gagal memuat detail pesanan',
      )
    }

    if (error?.response?.status === 422) {
      throw new Error(resolveApiError(error, 'Pesanan tidak ditemukan.'))
    }

    throw new Error(resolveApiError(error, 'Gagal memuat detail pesanan'))
  }
}

export async function createPaymentTransactionForCustomer(orderNumber) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post(`/api/catalog/orders/${orderNumber}/pay`)
    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal membuat transaksi pembayaran'))
  }
}
