import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, MessageCircleMore, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import './App.css'
import ProductPrice from './components/catalog/ProductPrice'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { initializeAnalytics, trackEvent, trackPageView } from './lib/analytics'
import { getApiUrl } from './lib/api'
import { useCart } from './lib/cart.jsx'
import { getConsentPreferences, hasAnalyticsConsent, setConsentPreferences } from './lib/consent'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { clearPersonalizationData } from './lib/personalization'
import { formatCurrencyAmount, getProductPriceDisplay } from './lib/price'

const defaultCheckoutForm = {
  name: '',
  whatsapp: '',
  fulfillment: 'delivery',
  address: '',
  notes: '',
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
    originalAmount,
    discountAmount,
    netAmount,
    originalLabel: formatCurrencyAmount(originalAmount, currency, language),
    discountLabel: formatCurrencyAmount(discountAmount, currency, language),
    discountDisplayLabel: `${discountAmount > 0 ? '-' : ''}${formatCurrencyAmount(discountAmount, currency, language)}`,
    netLabel: formatCurrencyAmount(netAmount, currency, language),
  }
}

function buildCheckoutMessage(items, checkoutForm, language, cartTotals) {
  const orderLines = items.map((item, index) => {
    const { currentPrice } = getProductPriceDisplay(item.product, language)
    const itemPrice = currentPrice || item.product.price || '-'

    return [
      `${index + 1}. ${item.product.name}`,
      `   ${language === 'en' ? 'Category' : 'Kategori'}: ${item.product.category || '-'}`,
      `   ${language === 'en' ? 'Size' : 'Ukuran'}: ${item.size}`,
      `   Qty: ${item.quantity}`,
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
      checkoutForm.address ? `Address: ${checkoutForm.address}` : null,
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
    checkoutForm.address ? `Alamat: ${checkoutForm.address}` : null,
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

export default function CartPage() {
  const { language, t } = useLanguage()
  const { items, itemCount, updateCartItemQuantity, removeCartItem, clearCart } = useCart()
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )
  const [checkoutForm, setCheckoutForm] = useState(defaultCheckoutForm)
  const [consentPreferences, setConsentPreferencesState] = useState(() => getConsentPreferences())

  const cartTotals = useMemo(() => getCartTotals(items, language), [items, language])

  useEffect(() => {
    if (!hasAnalyticsConsent()) {
      return
    }

    initializeAnalytics()
    trackPageView(window.location.pathname + window.location.search)
  }, [])

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

    if (nextPreferences.analytics === 'accepted') {
      initializeAnalytics()
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

  const updateCheckoutForm = (field, value) => {
    setCheckoutForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleCheckoutSubmit = (event) => {
    event.preventDefault()

    trackEvent('cart_checkout_whatsapp_click', {
      source_page: '/cart',
      cart_item_count: itemCount,
      cart_unique_item_count: items.length,
      fulfillment: checkoutForm.fulfillment,
      net_total_estimate: cartTotals?.netLabel || 'manual-confirmation',
    })

    window.open(
      buildWhatsAppUrl(pageContent.brand.whatsapp_number, buildCheckoutMessage(items, checkoutForm, language, cartTotals)),
      '_blank',
      'noopener,noreferrer',
    )
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
                        style={{ objectPosition: item.product.imagePosition || 'center center' }}
                      />
                    </Link>

                    <div className="cart-item-copy">
                      <span>{item.product.category || t('common.products')}</span>
                      <h3>{item.product.name}</h3>
                      <ProductPrice product={item.product} />
                      <p>{t('cart.itemMeta', { size: item.size })}</p>
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
              </div>

              <form className="cart-checkout-form" onSubmit={handleCheckoutSubmit}>
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

                <div className="cart-form-field">
                  <label htmlFor="cart-address">{t('cart.address')}</label>
                  <textarea
                    id="cart-address"
                    rows="3"
                    value={checkoutForm.address}
                    onChange={(event) => updateCheckoutForm('address', event.target.value)}
                    required={checkoutForm.fulfillment === 'delivery'}
                  />
                </div>

                <div className="cart-form-field">
                  <label htmlFor="cart-notes">{t('cart.notes')}</label>
                  <textarea
                    id="cart-notes"
                    rows="3"
                    value={checkoutForm.notes}
                    onChange={(event) => updateCheckoutForm('notes', event.target.value)}
                  />
                </div>

                <button className="cart-submit-button" type="submit">
                  <MessageCircleMore size={18} />
                  <span>{t('cart.checkoutWhatsApp')}</span>
                </button>
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
