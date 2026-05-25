import { useEffect, useMemo, useState, useCallback } from 'react'
import { ArrowLeft, LockKeyhole, LogOut, Mail, MessageCircleMore, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import './App.css'
import CustomerGoogleAuthButton from './components/auth/CustomerGoogleAuthButton'
import ShippingOptionPicker from './components/checkout/ShippingOptionPicker'
import ProductPrice from './components/catalog/ProductPrice'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { initializeAnalyticsAndTrackCurrentPage, trackEvent, updateConsent } from './lib/analytics'
import {
  fetchCatalogShippingRates,
  fetchCatalogCities,
  fetchCatalogDistricts,
  fetchCatalogProvinces,
  getApiUrl,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  saveCatalogOrder,
  updateCustomerProfile,
} from './lib/api'
import { getAttributionParams } from './lib/attribution'
import { getProductSizeOptions, useCart } from './lib/cart.jsx'
import { getConsentPreferences, setConsentPreferences } from './lib/consent'
import { useCustomer } from './lib/customer.jsx'
import { useGoogleAuthCallback } from './lib/googleAuth'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { clearPendingPayment, savePendingPayment } from './lib/pendingPayment'
import { useMidtransPayment } from './lib/useMidtransPayment'
import { clearPersonalizationData } from './lib/personalization'
import { formatCurrencyAmount, getProductPriceDisplay } from './lib/price'
import useDocumentTitle from './lib/useDocumentTitle'

const defaultCheckoutForm = {
  name: '',
  email: '',
  whatsapp: '',
  fulfillment: 'delivery',
  provinceCode: '',
  cityCode: '',
  districtCode: '',
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

function buildStructuredAddress(checkoutForm, locationOptions) {
  if (checkoutForm.fulfillment !== 'delivery') {
    return ''
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
  const pricing = item.product?.pricing || {}

  return (
    (pricing.is_estimated ? pricing.source_currency : pricing.currency) ||
    pricing.source_currency ||
    (language === 'en' ? 'USD' : 'IDR')
  )
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

function getItemPriceAmounts(item, language) {
  const pricing = item.product?.pricing || {}
  const currency = getItemCurrency(item, language)
  const unitNetAmount = getFirstPriceAmount(
    [
      pricing.final_amount_minor,
      pricing.formatted_final,
      item.product?.bestPrice,
      item.product?.price,
    ],
    currency,
  )
  const unitOriginalAmount = getFirstPriceAmount(
    [
      pricing.original_amount_minor,
      pricing.formatted_original,
      item.product?.originalPrice,
      item.product?.price,
      unitNetAmount,
    ],
    currency,
  )

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

function getCartTotals(items, language) {
  const pricedItems = items.map((item) => getItemPriceAmounts(item, language))

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

function getCheckoutTotals(cartTotals, shippingOption, language) {
  const shippingAmount = Number.isFinite(shippingOption?.price) ? shippingOption.price : 0
  const shippingCurrency = shippingOption?.currency || cartTotals?.currency || (language === 'en' ? 'USD' : 'IDR')
  const hasKnownCartTotal = Number.isFinite(cartTotals?.netAmount)
  const grandTotalAmount = hasKnownCartTotal ? cartTotals.netAmount + shippingAmount : null

  return {
    currency: shippingCurrency,
    shippingAmount,
    shippingLabel: formatCurrencyAmount(shippingAmount, shippingCurrency, language),
    grandTotalAmount,
    grandTotalLabel:
      grandTotalAmount !== null
        ? formatCurrencyAmount(grandTotalAmount, shippingCurrency, language)
        : null,
  }
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

function buildCheckoutMessage(items, checkoutForm, language, cartTotals, locationOptions) {
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
    const { currentPrice } = getProductPriceDisplay(group.product, language)
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

function buildCheckoutPayload(items, checkoutForm, language, cartTotals, locationOptions) {
  const firstItemCurrency = items.length > 0 ? getItemCurrency(items[0], language) : language === 'en' ? 'USD' : 'IDR'
  const formattedAddress = buildStructuredAddress(checkoutForm, locationOptions)
  const addressLine = stripTrailingRegionsFromAddressLine(
    checkoutForm.addressLine,
    locationOptions,
    checkoutForm,
  )

  return {
    name: checkoutForm.name,
    email: checkoutForm.email,
    whatsapp: checkoutForm.whatsapp,
    fulfillment: checkoutForm.fulfillment,
    address: formattedAddress || undefined,
    address_line: addressLine || undefined,
    province_code: checkoutForm.provinceCode || undefined,
    city_code: checkoutForm.cityCode || undefined,
    district_code: checkoutForm.districtCode || undefined,
    notes: checkoutForm.notes || undefined,
    locale: language,
    currency: cartTotals?.currency || firstItemCurrency,
    source_page: window.location.pathname,
    referrer_url: document.referrer || undefined,
    ...getAttributionParams(),
    items: items.map((item) => {
      const priceAmounts = getItemPriceAmounts(item, language)

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

function buildShippingQuotePayload(items, checkoutForm, language) {
  return {
    province_code: checkoutForm.provinceCode,
    city_code: checkoutForm.cityCode,
    district_code: checkoutForm.districtCode,
    items: items.map((item) => {
      const priceAmounts = getItemPriceAmounts(item, language)

      return {
        product_slug: item.product.slug,
        product_name: item.product.name,
        product_category: item.product.category || null,
        quantity: item.quantity,
        expected_unit_amount_minor: priceAmounts?.unitNetAmount ?? null,
        expected_original_unit_amount_minor: priceAmounts?.unitOriginalAmount ?? null,
      }
    }),
  }
}

function mapCustomerToCheckoutForm(customer, locationOptions = { provinces: [], cities: [], districts: [] }) {
  const checkoutForm = {
    name: customer?.name || '',
    email: customer?.email || '',
    whatsapp: customer?.phone || '',
    fulfillment: customer?.default_fulfillment_method || 'delivery',
    provinceCode: customer?.default_shipping_province_code || '',
    cityCode: customer?.default_shipping_city_code || '',
    districtCode: customer?.default_shipping_district_code || '',
    addressLine: customer?.default_shipping_address || '',
    notes: '',
  }

  checkoutForm.addressLine = stripTrailingRegionsFromAddressLine(
    checkoutForm.addressLine,
    locationOptions,
    checkoutForm,
  )

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
  return {
    name: checkoutForm.name,
    email: checkoutForm.email,
    whatsapp: checkoutForm.whatsapp,
    fulfillment: checkoutForm.fulfillment,
    address_line: checkoutForm.fulfillment === 'delivery' ? checkoutForm.addressLine : '',
    province_code: checkoutForm.fulfillment === 'delivery' ? checkoutForm.provinceCode : '',
    province_name:
      checkoutForm.fulfillment === 'delivery'
        ? findLocationName(locationOptions.provinces, checkoutForm.provinceCode)
        : '',
    city_code: checkoutForm.fulfillment === 'delivery' ? checkoutForm.cityCode : '',
    city_name:
      checkoutForm.fulfillment === 'delivery' ? findLocationName(locationOptions.cities, checkoutForm.cityCode) : '',
    district_code: checkoutForm.fulfillment === 'delivery' ? checkoutForm.districtCode : '',
    district_name:
      checkoutForm.fulfillment === 'delivery'
        ? findLocationName(locationOptions.districts, checkoutForm.districtCode)
        : '',
  }
}

export default function CartPage() {
  const { language, t } = useLanguage()
  const { customer: customerSession, isLoading: customerLoading, setCustomer: setCustomerSession, refreshCustomer } = useCustomer()
  const navigate = useNavigate()
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
  const { payOrder } = useMidtransPayment()
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )
  const [checkoutForm, setCheckoutForm] = useState(defaultCheckoutForm)
  const [checkoutStatus, setCheckoutStatus] = useState({ state: 'idle', message: '' })
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState(defaultAuthForm)
  const [authStatus, setAuthStatus] = useState({ state: 'idle', message: '' })
  const [mixedSizeDrafts, setMixedSizeDrafts] = useState({})
  const [consentPreferences, setConsentPreferencesState] = useState(() => getConsentPreferences())
  const [provinceOptions, setProvinceOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [shippingOptions, setShippingOptions] = useState([])
  const [selectedShippingOptionKey, setSelectedShippingOptionKey] = useState('')
  const [shippingStatus, setShippingStatus] = useState({ state: 'idle', message: '' })
  const [locationLoading, setLocationLoading] = useState({
    provinces: false,
    cities: false,
    districts: false,
  })

  const cartTotals = useMemo(() => getCartTotals(items, language), [items, language])
  const checkoutItems = useMemo(() => materializeCheckoutItems(items, mixedSizeDrafts), [items, mixedSizeDrafts])
  const selectedShippingOption = useMemo(
    () => getSelectedShippingOption(shippingOptions, selectedShippingOptionKey),
    [shippingOptions, selectedShippingOptionKey],
  )
  const checkoutTotals = useMemo(
    () => getCheckoutTotals(cartTotals, selectedShippingOption, language),
    [cartTotals, selectedShippingOption, language],
  )

  useEffect(() => {
    fetch(getApiUrl(`/api/catalog/landing-page?locale=${language}`), {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Gagal memuat checkout cart')
        }

        return response.json()
      })
      .then((payload) => {
        if (payload?.data) {
          setPageContent(getLandingChromeContent(payload.data, { hashPrefix: '/', locale: language }))
        }
      })
      .catch(() => {
        setPageContent(getLandingChromeContent({}, { hashPrefix: '/', locale: language }))
      })
  }, [language])

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
    setCheckoutForm((current) => ({
      ...mapCustomerToCheckoutForm(customer, {
        provinces: provinceOptions,
        cities: cityOptions,
        districts: districtOptions,
      }),
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
    if (checkoutForm.fulfillment !== 'delivery') {
      setShippingOptions([])
      setSelectedShippingOptionKey('')
      setShippingStatus({ state: 'idle', message: '' })

      return
    }

    if (!checkoutForm.provinceCode || !checkoutForm.cityCode || !checkoutForm.districtCode || checkoutItems.length === 0) {
      setShippingOptions([])
      setSelectedShippingOptionKey('')
      setShippingStatus({ state: 'idle', message: '' })

      return
    }

    let isActive = true

    setShippingStatus({ state: 'loading', message: '' })

    fetchCatalogShippingRates(buildShippingQuotePayload(checkoutItems, checkoutForm, language))
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
    checkoutForm.fulfillment,
    checkoutForm.provinceCode,
    checkoutForm.cityCode,
    checkoutForm.districtCode,
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

    if (!customerSession) {
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

    setCheckoutStatus({
      state: 'loading',
      message: t('cart.profileSyncing'),
    })

    trackEvent('begin_checkout', {
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

    try {
      const syncedCustomer = await updateCustomerProfile(buildCustomerProfilePayload(checkoutForm, locationOptions))

      setCustomerSession(syncedCustomer)
      const savedOrder = await saveCatalogOrder(
        {
          ...buildCheckoutPayload(checkoutItems, checkoutForm, language, cartTotals, locationOptions),
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

      setCheckoutStatus({
        state: 'success',
        message: t('cart.checkoutSaved', {
          orderNumber: savedOrder?.order_number || '-',
        }),
      })

      const conversion = resolveCheckoutConversionValue(savedOrder)

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
      })

      trackEvent('generate_lead', {
        source_page: '/cart',
        order_number: savedOrder?.order_number || null,
        order_status: savedOrder?.status || null,
        transaction_id: savedOrder?.order_number || null,
        currency: conversion.currency,
        value: conversion.value,
        value_source: conversion.source,
        checkout_channel: 'midtrans',
        lead_stage: 'pending_payment',
      })

      savePendingPayment(savedOrder.order_number, savedOrder.payment_access_token)

      setCheckoutStatus({
        state: 'loading',
        message: 'Membuka halaman pembayaran...',
      })

      await payOrder(savedOrder.order_number, savedOrder.payment_access_token, {
        onSuccess: () => {
          clearPendingPayment()
          clearCart()
          setCheckoutForm((current) => ({
            ...current,
            notes: '',
          }))
          setMixedSizeDrafts({})
          navigate(`/payment/success?order=${savedOrder.order_number}`)
        },
        onPending: () => {
          setCheckoutStatus({
            state: 'idle',
            message:
              language === 'en'
                ? 'Payment is pending. You can complete it from your order detail.'
                : 'Pembayaran masih pending. Anda bisa menyelesaikannya dari detail pesanan.',
          })
          navigate(`/akun/pesanan/${savedOrder.order_number}`)
        },
        onError: () => {
          setCheckoutStatus({
            state: 'error',
            message: 'Pembayaran gagal atau dibatalkan.',
          })
          navigate(`/akun/pesanan/${savedOrder.order_number}`)
        },
        onClose: () => {
          setCheckoutStatus({
            state: 'idle',
            message:
              language === 'en'
                ? 'Payment window closed. Continue from your order detail anytime.'
                : 'Pembayaran ditutup. Anda bisa melanjutkan dari detail pesanan kapan saja.',
          })
          navigate(`/akun/pesanan/${savedOrder.order_number}`)
        },
      })
    } catch (error) {
      setCheckoutStatus({
        state: 'error',
        message: error.message || t('cart.checkoutFallback'),
      })

      trackEvent('cart_checkout_order_save_failed', {
        source_page: '/cart',
        cart_item_count: itemCount,
        cart_unique_item_count: items.length,
        error_message: error.message || 'unknown-error',
      })
    }
  }

  return (
    <div className="app-shell">
      <SiteHeader
        brandHref="/"
        navGroups={pageContent.navGroups}
        ticker={pageContent.ticker}
        utilityAction={{ href: '/#contact', label: t('productDetail.utilityAction') }}
        utilityLinks={pageContent.utilityLinks}
        utilityMessage={pageContent.utilityMessage}
        cartItemCount={itemCount}
        onPrimaryAction={() => {
          window.location.href = '/all-products'
        }}
        primaryActionLabel={t('cart.continueShopping')}
      />

      <main className="cart-page">
        <section className="content-block section-plain cart-hero">
          <div className="all-products-breadcrumb">
            <Link to="/all-products">
              <ArrowLeft size={16} />
              <span>{t('cart.backToProducts')}</span>
            </Link>
          </div>

          <div className="section-heading heading-inline cart-heading">
            <div>
              <span>{t('cart.eyebrow')}</span>
              <h1>{t('cart.title')}</h1>
            </div>
            <p>{t('cart.body')}</p>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="content-block section-soft">
            <div className="cart-empty-state">
              <ShoppingBag size={28} />
              <h2>{t('cart.emptyTitle')}</h2>
              <p>{t('cart.emptyBody')}</p>
              <Link className="cta-button cta-button-dark" to="/all-products">
                {t('cart.continueShopping')}
              </Link>
            </div>
          </section>
        ) : (
          <section className="content-block section-soft cart-layout">
            <div className="cart-items-panel">
              <div className="cart-items-heading">
                <div>
                  <span>{t('cart.itemsEyebrow')}</span>
                  <h2>{t('cart.itemsTitle')}</h2>
                </div>
                <button className="cart-clear-button" type="button" onClick={clearCart}>
                  {t('cart.clearCart')}
                </button>
              </div>

              <div className="cart-item-list">
                {items.map((item) => (
                  <article className="cart-item-card" key={item.id}>
                    <Link className="cart-item-media" to={`/produk/${item.product.slug}`} state={{ product: item.product }}>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        width="800"
                        height="1000"
                        loading="lazy"
                        decoding="async"
                        style={{ objectPosition: item.product.imagePosition || 'center center' }}
                      />
                    </Link>

                    <div className="cart-item-copy">
                      <span>{item.product.category || t('common.products')}</span>
                      <h3>{item.product.name}</h3>
                      <ProductPrice product={item.product} />
                      <div className="cart-item-size-row">
                        <label htmlFor={`cart-size-${item.id}`}>{t('common.size')}</label>
                        <select
                          id={`cart-size-${item.id}`}
                          value={item.size}
                          onChange={(event) => updateCartItemSize(item.id, event.target.value)}
                        >
                          {Array.from(new Set([...getProductSizeOptions(item.product), item.size])).map((size) => (
                            <option key={`${item.id}-${size}`} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                      {item.quantity > 1 ? (
                        <div className="cart-item-mixed-size">
                          <button
                            className="cart-item-mixed-size-trigger"
                            type="button"
                            onClick={() => toggleMixedSizeEditor(item)}
                          >
                            {t('cart.mixedSizeTrigger')}
                          </button>
                          {mixedSizeDrafts[item.id] ? (
                            <div className="cart-item-mixed-size-editor">
                              <strong>{t('cart.mixedSizeTitle')}</strong>
                              <div className="cart-item-mixed-size-grid">
                                {getMixedSizeDraft(item).map((selectedSize, index) => (
                                  <label className="cart-item-mixed-size-field" key={`${item.id}-piece-${index + 1}`}>
                                    <span>{t('cart.mixedSizePiece', { number: index + 1 })}</span>
                                    <select
                                      value={selectedSize}
                                      onChange={(event) =>
                                        updateMixedSizeDraft(item.id, index, event.target.value, item.quantity, item.size)
                                      }
                                    >
                                      {Array.from(new Set([...getProductSizeOptions(item.product), item.size])).map((size) => (
                                        <option key={`${item.id}-piece-${index + 1}-${size}`} value={size}>
                                          {size}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                ))}
                              </div>
                              <button
                                className="cart-item-mixed-size-apply"
                                type="button"
                                onClick={() => applyMixedSizes(item)}
                              >
                                {t('cart.mixedSizeApply')}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="cart-item-actions">
                      <div className="cart-quantity-control" aria-label={t('cart.quantity')}>
                        <button
                          type="button"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          aria-label={t('cart.decreaseQuantity')}
                        >
                          <Minus size={15} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          aria-label={t('cart.increaseQuantity')}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                      <button
                        className="cart-remove-button"
                        type="button"
                        onClick={() => removeCartItem(item.id)}
                        aria-label={t('cart.removeItem')}
                      >
                        <Trash2 size={16} />
                        <span>{t('cart.removeItem')}</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="cart-summary-panel">
              <div className="cart-summary-heading">
                <span>{t('cart.summaryEyebrow')}</span>
                <h2>{t('cart.summaryTitle')}</h2>
              </div>

              <div className="cart-summary-list">
                <div className="cart-summary-row">
                  <span>{t('cart.totalItems')}</span>
                  <strong>{t('cart.itemsCount', { count: itemCount })}</strong>
                </div>
                <div className="cart-summary-row">
                  <span>{t('cart.originalTotal')}</span>
                  <strong>{cartTotals?.originalLabel || t('cart.subtotalManual')}</strong>
                </div>
                <div className="cart-summary-row discount">
                  <span>{t('cart.promoTotal')}</span>
                  <strong>{cartTotals?.discountDisplayLabel || t('cart.subtotalManual')}</strong>
                </div>
                <div className="cart-summary-row nett">
                  <span>{t('cart.nettTotal')}</span>
                  <strong>{cartTotals?.netLabel || t('cart.subtotalManual')}</strong>
                </div>
                {checkoutForm.fulfillment === 'delivery' ? (
                  <div className="cart-summary-row">
                    <span>{language === 'en' ? 'Shipping' : 'Ongkir'}</span>
                    <strong>
                      {selectedShippingOption ? checkoutTotals.shippingLabel : language === 'en' ? 'Choose courier' : 'Pilih kurir'}
                    </strong>
                  </div>
                ) : null}
                <div className="cart-summary-row nett">
                  <span>{language === 'en' ? 'Grand total' : 'Total akhir'}</span>
                  <strong>{checkoutTotals.grandTotalLabel || cartTotals?.netLabel || t('cart.subtotalManual')}</strong>
                </div>
              </div>

              <form className="cart-checkout-form" onSubmit={handleCheckoutSubmit}>
                {customerLoading ? (
                  <div className="cart-auth-card">
                    <p className="cart-auth-copy">{t('cart.authLoading')}</p>
                  </div>
                ) : !customerSession ? (
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
                        onClick={() => setAuthMode('login')}
                      >
                        {t('cart.loginTab')}
                      </button>
                      <button
                        className={authMode === 'register' ? 'cart-auth-tab active' : 'cart-auth-tab'}
                        type="button"
                        onClick={() => setAuthMode('register')}
                      >
                        {t('cart.registerTab')}
                      </button>
                    </div>

                    <CustomerGoogleAuthButton
                      returnPath="/cart"
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
                  </div>
                ) : (
                  <div className="cart-auth-card customer-account-card">
                    <div className="cart-auth-heading">
                      <div>
                        <span>{t('cart.summaryEyebrow')}</span>
                        <h3>{t('cart.accountTitle')}</h3>
                      </div>
                      <button className="cart-account-logout" type="button" onClick={handleCustomerLogout}>
                        <LogOut size={16} />
                        <span>{t('cart.logout')}</span>
                      </button>
                    </div>
                    <p className="cart-auth-copy">{t('cart.accountBody')}</p>
                    <div className="cart-account-meta">
                      <strong>{customerSession.name}</strong>
                      <span>{customerSession.email}</span>
                    </div>
                  </div>
                )}

                {!customerSession ? null : (
                  <>
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

                    <div className="cart-form-field cart-form-field-shipping">
                      <ShippingOptionPicker
                        options={shippingOptions}
                        selectedKey={selectedShippingOptionKey}
                        onSelect={setSelectedShippingOptionKey}
                        loading={shippingStatus.state === 'loading'}
                        disabled={shippingStatus.state === 'loading'}
                        language={language}
                        currency={checkoutTotals.currency}
                      />
                    </div>

                    {shippingStatus.message ? (
                      <p className={`cart-status ${shippingStatus.state}`}>{shippingStatus.message}</p>
                    ) : null}
                  </>
                ) : null}

                <div className="cart-form-field">
                  <label htmlFor="cart-notes">{t('cart.notes')}</label>
                  <textarea
                    id="cart-notes"
                    rows="3"
                    value={checkoutForm.notes}
                    onChange={(event) => updateCheckoutForm('notes', event.target.value)}
                  />
                </div>

                <button className="cart-submit-button" type="submit" disabled={checkoutStatus.state === 'loading'}>
                  <MessageCircleMore size={18} />
                  <span>{checkoutStatus.state === 'loading' ? t('common.submitting') : t('cart.checkoutPay')}</span>
                </button>
                {checkoutStatus.message ? (
                  <p className={`cart-status ${checkoutStatus.state}`}>{checkoutStatus.message}</p>
                ) : null}
                  </>
                )}
              </form>
            </aside>
          </section>
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
