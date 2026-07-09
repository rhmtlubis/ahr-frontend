import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, CreditCard, LockKeyhole, LogOut, Mail, Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import CustomerGoogleAuthButton from './components/auth/CustomerGoogleAuthButton'
import ShippingOptionPicker from './components/checkout/ShippingOptionPicker'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { buildGa4ItemFromProduct, initializeAnalyticsAndTrackCurrentPage, setEnhancedConversionUserData, trackEvent, updateConsent, getGaClientId } from './lib/analytics'
import { buildPurchaseContext, savePurchaseContext } from './lib/checkoutConversion'
import { clearCheckoutAbandoned, markCheckoutAbandoned } from './lib/cartRecovery'
import { fetchStorePromo, getFreeShippingThresholdDiscount } from './lib/storePromo'
import {
  fetchCatalogShippingRates,
  fetchCatalogShippingCountries,
  fetchCatalogCities,
  fetchCatalogDistricts,
  fetchCatalogProvinces,
  fetchCatalogLandingPage,
  getApiUrl,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  saveCatalogOrder,
  updateCustomerProfile,
  validateCatalogVoucher,
} from './lib/api'
import {
  convertAmountMinorForDisplay,
  formatExchangeRateNote,
  getDisplayCurrency,
  getItemDisplayAmounts,
  getItemPaymentAmounts,
  getPaymentCurrency,
} from './lib/currency.js'
import { getAttributionParams } from './lib/attribution'
import { getProductSizeOptions, useCart } from './lib/cart.jsx'
import { getConsentPreferences, setConsentPreferences } from './lib/consent'
import { useCustomer } from './lib/customer.jsx'
import { useGoogleAuthCallback } from './lib/googleAuth'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { getRetailHeaderActions } from './lib/storeConfig'
import {
  isInternationalCheckout,
  isPayPalPaymentChannel,
  resolvePaymentChannel,
  shouldShowInternationalPaymentPicker,
} from './lib/internationalPayment'
import { buildOrderDetailPath, clearPendingPayment, getPendingPayment, savePendingPayment } from './lib/pendingPayment'
import { useMidtransPayment } from './lib/useMidtransPayment'
import { usePayPalPayment } from './lib/usePayPalPayment'
import { clearPersonalizationData } from './lib/personalization'
import { formatCurrencyAmount, getProductPriceDisplay } from './lib/price'
import { getCountryLabel, isInternationalCountry, isShippingDestinationReady } from './lib/shippingCountries.js'
import useDocumentTitle from './lib/useDocumentTitle'
import useCartShippingEstimate from './lib/useCartShippingEstimate'
import CartStepView, { CartEmptyView } from './components/cart/CartStepView'
import CheckoutStepView from './components/cart/CheckoutStepView'

const defaultCheckoutForm = {
  name: '',
  email: '',
  whatsapp: '',
  fulfillment: 'delivery',
  countryCode: 'ID',
  provinceCode: '',
  cityCode: '',
  districtCode: '',
  cityName: '',
  stateRegion: '',
  postalCode: '',
  addressLine: '',
  notes: '',
}

const defaultAuthForm = {
  name: '',
  email: '',
  whatsapp: '',
  password: '',
  passwordConfirmation: '',
}

const DEFAULT_GOOGLE_ADS_CONVERSION_VALUE_IDR = Number.parseInt(
  import.meta.env.VITE_GOOGLE_ADS_CONVERSION_DEFAULT_VALUE_IDR || '1000000',
  10,
)

function findLocationName(options, code) {
  return options.find((option) => option.code === code)?.name || ''
}

function stripTrailingRegionsFromAddressLine(addressLine, locationOptions, checkoutForm) {
  let line = String(addressLine || '').trim()

  if (!line) {
    return ''
  }

  const regionParts = [
    findLocationName(locationOptions.districts, checkoutForm.districtCode),
    findLocationName(locationOptions.cities, checkoutForm.cityCode),
    findLocationName(locationOptions.provinces, checkoutForm.provinceCode),
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)

  if (regionParts.length === 0) {
    return line
  }

  let changed = true

  while (changed && line) {
    changed = false
    const fullSuffix = `, ${regionParts.join(', ')}`

    if (fullSuffix !== ', ' && line.endsWith(fullSuffix)) {
      line = line.slice(0, -fullSuffix.length).trim()
      changed = true
    }

    for (let index = regionParts.length - 1; index >= 0; index -= 1) {
      const suffix = `, ${regionParts[index]}`

      if (line.endsWith(suffix)) {
        line = line.slice(0, -suffix.length).trim()
        changed = true
      }
    }
  }

  return line.replace(/,\s*$/, '')
}

function buildStructuredAddress(checkoutForm, locationOptions, countryOptions = []) {
  if (checkoutForm.fulfillment !== 'delivery') {
    return ''
  }

  if (isInternationalCountry(checkoutForm.countryCode)) {
    return [
      checkoutForm.addressLine,
      checkoutForm.cityName,
      checkoutForm.stateRegion,
      checkoutForm.postalCode,
      getCountryLabel(countryOptions, checkoutForm.countryCode),
    ]
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .join(', ')
  }

  const streetLine = stripTrailingRegionsFromAddressLine(
    checkoutForm.addressLine,
    locationOptions,
    checkoutForm,
  )

  return [
    streetLine,
    findLocationName(locationOptions.districts, checkoutForm.districtCode),
    findLocationName(locationOptions.cities, checkoutForm.cityCode),
    findLocationName(locationOptions.provinces, checkoutForm.provinceCode),
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(', ')
}

function buildWhatsAppUrl(phoneNumber, message) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
}

function getItemCurrency(item, language) {
  return getItemDisplayAmounts(item.product?.pricing || {}, language).currency
}

function getItemPriceAmounts(item, language, exchangeRate = null) {
  const pricing = item.product?.pricing || {}
  const { currency, unitNetAmount, unitOriginalAmount } = getItemDisplayAmounts(pricing, language, exchangeRate)

  if (unitNetAmount === null || unitOriginalAmount === null) {
    const fallbackCurrency = getItemCurrency(item, language)
    const unitNetFallback = getFirstPriceAmount(
      [pricing.final_amount_minor, pricing.formatted_final, item.product?.bestPrice, item.product?.price],
      fallbackCurrency,
    )
    const unitOriginalFallback = getFirstPriceAmount(
      [pricing.original_amount_minor, pricing.formatted_original, item.product?.originalPrice, item.product?.price, unitNetFallback],
      fallbackCurrency,
    )

    if (unitNetFallback === null || unitOriginalFallback === null) {
      return null
    }

    const safeOriginalAmount = Math.max(unitOriginalFallback, unitNetFallback)

    return {
      currency: fallbackCurrency,
      unitOriginalAmount: safeOriginalAmount,
      unitDiscountAmount: Math.max(safeOriginalAmount - unitNetFallback, 0),
      unitNetAmount: unitNetFallback,
      originalAmount: safeOriginalAmount * item.quantity,
      discountAmount: Math.max(safeOriginalAmount - unitNetFallback, 0) * item.quantity,
      netAmount: unitNetFallback * item.quantity,
    }
  }

  const safeOriginalAmount = Math.max(unitOriginalAmount, unitNetAmount)

  return {
    currency,
    unitOriginalAmount: safeOriginalAmount,
    unitDiscountAmount: Math.max(safeOriginalAmount - unitNetAmount, 0),
    unitNetAmount,
    originalAmount: safeOriginalAmount * item.quantity,
    discountAmount: Math.max(safeOriginalAmount - unitNetAmount, 0) * item.quantity,
    netAmount: unitNetAmount * item.quantity,
  }
}

function getItemChargeAmounts(item) {
  const pricing = item.product?.pricing || {}
  const { currency, unitNetAmount, unitOriginalAmount } = getItemPaymentAmounts(pricing)

  if (unitNetAmount === null || unitOriginalAmount === null) {
    return null
  }

  const safeOriginalAmount = Math.max(unitOriginalAmount, unitNetAmount)

  return {
    currency,
    unitOriginalAmount: safeOriginalAmount,
    unitDiscountAmount: Math.max(safeOriginalAmount - unitNetAmount, 0),
    unitNetAmount,
    originalAmount: safeOriginalAmount * item.quantity,
    discountAmount: Math.max(safeOriginalAmount - unitNetAmount, 0) * item.quantity,
    netAmount: unitNetAmount * item.quantity,
  }
}

function parsePriceAmount(value, currency = 'IDR') {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  const priceText = String(value).trim()

  if (!/\d/.test(priceText)) {
    return null
  }

  if (currency === 'USD') {
    const decimalText = priceText
      .replace(/[^\d.,-]/g, '')
      .replace(/,(?=\d{3}(\D|$))/g, '')
      .replace(',', '.')
    const amount = Number(decimalText)

    return Number.isFinite(amount) ? Math.round(amount * 100) : null
  }

  const integerText = priceText.replace(/[^\d-]/g, '')
  const amount = Number(integerText)

  return Number.isFinite(amount) ? amount : null
}

function getFirstPriceAmount(values, currency) {
  for (const value of values) {
    const amount = parsePriceAmount(value, currency)

    if (amount !== null) {
      return amount
    }
  }

  return null
}

