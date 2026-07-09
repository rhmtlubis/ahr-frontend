import axios from 'axios'
import { getCatalogLandingPageUrl, getDisplayCurrency } from './currency.js'

export {
  buildCatalogQuery,
  getCatalogLandingPageUrl,
  getCatalogProductUrl,
  getCatalogRelatedProductsUrl,
  getDisplayCurrency,
  getPaymentCurrency,
  getPreferredCurrency,
  getItemDisplayAmounts,
  getItemPaymentAmounts,
  getItemDisplayCurrency,
  formatExchangeRateNote,
  detectInitialLanguage,
} from './currency.js'

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
let csrfCookiePromise = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const skipLogout = Boolean(error?.config?.skipUnauthorizedHandler)
    const originalRequest = error?.config

    if (status === 419 && originalRequest && !originalRequest.__csrfRetried) {
      originalRequest.__csrfRetried = true
      csrfCookiePromise = null
      await ensureCsrfCookie()
      return apiClient.request(originalRequest)
    }

    if (status === 401 && !skipLogout) {
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
  if (!csrfCookiePromise) {
    csrfCookiePromise = apiClient.get('/sanctum/csrf-cookie').finally(() => {
      csrfCookiePromise = null
    })
  }

  await csrfCookiePromise
}

export async function fetchCatalogLandingPage(locale = 'id') {
  const response = await fetch(getApiUrl(getCatalogLandingPageUrl(locale)), {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to load landing page content')
  }

  return response.json()
}

export async function fetchCatalogPriceQuote({
  productSlug,
  quantity = 1,
  locale = 'id',
  currency = getDisplayCurrency(locale),
  expectedTotalAmountMinor,
}) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post(
      '/api/catalog/pricing/quote',
      {
        product_slug: productSlug,
        quantity,
        locale,
        currency,
        expected_total_amount_minor: expectedTotalAmountMinor,
      },
      { skipUnauthorizedHandler: true },
    )

    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal memvalidasi amount produk'))
  }
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

export async function listCatalogVouchers({
  items,
  locale,
  currency,
  fulfillment,
  shippingFeeAmountMinor,
}) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post(
      '/api/catalog/vouchers/available',
      {
        items,
        locale,
        currency,
        fulfillment,
        shipping_fee_amount_minor: shippingFeeAmountMinor,
      },
      { skipUnauthorizedHandler: true },
    )

    return response.data?.data || []
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal memuat daftar voucher'))
  }
}

export async function validateCatalogVoucher({
  voucherCode,
  items,
  locale,
  currency,
  fulfillment,
  shippingFeeAmountMinor,
}) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post(
      '/api/catalog/vouchers/validate',
      {
        voucher_code: voucherCode,
        items,
        locale,
        currency,
        fulfillment,
        shipping_fee_amount_minor: shippingFeeAmountMinor,
      },
      { skipUnauthorizedHandler: true },
    )

    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Voucher tidak valid'))
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

export async function fetchCatalogShippingCountries(locale = 'id') {
  const response = await fetch(getApiUrl(`/api/catalog/shipping/countries?locale=${locale}`), {
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.message || 'Gagal memuat daftar negara')
  }

  return payload?.data || []
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

export async function createPaymentTransaction(orderNumber, paymentAccessToken, options = {}) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post(`/api/catalog/orders/${orderNumber}/pay`, {
      token: paymentAccessToken,
      ...(options.paymentSource ? { payment_source: options.paymentSource } : {}),
    })
    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal membuat transaksi pembayaran'))
  }
}

export async function createPayPalOrder(orderNumber, paymentAccessToken) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post(`/api/catalog/orders/${orderNumber}/paypal/create-order`, {
      token: paymentAccessToken,
    })
    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal membuat order PayPal'))
  }
}

export async function capturePayPalOrder(orderNumber, paymentAccessToken, paypalOrderId) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post(`/api/catalog/orders/${orderNumber}/paypal/capture`, {
      token: paymentAccessToken,
      paypal_order_id: paypalOrderId,
    })
    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal menangkap pembayaran PayPal'))
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

