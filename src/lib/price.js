const LANGUAGE_TO_LOCALE = {
  id: 'id-ID',
  en: 'en-US',
}

function getNumberLocale(language = 'id') {
  return LANGUAGE_TO_LOCALE[language] || LANGUAGE_TO_LOCALE.id
}

function normalizeCurrencySpacing(value = '') {
  return value.replace(/\u00A0/g, ' ').replace(/^Rp(?=\S)/, 'Rp.').replace(/^Rp\s/, 'Rp. ')
}

function toMinorNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace(/[^\d.-]/g, '')

    if (!normalized) {
      return null
    }

    const parsed = Number(normalized)

    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function formatPriceFallback(value, currency, language) {
  if (typeof value !== 'string' || !value.trim()) {
    return null
  }

  const numericValue = toMinorNumber(value)

  if (numericValue === null) {
    return value
  }

  return formatCurrencyAmount(numericValue, currency, language)
}

export function formatCurrencyAmount(amountMinor, currency = 'IDR', language = 'id') {
  const normalizedAmountMinor = toMinorNumber(amountMinor)

  if (normalizedAmountMinor === null) {
    return null
  }

  const normalizedCurrency = currency === 'USD' ? 'USD' : 'IDR'
  const locale = getNumberLocale(language)

  if (normalizedCurrency === 'IDR') {
    const formattedInteger = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(normalizedAmountMinor)

    return `Rp.${formattedInteger}`
  }

  const formattedUsd = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(normalizedAmountMinor / 100)

  return normalizeCurrencySpacing(`$${formattedUsd}`)
}

export function getProductPriceDisplay(product, language = 'id') {
  const pricing = product?.pricing || {}
  const currentAmount = toMinorNumber(pricing.final_amount_minor)
  const originalAmount = toMinorNumber(pricing.original_amount_minor)
  const currency =
    (pricing.is_estimated ? pricing.source_currency : pricing.currency) ||
    pricing.source_currency ||
    (language === 'en' ? 'USD' : 'IDR')

  const currentPrice =
    formatCurrencyAmount(currentAmount, currency, language) ||
    formatPriceFallback(pricing.formatted_final, currency, language) ||
    formatPriceFallback(product?.bestPrice, currency, language) ||
    formatPriceFallback(product?.price, currency, language) ||
    pricing.formatted_final ||
    product?.bestPrice ||
    product?.price ||
    null
  const originalPrice =
    formatCurrencyAmount(originalAmount, currency, language) ||
    formatPriceFallback(pricing.formatted_original, currency, language) ||
    formatPriceFallback(product?.originalPrice, currency, language) ||
    pricing.formatted_original ||
    product?.originalPrice ||
    null
  const hasPromo = Boolean(
    (pricing.has_promo || product?.hasPromo) && currentPrice && originalPrice && currentPrice !== originalPrice,
  )
  const discountPercentage =
    Number.isFinite(currentAmount) && Number.isFinite(originalAmount) && originalAmount > currentAmount
      ? Math.round(((originalAmount - currentAmount) / originalAmount) * 100)
      : null

  return {
    currentPrice,
    originalPrice: hasPromo ? originalPrice : null,
    discountPercentage,
    promoLabel: discountPercentage ? `-${discountPercentage}%` : pricing.promo_badge || product?.promoBadge || null,
    hasPromo,
  }
}
