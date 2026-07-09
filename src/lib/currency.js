export const PAYMENT_CURRENCY = 'IDR'

export function getDisplayCurrency(locale = 'id') {
  return locale === 'en' ? 'USD' : 'IDR'
}

export function getPaymentCurrency() {
  return PAYMENT_CURRENCY
}

/** @deprecated use getDisplayCurrency */
export function getPreferredCurrency(locale = 'id') {
  return getDisplayCurrency(locale)
}

export function buildCatalogQuery(locale = 'id', currency) {
  const params = new URLSearchParams({ locale })
  params.set('currency', currency || getDisplayCurrency(locale))

  return params.toString()
}

export function getCatalogLandingPageUrl(locale = 'id', currency) {
  return `/api/catalog/landing-page?${buildCatalogQuery(locale, currency)}`
}

export function getCatalogProductUrl(productSlug, locale = 'id', currency) {
  return `/api/catalog/products/${productSlug}?${buildCatalogQuery(locale, currency)}`
}

export function getCatalogRelatedProductsUrl(productSlug, locale = 'id', currency) {
  return `/api/catalog/products/${productSlug}/related?${buildCatalogQuery(locale, currency)}`
}

export function readLanguageFromUrl() {
  if (typeof window === 'undefined') {
    return null
  }

  const candidates = [
    new URLSearchParams(window.location.search),
  ]

  const hashQueryIndex = window.location.hash.indexOf('?')

  if (hashQueryIndex >= 0) {
    candidates.push(new URLSearchParams(window.location.hash.slice(hashQueryIndex + 1)))
  }

  for (const params of candidates) {
    const language = String(params.get('lang') || params.get('locale') || '').toLowerCase()

    if (language === 'id' || language === 'en') {
      return language
    }
  }

  return null
}

export function detectInitialLanguage() {
  const urlLanguage = readLanguageFromUrl()

  if (urlLanguage) {
    return urlLanguage
  }

  const storedLanguage = window.localStorage.getItem('ahr-language')

  if (storedLanguage === 'id' || storedLanguage === 'en') {
    return storedLanguage
  }

  return 'id'
}

export function getItemDisplayCurrency(pricing = {}, locale = 'id') {
  const displayCurrency = getDisplayCurrency(locale)

  if (displayCurrency === 'USD' && pricing.currency === 'USD' && !pricing.is_estimated) {
    return 'USD'
  }

  return pricing.source_currency || pricing.currency || displayCurrency
}

export function formatExchangeRateNote(exchangeRate, locale = 'id', payWithPayPal = false) {
  if (!exchangeRate?.value) {
    return null
  }

  const rate = Number(exchangeRate.value)

  if (!Number.isFinite(rate) || rate <= 0) {
    return null
  }

  const formattedRate = new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rate)

  if (payWithPayPal) {
    return locale === 'en'
      ? `USD total is converted from IDR at Rp ${formattedRate} / USD (Bank Indonesia reference), including display markup. You pay in USD via PayPal after placing your order.`
      : `Total USD dikonversi dari IDR dengan kurs Rp ${formattedRate} / USD (referensi Bank Indonesia), termasuk markup tampilan. Anda membayar dalam USD via PayPal setelah memesan.`
  }

  return locale === 'en'
    ? `USD prices are estimates converted from IDR at Rp ${formattedRate} / USD (Bank Indonesia reference). You pay in IDR at checkout.`
    : `Harga USD adalah estimasi konversi dari IDR dengan kurs Rp ${formattedRate} / USD (referensi Bank Indonesia). Pembayaran tetap dalam Rupiah.`
}

export function formatDisplayMarkupNote(markupPercent, locale = 'id') {
  const normalizedMarkup = Number(markupPercent)

  if (!Number.isFinite(normalizedMarkup) || normalizedMarkup <= 0) {
    return null
  }

  const formattedMarkup = new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(normalizedMarkup)

  return locale === 'en'
    ? `USD display prices include a ${formattedMarkup}% international display markup. Checkout is still charged in IDR.`
    : `Harga tampilan USD sudah termasuk markup internasional ${formattedMarkup}%. Pembayaran checkout tetap dalam Rupiah.`
}

