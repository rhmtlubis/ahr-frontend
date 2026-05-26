import { getApiUrl } from './api'

export async function fetchCheckoutTerms(locale = 'id') {
  const response = await fetch(getApiUrl(`/api/catalog/checkout-terms?locale=${locale}`), {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message || 'Gagal memuat syarat dan ketentuan')
  }

  const payload = await response.json()
  return payload?.data || null
}