function getCartChargeTotals(items) {
  const pricedItems = items.map((item) => getItemChargeAmounts(item))

  if (pricedItems.some((item) => !item) || pricedItems.length === 0) {
    return null
  }

  const currency = getPaymentCurrency()
  const originalAmount = pricedItems.reduce((total, item) => total + item.originalAmount, 0)
  const discountAmount = pricedItems.reduce((total, item) => total + item.discountAmount, 0)
  const netAmount = pricedItems.reduce((total, item) => total + item.netAmount, 0)

  return {
    currency,
    originalAmount,
    discountAmount,
    netAmount,
    originalLabel: formatCurrencyAmount(originalAmount, currency, 'id'),
    discountLabel: formatCurrencyAmount(discountAmount, currency, 'id'),
    discountDisplayLabel: `${discountAmount > 0 ? '-' : ''}${formatCurrencyAmount(discountAmount, currency, 'id')}`,
    netLabel: formatCurrencyAmount(netAmount, currency, 'id'),
  }
}

function getCartTotals(items, language, exchangeRate = null) {
  const pricedItems = items.map((item) => getItemPriceAmounts(item, language, exchangeRate))

  if (pricedItems.some((item) => !item) || pricedItems.length === 0) {
    return null
  }

  const currencies = new Set(pricedItems.map((item) => item.currency))

  if (currencies.size > 1) {
    return null
  }

  const currency = pricedItems[0].currency
  const originalAmount = pricedItems.reduce((total, item) => total + item.originalAmount, 0)
  const discountAmount = pricedItems.reduce((total, item) => total + item.discountAmount, 0)
  const netAmount = pricedItems.reduce((total, item) => total + item.netAmount, 0)

  return {
    currency,
    originalAmount,
    discountAmount,
    netAmount,
    originalLabel: formatCurrencyAmount(originalAmount, currency, language),
    discountLabel: formatCurrencyAmount(discountAmount, currency, language),
    discountDisplayLabel: `${discountAmount > 0 ? '-' : ''}${formatCurrencyAmount(discountAmount, currency, language)}`,
    netLabel: formatCurrencyAmount(netAmount, currency, language),
  }
}

function getSelectedShippingOption(shippingOptions, selectedShippingOptionKey) {
  if (!selectedShippingOptionKey) {
    return null
  }

  return shippingOptions.find((option) => option.key === selectedShippingOptionKey) || null
}

function getVoucherDiscountParts(appliedVoucher) {
  if (!appliedVoucher) {
    return { orderDiscountAmount: 0, shippingDiscountAmount: 0 }
  }

  const orderDiscountAmount = Number.isFinite(appliedVoucher.order_discount_amount_minor)
    ? appliedVoucher.order_discount_amount_minor
    : appliedVoucher.benefit_type === 'order_discount' && Number.isFinite(appliedVoucher.discount_amount_minor)
      ? appliedVoucher.discount_amount_minor
      : 0

  const shippingDiscountAmount = Number.isFinite(appliedVoucher.shipping_discount_amount_minor)
    ? appliedVoucher.shipping_discount_amount_minor
    : 0

  return { orderDiscountAmount, shippingDiscountAmount }
}

function getCheckoutTotals(
  cartTotals,
  shippingOption,
  language,
  appliedVoucher,
  storePromo,
  fulfillment = 'delivery',
  chargeCartTotals = null,
  exchangeRate = null,
) {
  const displayCurrency = cartTotals?.currency || (language === 'en' ? 'USD' : 'IDR')
  const shippingAmountIdr = Number.isFinite(shippingOption?.price) ? shippingOption.price : 0
  const shippingSourceCurrency = shippingOption?.currency || getPaymentCurrency()
  const shippingAmount = convertAmountMinorForDisplay(
    shippingAmountIdr,
    shippingSourceCurrency,
    displayCurrency,
    exchangeRate,
  )
  const { orderDiscountAmount, shippingDiscountAmount } = getVoucherDiscountParts(appliedVoucher)
  const orderDiscountAmountDisplay = convertAmountMinorForDisplay(
    orderDiscountAmount,
    getPaymentCurrency(),
    displayCurrency,
    exchangeRate,
  )
  const shippingDiscountAmountDisplay = convertAmountMinorForDisplay(
    shippingDiscountAmount,
    getPaymentCurrency(),
    displayCurrency,
    exchangeRate,
  )
  const promoCartTotals = chargeCartTotals || cartTotals
  const freeShippingThresholdDiscountAmount = getFreeShippingThresholdDiscount({
    storePromo,
    cartTotals: promoCartTotals,
    fulfillment,
    existingShippingDiscountAmount: shippingDiscountAmount,
    shippingAmount: shippingAmountIdr,
  })
  const freeShippingThresholdDiscountAmountDisplay = convertAmountMinorForDisplay(
    freeShippingThresholdDiscountAmount,
    getPaymentCurrency(),
    displayCurrency,
    exchangeRate,
  )
  const totalShippingDiscountAmount = shippingDiscountAmountDisplay + freeShippingThresholdDiscountAmountDisplay
  const hasKnownCartTotal = Number.isFinite(cartTotals?.netAmount)
  const netAfterVoucher = hasKnownCartTotal ? Math.max(cartTotals.netAmount - orderDiscountAmountDisplay, 0) : null
  const shippingAfterDiscount = Math.max(shippingAmount - totalShippingDiscountAmount, 0)
  const grandTotalAmount = netAfterVoucher !== null ? netAfterVoucher + shippingAfterDiscount : null

  return {
    currency: displayCurrency,
    shippingAmount,
    shippingLabel: formatCurrencyAmount(shippingAmount, displayCurrency, language),
    orderVoucherDiscountAmount: orderDiscountAmountDisplay,
    orderVoucherDiscountLabel:
      orderDiscountAmountDisplay > 0
        ? `-${formatCurrencyAmount(orderDiscountAmountDisplay, displayCurrency, language)}`
        : null,
    shippingVoucherDiscountAmount: shippingDiscountAmountDisplay,
    shippingVoucherDiscountLabel:
      shippingDiscountAmountDisplay > 0
        ? `-${formatCurrencyAmount(shippingDiscountAmountDisplay, displayCurrency, language)}`
        : null,
    freeShippingThresholdDiscountAmount: freeShippingThresholdDiscountAmountDisplay,
    freeShippingThresholdDiscountLabel:
      freeShippingThresholdDiscountAmountDisplay > 0
        ? `-${formatCurrencyAmount(freeShippingThresholdDiscountAmountDisplay, displayCurrency, language)}`
        : null,
    voucherDiscountAmount: orderDiscountAmountDisplay + totalShippingDiscountAmount,
    voucherDiscountLabel:
      orderDiscountAmountDisplay + totalShippingDiscountAmount > 0
        ? `-${formatCurrencyAmount(orderDiscountAmountDisplay + totalShippingDiscountAmount, displayCurrency, language)}`
        : null,
    grandTotalAmount,
    grandTotalLabel:
      grandTotalAmount !== null
        ? formatCurrencyAmount(grandTotalAmount, displayCurrency, language)
        : null,
  }
}

function buildVoucherValidateItems(items) {
  return items.map((item) => {
    const priceAmounts = getItemChargeAmounts(item)

    return {
      product_slug: item.product.slug,
      quantity: item.quantity,
      expected_unit_amount_minor: priceAmounts?.unitNetAmount ?? null,
    }
  })
}

function normalizeGoogleAdsConversionValue(amountMinor, currency) {
  if (!Number.isFinite(amountMinor)) {
    return null
  }

  return String(currency || 'IDR').toUpperCase() === 'USD' ? amountMinor / 100 : amountMinor
}

function resolveCheckoutConversionValue(savedOrder) {
  const orderCurrency = String(savedOrder?.summary?.currency || 'IDR').toUpperCase()
  const orderNetAmountMinor =
    savedOrder?.summary?.grand_total_amount_minor ?? savedOrder?.summary?.net_total_amount_minor

  if (Number.isFinite(orderNetAmountMinor)) {
    return {
      currency: orderCurrency,
      value: normalizeGoogleAdsConversionValue(orderNetAmountMinor, orderCurrency),
      source: 'order_total',
    }
  }

  return {
    currency: 'IDR',
    value: Number.isFinite(DEFAULT_GOOGLE_ADS_CONVERSION_VALUE_IDR)
      ? DEFAULT_GOOGLE_ADS_CONVERSION_VALUE_IDR
      : 1000000,
    source: 'default_estimate',
  }
}

function materializeCheckoutItems(items, mixedSizeDrafts = {}) {
  const mergedItems = new Map()

  items.forEach((item) => {
    const activeDraft = mixedSizeDrafts[item.id]
    const expandedItems =
      Array.isArray(activeDraft) && activeDraft.length === item.quantity
        ? Array.from(
            activeDraft.reduce((sizeCounts, size) => {
              const normalizedSize = String(size || item.size || 'M').trim() || item.size || 'M'

              sizeCounts.set(normalizedSize, (sizeCounts.get(normalizedSize) || 0) + 1)

              return sizeCounts
            }, new Map()),
            ([size, quantity]) => ({
              ...item,
              id: `${item.product.slug}-${size}`,
              size,
              quantity,
            }),
          )
        : [item]

    expandedItems.forEach((expandedItem) => {
      const key = `${expandedItem.product.slug}::${expandedItem.size}`
      const existingItem = mergedItems.get(key)

      if (!existingItem) {
        mergedItems.set(key, expandedItem)

        return
      }

      mergedItems.set(key, {
        ...existingItem,
        quantity: existingItem.quantity + expandedItem.quantity,
      })
    })
  })

  return Array.from(mergedItems.values())
}