export async function fetchOrderConversionContext(orderNumber, paymentAccessToken) {
  try {
    const response = await apiClient.get(`/api/catalog/orders/${orderNumber}/conversion-context`, {
      params: paymentAccessToken ? { token: paymentAccessToken } : undefined,
      headers: paymentAccessToken
        ? {
            'X-Payment-Access-Token': paymentAccessToken,
          }
        : undefined,
    })

    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal memuat konteks konversi'))
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
    const response = await apiClient.get('/api/customer/auth/me', { skipUnauthorizedHandler: true })

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

export async function fetchGuestOrder(orderNumber, paymentAccessToken) {
  if (!orderNumber || !paymentAccessToken) {
    throw new Error('Token akses pesanan tidak ditemukan.')
  }

  try {
    const response = await apiClient.get(`/api/catalog/orders/${encodeURIComponent(orderNumber)}`, {
      params: { token: paymentAccessToken },
      headers: {
        'X-Payment-Access-Token': paymentAccessToken,
      },
    })

    return response.data?.data || null
  } catch (error) {
    if (error?.response?.status === 422) {
      throw new Error(resolveApiError(error, 'Link pesanan tidak valid atau sudah kedaluwarsa.'))
    }

    throw new Error(resolveApiError(error, 'Gagal memuat detail pesanan'))
  }
}

export async function syncCustomerOrderShipment(orderNumber) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post(
      `/api/customer/auth/orders/${encodeURIComponent(orderNumber)}/shipment/sync`,
    )

    return response.data?.data || null
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return retryCustomerRequest(
        async () => {
          const response = await apiClient.post(
            `/api/customer/auth/orders/${encodeURIComponent(orderNumber)}/shipment/sync`,
          )

          return response.data?.data || null
        },
        'Gagal memperbarui status pengiriman',
      )
    }

    throw new Error(resolveApiError(error, 'Gagal memperbarui status pengiriman'))
  }
}

export async function createPaymentTransactionForCustomer(orderNumber, options = {}) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post(`/api/catalog/orders/${orderNumber}/pay`, {
      ...(options.paymentSource ? { payment_source: options.paymentSource } : {}),
    })
    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal membuat transaksi pembayaran'))
  }
}

export async function saveCatalogLead(payload) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post('/api/catalog/leads', payload)
    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal menyimpan lead'))
  }
}

export async function saveB2BLead(payload) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post('/api/b2b/leads', payload)
    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal menyimpan lead B2B'))
  }
}

export async function fetchProductReviews(productSlug) {
  try {
    const response = await apiClient.get(`/api/catalog/products/${productSlug}/reviews`)
    return Array.isArray(response.data?.data) ? response.data.data : []
  } catch {
    return []
  }
}

export async function fetchOrderReviewContext(orderNumber, paymentAccessToken) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.get(`/api/catalog/orders/${orderNumber}/reviews/context`, {
      params: paymentAccessToken ? { token: paymentAccessToken } : undefined,
      headers: paymentAccessToken ? { 'X-Payment-Access-Token': paymentAccessToken } : undefined,
    })

    return response.data?.data || { eligible: false, items: [] }
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal memuat form ulasan'))
  }
}

export async function submitProductReview(orderNumber, { orderItemId, rating, body, paymentAccessToken }) {
  await ensureCsrfCookie()

  try {
    const response = await apiClient.post(
      `/api/catalog/orders/${orderNumber}/reviews`,
      {
        order_item_id: orderItemId,
        rating,
        body,
        ...(paymentAccessToken ? { token: paymentAccessToken } : {}),
      },
      paymentAccessToken
        ? {
            headers: {
              'X-Payment-Access-Token': paymentAccessToken,
            },
          }
        : undefined,
    )

    return response.data?.data || null
  } catch (error) {
    throw new Error(resolveApiError(error, 'Gagal mengirim ulasan'))
  }
}
