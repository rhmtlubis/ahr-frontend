import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ChevronRight, LockKeyhole, LogOut, Mail, MapPin, Package, Truck } from 'lucide-react'
import { getShipmentPhaseLabel } from './lib/shipmentTracking'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import './App.css'
import CustomerGoogleAuthButton from './components/auth/CustomerGoogleAuthButton'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { initializeAnalyticsAndTrackCurrentPage, trackEvent, updateConsent } from './lib/analytics'
import {
  fetchCatalogCities,
  fetchCatalogDistricts,
  fetchCatalogProvinces,
  fetchCatalogShippingCountries,
  fetchCustomerOrders,
  fetchCatalogLandingPage,
  getApiUrl,
  changeCustomerPassword,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  requestCustomerPasswordReset,
  resetCustomerPassword,
  updateCustomerProfile,
} from './lib/api'
import { useCart } from './lib/cart.jsx'
import { getConsentPreferences, setConsentPreferences } from './lib/consent'
import { useCustomer } from './lib/customer.jsx'
import { useGoogleAuthCallback } from './lib/googleAuth'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { getRetailHeaderActions, getStoreBrandName, isCssStore } from './lib/storeConfig'
import useDocumentTitle from './lib/useDocumentTitle'
import { clearPersonalizationData } from './lib/personalization'
import { fetchStorePromo } from './lib/storePromo'
import {
  formatOrderDisplayAmount,
  formatOrderHistoryPricingNote,
  getPaymentChannelLabel,
} from './lib/orderDisplay'
import { getCountryLabel, isInternationalCountry } from './lib/shippingCountries'

const ORDER_STATUS_FILTERS = [
  { value: 'all', labelId: 'Semua', labelEn: 'All' },
  { value: 'pending_whatsapp', labelId: 'Menunggu pembayaran', labelEn: 'Awaiting payment' },
  { value: 'confirmed', labelId: 'Sudah dibayar', labelEn: 'Paid' },
  { value: 'processing', labelId: 'Diproses', labelEn: 'Processing' },
  { value: 'completed', labelId: 'Selesai', labelEn: 'Completed' },
  { value: 'payment_expired', labelId: 'Kedaluwarsa', labelEn: 'Expired' },
  { value: 'cancelled', labelId: 'Dibatalkan', labelEn: 'Cancelled' },
]

function getOrderStatusLabel(status, language) {
  const labels = {
    pending_whatsapp: language === 'en' ? 'Awaiting payment' : 'Menunggu pembayaran',
    confirmed: language === 'en' ? 'Paid' : 'Sudah dibayar',
    processing: language === 'en' ? 'Processing' : 'Diproses',
    completed: language === 'en' ? 'Completed' : 'Selesai',
    cancelled: language === 'en' ? 'Cancelled' : 'Dibatalkan',
    payment_expired: language === 'en' ? 'Payment expired' : 'Pembayaran kedaluwarsa',
  }

  return labels[status] || status
}

function getOrderFilterLabel(filter, language) {
  return language === 'en' ? filter.labelEn : filter.labelId
}

function formatOrderDate(isoDate, language) {
  if (!isoDate) {
    return '-'
  }

  return new Date(isoDate).toLocaleDateString(language === 'en' ? 'en-ID' : 'id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function CustomerOrderRow({ order, language, exchangeRateMeta, storePromo }) {
  const statusLabel = getOrderStatusLabel(order.status, language)
  const tracking = order.shipment_tracking
  const trackingLabel = tracking ? getShipmentPhaseLabel(tracking.phase, language) : null
  const paymentChannelLabel = getPaymentChannelLabel(order.checkout_channel, language)

  return (
    <Link className="customer-order-row" to={`/akun/pesanan/${order.order_number}`}>
      <div className="customer-order-row-order">
        <strong>{order.order_number}</strong>
        <span>{formatOrderDate(order.created_at, language)}</span>
        {paymentChannelLabel ? (
          <span
            className={`customer-order-payment-channel customer-order-payment-channel-${order.checkout_channel || 'unknown'}`}
          >
            {paymentChannelLabel}
          </span>
        ) : null}
        {trackingLabel ? (
          <span className={`customer-order-row-tracking customer-order-row-tracking-${tracking.phase}`}>
            <Truck size={14} aria-hidden="true" />
            {tracking.waybill_id ? `${trackingLabel} · ${tracking.waybill_id}` : trackingLabel}
          </span>
        ) : null}
      </div>

      <span className={`customer-order-status customer-order-status-${order.status}`}>{statusLabel}</span>

      <span className="customer-order-row-amount">
        {formatOrderDisplayAmount(order, language, exchangeRateMeta, storePromo)}
      </span>

      <span className="customer-order-row-action">
        {order.can_pay ? (
          <em>{language === 'en' ? 'Pay now' : 'Bayar sekarang'}</em>
        ) : (
          <>
            <span>{language === 'en' ? 'Detail' : 'Detail'}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </>
        )}
      </span>
    </Link>
  )
}

const defaultProfileForm = {
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
}

const defaultAuthForm = {
  name: '',
  email: '',
  whatsapp: '',
  password: '',
  passwordConfirmation: '',
}

const defaultPasswordForm = {
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
}

function buildWhatsAppUrl(phoneNumber, message) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
}

function findLocationName(options, code) {
  return options.find((option) => option.code === code)?.name || ''
}

function mapCustomerToProfileForm(customer) {
  const countryCode = customer?.default_shipping_country_code || 'ID'
  const isInternational = isInternationalCountry(countryCode)

  return {
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
  }
}

function mapCustomerToAuthForm(customer) {
  return {
    ...defaultAuthForm,
    name: customer?.name || '',
    email: customer?.email || '',
    whatsapp: customer?.phone || '',
  }
}