function resolveRateMinor(exchangeRate) {
  const rateMinor = Number(exchangeRate?.rate_minor)

  if (Number.isFinite(rateMinor) && rateMinor > 0) {
    return rateMinor
  }

  const rate = Number(exchangeRate?.value)

  if (!Number.isFinite(rate) || rate <= 0) {
    return null
  }

  return Math.round(rate * 100)
}

function applyDisplayMarkup(amountMinor, markupPercent = 0) {
  const normalizedMarkup = Number(markupPercent)

  if (!Number.isFinite(normalizedMarkup) || normalizedMarkup <= 0) {
    return amountMinor
  }

  return Math.round(amountMinor * (1 + normalizedMarkup / 100))
}

/** Convert IDR minor units to USD cents using the same rounding as the backend PriceService. */
export function convertIdrMinorToUsdMinor(amountIdr, exchangeRate) {
  const normalizedAmount = Number(amountIdr)

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    return 0
  }

  const rateMinor = resolveRateMinor(exchangeRate)

  if (!rateMinor) {
    return 0
  }

  const converted = Math.floor(((normalizedAmount * 100 * 100) + (rateMinor / 2)) / rateMinor)
  const markupPercent =
    exchangeRate?.display_markup_percent ?? exchangeRate?.foreign_display_price_markup_percent ?? 0

  return applyDisplayMarkup(converted, markupPercent)
}

export function convertAmountMinorForDisplay(amountMinor, fromCurrency, toCurrency, exchangeRate) {
  const normalizedAmount = Number(amountMinor)

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    return 0
  }

  if (fromCurrency === toCurrency) {
    return normalizedAmount
  }

  if (fromCurrency === 'IDR' && toCurrency === 'USD') {
    return convertIdrMinorToUsdMinor(normalizedAmount, exchangeRate)
  }

  return normalizedAmount
}

export function getItemDisplayAmounts(pricing = {}, locale = 'id', exchangeRate = null) {
  const displayCurrency = getDisplayCurrency(locale)
  const currency = getItemDisplayCurrency(pricing, locale)
  const resolvedExchangeRate = pricing.exchange_rate || exchangeRate

  if (currency === 'USD' && pricing.currency === 'USD' && !pricing.is_estimated) {
    return {
      currency: 'USD',
      unitNetAmount: pricing.final_amount_minor ?? null,
      unitOriginalAmount: pricing.original_amount_minor ?? pricing.final_amount_minor ?? null,
    }
  }

  const sourceFinal = pricing.source_final_amount_minor ?? pricing.final_amount_minor ?? null
  const sourceOriginal =
    pricing.source_original_amount_minor ?? pricing.original_amount_minor ?? sourceFinal ?? null

  if (displayCurrency === 'USD' && resolvedExchangeRate) {
    return {
      currency: 'USD',
      unitNetAmount:
        sourceFinal !== null ? convertIdrMinorToUsdMinor(sourceFinal, resolvedExchangeRate) : null,
      unitOriginalAmount:
        sourceOriginal !== null ? convertIdrMinorToUsdMinor(sourceOriginal, resolvedExchangeRate) : null,
    }
  }

  return {
    currency: 'IDR',
    unitNetAmount: sourceFinal,
    unitOriginalAmount: sourceOriginal,
  }
}

/** Amounts sent to checkout API — always IDR minor units for Midtrans. */
export function getItemPaymentAmounts(pricing = {}) {
  return {
    currency: PAYMENT_CURRENCY,
    unitNetAmount: pricing.source_final_amount_minor ?? pricing.final_amount_minor ?? null,
    unitOriginalAmount:
      pricing.source_original_amount_minor ??
      pricing.original_amount_minor ??
      pricing.source_final_amount_minor ??
      null,
  }
}