function buildCheckoutMessage(items, checkoutForm, language, cartTotals, locationOptions, exchangeRate = null, storePromo = null) {
  const formattedAddress = buildStructuredAddress(checkoutForm, locationOptions)
  const groupedItems = items.reduce((groups, item) => {
    const groupKey = `${item.product.slug}::${item.product.category || ''}`
    const group = groups.get(groupKey) || {
      product: item.product,
      entries: [],
      totalQuantity: 0,
    }

    group.entries.push({
      size: item.size,
      quantity: item.quantity,
    })
    group.totalQuantity += item.quantity
    groups.set(groupKey, group)

    return groups
  }, new Map())
  const orderLines = Array.from(groupedItems.values()).map((group, index) => {
    const { currentPrice } = getProductPriceDisplay(group.product, language, {
      exchangeRate: exchangeRateMeta,
      storePromo,
    })
    const itemPrice = currentPrice || group.product.price || '-'
    const sizeLabel = group.entries
      .map((entry) => `${entry.size} (${entry.quantity} pcs)`)
      .join(', ')

    return [
      `${index + 1}. ${group.product.name}`,
      `   ${language === 'en' ? 'Category' : 'Kategori'}: ${group.product.category || '-'}`,
      `   ${language === 'en' ? 'Sizes' : 'Ukuran'}: ${sizeLabel}`,
      `   Qty: ${group.totalQuantity}`,
      `   ${language === 'en' ? 'Estimated unit price' : 'Estimasi harga satuan'}: ${itemPrice}`,
    ].join('\n')
  })

  if (language === 'en') {
    return [
      'Hello AHR, I would like to checkout this cart:',
      '',
      `Name: ${checkoutForm.name}`,
      `WhatsApp: ${checkoutForm.whatsapp}`,
      `Fulfillment: ${checkoutForm.fulfillment === 'pickup' ? 'Pickup at workshop' : 'Delivery'}`,
      formattedAddress ? `Address: ${formattedAddress}` : null,
      '',
      'Order list:',
      orderLines.join('\n\n'),
      cartTotals
        ? `\nEstimated totals:\nOriginal price: ${cartTotals.originalLabel}\nPromo: ${cartTotals.discountDisplayLabel}\nNett: ${cartTotals.netLabel}`
        : null,
      checkoutForm.notes ? `\nNotes: ${checkoutForm.notes}` : null,
      '',
      'Please confirm stock, final total, production estimate, and payment steps.',
    ]
      .filter(Boolean)
      .join('\n')
  }

  return [
    'Halo AHR, saya ingin checkout cart berikut:',
    '',
    `Nama: ${checkoutForm.name}`,
    `WhatsApp: ${checkoutForm.whatsapp}`,
    `Metode: ${checkoutForm.fulfillment === 'pickup' ? 'Ambil di workshop' : 'Kirim ke alamat'}`,
    formattedAddress ? `Alamat: ${formattedAddress}` : null,
    '',
    'Daftar order:',
    orderLines.join('\n\n'),
    cartTotals
      ? `\nEstimasi total:\nHarga asli: ${cartTotals.originalLabel}\nPromo: ${cartTotals.discountDisplayLabel}\nNett: ${cartTotals.netLabel}`
      : null,
    checkoutForm.notes ? `\nCatatan: ${checkoutForm.notes}` : null,
    '',
    'Mohon konfirmasi stok, total final, estimasi produksi, dan langkah pembayarannya.',
  ]
    .filter(Boolean)
    .join('\n')
}

function buildCheckoutPayload(
  items,
  checkoutForm,
  language,
  locationOptions,
  appliedVoucherCode,
  countryOptions = [],
  storePromo = null,
  internationalPaymentChannel = null,
) {
  const formattedAddress = buildStructuredAddress(checkoutForm, locationOptions, countryOptions)
  const addressLine = isInternationalCountry(checkoutForm.countryCode)
    ? String(checkoutForm.addressLine || '').trim()
    : stripTrailingRegionsFromAddressLine(checkoutForm.addressLine, locationOptions, checkoutForm)
  const isInternational = isInternationalCountry(checkoutForm.countryCode)
  const paymentChannel = resolvePaymentChannel(checkoutForm, storePromo, internationalPaymentChannel)

  return {
    name: checkoutForm.name,
    email: checkoutForm.email,
    whatsapp: checkoutForm.whatsapp,
    fulfillment: checkoutForm.fulfillment,
    address: formattedAddress || undefined,
    address_line: addressLine || undefined,
    country_code: isInternational ? checkoutForm.countryCode : 'ID',
    city_name: isInternational ? checkoutForm.cityName : undefined,
    state_region: isInternational ? checkoutForm.stateRegion || undefined : undefined,
    postal_code: isInternational ? checkoutForm.postalCode : undefined,
    province_code: !isInternational ? checkoutForm.provinceCode || undefined : undefined,
    city_code: !isInternational ? checkoutForm.cityCode || undefined : undefined,
    district_code: !isInternational ? checkoutForm.districtCode || undefined : undefined,
    notes: checkoutForm.notes || undefined,
    terms_accepted: true,
    voucher_code: appliedVoucherCode || undefined,
    locale: language,
    currency: getPaymentCurrency(),
    payment_channel: paymentChannel,
    source_page: window.location.pathname,
    referrer_url: document.referrer || undefined,
    store_hostname: typeof window !== 'undefined' ? window.location.hostname : undefined,
    ga_client_id: getGaClientId() || undefined,
    ...getAttributionParams(),
    items: items.map((item) => {
      const priceAmounts = getItemChargeAmounts(item)

      return {
        product_slug: item.product.slug,
        product_name: item.product.name,
        product_category: item.product.category || null,
        size: item.size,
        quantity: item.quantity,
        expected_unit_amount_minor: priceAmounts?.unitNetAmount ?? null,
        expected_original_unit_amount_minor: priceAmounts?.unitOriginalAmount ?? null,
      }
    }),
  }
}

function buildShippingQuotePayload(items, checkoutForm) {
  const payloadItems = items.map((item) => {
    const priceAmounts = getItemPriceAmounts(item, 'id')

    return {
      product_slug: item.product.slug,
      product_name: item.product.name,
      product_category: item.product.category || null,
      quantity: item.quantity,
      expected_unit_amount_minor: priceAmounts?.unitNetAmount ?? null,
      expected_original_unit_amount_minor: priceAmounts?.unitOriginalAmount ?? null,
    }
  })

  const countryCode = String(checkoutForm.countryCode || 'ID').toUpperCase()

  if (isInternationalCountry(countryCode)) {
    const payload = {
      country_code: countryCode,
      items: payloadItems,
    }

    const cityName = checkoutForm.cityName?.trim()
    const postalCode = checkoutForm.postalCode?.trim()
    const stateRegion = checkoutForm.stateRegion?.trim()

    if (cityName) {
      payload.city_name = cityName
    }

    if (postalCode) {
      payload.postal_code = postalCode
    }

    if (stateRegion) {
      payload.state_region = stateRegion
    }

    return payload
  }

  return {
    country_code: 'ID',
    province_code: checkoutForm.provinceCode,
    city_code: checkoutForm.cityCode,
    district_code: checkoutForm.districtCode,
    items: payloadItems,
  }
}

function mapCustomerToCheckoutForm(customer, locationOptions = { provinces: [], cities: [], districts: [] }) {
  const countryCode = customer?.default_shipping_country_code || 'ID'
  const isInternational = isInternationalCountry(countryCode)

  const checkoutForm = {
    name: customer?.name || '',
    email: customer?.email || '',
    whatsapp: customer?.phone || '',
    fulfillment: customer?.default_fulfillment_method || 'delivery',
    countryCode,
    provinceCode: isInternational ? '' : customer?.default_shipping_province_code || '',
    cityCode: isInternational ? '' : customer?.default_shipping_city_code || '',
    districtCode: isInternational ? '' : customer?.default_shipping_district_code || '',
    cityName: isInternational ? customer?.default_shipping_city_name || '' : '',
    stateRegion: isInternational ? customer?.default_shipping_province_name || '' : '',
    postalCode: isInternational ? customer?.default_shipping_postal_code || '' : '',
    addressLine: customer?.default_shipping_address || '',
    notes: '',
  }

  if (!isInternational) {
    checkoutForm.addressLine = stripTrailingRegionsFromAddressLine(
      checkoutForm.addressLine,
      locationOptions,
      checkoutForm,
    )
  }

  return checkoutForm
}

function mapCustomerToAuthForm(customer) {
  return {
    ...defaultAuthForm,
    name: customer?.name || '',
    email: customer?.email || '',
    whatsapp: customer?.phone || '',
  }
}

function buildCustomerProfilePayload(checkoutForm, locationOptions) {
  const isInternational = isInternationalCountry(checkoutForm.countryCode)

  return {
    name: checkoutForm.name,
    email: checkoutForm.email,
    whatsapp: checkoutForm.whatsapp,
    fulfillment: checkoutForm.fulfillment,
    country_code: checkoutForm.fulfillment === 'delivery' ? checkoutForm.countryCode : 'ID',
    address_line: checkoutForm.fulfillment === 'delivery' ? checkoutForm.addressLine : '',
    ...(isInternational
      ? {
          city_name: checkoutForm.cityName,
          state_region: checkoutForm.stateRegion,
          postal_code: checkoutForm.postalCode,
          province_code: '',
          province_name: '',
          city_code: '',
          district_code: '',
          district_name: '',
        }
      : {
          province_code: checkoutForm.fulfillment === 'delivery' ? checkoutForm.provinceCode : '',
          province_name:
            checkoutForm.fulfillment === 'delivery'
              ? findLocationName(locationOptions.provinces, checkoutForm.provinceCode)
              : '',
          city_code: checkoutForm.fulfillment === 'delivery' ? checkoutForm.cityCode : '',
          city_name:
            checkoutForm.fulfillment === 'delivery'
              ? findLocationName(locationOptions.cities, checkoutForm.cityCode)
              : '',
          district_code: checkoutForm.fulfillment === 'delivery' ? checkoutForm.districtCode : '',
          district_name:
            checkoutForm.fulfillment === 'delivery'
              ? findLocationName(locationOptions.districts, checkoutForm.districtCode)
              : '',
          postal_code: '',
          state_region: '',
        }),
  }
}