export default function CustomerAccountPage() {
  const { language, t } = useLanguage()
  const { itemCount } = useCart()
  const location = useLocation()
  const { customer, isLoading: customerLoading, setCustomer, refreshCustomer } = useCustomer()
  const [searchParams] = useSearchParams()
  const isResetPasswordPage = location.pathname === '/akun/reset-password'
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )
  const [authMode, setAuthMode] = useState(() => {
    if (isResetPasswordPage) {
      return 'reset'
    }

    return searchParams.get('auth') === 'forgot' ? 'forgot' : 'login'
  })
  const [authForm, setAuthForm] = useState(defaultAuthForm)
  const [resetForm, setResetForm] = useState({
    email: searchParams.get('email') || '',
    token: searchParams.get('token') || '',
    password: '',
    passwordConfirmation: '',
  })
  const [profileForm, setProfileForm] = useState(defaultProfileForm)
  const [authStatus, setAuthStatus] = useState({ state: 'idle', message: '' })
  const [profileStatus, setProfileStatus] = useState({ state: 'idle', message: '' })
  const [passwordForm, setPasswordForm] = useState(defaultPasswordForm)
  const [passwordStatus, setPasswordStatus] = useState({ state: 'idle', message: '' })
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({})
  const [profileFieldErrors, setProfileFieldErrors] = useState({})
  const [consentPreferences, setConsentPreferencesState] = useState(() => getConsentPreferences())
  const [provinceOptions, setProvinceOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [countryOptions, setCountryOptions] = useState([])
  const [locationLoading, setLocationLoading] = useState({
    provinces: false,
    cities: false,
    districts: false,
  })
  const [orders, setOrders] = useState([])
  const [ordersStatus, setOrdersStatus] = useState({ state: 'idle', message: '' })
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [exchangeRateMeta, setExchangeRateMeta] = useState(null)
  const [storePromo, setStorePromo] = useState(null)

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
        setProfileForm(mapCustomerToProfileForm(status.customer))
        setAuthForm(mapCustomerToAuthForm(status.customer))
      }
    },
    [t],
  )

  useGoogleAuthCallback({
    refreshCustomer,
    setCustomer,
    onStatus: handleGoogleAuthStatus,
  })

  useEffect(() => {
    if (isResetPasswordPage) {
      setAuthMode('reset')
      setResetForm((current) => ({
        ...current,
        email: searchParams.get('email') || current.email,
        token: searchParams.get('token') || current.token,
      }))
      return
    }

    if (searchParams.get('auth') === 'forgot') {
      setAuthMode('forgot')
    }
  }, [isResetPasswordPage, searchParams])

  useDocumentTitle(
    language === 'en' ? 'Customer Account' : 'Akun Customer',
    language === 'en'
      ? 'Manage your customer profile, shipping address, and checkout identity before paying.'
      : 'Kelola profil customer, alamat pengiriman, dan identitas checkout sebelum melakukan pembayaran.',
    {
      canonicalPath: '/akun',
      image: '/ahr-brand-logo.webp',
      imageAlt: 'Akun customer AHR',
      locale: language,
      robots: 'noindex, nofollow',
      type: 'website',
    },
  )

  useEffect(() => {
    fetchCatalogShippingCountries(language)
      .then((countries) => setCountryOptions(Array.isArray(countries) ? countries : []))
      .catch(() => setCountryOptions([]))
  }, [language])

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
    if (!customer) {
      setProfileForm(defaultProfileForm)
      setAuthForm(defaultAuthForm)
      setOrders([])
      return
    }

    setProfileForm(mapCustomerToProfileForm(customer))
    setAuthForm(mapCustomerToAuthForm(customer))
  }, [customer])

  const loadOrders = useCallback(async () => {
    setOrdersStatus({ state: 'loading', message: '' })

    try {
      const data = await fetchCustomerOrders()
      setOrders(data)
      setOrdersStatus({ state: 'idle', message: '' })
    } catch (error) {
      const message = error.message || ''
      setOrders([])
      setOrdersStatus({
        state: 'error',
        message: message.toLowerCase().includes('unauthenticated')
          ? language === 'en'
            ? 'Your session has expired. Please sign in again.'
            : 'Sesi Anda berakhir. Silakan login ulang.'
          : message,
      })

      if (message.toLowerCase().includes('unauthenticated')) {
        await refreshCustomer()
      }
    }
  }, [language, refreshCustomer])

  useEffect(() => {
    if (!customer) {
      return
    }

    loadOrders()
  }, [customer, loadOrders])

  useEffect(() => {
    if (location.pathname !== '/akun' || customerLoading) {
      return
    }

    refreshCustomer().catch(() => {})
  }, [location.pathname, customerLoading, refreshCustomer])

  useEffect(() => {
    if (location.pathname !== '/akun' || customerLoading || !customer) {
      return
    }

    loadOrders()
  }, [location.pathname, customerLoading, customer, loadOrders])

  useEffect(() => {
    let isActive = true

    setLocationLoading((current) => ({ ...current, provinces: true }))

    fetchCatalogProvinces()
      .then((data) => {
        if (isActive) {
          setProvinceOptions(data)
        }
      })
      .catch(() => {
        if (isActive) {
          setProvinceOptions([])
        }
      })
      .finally(() => {
        if (isActive) {
          setLocationLoading((current) => ({ ...current, provinces: false }))
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!profileForm.provinceCode) {
      setCityOptions([])
      setDistrictOptions([])
      return
    }

    let isActive = true
    setLocationLoading((current) => ({ ...current, cities: true }))

    fetchCatalogCities(profileForm.provinceCode)
      .then((data) => {
        if (isActive) {
          setCityOptions(data)
        }
      })
      .catch(() => {
        if (isActive) {
          setCityOptions([])
        }
      })
      .finally(() => {
        if (isActive) {
          setLocationLoading((current) => ({ ...current, cities: false }))
        }
      })

    return () => {
      isActive = false
    }
  }, [profileForm.provinceCode])

  useEffect(() => {
    if (!profileForm.cityCode) {
      setDistrictOptions([])
      return
    }

    let isActive = true
    setLocationLoading((current) => ({ ...current, districts: true }))

    fetchCatalogDistricts(profileForm.cityCode)
      .then((data) => {
        if (isActive) {
          setDistrictOptions(data)
        }
      })
      .catch(() => {
        if (isActive) {
          setDistrictOptions([])
        }
      })
      .finally(() => {
        if (isActive) {
          setLocationLoading((current) => ({ ...current, districts: false }))
        }
      })

    return () => {
      isActive = false
    }
  }, [profileForm.cityCode])

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
      personalization_scope: 'customer-account',
      source_page: '/akun',
    })
  }

  const orderPricingNote = useMemo(
    () => formatOrderHistoryPricingNote(exchangeRateMeta, storePromo, language),
    [exchangeRateMeta, language, storePromo],
  )

  const orderStatusCounts = useMemo(() => {
    const counts = { all: orders.length }

    for (const order of orders) {
      counts[order.status] = (counts[order.status] || 0) + 1
    }

    return counts
  }, [orders])

  const visibleOrderStatusFilters = useMemo(
    () =>
      ORDER_STATUS_FILTERS.filter(
        (filter) => filter.value === 'all' || (orderStatusCounts[filter.value] || 0) > 0,
      ),
    [orderStatusCounts],
  )

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') {
      return orders
    }

    return orders.filter((order) => order.status === orderStatusFilter)
  }, [orderStatusFilter, orders])

  useEffect(() => {
    if (orderStatusFilter === 'all') {
      return
    }

    if ((orderStatusCounts[orderStatusFilter] || 0) === 0) {
      setOrderStatusFilter('all')
    }
  }, [orderStatusCounts, orderStatusFilter])

  const profileSummary = useMemo(() => {
    if (profileForm.fulfillment !== 'delivery') {
      return ''
    }

    if (isInternationalCountry(profileForm.countryCode)) {
      return [
        profileForm.addressLine,
        profileForm.cityName,
        profileForm.stateRegion,
        profileForm.postalCode,
        getCountryLabel(countryOptions, profileForm.countryCode),
      ]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .join(', ')
    }

    return [
      profileForm.addressLine,
      findLocationName(districtOptions, profileForm.districtCode),
      findLocationName(cityOptions, profileForm.cityCode),
      findLocationName(provinceOptions, profileForm.provinceCode),
    ]
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .join(', ')
  }, [cityOptions, countryOptions, districtOptions, profileForm, provinceOptions])

  const updateAuthForm = (field, value) => {
    if (authStatus.message) {
      setAuthStatus({ state: 'idle', message: '' })
    }

    setAuthForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const updateProfileForm = (updates) => {
    if (profileStatus.message) {
      setProfileStatus({ state: 'idle', message: '' })
    }

    if (Object.keys(profileFieldErrors).length > 0) {
      setProfileFieldErrors({})
    }

    setProfileForm((current) => ({
      ...current,
      ...updates,
    }))
  }

  const updatePasswordForm = (updates) => {
    if (passwordStatus.message) {
      setPasswordStatus({ state: 'idle', message: '' })
    }

    if (Object.keys(passwordFieldErrors).length > 0) {
      setPasswordFieldErrors({})
    }

    setPasswordForm((current) => ({
      ...current,
      ...updates,
    }))
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setAuthStatus({ state: 'loading', message: '' })

    try {
      const nextCustomer = await loginCustomer({
        email: authForm.email,
        password: authForm.password,
      })

      setCustomer(nextCustomer)
      setAuthStatus({ state: 'success', message: '' })
    } catch (error) {
      setAuthStatus({ state: 'error', message: error.message })
    }
  }

  const handleForgotPassword = async (event) => {
    event.preventDefault()
    setAuthStatus({ state: 'loading', message: '' })

    try {
      const result = await requestCustomerPasswordReset({
        email: authForm.email,
        frontendUrl: window.location.origin,
      })

      setAuthStatus({
        state: 'success',
        message: result.message,
      })
    } catch (error) {
      setAuthStatus({ state: 'error', message: error.message })
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    setAuthStatus({ state: 'loading', message: '' })

    try {
      const result = await resetCustomerPassword({
        email: resetForm.email,
        token: resetForm.token,
        password: resetForm.password,
        password_confirmation: resetForm.passwordConfirmation,
      })

      setCustomer(result.data)
      setAuthStatus({
        state: 'success',
        message: result.message,
      })
    } catch (error) {
      setAuthStatus({ state: 'error', message: error.message })
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setAuthStatus({ state: 'loading', message: '' })

    try {
      const nextCustomer = await registerCustomer({
        name: authForm.name,
        email: authForm.email,
        whatsapp: authForm.whatsapp,
        password: authForm.password,
        password_confirmation: authForm.passwordConfirmation,
      })

      setCustomer(nextCustomer)
      setAuthMode('login')
      setAuthStatus({ state: 'success', message: '' })
    } catch (error) {
      setAuthStatus({ state: 'error', message: error.message })
    }
  }

  const handleLogout = async () => {
    setProfileStatus({ state: 'loading', message: '' })

    try {
      await logoutCustomer()
      setCustomer(null)
      setPasswordForm(defaultPasswordForm)
      setPasswordStatus({ state: 'idle', message: '' })
      setPasswordFieldErrors({})
      setProfileStatus({ state: 'idle', message: '' })
      setAuthStatus({ state: 'idle', message: '' })
    } catch (error) {
      setProfileStatus({ state: 'error', message: error.message })
    }
  }

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setProfileStatus({ state: 'loading', message: t('cart.profileSyncing') })
    setProfileFieldErrors({})

    try {
      const isInternational = isInternationalCountry(profileForm.countryCode)

      const nextCustomer = await updateCustomerProfile({
        name: profileForm.name,
        email: profileForm.email,
        whatsapp: profileForm.whatsapp,
        fulfillment: profileForm.fulfillment,
        country_code: profileForm.fulfillment === 'delivery' ? profileForm.countryCode : 'ID',
        address_line: profileForm.fulfillment === 'delivery' ? profileForm.addressLine : '',
        ...(isInternational
          ? {
              city_name: profileForm.cityName,
              state_region: profileForm.stateRegion,
              postal_code: profileForm.postalCode,
              province_code: '',
              province_name: '',
              city_code: '',
              district_code: '',
              district_name: '',
            }
          : {
              province_code: profileForm.fulfillment === 'delivery' ? profileForm.provinceCode : '',
              province_name:
                profileForm.fulfillment === 'delivery'
                  ? findLocationName(provinceOptions, profileForm.provinceCode)
                  : '',
              city_code: profileForm.fulfillment === 'delivery' ? profileForm.cityCode : '',
              city_name:
                profileForm.fulfillment === 'delivery' ? findLocationName(cityOptions, profileForm.cityCode) : '',
              district_code: profileForm.fulfillment === 'delivery' ? profileForm.districtCode : '',
              district_name:
                profileForm.fulfillment === 'delivery'
                  ? findLocationName(districtOptions, profileForm.districtCode)
                  : '',
              postal_code: '',
              state_region: '',
            }),
      })

      setCustomer(nextCustomer)
      setProfileStatus({
        state: 'success',
        message: language === 'en' ? 'Customer profile saved.' : 'Profil customer berhasil disimpan.',
      })
    } catch (error) {
      setProfileFieldErrors(error.fieldErrors || {})
      setProfileStatus({ state: 'error', message: error.message })

      if (error.fieldErrors?.whatsapp) {
        document.getElementById('profile-whatsapp')?.focus()
      }
    }
  }

  const handlePasswordSave = async (event) => {
    event.preventDefault()
    setPasswordStatus({
      state: 'loading',
      message: language === 'en' ? 'Updating password...' : 'Mengubah password...',
    })
    setPasswordFieldErrors({})

    try {
      const payload = {
        password: passwordForm.password,
        password_confirmation: passwordForm.passwordConfirmation,
      }

      if (customer?.has_password) {
        payload.current_password = passwordForm.currentPassword
      }

      const result = await changeCustomerPassword(payload)
      setCustomer(result.data)
      setPasswordForm(defaultPasswordForm)
      setPasswordStatus({
        state: 'success',
        message:
          result.message ||
          (language === 'en' ? 'Password updated successfully.' : 'Password berhasil diubah.'),
      })
    } catch (error) {
      setPasswordFieldErrors(error.fieldErrors || {})
      setPasswordStatus({ state: 'error', message: error.message })
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
        {...getRetailHeaderActions({
          primaryActionLabel: t('cart.continueShopping'),
          onPrimaryAction: () => {
            window.location.href = '/all-products'
          },
        })}
      />

      <main className="cart-page customer-account-page">
        <section className="content-block section-plain cart-hero customer-account-hero">
          <div className="all-products-breadcrumb">
            <Link to={isCssStore() ? '/all-products' : '/'}>
              <ArrowLeft size={16} />
              <span>{isCssStore() ? (language === 'en' ? 'Back to store' : 'Kembali ke toko') : t('common.backToHome')}</span>
            </Link>
          </div>

          <div className="section-heading heading-inline cart-heading customer-account-heading">
            <div>
              <span>{isCssStore() ? getStoreBrandName() : t('common.profileLabel')}</span>
              <h1>{language === 'en' ? 'Customer Account' : 'Akun Customer'}</h1>
              <p>
                {language === 'en'
                  ? 'Log in first, then keep your email, phone number, and shipping address ready for faster checkout.'
                  : 'Login lebih awal, lalu simpan email, no. telepon, dan alamat pengiriman agar checkout lebih cepat.'}
              </p>
            </div>
          </div>
        </section>

        <section className="content-block section-soft account-page-layout customer-account-shell">
          <aside className="cart-summary-panel customer-account-sidebar">
            {customerLoading ? (
              <div className="cart-auth-card">
                <p className="cart-auth-copy">{t('cart.authLoading')}</p>
              </div>
            ) : !customer ? (
              <div className="cart-auth-card">
                <div className="cart-auth-heading">
                  <div>
                    <span>{t('cart.summaryEyebrow')}</span>
                    <h3>
                      {authMode === 'forgot'
                        ? t('cart.forgotPasswordTitle')
                        : authMode === 'reset'
                          ? t('cart.resetPasswordTitle')
                          : t('cart.loginTitle')}
                    </h3>
                  </div>
                  <LockKeyhole size={18} />
                </div>
                <p className="cart-auth-copy">
                  {authMode === 'forgot'
                    ? t('cart.forgotPasswordBody')
                    : authMode === 'reset'
                      ? t('cart.resetPasswordBody')
                      : t('cart.loginBody')}
                </p>

                {authMode === 'login' || authMode === 'register' ? (
                  <>
                    <div className="cart-auth-tabs">
                      <button
                        className={authMode === 'login' ? 'cart-auth-tab active' : 'cart-auth-tab'}
                        type="button"
                        onClick={() => {
                          setAuthMode('login')
                          setAuthStatus({ state: 'idle', message: '' })
                        }}
                      >
                        {t('cart.loginTab')}
                      </button>
                      <button
                        className={authMode === 'register' ? 'cart-auth-tab active' : 'cart-auth-tab'}
                        type="button"
                        onClick={() => {
                          setAuthMode('register')
                          setAuthStatus({ state: 'idle', message: '' })
                        }}
                      >
                        {t('cart.registerTab')}
                      </button>
                    </div>

                    <CustomerGoogleAuthButton
                      returnPath="/akun"
                      disabled={authStatus.state === 'loading'}
                      label={t('cart.googleLoginCta')}
                    />

                    <div className="cart-auth-divider">
                      <span>{t('cart.authOrDivider')}</span>
                    </div>

                    <form className="cart-auth-form" onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
                      {authMode === 'register' ? (
                        <div className="cart-form-field">
                          <label htmlFor="account-register-name">{t('cart.customerName')}</label>
                          <input
                            id="account-register-name"
                            value={authForm.name}
                            onChange={(event) => updateAuthForm('name', event.target.value)}
                            required
                          />
                        </div>
                      ) : null}

                      <div className="cart-form-field">
                        <label htmlFor="account-email">{t('cart.customerEmail')}</label>
                        <input
                          id="account-email"
                          type="email"
                          value={authForm.email}
                          onChange={(event) => updateAuthForm('email', event.target.value)}
                          required
                        />
                      </div>

                      {authMode === 'register' ? (
                        <div className="cart-form-field">
                          <label htmlFor="account-whatsapp">{t('cart.customerWhatsapp')}</label>
                          <input
                            id="account-whatsapp"
                            value={authForm.whatsapp}
                            onChange={(event) => updateAuthForm('whatsapp', event.target.value)}
                            required
                          />
                        </div>
                      ) : null}

                      <div className="cart-form-grid">
                        <div className="cart-form-field">
                          <label htmlFor="account-password">{t('cart.password')}</label>
                          <input
                            id="account-password"
                            type="password"
                            value={authForm.password}
                            onChange={(event) => updateAuthForm('password', event.target.value)}
                            required
                          />
                          {authMode === 'login' ? (
                            <button
                              className="cart-forgot-password-link"
                              type="button"
                              onClick={() => {
                                setAuthMode('forgot')
                                setAuthStatus({ state: 'idle', message: '' })
                              }}
                            >
                              {t('cart.forgotPasswordLink')}
                            </button>
                          ) : null}
                        </div>

                        {authMode === 'register' ? (
                          <div className="cart-form-field">
                            <label htmlFor="account-password-confirm">{t('cart.passwordConfirmation')}</label>
                            <input
                              id="account-password-confirm"
                              type="password"
                              value={authForm.passwordConfirmation}
                              onChange={(event) => updateAuthForm('passwordConfirmation', event.target.value)}
                              required
                            />
                          </div>
                        ) : null}
                      </div>

                      <button className="cart-submit-button" type="submit" disabled={authStatus.state === 'loading'}>
                        <Mail size={18} />
                        <span>
                          {authStatus.state === 'loading'
                            ? t('common.submitting')
                            : authMode === 'login'
                              ? t('cart.loginCta')
                              : t('cart.registerCta')}
                        </span>
                      </button>
                      {authStatus.message ? <p className={`cart-status ${authStatus.state}`}>{authStatus.message}</p> : null}
                    </form>
                  </>
                ) : null}

                {authMode === 'forgot' ? (
                  <form className="cart-auth-form" onSubmit={handleForgotPassword}>
                    <div className="cart-form-field">
                      <label htmlFor="account-forgot-email">{t('cart.customerEmail')}</label>
                      <input
                        id="account-forgot-email"
                        type="email"
                        value={authForm.email}
                        onChange={(event) => updateAuthForm('email', event.target.value)}
                        required
                      />
                    </div>

                    <button className="cart-submit-button" type="submit" disabled={authStatus.state === 'loading'}>
                      <Mail size={18} />
                      <span>
                        {authStatus.state === 'loading' ? t('common.submitting') : t('cart.forgotPasswordCta')}
                      </span>
                    </button>
                    <button
                      className="cart-forgot-password-link"
                      type="button"
                      onClick={() => {
                        setAuthMode('login')
                        setAuthStatus({ state: 'idle', message: '' })
                      }}
                    >
                      {t('cart.forgotPasswordBack')}
                    </button>
                    {authStatus.message ? <p className={`cart-status ${authStatus.state}`}>{authStatus.message}</p> : null}
                  </form>
                ) : null}

                {authMode === 'reset' ? (
                  <form className="cart-auth-form" onSubmit={handleResetPassword}>
                    <div className="cart-form-field">
                      <label htmlFor="account-reset-email">{t('cart.customerEmail')}</label>
                      <input
                        id="account-reset-email"
                        type="email"
                        value={resetForm.email}
                        onChange={(event) =>
                          setResetForm((current) => ({ ...current, email: event.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="cart-form-grid">
                      <div className="cart-form-field">
                        <label htmlFor="account-reset-password">{t('cart.password')}</label>
                        <input
                          id="account-reset-password"
                          type="password"
                          minLength={8}
                          value={resetForm.password}
                          onChange={(event) =>
                            setResetForm((current) => ({ ...current, password: event.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="cart-form-field">
                        <label htmlFor="account-reset-password-confirm">{t('cart.passwordConfirmation')}</label>
                        <input
                          id="account-reset-password-confirm"
                          type="password"
                          minLength={8}
                          value={resetForm.passwordConfirmation}
                          onChange={(event) =>
                            setResetForm((current) => ({
                              ...current,
                              passwordConfirmation: event.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>

                    <button
                      className="cart-submit-button"
                      type="submit"
                      disabled={authStatus.state === 'loading' || !resetForm.token}
                    >
                      <LockKeyhole size={18} />
                      <span>
                        {authStatus.state === 'loading' ? t('common.submitting') : t('cart.resetPasswordCta')}
                      </span>
                    </button>
                    {!resetForm.token ? (
                      <p className="cart-status error">
                        {language === 'en'
                          ? 'Reset link is invalid. Please request a new one.'
                          : 'Link reset tidak valid. Silakan minta link baru.'}
                      </p>
                    ) : null}
                    <button
                      className="cart-forgot-password-link"
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot')
                        setAuthStatus({ state: 'idle', message: '' })
                      }}
                    >
                      {t('cart.forgotPasswordBack')}
                    </button>
                    {authStatus.message ? <p className={`cart-status ${authStatus.state}`}>{authStatus.message}</p> : null}
                  </form>
                ) : null}
              </div>
            ) : (
              <div className="cart-auth-card customer-account-card">
                <div className="cart-auth-heading">
                  <div>
                    <span>{t('cart.summaryEyebrow')}</span>
                    <h3>{t('cart.accountTitle')}</h3>
                  </div>
                  <button className="cart-account-logout" type="button" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>{t('cart.logout')}</span>
                  </button>
                </div>
                <p className="cart-auth-copy">{t('cart.accountBody')}</p>
                <div className="cart-account-meta">
                  <strong>{customer.name}</strong>
                  <span>{customer.email}</span>
                </div>
              </div>
            )}
          </aside>

          <div className="customer-account-main">
            {customer ? (
              <section className="customer-account-orders-panel">
                <div className="customer-section-heading customer-section-heading-row">
                  <div>
                    <span>{language === 'en' ? 'Orders' : 'Pesanan'}</span>
                    <h2>{language === 'en' ? 'Recent orders' : 'Pesanan terbaru'}</h2>
                  </div>
                  {orders.length > 0 ? (
                    <p className="customer-orders-count">
                      {orderStatusFilter === 'all'
                        ? orders.length
                        : `${filteredOrders.length} / ${orders.length}`}{' '}
                      {language === 'en' ? 'orders' : 'pesanan'}
                    </p>
                  ) : null}
                </div>

                {orders.length > 0 && visibleOrderStatusFilters.length > 1 ? (
                  <div className="customer-orders-toolbar">
                    <div className="customer-orders-filters" role="tablist" aria-label={language === 'en' ? 'Filter by status' : 'Filter status pesanan'}>
                      {visibleOrderStatusFilters.map((filter) => {
                        const count =
                          filter.value === 'all' ? orders.length : orderStatusCounts[filter.value] || 0
                        const isActive = orderStatusFilter === filter.value

                        return (
                          <button
                            key={filter.value}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            className={isActive ? 'customer-orders-filter active' : 'customer-orders-filter'}
                            onClick={() => setOrderStatusFilter(filter.value)}
                          >
                            <span>{getOrderFilterLabel(filter, language)}</span>
                            <span className="customer-orders-filter-count">{count}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                {ordersStatus.state === 'loading' ? (
                  <p className="cart-auth-copy">{t('cart.authLoading')}</p>
                ) : ordersStatus.message ? (
                  <div className="customer-account-notice customer-account-notice-inline">
                    <p>{ordersStatus.message}</p>
                    {ordersStatus.message.toLowerCase().includes('login') ||
                    ordersStatus.message.toLowerCase().includes('sesi') ? (
                      <button className="cart-auth-tab active" type="button" onClick={() => setCustomer(null)}>
                        {language === 'en' ? 'Sign in again' : 'Login ulang'}
                      </button>
                    ) : null}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="cart-empty-state customer-orders-empty">
                    <Package size={28} />
                    <p>{language === 'en' ? 'No orders yet.' : 'Belum ada pesanan.'}</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="cart-empty-state customer-orders-empty">
                    <Package size={28} />
                    <p>
                      {language === 'en'
                        ? 'No orders match this status.'
                        : 'Tidak ada pesanan dengan status ini.'}
                    </p>
                    <button className="cart-auth-tab active" type="button" onClick={() => setOrderStatusFilter('all')}>
                      {language === 'en' ? 'Show all orders' : 'Tampilkan semua pesanan'}
                    </button>
                  </div>
                ) : (
                  <div className="customer-orders-panel">
                    <div className="customer-orders-table">
                      <div className="customer-orders-table-head" aria-hidden="true">
                        <span>{language === 'en' ? 'Order' : 'Pesanan'}</span>
                        <span>{language === 'en' ? 'Status' : 'Status'}</span>
                        <span>{language === 'en' ? 'Total' : 'Total'}</span>
                        <span>{language === 'en' ? 'Action' : 'Aksi'}</span>
                      </div>
                      <div className="customer-orders-table-body">
                        {filteredOrders.map((order) => (
                          <CustomerOrderRow
                            key={order.order_number}
                            order={order}
                            language={language}
                            exchangeRateMeta={exchangeRateMeta}
                            storePromo={storePromo}
                          />
                        ))}
                      </div>
                    </div>
                    {orderPricingNote ? (
                      <p className="customer-orders-pricing-note">{orderPricingNote}</p>
                    ) : null}
                  </div>
                )}
              </section>
            ) : null}

            <section className="cart-items-panel customer-account-profile-panel">
              <div className="customer-section-heading">
                <div>
                  <span>{language === 'en' ? 'Profile' : 'Profil'}</span>
                  <h2>{language === 'en' ? 'Shipping Identity' : 'Identitas Pengiriman'}</h2>
                </div>
              </div>

              {customer ? (
              <form className="cart-checkout-form" onSubmit={handleProfileSave}>
                <div className="cart-form-grid">
                  <div className="cart-form-field">
                    <label htmlFor="profile-name">{t('cart.customerName')}</label>
                    <input
                      id="profile-name"
                      value={profileForm.name}
                      onChange={(event) => updateProfileForm({ name: event.target.value })}
                      required
                    />
                  </div>

                  <div className="cart-form-field">
                    <label htmlFor="profile-email">{t('cart.customerEmail')}</label>
                    <input
                      id="profile-email"
                      type="email"
                      className={profileFieldErrors.email ? 'has-error' : undefined}
                      value={profileForm.email}
                      onChange={(event) => updateProfileForm({ email: event.target.value })}
                      required
                      aria-invalid={profileFieldErrors.email ? 'true' : undefined}
                      aria-describedby={profileFieldErrors.email ? 'profile-email-error' : undefined}
                    />
                    {profileFieldErrors.email ? (
                      <p className="cart-field-error" id="profile-email-error">
                        {profileFieldErrors.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="cart-form-field">
                  <label htmlFor="profile-whatsapp">{t('cart.customerWhatsapp')}</label>
                  <input
                    id="profile-whatsapp"
                    className={profileFieldErrors.whatsapp ? 'has-error' : undefined}
                    value={profileForm.whatsapp}
                    onChange={(event) => updateProfileForm({ whatsapp: event.target.value })}
                    required
                    aria-invalid={profileFieldErrors.whatsapp ? 'true' : undefined}
                    aria-describedby={profileFieldErrors.whatsapp ? 'profile-whatsapp-error' : undefined}
                  />
                  {profileFieldErrors.whatsapp ? (
                    <p className="cart-field-error" id="profile-whatsapp-error">
                      {profileFieldErrors.whatsapp}
                    </p>
                  ) : (
                    <p className="cart-field-hint">
                      {language === 'en'
                        ? 'Use the same number for order updates via WhatsApp.'
                        : 'Gunakan nomor yang sama untuk update pesanan via WhatsApp.'}
                    </p>
                  )}
                </div>

                <div className="cart-form-field">
                  <label htmlFor="profile-fulfillment">{t('cart.fulfillment')}</label>
                  <select
                    id="profile-fulfillment"
                    value={profileForm.fulfillment}
                    onChange={(event) => updateProfileForm({ fulfillment: event.target.value })}
                  >
                    <option value="delivery">{t('cart.delivery')}</option>
                    <option value="pickup">{t('cart.pickup')}</option>
                  </select>
                </div>

                {profileForm.fulfillment === 'delivery' ? (
                  <>
                    <div className="cart-form-field">
                      <label htmlFor="profile-country">{t('cart.country')}</label>
                      <select
                        id="profile-country"
                        value={profileForm.countryCode}
                        onChange={(event) =>
                          updateProfileForm({
                            countryCode: event.target.value,
                            provinceCode: '',
                            cityCode: '',
                            districtCode: '',
                            cityName: '',
                            stateRegion: '',
                            postalCode: '',
                          })
                        }
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
                          </>
                        )}
                      </select>
                      {isInternationalCountry(profileForm.countryCode) ? (
                        <p className="cart-field-hint">{t('cart.whatsappInternationalHint')}</p>
                      ) : null}
                    </div>

                    {isInternationalCountry(profileForm.countryCode) ? (
                      <>
                        <div className="cart-form-grid">
                          <div className="cart-form-field">
                            <label htmlFor="profile-city-name">{t('cart.cityName')}</label>
                            <input
                              id="profile-city-name"
                              type="text"
                              value={profileForm.cityName}
                              onChange={(event) => updateProfileForm({ cityName: event.target.value })}
                              required
                            />
                          </div>

                          <div className="cart-form-field">
                            <label htmlFor="profile-state-region">{t('cart.stateRegion')}</label>
                            <input
                              id="profile-state-region"
                              type="text"
                              value={profileForm.stateRegion}
                              onChange={(event) => updateProfileForm({ stateRegion: event.target.value })}
                            />
                          </div>
                        </div>

                        <div className="cart-form-field">
                          <label htmlFor="profile-postal-code">{t('cart.postalCode')}</label>
                          <input
                            id="profile-postal-code"
                            type="text"
                            value={profileForm.postalCode}
                            onChange={(event) => updateProfileForm({ postalCode: event.target.value })}
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <>
                    <div className="cart-form-grid">
                      <div className="cart-form-field">
                        <label htmlFor="profile-province">{t('cart.province')}</label>
                        <select
                          id="profile-province"
                          value={profileForm.provinceCode}
                          onChange={(event) =>
                            updateProfileForm({
                              provinceCode: event.target.value,
                              cityCode: '',
                              districtCode: '',
                            })
                          }
                          disabled={locationLoading.provinces}
                          required
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
                        <label htmlFor="profile-city">{t('cart.city')}</label>
                        <select
                          id="profile-city"
                          value={profileForm.cityCode}
                          onChange={(event) => updateProfileForm({ cityCode: event.target.value, districtCode: '' })}
                          disabled={!profileForm.provinceCode || locationLoading.cities}
                          required
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
                      <label htmlFor="profile-district">{t('cart.district')}</label>
                      <select
                        id="profile-district"
                        value={profileForm.districtCode}
                        onChange={(event) => updateProfileForm({ districtCode: event.target.value })}
                        disabled={!profileForm.cityCode || locationLoading.districts}
                        required
                      >
                        <option value="">{t('cart.selectDistrict')}</option>
                        {districtOptions.map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </div>
                      </>
                    )}

                    <div className="cart-form-field">
                      <label htmlFor="profile-address">{t('cart.addressDetail')}</label>
                      <textarea
                        id="profile-address"
                        rows="4"
                        value={profileForm.addressLine}
                        onChange={(event) => updateProfileForm({ addressLine: event.target.value })}
                        required
                      />
                    </div>

                    {profileSummary ? (
                      <div className="account-address-preview">
                        <MapPin size={18} />
                        <p>{profileSummary}</p>
                      </div>
                    ) : null}
                  </>
                ) : null}

                <button className="cart-submit-button" type="submit" disabled={profileStatus.state === 'loading'}>
                  <Mail size={18} />
                  <span>{profileStatus.state === 'loading' ? t('common.submitting') : t('common.save')}</span>
                </button>
                {profileStatus.message ? <p className={`cart-status ${profileStatus.state}`}>{profileStatus.message}</p> : null}
              </form>
              ) : (
                <div className="cart-empty-state">
                  <Mail size={28} />
                  <h2>{language === 'en' ? 'Account first, checkout later' : 'Login dulu, checkout lebih cepat'}</h2>
                  <p>{t('cart.loginBody')}</p>
                  <Link className="cta-button cta-button-dark" to="/cart">
                    {language === 'en' ? 'Open cart' : 'Buka cart'}
                  </Link>
                </div>
              )}
            </section>

            {customer ? (
              <section className="cart-items-panel customer-account-profile-panel">
                <div className="customer-section-heading">
                  <div>
                    <span>{language === 'en' ? 'Security' : 'Keamanan'}</span>
                    <h2>
                      {customer.has_password
                        ? language === 'en'
                          ? 'Change password'
                          : 'Ganti password'
                        : language === 'en'
                          ? 'Create password'
                          : 'Buat password'}
                    </h2>
                  </div>
                </div>

                <form className="cart-checkout-form" onSubmit={handlePasswordSave}>
                  <p className="cart-field-hint">
                    {customer.has_password
                      ? language === 'en'
                        ? 'Use a password with at least 8 characters.'
                        : 'Gunakan password minimal 8 karakter.'
                      : language === 'en'
                        ? 'Your account was created with Google. Set a password so you can also sign in with email.'
                        : 'Akun Anda dibuat via Google. Buat password agar bisa login dengan email juga.'}
                  </p>

                  {customer.has_password ? (
                    <div className="cart-form-field">
                      <label htmlFor="account-current-password">
                        {language === 'en' ? 'Current password' : 'Password saat ini'}
                      </label>
                      <input
                        id="account-current-password"
                        type="password"
                        autoComplete="current-password"
                        className={passwordFieldErrors.current_password ? 'has-error' : undefined}
                        value={passwordForm.currentPassword}
                        onChange={(event) => updatePasswordForm({ currentPassword: event.target.value })}
                        required
                        aria-invalid={passwordFieldErrors.current_password ? 'true' : undefined}
                        aria-describedby={
                          passwordFieldErrors.current_password ? 'account-current-password-error' : undefined
                        }
                      />
                      {passwordFieldErrors.current_password ? (
                        <p className="cart-field-error" id="account-current-password-error">
                          {passwordFieldErrors.current_password}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="cart-form-grid">
                    <div className="cart-form-field">
                      <label htmlFor="account-new-password">
                        {language === 'en' ? 'New password' : 'Password baru'}
                      </label>
                      <input
                        id="account-new-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        className={passwordFieldErrors.password ? 'has-error' : undefined}
                        value={passwordForm.password}
                        onChange={(event) => updatePasswordForm({ password: event.target.value })}
                        required
                        aria-invalid={passwordFieldErrors.password ? 'true' : undefined}
                        aria-describedby={passwordFieldErrors.password ? 'account-new-password-error' : undefined}
                      />
                      {passwordFieldErrors.password ? (
                        <p className="cart-field-error" id="account-new-password-error">
                          {passwordFieldErrors.password}
                        </p>
                      ) : null}
                    </div>

                    <div className="cart-form-field">
                      <label htmlFor="account-new-password-confirm">
                        {language === 'en' ? 'Confirm new password' : 'Konfirmasi password baru'}
                      </label>
                      <input
                        id="account-new-password-confirm"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        className={passwordFieldErrors.password_confirmation ? 'has-error' : undefined}
                        value={passwordForm.passwordConfirmation}
                        onChange={(event) => updatePasswordForm({ passwordConfirmation: event.target.value })}
                        required
                        aria-invalid={passwordFieldErrors.password_confirmation ? 'true' : undefined}
                        aria-describedby={
                          passwordFieldErrors.password_confirmation
                            ? 'account-new-password-confirm-error'
                            : undefined
                        }
                      />
                      {passwordFieldErrors.password_confirmation ? (
                        <p className="cart-field-error" id="account-new-password-confirm-error">
                          {passwordFieldErrors.password_confirmation}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <button className="cart-submit-button" type="submit" disabled={passwordStatus.state === 'loading'}>
                    <LockKeyhole size={18} />
                    <span>
                      {passwordStatus.state === 'loading'
                        ? t('common.submitting')
                        : customer.has_password
                          ? language === 'en'
                            ? 'Update password'
                            : 'Simpan password baru'
                          : language === 'en'
                            ? 'Create password'
                            : 'Buat password'}
                    </span>
                  </button>
                  {passwordStatus.message ? (
                    <p className={`cart-status ${passwordStatus.state}`}>{passwordStatus.message}</p>
                  ) : null}
                </form>
              </section>
            ) : null}
          </div>
        </section>
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
