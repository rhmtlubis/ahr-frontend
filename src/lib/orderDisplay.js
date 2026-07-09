import { convertIdrMinorToUsdMinor } from './currency.js'
import { formatCurrencyAmount } from './price.js'

export function getPaymentChannelLabel(checkoutChannel, language = 'id') {
  switch (checkoutChannel) {
    case 'paypal':
      return 'PayPal'
    case 'midtrans':
      return 'Midtrans'
    case 'whatsapp':
      return 'WhatsApp'
    default:
      return checkoutChannel || null
  }
}

export function buildOrderExchangeRateMeta(exchangeRateMeta, storePromo) {
  if (!exchangeRateMeta && !storePromo) {
    return null
  }

  return {
    ...(exchangeRateMeta || {}),
    display_markup_percent:
      storePromo?.foreign_display_price_markup_percent ??
      exchangeRateMeta?.display_markup_percent ??
      exchangeRateMeta?.foreign_display_price_markup_percent ??
      0,
  }
}

export function resolveStoredAmountDisplayMinor(
  amountMinor,
  sourceCurrency,
  language,
  exchangeRateMeta,
  storePromo,
) {
  if (amountMinor === null || amountMinor === undefined) {
    return { amountMinor: null, currency: language === 'en' ? 'USD' : 'IDR' }
  }

  if (language !== 'en') {
    return { amountMinor, currency: sourceCurrency || 'IDR' }
  }

  const normalizedCurrency = sourceCurrency || 'IDR'

  if (normalizedCurrency === 'USD') {
    return { amountMinor, currency: 'USD' }
  }

  const rateMeta = buildOrderExchangeRateMeta(exchangeRateMeta, storePromo)

  if (normalizedCurrency === 'IDR' && rateMeta) {
    return {
      amountMinor: convertIdrMinorToUsdMinor(amountMinor, rateMeta),
      currency: 'USD',
    }
  }

  return { amountMinor, currency: normalizedCurrency }
}

export function resolveOrderDisplayAmountMinor(order, language, exchangeRateMeta, storePromo) {
  const sourceCurrency = order.currency || 'IDR'
  const sourceAmount = order.grand_total_amount_minor ?? order.summary?.grand_total_amount_minor

  if (sourceAmount === null || sourceAmount === undefined) {
    return { amountMinor: null, currency: language === 'en' ? 'USD' : 'IDR' }
  }

  if (language !== 'en') {
    return { amountMinor: sourceAmount, currency: 'IDR' }
  }

  const usesForeignCharge =
    order.uses_foreign_charge === true ||
    (order.charge_currency && order.charge_currency !== 'IDR') ||
    order.checkout_channel === 'paypal'

  const storedChargeAmount =
    order.charge_amount_minor ??
    order.paypal_charge_amount_minor ??
    order.payment?.charge_amount_minor ??
    order.payment?.paypal_amount_minor
  const storedChargeCurrency =
    order.charge_currency ??
    order.paypal_charge_currency ??
    order.payment?.charge_currency ??
    order.payment?.paypal_currency ??
    'USD'

  if (usesForeignCharge && storedChargeAmount !== null && storedChargeAmount !== undefined) {
    return { amountMinor: storedChargeAmount, currency: storedChargeCurrency }
  }

  return resolveStoredAmountDisplayMinor(sourceAmount, sourceCurrency, language, exchangeRateMeta, storePromo)
}

export function formatOrderDisplayAmount(order, language, exchangeRateMeta, storePromo, amountMinor, sourceCurrency) {
  const resolved =
    amountMinor === undefined
      ? resolveOrderDisplayAmountMinor(order, language, exchangeRateMeta, storePromo)
      : resolveStoredAmountDisplayMinor(amountMinor, sourceCurrency || order.currency, language, exchangeRateMeta, storePromo)

  if (resolved.amountMinor === null || resolved.amountMinor === undefined) {
    return '-'
  }

  return formatCurrencyAmount(resolved.amountMinor, resolved.currency, language)
}

export function formatOrderHistoryPricingNote(exchangeRateMeta, storePromo, language) {
  if (language !== 'en') {
    return null
  }

  const rate = Number(exchangeRateMeta?.value)

  if (!Number.isFinite(rate) || rate <= 0) {
    return null
  }

  const formattedRate = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rate)

  const markupPercent = Number(storePromo?.foreign_display_price_markup_percent ?? 0)
  const markupSuffix =
    Number.isFinite(markupPercent) && markupPercent > 0
      ? `, including a ${new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(markupPercent)}% international display markup`
      : ''

  return `USD totals are converted from IDR at Rp ${formattedRate} / USD (Bank Indonesia reference)${markupSuffix}. IDR orders are paid in Rupiah via Midtrans; foreign-currency orders (PayPal or Midtrans card) are charged in USD.`
}