export default function CartPage() {
  const { language, t } = useLanguage()
  const { customer: customerSession, isLoading: customerLoading, setCustomer: setCustomerSession, refreshCustomer } = useCustomer()
  const navigate = useNavigate()
  const location = useLocation()
  const isCheckoutStep = location.pathname.includes('/cart/checkout')
  useDocumentTitle(
    language === 'en' ? 'Cart for Custom Jersey Orders' : 'Keranjang Belanja Jersey Custom',
    language === 'en'
      ? 'Review selected custom jerseys and sportswear before continuing your order with AHR.'
      : 'Tinjau pilihan jersey custom dan apparel sublimasi Anda sebelum melanjutkan pemesanan bersama AHR.',
    {
      canonicalPath: '/cart',
      image: '/ahr-brand-logo.webp',
      imageAlt: 'Keranjang belanja AHR',
      keywords:
        language === 'en'
          ? 'custom jersey cart, sportswear order, AHR cart'
          : 'keranjang jersey custom, checkout apparel, keranjang AHR',
      locale: language,
      robots: 'noindex, nofollow',
      type: 'website',
    },
  )
  const { items, itemCount, updateCartItemQuantity, updateCartItemSize, distributeCartItemSizes, removeCartItem, clearCart } = useCart()
  const { payOrder } = useMidtransPayment({ preload: isCheckoutStep })
  const { payOrder: payPalOrder } = usePayPalPayment()
  const paymentInProgressRef = useRef(false)
  const wasOnCheckoutRef = useRef(false)
  const [storePromo, setStorePromo] = useState(null)
  const [internationalPaymentChannel, setInternationalPaymentChannel] = useState('paypal')
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )
  const [checkoutForm, setCheckoutForm] = useState(defaultCheckoutForm)
  const [checkoutStatus, setCheckoutStatus] = useState({ state: 'idle', message: '' })
  const [authMode, setAuthMode] = useState('login')
  const [checkoutAuthMode, setCheckoutAuthMode] = useState('guest')
  const [authForm, setAuthForm] = useState(defaultAuthForm)
  const [authStatus, setAuthStatus] = useState({ state: 'idle', message: '' })
  const [mixedSizeDrafts, setMixedSizeDrafts] = useState({})
  const [consentPreferences, setConsentPreferencesState] = useState(() => getConsentPreferences())
  const [provinceOptions, setProvinceOptions] = useState([])
  const [countryOptions, setCountryOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [shippingOptions, setShippingOptions] = useState([])
  const [selectedShippingOptionKey, setSelectedShippingOptionKey] = useState('')
  const [shippingStatus, setShippingStatus] = useState({ state: 'idle', message: '' })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsError, setTermsError] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [exchangeRateMeta, setExchangeRateMeta] = useState(null)
  const appliedVoucherRef = useRef(null)
  const [locationLoading, setLocationLoading] = useState({
    provinces: false,
    cities: false,
    districts: false,
  })

  const checkoutItems = useMemo(() => materializeCheckoutItems(items, mixedSizeDrafts), [items, mixedSizeDrafts])
  const cartTotals = useMemo(
    () => getCartTotals(items, language, exchangeRateMeta),
    [items, language, exchangeRateMeta],
  )
  const cartChargeTotals = useMemo(() => getCartChargeTotals(checkoutItems), [checkoutItems])
  const selectedShippingOption = useMemo(
    () => getSelectedShippingOption(shippingOptions, selectedShippingOptionKey),
    [shippingOptions, selectedShippingOptionKey],
  )
  const checkoutTotals = useMemo(
    () =>
      getCheckoutTotals(
        cartTotals,
        selectedShippingOption,
        language,
        appliedVoucher,
        storePromo,
        checkoutForm.fulfillment,
        cartChargeTotals,
        exchangeRateMeta,
      ),
    [
      appliedVoucher,
      cartChargeTotals,
      cartTotals,
      checkoutForm.fulfillment,
      exchangeRateMeta,
      selectedShippingOption,
      language,
      storePromo,
    ],
  )
  const checkoutChargeTotals = useMemo(
    () =>
      getCheckoutTotals(
        cartChargeTotals,
        selectedShippingOption,
        'id',
        appliedVoucher,
        storePromo,
        checkoutForm.fulfillment,
        cartChargeTotals,
      ),
    [appliedVoucher, cartChargeTotals, checkoutForm.fulfillment, selectedShippingOption, storePromo],
  )
  const activePaymentChannel = useMemo(
    () => resolvePaymentChannel(checkoutForm, storePromo, internationalPaymentChannel),
    [checkoutForm, storePromo, internationalPaymentChannel],
  )
  const payWithPayPal = useMemo(
    () => isPayPalPaymentChannel(activePaymentChannel),
    [activePaymentChannel],
  )
  const showInternationalPaymentPicker = useMemo(
    () => shouldShowInternationalPaymentPicker(storePromo) && isInternationalCheckout(checkoutForm),
    [storePromo, checkoutForm],
  )
  const exchangeRateNote = useMemo(
    () => formatExchangeRateNote(exchangeRateMeta, language, payWithPayPal),
    [exchangeRateMeta, language, payWithPayPal],
  )
  const { estimate: shippingEstimate, loading: shippingEstimateLoading } = useCartShippingEstimate(
    checkoutItems,
    language,
    exchangeRateMeta,
    storePromo,
  )
  const canPlaceOrder = Boolean(customerSession) || checkoutAuthMode === 'guest'
  const shippingEstimateLabel =
    shippingEstimate?.state === 'ready' && shippingEstimate.priceLabel
      ? language === 'en'
        ? `From ${shippingEstimate.priceLabel}`
        : `Mulai ${shippingEstimate.priceLabel}`
      : null

  useEffect(() => {
    let cancelled = false

    fetchCatalogShippingCountries(language)
      .then((countries) => {
        if (!cancelled) {
          setCountryOptions(countries)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCountryOptions([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [language])

  useEffect(() => {
    let cancelled = false

    fetchStorePromo().then((promo) => {
      if (!cancelled) {
        setStorePromo(promo)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const defaultChannel = storePromo?.international_payment?.default_channel

    if (defaultChannel) {
      setInternationalPaymentChannel(defaultChannel)
    }
  }, [storePromo?.international_payment?.default_channel, storePromo?.international_payment?.mode])

  useEffect(() => {
    if (isCheckoutStep) {
      wasOnCheckoutRef.current = true
      clearCheckoutAbandoned()
      return
    }

    if (wasOnCheckoutRef.current && items.length > 0) {
      markCheckoutAbandoned(items)
      trackEvent('cart_checkout_abandoned', {
        cart_item_count: itemCount,
        cart_unique_item_count: items.length,
        source_page: '/cart/checkout',
      })
    }

    wasOnCheckoutRef.current = false
  }, [isCheckoutStep, itemCount, items])

  useEffect(() => {
    fetchCatalogLandingPage(language)
      .then((payload) => {
        if (payload?.data) {
          setPageContent(getLandingChromeContent(payload.data, { hashPrefix: '/', locale: language }))
        }

        setExchangeRateMeta(payload?.meta?.exchange_rate || null)
      })
      .catch(() => {
        setPageContent(getLandingChromeContent({}, { hashPrefix: '/', locale: language }))
        setExchangeRateMeta(null)
      })
  }, [language])

  useEffect(() => {
    appliedVoucherRef.current = appliedVoucher
  }, [appliedVoucher])

  useEffect(() => {
    setAppliedVoucher(null)
  }, [items])

  useEffect(() => {
    const voucher = appliedVoucherRef.current

    if (!voucher?.code) {
      return undefined
    }

    let cancelled = false
    const isShippingVoucher =
      voucher.benefit_type === 'shipping_discount' || voucher.benefit_type === 'free_shipping'
    const shippingFeeAmountMinor =
      checkoutForm.fulfillment === 'delivery' && selectedShippingOption
        ? Number(selectedShippingOption.price) || 0
        : 0

    if (checkoutForm.fulfillment !== 'delivery') {
      if (isShippingVoucher) {
        setAppliedVoucher(null)
      }

      return undefined
    }

    if (isShippingVoucher && shippingFeeAmountMinor <= 0) {
      setAppliedVoucher(null)
      return undefined
    }

    const syncVoucher = async () => {
      try {
        const preview = await validateCatalogVoucher({
          voucherCode: voucher.code,
          items: buildVoucherValidateItems(checkoutItems),
          locale: language === 'en' ? 'en' : 'id',
          currency: getPaymentCurrency(),
          fulfillment: checkoutForm.fulfillment,
          shippingFeeAmountMinor,
        })

        if (!cancelled) {
          setAppliedVoucher(preview)
        }
      } catch {
        if (!cancelled) {
          setAppliedVoucher(null)
        }
      }
    }

    syncVoucher()

    return () => {
      cancelled = true
    }
  }, [
    cartTotals?.currency,
    checkoutForm.fulfillment,
    checkoutItems,
    language,
    selectedShippingOption,
    selectedShippingOptionKey,
  ])

  const applyConsentPreferences = (nextPreferences) => {
    setConsentPreferences(nextPreferences)
    setConsentPreferencesState(nextPreferences)

    updateConsent(nextPreferences)

    if (nextPreferences.analytics === 'accepted') {
      initializeAnalyticsAndTrackCurrentPage()
    }

    if (nextPreferences.personalization === 'rejected') {
      clearPersonalizationData()
    }

    trackEvent('cookie_consent_updated', {
      analytics_consent: nextPreferences.analytics,
      personalization_consent: nextPreferences.personalization,
      personalization_scope: 'cart-checkout',
      source_page: '/cart',
    })
  }

  const updateCheckoutFormFields = (updates) => {
    if (checkoutStatus.state !== 'idle' || checkoutStatus.message) {
      setCheckoutStatus({ state: 'idle', message: '' })
    }

    setCheckoutForm((current) => ({
      ...current,
      ...updates,
    }))
  }

  const updateCheckoutForm = (field, value) => {
    updateCheckoutFormFields({ [field]: value })
  }

  const updateAuthForm = (field, value) => {
    if (authStatus.state !== 'idle' || authStatus.message) {
      setAuthStatus({ state: 'idle', message: '' })
    }

    setAuthForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const applyCustomerProfileToForms = (customer) => {
    setCustomerSession(customer)
    const mapped = mapCustomerToCheckoutForm(customer, {
      provinces: provinceOptions,
      cities: cityOptions,
      districts: districtOptions,
    })

    setCheckoutForm((current) => ({
      ...current,
      ...mapped,
      notes: current.notes,
    }))
    setAuthForm(mapCustomerToAuthForm(customer))
  }

  const handleGoogleAuthStatus = useCallback(
    (status) => {
      setAuthStatus({
        state: status.state,
        message:
          status.state === 'success'
            ? status.needsPhone
              ? t('cart.googleLoginNeedsPhone')
              : t('cart.googleLoginSuccess')
            : t('cart.googleLoginError'),
      })

      if (status.customer) {
        applyCustomerProfileToForms(status.customer)
      }
    },
    [t],
  )

  useGoogleAuthCallback({
    refreshCustomer,
    setCustomer: setCustomerSession,
    onStatus: handleGoogleAuthStatus,
  })

  useEffect(() => {
    if (!customerSession) {
      return
    }

    applyCustomerProfileToForms(customerSession)
  }, [customerSession])

  useEffect(() => {
    let isActive = true

    setLocationLoading((current) => ({ ...current, provinces: true }))

    fetchCatalogProvinces()
      .then((data) => {
        if (!isActive) {
          return
        }

        setProvinceOptions(data)
      })
      .catch(() => {
        if (!isActive) {
          return
        }

        setProvinceOptions([])
      })
      .finally(() => {
        if (!isActive) {
          return
        }

        setLocationLoading((current) => ({ ...current, provinces: false }))
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!checkoutForm.provinceCode) {
      setCityOptions([])
      setDistrictOptions([])

      return
    }

    let isActive = true

    setLocationLoading((current) => ({ ...current, cities: true }))

    fetchCatalogCities(checkoutForm.provinceCode)
      .then((data) => {
        if (!isActive) {
          return
        }

        setCityOptions(data)
      })
      .catch(() => {
        if (!isActive) {
          return
        }

        setCityOptions([])
      })
      .finally(() => {
        if (!isActive) {
          return
        }

        setLocationLoading((current) => ({ ...current, cities: false }))
      })

    return () => {
      isActive = false
    }
  }, [checkoutForm.provinceCode])

  useEffect(() => {
    if (!checkoutForm.cityCode) {
      setDistrictOptions([])

      return
    }

    let isActive = true

    setLocationLoading((current) => ({ ...current, districts: true }))

    fetchCatalogDistricts(checkoutForm.cityCode)
      .then((data) => {
        if (!isActive) {
          return
        }

        setDistrictOptions(data)
      })
      .catch(() => {
        if (!isActive) {
          return
        }

        setDistrictOptions([])
      })
      .finally(() => {
        if (!isActive) {
          return
        }

        setLocationLoading((current) => ({ ...current, districts: false }))
      })

    return () => {
      isActive = false
    }
  }, [checkoutForm.cityCode])

  useEffect(() => {
    if (!isCheckoutStep || checkoutForm.fulfillment !== 'delivery') {
      setShippingOptions([])
      setSelectedShippingOptionKey('')
      setShippingStatus({ state: 'idle', message: '' })

      return
    }

    if (!isShippingDestinationReady(checkoutForm) || checkoutItems.length === 0) {
      setShippingOptions([])
      setSelectedShippingOptionKey('')
      setShippingStatus({ state: 'idle', message: '' })

      return
    }

    let isActive = true

    setShippingStatus({ state: 'loading', message: '' })

    fetchCatalogShippingRates(buildShippingQuotePayload(checkoutItems, checkoutForm))
      .then((data) => {
        if (!isActive) {
          return
        }

        const rates = Array.isArray(data?.rates)
          ? data.rates.map((rate, index) => ({
              ...rate,
              key: `${rate.company || rate.courier_code}-${rate.courier_type}-${rate.courier_service_code || index}`,
            }))
          : []

        setShippingOptions(rates)
        setSelectedShippingOptionKey((current) => {
          if (current && rates.some((rate) => rate.key === current)) {
            return current
          }

          return rates[0]?.key || ''
        })
        setShippingStatus(
          rates.length > 0
            ? { state: 'success', message: '' }
            : {
                state: 'error',
                message:
                  language === 'en'
                    ? 'No shipping service is currently available for this destination.'
                    : 'Belum ada layanan pengiriman yang tersedia untuk tujuan ini.',
              },
        )
      })
      .catch((error) => {
        if (!isActive) {
          return
        }

        setShippingOptions([])
        setSelectedShippingOptionKey('')
        setShippingStatus({
          state: 'error',
          message: error.message,
        })
      })

    return () => {
      isActive = false
    }
  }, [
    isCheckoutStep,
    checkoutForm.fulfillment,
    checkoutForm.countryCode,
    checkoutForm.provinceCode,
    checkoutForm.cityCode,
    checkoutForm.districtCode,
    checkoutForm.cityName,
    checkoutForm.stateRegion,
    checkoutForm.postalCode,
    checkoutForm.addressLine,
    checkoutItems,
    language,
  ])

  const getMixedSizeDraft = (item) => {
    const savedDraft = mixedSizeDrafts[item.id]

    if (Array.isArray(savedDraft) && savedDraft.length === item.quantity) {
      return savedDraft
    }

    return Array.from({ length: item.quantity }, () => item.size)
  }

  const toggleMixedSizeEditor = (item) => {
    setMixedSizeDrafts((current) => {
      if (current[item.id]) {
        const nextDrafts = { ...current }

        delete nextDrafts[item.id]

        return nextDrafts
      }

      return {
        ...current,
        [item.id]: Array.from({ length: item.quantity }, () => item.size),
      }
    })
  }

  const updateMixedSizeDraft = (itemId, unitIndex, size, quantity, fallbackSize) => {
    setMixedSizeDrafts((current) => {
      const baseDraft =
        Array.isArray(current[itemId]) && current[itemId].length === quantity
          ? [...current[itemId]]
          : Array.from({ length: quantity }, () => fallbackSize)

      baseDraft[unitIndex] = size

      return {
        ...current,
        [itemId]: baseDraft,
      }
    })
  }

  const applyMixedSizes = (item) => {
    const nextSizes = getMixedSizeDraft(item)

    distributeCartItemSizes(item.id, nextSizes)
    setMixedSizeDrafts((current) => {
      const nextDrafts = { ...current }

      delete nextDrafts[item.id]

      return nextDrafts
    })
  }

  const handleCustomerLogin = async (event) => {
    event.preventDefault()
    setAuthStatus({ state: 'loading', message: '' })

    try {
      const customer = await loginCustomer({
        email: authForm.email,
        password: authForm.password,
      })

      applyCustomerProfileToForms(customer)
      setAuthStatus({ state: 'success', message: '' })
    } catch (error) {
      setAuthStatus({
        state: 'error',
        message: error.message,
      })
    }
  }

  const handleCustomerRegister = async (event) => {
    event.preventDefault()
    setAuthStatus({ state: 'loading', message: '' })

    try {
      const customer = await registerCustomer({
        name: authForm.name,
        email: authForm.email,
        whatsapp: authForm.whatsapp,
        password: authForm.password,
        password_confirmation: authForm.passwordConfirmation,
      })

      applyCustomerProfileToForms(customer)
      setAuthMode('login')
      setAuthStatus({ state: 'success', message: '' })
    } catch (error) {
      setAuthStatus({
        state: 'error',
        message: error.message,
      })
    }
  }

  const handleCustomerLogout = async () => {
    setAuthStatus({ state: 'loading', message: '' })

    try {
      await logoutCustomer()
      setCustomerSession(null)
      setCheckoutForm(defaultCheckoutForm)
      setAuthForm(defaultAuthForm)
      setAuthStatus({ state: 'idle', message: '' })
    } catch (error) {
      setAuthStatus({
        state: 'error',
        message: error.message,
      })
    }
  }

  const handleCheckoutSubmit = async (event) => {
    event.preventDefault()

    if (!customerSession && checkoutAuthMode !== 'guest') {
      if (authMode === 'register') {
        await handleCustomerRegister(event)
        return
      }

      await handleCustomerLogin(event)
      return
    }

    const locationOptions = {
      provinces: provinceOptions,
      cities: cityOptions,
      districts: districtOptions,
    }

    if (checkoutForm.fulfillment === 'delivery' && !selectedShippingOption) {
      setCheckoutStatus({
        state: 'error',
        message:
          language === 'en'
            ? 'Please choose one shipping service before checkout.'
            : 'Silakan pilih salah satu layanan pengiriman sebelum checkout.',
      })
      return
    }

    if (!termsAccepted) {
      const message =
        language === 'en'
          ? 'Please read and accept the Terms & Conditions before payment.'
          : 'Silakan baca dan setujui Syarat & Ketentuan sebelum pembayaran.'
      setTermsError(message)
      setCheckoutStatus({ state: 'error', message })
      return
    }

    setTermsError('')

    setCheckoutStatus({
      state: 'loading',
      message: t('cart.profileSyncing'),
    })

    trackEvent('checkout_submit', {
      currency: cartTotals?.currency || 'IDR',
      value:
        cartTotals?.netAmount !== undefined && cartTotals?.netAmount !== null
          ? normalizeGoogleAdsConversionValue(cartTotals.netAmount, cartTotals.currency)
          : undefined,
      source_page: '/cart',
      cart_item_count: itemCount,
      cart_unique_item_count: items.length,
      fulfillment: checkoutForm.fulfillment,
    })

    let savedOrderNumber = ''

    try {
      if (customerSession) {
        const syncedCustomer = await updateCustomerProfile(buildCustomerProfilePayload(checkoutForm, locationOptions))
        setCustomerSession(syncedCustomer)
      }

      const savedOrder = await saveCatalogOrder(
        {
          ...buildCheckoutPayload(
            checkoutItems,
            checkoutForm,
            language,
            locationOptions,
            appliedVoucher?.code,
            countryOptions,
            storePromo,
            internationalPaymentChannel,
          ),
          shipping_option: selectedShippingOption
            ? {
                provider: selectedShippingOption.provider,
                company: selectedShippingOption.company,
                courier_code: selectedShippingOption.courier_code,
                courier_name: selectedShippingOption.courier_name,
                courier_service_code: selectedShippingOption.courier_service_code,
                courier_service_name: selectedShippingOption.courier_service_name,
                courier_type: selectedShippingOption.courier_type,
                price: selectedShippingOption.price,
              }
            : undefined,
        },
      )
      savedOrderNumber = savedOrder?.order_number || ''

      setCheckoutStatus({
        state: 'success',
        message: t('cart.checkoutSaved', {
          orderNumber: savedOrder?.order_number || '-',
        }),
      })

      const conversion = resolveCheckoutConversionValue(savedOrder)
      const purchaseContext = buildPurchaseContext(
        savedOrder,
        checkoutItems,
        customerSession || {
          email: checkoutForm.email,
          phone: checkoutForm.whatsapp,
        },
      )

      if (purchaseContext) {
        savePurchaseContext(purchaseContext)
      }

      clearCheckoutAbandoned()

      void setEnhancedConversionUserData({
        email: purchaseContext?.customer?.email || checkoutForm.email,
        phone: purchaseContext?.customer?.phone || checkoutForm.whatsapp,
      })

      trackEvent('cart_checkout_order_saved', {
        source_page: '/cart',
        order_number: savedOrder?.order_number || null,
        order_status: savedOrder?.status || null,
        cart_item_count: itemCount,
        cart_unique_item_count: items.length,
        transaction_id: savedOrder?.order_number || null,
        currency: conversion.currency,
        value: conversion.value,
        value_source: conversion.source,
        items: purchaseContext?.items || [],
      })

      trackEvent('generate_lead', {
        source_page: '/cart',
        order_number: savedOrder?.order_number || null,
        order_status: savedOrder?.status || null,
        transaction_id: savedOrder?.order_number || null,
        currency: conversion.currency,
        value: conversion.value,
        value_source: conversion.source,
        checkout_channel: savedOrder?.checkout_channel || 'midtrans',
        lead_stage: 'pending_payment',
      })

      savePendingPayment(savedOrder.order_number, savedOrder.payment_access_token)

      paymentInProgressRef.current = true

      setCheckoutStatus({
        state: 'loading',
        message:
          savedOrder?.checkout_channel === 'paypal'
            ? (language === 'en' ? 'Opening PayPal...' : 'Membuka PayPal...')
            : (language === 'en' ? 'Opening payment...' : 'Membuka halaman pembayaran...'),
      })

      const openPayment = savedOrder?.checkout_channel === 'paypal' ? payPalOrder : payOrder

      await openPayment(savedOrder.order_number, savedOrder.payment_access_token, {
        onSuccess: () => {
          clearPendingPayment()
          clearCart()
          setMixedSizeDrafts({})
          setCheckoutForm((current) => ({
            ...current,
            notes: '',
          }))
          navigate(`/payment/success?order=${savedOrder.order_number}`)
        },
        onPending: () => {
          clearCart()
          setMixedSizeDrafts({})
          setCheckoutForm((current) => ({
            ...current,
            notes: '',
          }))
          setCheckoutStatus({
            state: 'idle',
            message:
              language === 'en'
                ? 'Payment is pending. You can complete it from your order detail.'
                : 'Pembayaran masih pending. Anda bisa menyelesaikannya dari detail pesanan.',
          })
          navigate(buildOrderDetailPath(savedOrder.order_number, savedOrder.payment_access_token))
        },
        onError: () => {
          setCheckoutStatus({
            state: 'error',
            message: 'Pembayaran gagal atau dibatalkan.',
          })
          navigate(buildOrderDetailPath(savedOrder.order_number, savedOrder.payment_access_token))
        },
        onClose: () => {
          clearCart()
          setMixedSizeDrafts({})
          setCheckoutForm((current) => ({
            ...current,
            notes: '',
          }))
          setCheckoutStatus({
            state: 'idle',
            message:
              language === 'en'
                ? 'Payment window closed. Continue from your order detail anytime.'
                : 'Pembayaran ditutup. Anda bisa melanjutkan dari detail pesanan kapan saja.',
          })
          navigate(buildOrderDetailPath(savedOrder.order_number, savedOrder.payment_access_token))
        },
      }, { paymentSource: 'checkout' })
    } catch (error) {
      const paymentOpenFailed = Boolean(savedOrderNumber)

      setCheckoutStatus({
        state: 'error',
        message:
          error.message
          || (paymentOpenFailed
            ? (language === 'en'
              ? 'Payment could not be opened. Continue from your order detail.'
              : 'Pembayaran tidak dapat dibuka. Lanjutkan dari detail pesanan.')
            : t('cart.checkoutFallback')),
      })

      if (paymentOpenFailed) {
        const pending = getPendingPayment(savedOrderNumber)
        navigate(buildOrderDetailPath(savedOrderNumber, pending?.paymentAccessToken))

        trackEvent('cart_checkout_payment_open_failed', {
          source_page: '/cart',
          order_number: savedOrderNumber,
          cart_item_count: itemCount,
          cart_unique_item_count: items.length,
          error_message: error.message || 'unknown-error',
        })
      } else {
        trackEvent('cart_checkout_order_save_failed', {
          source_page: '/cart',
          cart_item_count: itemCount,
          cart_unique_item_count: items.length,
          error_message: error.message || 'unknown-error',
        })
      }
    } finally {
      paymentInProgressRef.current = false
    }
  }

  const handleGoToCheckout = () => {
    if (items.length === 0) {
      return
    }

    trackEvent('begin_checkout', {
      currency: cartTotals?.currency || 'IDR',
      value:
        cartTotals?.netAmount !== undefined && cartTotals?.netAmount !== null
          ? normalizeGoogleAdsConversionValue(cartTotals.netAmount, cartTotals.currency)
          : undefined,
      source_page: '/cart',
      cart_item_count: itemCount,
      cart_unique_item_count: items.length,
      checkout_step: 'cart_to_checkout',
      items: checkoutItems
        .map((item) => buildGa4ItemFromProduct(item.product, item.quantity))
        .filter(Boolean),
    })

    navigate('/cart/checkout')
  }

  useEffect(() => {
    if (isCheckoutStep && items.length === 0 && !paymentInProgressRef.current) {
      navigate('/cart', { replace: true })
    }
  }, [isCheckoutStep, items.length, navigate])

  const locationOptions = useMemo(
    () => ({
      provinces: provinceOptions,
      cities: cityOptions,
      districts: districtOptions,
    }),
    [provinceOptions, cityOptions, districtOptions],
  )

  const formattedDeliveryAddress = useMemo(() => {
    if (checkoutForm.fulfillment !== 'delivery') {
      return language === 'en' ? 'Pickup at AHR workshop' : 'Ambil di workshop AHR'
    }

    return buildStructuredAddress(checkoutForm, locationOptions) || checkoutForm.addressLine || 'â€”'
  }, [checkoutForm, locationOptions, language])

  const renderCheckoutForm = () => (
    <div className="cart-checkout-form">
      {customerLoading ? (
        <div className="cart-auth-card">
          <p className="cart-auth-copy">{t('cart.authLoading')}</p>
        </div>
      ) : !customerSession && checkoutAuthMode !== 'guest' ? (
        <div className="cart-auth-card">
          <div className="cart-auth-heading">
            <div>
              <span>{t('cart.summaryEyebrow')}</span>
              <h3>{t('cart.loginTitle')}</h3>
            </div>
            <LockKeyhole size={18} />
          </div>
          <p className="cart-auth-copy">{t('cart.loginBody')}</p>

          <div className="cart-auth-tabs" role="tablist" aria-label={t('cart.loginTitle')}>
            <button
              className={authMode === 'login' ? 'cart-auth-tab active' : 'cart-auth-tab'}
              type="button"
              onClick={() => {
                setAuthMode('login')
                setCheckoutAuthMode('login')
              }}
            >
              {t('cart.loginTab')}
            </button>
            <button
              className={authMode === 'register' ? 'cart-auth-tab active' : 'cart-auth-tab'}
              type="button"
              onClick={() => {
                setAuthMode('register')
                setCheckoutAuthMode('register')
              }}
            >
              {t('cart.registerTab')}
            </button>
          </div>

          <CustomerGoogleAuthButton
            returnPath="/cart/checkout"
            disabled={authStatus.state === 'loading'}
            label={t('cart.googleLoginCta')}
          />

          <div className="cart-auth-divider">
            <span>{t('cart.authOrDivider')}</span>
          </div>

          {authMode === 'login' ? (
            <div className="cart-auth-form">
              <div className="cart-form-field">
                <label htmlFor="customer-login-email">{t('cart.customerEmail')}</label>
                <input
                  id="customer-login-email"
                  type="email"
                  value={authForm.email}
                  onChange={(event) => updateAuthForm('email', event.target.value)}
                  required
                />
              </div>
              <div className="cart-form-field">
                <label htmlFor="customer-login-password">{t('cart.password')}</label>
                <input
                  id="customer-login-password"
                  type="password"
                  value={authForm.password}
                  onChange={(event) => updateAuthForm('password', event.target.value)}
                  required
                />
              </div>
              <button
                className="cart-submit-button"
                type="button"
                disabled={authStatus.state === 'loading'}
                onClick={handleCustomerLogin}
              >
                <Mail size={18} />
                <span>{authStatus.state === 'loading' ? t('common.submitting') : t('cart.loginCta')}</span>
              </button>
            </div>
          ) : (
            <div className="cart-auth-form">
              <div className="cart-form-field">
                <label htmlFor="customer-register-name">{t('cart.customerName')}</label>
                <input
                  id="customer-register-name"
                  value={authForm.name}
                  onChange={(event) => updateAuthForm('name', event.target.value)}
                  required
                />
              </div>
              <div className="cart-form-field">
                <label htmlFor="customer-register-email">{t('cart.customerEmail')}</label>
                <input
                  id="customer-register-email"
                  type="email"
                  value={authForm.email}
                  onChange={(event) => updateAuthForm('email', event.target.value)}
                  required
                />
              </div>
              <div className="cart-form-field">
                <label htmlFor="customer-register-whatsapp">{t('cart.customerWhatsapp')}</label>
                <input
                  id="customer-register-whatsapp"
                  value={authForm.whatsapp}
                  onChange={(event) => updateAuthForm('whatsapp', event.target.value)}
                  required
                />
              </div>
              <div className="cart-form-grid">
                <div className="cart-form-field">
                  <label htmlFor="customer-register-password">{t('cart.password')}</label>
                  <input
                    id="customer-register-password"
                    type="password"
                    value={authForm.password}
                    onChange={(event) => updateAuthForm('password', event.target.value)}
                    required
                  />
                </div>
                <div className="cart-form-field">
                  <label htmlFor="customer-register-password-confirmation">{t('cart.passwordConfirmation')}</label>
                  <input
                    id="customer-register-password-confirmation"
                    type="password"
                    value={authForm.passwordConfirmation}
                    onChange={(event) => updateAuthForm('passwordConfirmation', event.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                className="cart-submit-button"
                type="button"
                disabled={authStatus.state === 'loading'}
                onClick={handleCustomerRegister}
              >
                <Mail size={18} />
                <span>{authStatus.state === 'loading' ? t('common.submitting') : t('cart.registerCta')}</span>
              </button>
            </div>
          )}

          {authStatus.message ? <p className={`cart-status ${authStatus.state}`}>{authStatus.message}</p> : null}

          <div className="cart-auth-guest">
            <button
              className="cart-auth-guest-button"
              type="button"
              onClick={() => {
                setCheckoutAuthMode('guest')
                setAuthStatus({ state: 'idle', message: '' })
              }}
            >
              {t('cart.guestCheckoutCta')}
            </button>
            <p>{t('cart.guestCheckoutHint')}</p>
          </div>
        </div>
      ) : (
        <>
          {!customerSession && checkoutAuthMode === 'guest' ? (
            <div className="cart-auth-card cart-auth-card--guest">
              <div className="cart-auth-heading">
                <div>
                  <span>{t('cart.summaryEyebrow')}</span>
                  <h3>{t('cart.guestCheckoutCta')}</h3>
                </div>
              </div>
              <p className="cart-auth-copy">{t('cart.guestCheckoutHint')}</p>
              <button className="cart-auth-guest-back" type="button" onClick={() => setCheckoutAuthMode('login')}>
                {language === 'en' ? 'Use account instead' : 'Pakai akun saja'}
              </button>
            </div>
          ) : null}

          <div className="checkout-confirm-card">
            <div className="checkout-confirm-card-head">
              <h2>{t('cart.deliveryDetails')}</h2>
              <span className="checkout-confirm-card-badge">
                {customerSession ? t('cart.accountTitle') : t('cart.guestCheckoutBadge')}
              </span>
            </div>
            {customerSession ? (
              <div className="checkout-confirm-address">
                <strong>{checkoutForm.name || customerSession.name}</strong>
                <span>{checkoutForm.whatsapp || customerSession.phone}</span>
                <p>{formattedDeliveryAddress}</p>
              </div>
            ) : null}
          </div>

          <div className="cart-form-field">
            <label htmlFor="cart-name">{t('cart.customerName')}</label>
            <input
              id="cart-name"
              value={checkoutForm.name}
              onChange={(event) => updateCheckoutForm('name', event.target.value)}
              required
            />
          </div>

          <div className="cart-form-field">
            <label htmlFor="cart-email">{t('cart.customerEmail')}</label>
            <input
              id="cart-email"
              type="email"
              value={checkoutForm.email}
              onChange={(event) => updateCheckoutForm('email', event.target.value)}
              required
            />
          </div>

          <div className="cart-form-field">
            <label htmlFor="cart-whatsapp">{t('cart.customerWhatsapp')}</label>
            <input
              id="cart-whatsapp"
              value={checkoutForm.whatsapp}
              onChange={(event) => updateCheckoutForm('whatsapp', event.target.value)}
              required
            />
          </div>

          <div className="cart-form-field">
            <label htmlFor="cart-fulfillment">{t('cart.fulfillment')}</label>
            <select
              id="cart-fulfillment"
              value={checkoutForm.fulfillment}
              onChange={(event) => updateCheckoutForm('fulfillment', event.target.value)}
            >
              <option value="delivery">{t('cart.delivery')}</option>
              <option value="pickup">{t('cart.pickup')}</option>
            </select>
          </div>

          {checkoutForm.fulfillment === 'delivery' ? (
            <>
              <div className="cart-form-field">
                <label htmlFor="cart-country">{t('cart.country')}</label>
                <select
                  id="cart-country"
                  value={checkoutForm.countryCode}
                  onChange={(event) => {
                    updateCheckoutFormFields({
                      countryCode: event.target.value,
                      provinceCode: '',
                      cityCode: '',
                      districtCode: '',
                      cityName: '',
                      stateRegion: '',
                      postalCode: '',
                      addressLine: '',
                    })
                    setShippingOptions([])
                    setSelectedShippingOptionKey('')
                    setShippingStatus({ state: 'idle', message: '' })
                  }}
                  required
                >
                  {countryOptions.length > 0 ? (
                    countryOptions.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.label}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="ID">{language === 'en' ? 'Indonesia' : 'Indonesia'}</option>
                      <option value="SG">{language === 'en' ? 'Singapore' : 'Singapura'}</option>
                      <option value="MY">{language === 'en' ? 'Malaysia' : 'Malaysia'}</option>
                      <option value="US">{language === 'en' ? 'United States' : 'Amerika Serikat'}</option>
                    </>
                  )}
                </select>
                {isInternationalCountry(checkoutForm.countryCode) ? (
                  <p className="cart-field-hint">{t('cart.whatsappInternationalHint')}</p>
                ) : null}
              </div>

              {isInternationalCountry(checkoutForm.countryCode) ? (
                <>
                  <div className="cart-form-grid">
                    <div className="cart-form-field">
                      <label htmlFor="cart-city-name">{t('cart.cityName')}</label>
                      <input
                        id="cart-city-name"
                        type="text"
                        value={checkoutForm.cityName}
                        onChange={(event) => updateCheckoutForm('cityName', event.target.value)}
                        required
                      />
                    </div>

                    <div className="cart-form-field">
                      <label htmlFor="cart-state-region">{t('cart.stateRegion')}</label>
                      <input
                        id="cart-state-region"
                        type="text"
                        value={checkoutForm.stateRegion}
                        onChange={(event) => updateCheckoutForm('stateRegion', event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="cart-form-field">
                    <label htmlFor="cart-postal-code">{t('cart.postalCode')}</label>
                    <input
                      id="cart-postal-code"
                      type="text"
                      value={checkoutForm.postalCode}
                      onChange={(event) => updateCheckoutForm('postalCode', event.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
              <div className="cart-form-grid">
                <div className="cart-form-field">
                  <label htmlFor="cart-province">{t('cart.province')}</label>
                  <select
                    id="cart-province"
                    value={checkoutForm.provinceCode}
                    onChange={(event) =>
                      updateCheckoutFormFields({
                        provinceCode: event.target.value,
                        cityCode: '',
                        districtCode: '',
                      })
                    }
                    required
                    disabled={locationLoading.provinces}
                  >
                    <option value="">{t('cart.selectProvince')}</option>
                    {provinceOptions.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cart-form-field">
                  <label htmlFor="cart-city">{t('cart.city')}</label>
                  <select
                    id="cart-city"
                    value={checkoutForm.cityCode}
                    onChange={(event) =>
                      updateCheckoutFormFields({
                        cityCode: event.target.value,
                        districtCode: '',
                      })
                    }
                    required
                    disabled={!checkoutForm.provinceCode || locationLoading.cities}
                  >
                    <option value="">{t('cart.selectCity')}</option>
                    {cityOptions.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="cart-form-field">
                <label htmlFor="cart-district">{t('cart.district')}</label>
                <select
                  id="cart-district"
                  value={checkoutForm.districtCode}
                  onChange={(event) => updateCheckoutForm('districtCode', event.target.value)}
                  required
                  disabled={!checkoutForm.cityCode || locationLoading.districts}
                >
                  <option value="">{t('cart.selectDistrict')}</option>
                  {districtOptions.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              {locationLoading.provinces || locationLoading.cities || locationLoading.districts ? (
                <p className="cart-form-location-status">{t('cart.loadingLocations')}</p>
              ) : null}
                </>
              )}

              <div className="cart-form-field">
                <label htmlFor="cart-address">{t('cart.addressDetail')}</label>
                <textarea
                  id="cart-address"
                  rows="3"
                  value={checkoutForm.addressLine}
                  onChange={(event) => updateCheckoutForm('addressLine', event.target.value)}
                  required
                />
              </div>

              {isInternationalCountry(checkoutForm.countryCode) ? (
                <p className="checkout-confirm-payment-note">
                  {t('cart.internationalShippingNote')}{' '}
                  <Link to="/pengiriman-internasional" target="_blank" rel="noopener noreferrer">
                    {t('cart.internationalShippingPolicyLink')}
                  </Link>
                </p>
              ) : null}

              <div className="checkout-confirm-card checkout-confirm-card-interactive">
                <div className="checkout-confirm-card-head">
                  <h2>{t('cart.shippingMethod')}</h2>
                  <Truck size={18} aria-hidden="true" />
                </div>
                <div className="cart-form-field cart-form-field-shipping">
                  <ShippingOptionPicker
                    options={shippingOptions}
                    selectedKey={selectedShippingOptionKey}
                    onSelect={setSelectedShippingOptionKey}
                    loading={shippingStatus.state === 'loading'}
                    disabled={shippingStatus.state === 'loading'}
                    language={language}
                    currency={checkoutTotals.currency}
                    exchangeRate={exchangeRateMeta}
                  />
                </div>
                {shippingStatus.message ? (
                  <p className={`cart-status ${shippingStatus.state}`}>{shippingStatus.message}</p>
                ) : null}
              </div>
            </>
          ) : null}

          <div className="checkout-confirm-card">
            <div className="checkout-confirm-card-head">
              <h2>{t('cart.paymentMethod')}</h2>
              <CreditCard size={18} aria-hidden="true" />
            </div>
            <p className="checkout-confirm-payment-copy">
              {payWithPayPal
                ? (language === 'en'
                  ? 'You will be redirected to PayPal to complete payment in USD.'
                  : 'Anda akan diarahkan ke PayPal untuk menyelesaikan pembayaran dalam USD.')
                : showInternationalPaymentPicker
                  ? (language === 'en'
                    ? 'Pay securely with your credit or debit card via Midtrans in USD.'
                    : 'Bayar aman dengan kartu kredit/debit via Midtrans dalam USD.')
                  : (language === 'en'
                    ? 'Pay securely online via Midtrans (bank transfer, e-wallet, QRIS, and more).'
                    : 'Bayar aman secara online via Midtrans (transfer bank, e-wallet, QRIS, dan lainnya).')}
            </p>
            {showInternationalPaymentPicker ? (
              <div className="checkout-payment-channel-picker" role="radiogroup" aria-label={language === 'en' ? 'International payment method' : 'Metode pembayaran internasional'}>
                <label className={`checkout-payment-channel-option${internationalPaymentChannel === 'paypal' ? ' is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="international-payment-channel"
                    value="paypal"
                    checked={internationalPaymentChannel === 'paypal'}
                    onChange={() => setInternationalPaymentChannel('paypal')}
                  />
                  <span>
                    <strong>PayPal</strong>
                    <em>{language === 'en' ? 'Pay in USD' : 'Bayar dalam USD'}</em>
                  </span>
                </label>
                <label className={`checkout-payment-channel-option${internationalPaymentChannel === 'midtrans' ? ' is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="international-payment-channel"
                    value="midtrans"
                    checked={internationalPaymentChannel === 'midtrans'}
                    onChange={() => setInternationalPaymentChannel('midtrans')}
                  />
                  <span>
                    <strong>Midtrans</strong>
                    <em>{language === 'en' ? 'Credit / debit card (USD)' : 'Kartu kredit / debit (USD)'}</em>
                  </span>
                </label>
              </div>
            ) : null}
            {payWithPayPal ? (
              <div className="checkout-paypal-badge" aria-hidden="true">
                PayPal
              </div>
            ) : null}
          </div>

          {customerSession ? (
            <button
              className="cart-account-logout checkout-confirm-logout"
              type="button"
              onClick={handleCustomerLogout}
            >
              <LogOut size={16} />
              <span>{t('cart.logout')}</span>
            </button>
          ) : null}
        </>
      )}
    </div>
  )

  const itemHandlers = {
    mixedSizeDrafts,
    getMixedSizeDraft,
    toggleMixedSizeEditor,
    updateMixedSizeDraft,
    applyMixedSizes,
    updateCartItemSize,
    updateCartItemQuantity,
    removeCartItem,
    updateCheckoutForm,
    buildVoucherValidateItems,
    exchangeRate: exchangeRateMeta,
    storePromo,
  }

  return (
    <div
      className={`app-shell${items.length > 0 ? ' app-shell--cart-flow' : ''}`}
    >
      <SiteHeader
        brandHref="/"
        navGroups={pageContent.navGroups}
        ticker={pageContent.ticker}
        utilityAction={{ href: '/#contact', label: t('productDetail.utilityAction') }}
        utilityLinks={pageContent.utilityLinks}
        utilityMessage={pageContent.utilityMessage}
        cartItemCount={itemCount}
        {...getRetailHeaderActions({
          primaryActionLabel: t('cart.continueShopping'),
          onPrimaryAction: () => {
            window.location.href = '/all-products'
          },
        })}
      />

      <main className={`cart-page ${isCheckoutStep ? 'cart-page--checkout' : 'cart-page--cart'}`}>
        {items.length === 0 ? (
          <CartEmptyView language={language} t={t} />
        ) : isCheckoutStep ? (
          <CheckoutStepView
            language={language}
            t={t}
            items={items}
            itemCount={itemCount}
            cartTotals={cartTotals}
            checkoutTotals={checkoutTotals}
            checkoutChargeTotals={checkoutChargeTotals}
            exchangeRateNote={exchangeRateNote}
            checkoutForm={checkoutForm}
            checkoutItems={checkoutItems}
            customerSession={customerSession}
            canPlaceOrder={canPlaceOrder}
            appliedVoucher={appliedVoucher}
            setAppliedVoucher={setAppliedVoucher}
            selectedShippingOption={selectedShippingOption}
            termsAccepted={termsAccepted}
            setTermsAccepted={setTermsAccepted}
            termsError={termsError}
            setTermsError={setTermsError}
            checkoutStatus={checkoutStatus}
            setCheckoutStatus={setCheckoutStatus}
            handleCheckoutSubmit={handleCheckoutSubmit}
            renderCheckoutForm={renderCheckoutForm}
            itemHandlers={itemHandlers}
            shippingEstimate={shippingEstimate}
            shippingEstimateLoading={shippingEstimateLoading}
            storePromo={storePromo}
            promoCartTotals={cartChargeTotals}
            payWithPayPal={payWithPayPal}
            checkoutSubmitLabel={
              payWithPayPal
                ? (language === 'en'
                  ? `Pay with PayPal · ${checkoutTotals?.grandTotalLabel || ''}`
                  : `Bayar dengan PayPal · ${checkoutTotals?.grandTotalLabel || ''}`)
                : ''
            }
          />
        ) : (
          <CartStepView
            language={language}
            t={t}
            items={items}
            itemCount={itemCount}
            cartTotals={cartTotals}
            checkoutTotals={checkoutTotals}
            clearCart={clearCart}
            onCheckout={handleGoToCheckout}
            itemHandlers={itemHandlers}
            shippingEstimate={shippingEstimate}
            shippingEstimateLoading={shippingEstimateLoading}
            storePromo={storePromo}
            promoCartTotals={cartChargeTotals}
          />
        )}
      </main>

      <SiteFooter
        footerGroups={pageContent.footerGroups}
        companyProfile={pageContent.companyProfile}
        contactProfile={pageContent.brand}
        defaultMapLabel={t('common.mapLabel')}
        onWhatsAppClick={(message) => {
          window.open(buildWhatsAppUrl(pageContent.brand.whatsapp_number, message), '_blank', 'noopener,noreferrer')
        }}
        footerMessage={t('allProducts.footerMessage')}
        bottomText={pageContent.footerBottomText}
      />

      {consentPreferences.analytics === 'unknown' && consentPreferences.personalization === 'unknown' ? (
        <CookieConsentBanner
          onAcceptAll={() =>
            applyConsentPreferences({
              analytics: 'accepted',
              personalization: 'accepted',
            })
          }
          onAcceptAnalyticsOnly={() =>
            applyConsentPreferences({
              analytics: 'accepted',
              personalization: 'rejected',
            })
          }
          onAcceptPersonalizationOnly={() =>
            applyConsentPreferences({
              analytics: 'rejected',
              personalization: 'accepted',
            })
          }
          onRejectAll={() =>
            applyConsentPreferences({
              analytics: 'rejected',
              personalization: 'rejected',
            })
          }
        />
      ) : null}
    </div>
  )
}
