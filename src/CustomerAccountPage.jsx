import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, LockKeyhole, LogOut, Mail, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import './App.css'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { initializeAnalyticsAndTrackCurrentPage, trackEvent, updateConsent } from './lib/analytics'
import {
  fetchCatalogCities,
  fetchCatalogDistricts,
  fetchCatalogProvinces,
  getApiUrl,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  updateCustomerProfile,
} from './lib/api'
import { useCart } from './lib/cart.jsx'
import { getConsentPreferences, setConsentPreferences } from './lib/consent'
import { useCustomer } from './lib/customer.jsx'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { clearPersonalizationData } from './lib/personalization'
import useDocumentTitle from './lib/useDocumentTitle'

const defaultProfileForm = {
  name: '',
  email: '',
  whatsapp: '',
  fulfillment: 'delivery',
  provinceCode: '',
  cityCode: '',
  districtCode: '',
  addressLine: '',
}

const defaultAuthForm = {
  name: '',
  email: '',
  whatsapp: '',
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
  return {
    name: customer?.name || '',
    email: customer?.email || '',
    whatsapp: customer?.phone || '',
    fulfillment: customer?.default_fulfillment_method || 'delivery',
    provinceCode: customer?.default_shipping_province_code || '',
    cityCode: customer?.default_shipping_city_code || '',
    districtCode: customer?.default_shipping_district_code || '',
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
  const { customer, isLoading: customerLoading, setCustomer } = useCustomer()
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState(defaultAuthForm)
  const [profileForm, setProfileForm] = useState(defaultProfileForm)
  const [authStatus, setAuthStatus] = useState({ state: 'idle', message: '' })
  const [profileStatus, setProfileStatus] = useState({ state: 'idle', message: '' })
  const [consentPreferences, setConsentPreferencesState] = useState(() => getConsentPreferences())
  const [provinceOptions, setProvinceOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [locationLoading, setLocationLoading] = useState({
    provinces: false,
    cities: false,
    districts: false,
  })

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
    fetch(getApiUrl(`/api/catalog/landing-page?locale=${language}`), {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Gagal memuat halaman akun')
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

  useEffect(() => {
    if (!customer) {
      setProfileForm(defaultProfileForm)
      setAuthForm(defaultAuthForm)
      return
    }

    setProfileForm(mapCustomerToProfileForm(customer))
    setAuthForm(mapCustomerToAuthForm(customer))
  }, [customer])

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

  const profileSummary = useMemo(() => {
    if (profileForm.fulfillment !== 'delivery') {
      return ''
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
  }, [cityOptions, districtOptions, profileForm, provinceOptions])

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

    setProfileForm((current) => ({
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
      setProfileStatus({ state: 'idle', message: '' })
      setAuthStatus({ state: 'idle', message: '' })
    } catch (error) {
      setProfileStatus({ state: 'error', message: error.message })
    }
  }

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setProfileStatus({ state: 'loading', message: t('cart.profileSyncing') })

    try {
      const nextCustomer = await updateCustomerProfile({
        name: profileForm.name,
        email: profileForm.email,
        whatsapp: profileForm.whatsapp,
        fulfillment: profileForm.fulfillment,
        address_line: profileForm.fulfillment === 'delivery' ? profileForm.addressLine : '',
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
          profileForm.fulfillment === 'delivery' ? findLocationName(districtOptions, profileForm.districtCode) : '',
      })

      setCustomer(nextCustomer)
      setProfileStatus({
        state: 'success',
        message: language === 'en' ? 'Customer profile saved.' : 'Profil customer berhasil disimpan.',
      })
    } catch (error) {
      setProfileStatus({ state: 'error', message: error.message })
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
            <Link to="/">
              <ArrowLeft size={16} />
              <span>{t('common.backToHome')}</span>
            </Link>
          </div>

          <div className="section-heading heading-inline cart-heading">
            <div>
              <span>{t('common.profileLabel')}</span>
              <h1>{language === 'en' ? 'Customer Account' : 'Akun Customer'}</h1>
            </div>
            <p>
              {language === 'en'
                ? 'Log in first, then keep your email, phone number, and shipping address ready for faster checkout.'
                : 'Login lebih awal, lalu simpan email, no. telepon, dan alamat pengiriman agar checkout lebih cepat.'}
            </p>
          </div>
        </section>

        <section className="content-block section-soft account-page-layout">
          <aside className="cart-summary-panel">
            {customerLoading ? (
              <div className="cart-auth-card">
                <p className="cart-auth-copy">{t('cart.authLoading')}</p>
              </div>
            ) : !customer ? (
              <div className="cart-auth-card">
                <div className="cart-auth-heading">
                  <div>
                    <span>{t('cart.summaryEyebrow')}</span>
                    <h3>{t('cart.loginTitle')}</h3>
                  </div>
                  <LockKeyhole size={18} />
                </div>
                <p className="cart-auth-copy">{t('cart.loginBody')}</p>

                <div className="cart-auth-tabs">
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
                    <span>{authStatus.state === 'loading' ? t('common.submitting') : authMode === 'login' ? t('cart.loginCta') : t('cart.registerCta')}</span>
                  </button>
                  {authStatus.message ? <p className={`cart-status ${authStatus.state}`}>{authStatus.message}</p> : null}
                </form>
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

          <section className="cart-items-panel">
            <div className="cart-items-heading">
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
                      value={profileForm.email}
                      onChange={(event) => updateProfileForm({ email: event.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="cart-form-field">
                  <label htmlFor="profile-whatsapp">{t('cart.customerWhatsapp')}</label>
                  <input
                    id="profile-whatsapp"
                    value={profileForm.whatsapp}
                    onChange={(event) => updateProfileForm({ whatsapp: event.target.value })}
                    required
                  />
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
