import { convertAmountMinorForDisplay } from './currency.js'
import { buildDisplayExchangeRate, formatCurrencyAmount, formatIdrMinorForDisplay } from './price.js'

const BENEFIT_TYPE_LABELS = {
  en: {
    order_discount: 'Product discount',
    shipping_discount: 'Shipping discount',
    free_shipping: 'Free shipping',
  },
  id: {
    order_discount: 'Potongan harga produk',
    shipping_discount: 'Potongan ongkir',
    free_shipping: 'Gratis ongkir',
  },
}

export function formatVoucherBenefitTypeLabel(benefitType, language, fallback = '') {
  const labels = BENEFIT_TYPE_LABELS[language === 'en' ? 'en' : 'id'] || BENEFIT_TYPE_LABELS.id

  return labels[benefitType] || fallback || benefitType || ''
}

export function formatVoucherMinOrderLabel(entry, language, exchangeRate = null, storePromo = null) {
  if (entry?.min_order_label && language !== 'en') {
    return entry.min_order_label
  }

  const minOrderAmount =
    entry?.preview?.min_order_amount_minor ??
    entry?.min_order_amount_minor ??
    null

  if (minOrderAmount === null || minOrderAmount <= 0) {
    return language === 'en' ? 'No minimum' : 'Tanpa minimum'
  }

  if (language === 'en') {
    return `Min. ${formatIdrMinorForDisplay(minOrderAmount, language, exchangeRate, storePromo)}`
  }

  return entry?.min_order_label || `Min. ${formatCurrencyAmount(minOrderAmount, 'IDR', language)}`
}

export function formatVoucherDiscountAmount(
  amountMinor,
  sourceCurrency,
  language,
  exchangeRate = null,
  storePromo = null,
) {
  const normalizedAmount = Number(amountMinor)

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    return null
  }

  const displayCurrency = language === 'en' ? 'USD' : 'IDR'
  const rateMeta = buildDisplayExchangeRate(exchangeRate, storePromo)
  const displayAmount = convertAmountMinorForDisplay(
    normalizedAmount,
    sourceCurrency || 'IDR',
    displayCurrency,
    rateMeta,
  )

  return formatCurrencyAmount(displayAmount, displayCurrency, language)
}

export function formatVoucherSuccessMessage(preview, language, exchangeRate = null, storePromo = null) {
  const parts = []
  const sourceCurrency = preview?.currency || 'IDR'

  const productDiscount = formatVoucherDiscountAmount(
    preview?.order_discount_amount_minor,
    sourceCurrency,
    language,
    exchangeRate,
    storePromo,
  )

  if (productDiscount) {
    parts.push(language === 'en' ? `product -${productDiscount}` : `produk -${productDiscount}`)
  }

  const shippingDiscount = formatVoucherDiscountAmount(
    preview?.shipping_discount_amount_minor,
    sourceCurrency,
    language,
    exchangeRate,
    storePromo,
  )

  if (shippingDiscount) {
    parts.push(language === 'en' ? `shipping -${shippingDiscount}` : `ongkir -${shippingDiscount}`)
  }

  if (parts.length === 0) {
    const fallbackDiscount = formatVoucherDiscountAmount(
      preview?.discount_amount_minor,
      sourceCurrency,
      language,
      exchangeRate,
      storePromo,
    )

    if (fallbackDiscount) {
      parts.push(`-${fallbackDiscount}`)
    }
  }

  const detail =
    parts.length > 0
      ? parts.join(', ')
      : formatVoucherBenefitTypeLabel(preview?.benefit_type, language, preview?.benefit_type_label)

  return language === 'en' ? `Voucher applied: ${detail}` : `Voucher aktif: ${detail}`
}

export function formatVoucherListEntry(entry, language, exchangeRate = null, storePromo = null) {
  if (!entry) {
    return entry
  }

  return {
    ...entry,
    benefit_type_label: formatVoucherBenefitTypeLabel(
      entry.benefit_type || entry.preview?.benefit_type,
      language,
      entry.benefit_type_label,
    ),
    min_order_label: formatVoucherMinOrderLabel(entry, language, exchangeRate, storePromo),
  }
}
