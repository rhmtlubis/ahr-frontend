import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, CreditCard, Package } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { fetchCustomerOrder, getApiUrl } from './lib/api'
import { useCart } from './lib/cart.jsx'
import { getConsentPreferences, setConsentPreferences } from './lib/consent'
import { useCustomer } from './lib/customer.jsx'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { useMidtransPayment } from './lib/useMidtransPayment'
import { formatCurrencyAmount } from './lib/price'
import useDocumentTitle from './lib/useDocumentTitle'

function formatOrderAmount(amountMinor, currency) {
  if (amountMinor === null || amountMinor === undefined) {
    return '-'
  }

  return formatCurrencyAmount(amountMinor, currency || 'IDR')
}

function getStatusLabel(status, language) {
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

function buildWhatsAppUrl(phoneNumber, message) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
}

export default function CustomerOrderDetailPage() {
  const { orderNumber } = useParams()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { itemCount } = useCart()
  const { customer, isLoading: customerLoading } = useCustomer()
  const { payOrder, isSnapReady } = useMidtransPayment()
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )
  const [order, setOrder] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [paymentStatus, setPaymentStatus] = useState({ state: 'idle', message: '' })
  const [consentPreferences, setConsentPreferencesState] = useState(() => getConsentPreferences())

  useDocumentTitle(
    language === 'en' ? 'Order Detail' : 'Detail Pesanan',
    language === 'en'
      ? 'Review your order status and continue payment if needed.'
      : 'Lihat status pesanan Anda dan lanjutkan pembayaran jika diperlukan.',
    {
      canonicalPath: `/akun/pesanan/${orderNumber || ''}`,
      image: '/ahr-brand-logo.webp',
      robots: 'noindex, nofollow',
      locale: language,
      type: 'website',
    },
  )

  const loadOrder = useCallback(async () => {
    if (!orderNumber) {
      return
    }

    setLoadError('')

    try {
      const data = await fetchCustomerOrder(orderNumber)
      setOrder(data)
    } catch (error) {
      setLoadError(error.message)
      setOrder(null)
    }
  }, [orderNumber])

  useEffect(() => {
    fetch(getApiUrl(`/api/catalog/landing-page?locale=${language}`), {
      headers: { Accept: 'application/json' },
    })
      .then((response) => (response.ok ? response.json() : null))
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
    if (!customer || customerLoading) {
      return
    }

    loadOrder()
  }, [customer, customerLoading, loadOrder])

  const handlePayAgain = async () => {
    if (!order?.can_pay || !order?.order_number) {
      return
    }

    setPaymentStatus({
      state: 'loading',
      message: language === 'en' ? 'Opening payment...' : 'Membuka pembayaran...',
    })

    try {
      await payOrder(order.order_number, order.payment_access_token, {
        onSuccess: () => {
          setPaymentStatus({ state: 'success', message: '' })
          navigate(`/payment/success?order=${order.order_number}`)
        },
        onPending: () => {
          setPaymentStatus({ state: 'idle', message: '' })
          navigate(`/payment/pending?order=${order.order_number}`)
        },
        onError: () => {
          setPaymentStatus({
            state: 'error',
            message: language === 'en' ? 'Payment failed or was cancelled.' : 'Pembayaran gagal atau dibatalkan.',
          })
        },
        onClose: () => {
          setPaymentStatus({
            state: 'idle',
            message:
              language === 'en'
                ? 'Payment window closed. You can try again anytime.'
                : 'Jendela pembayaran ditutup. Anda bisa mencoba lagi kapan saja.',
          })
          loadOrder()
        },
      })
    } catch (error) {
      setPaymentStatus({ state: 'error', message: error.message })
    }
  }

  return (
    <OrderPageShell
      pageContent={pageContent}
      itemCount={itemCount}
      t={t}
      consentPreferences={consentPreferences}
      setConsentPreferencesState={setConsentPreferencesState}
    >
      <main className="cart-page">
        <section className="content-block section-plain cart-hero">
          <div className="all-products-breadcrumb">
            <Link to="/akun">
              <ArrowLeft size={16} />
              <span>{language === 'en' ? 'Back to account' : 'Kembali ke akun'}</span>
            </Link>
          </div>
          <OrderDetailHeading language={language} />
        </section>

        <section className="content-block section-soft account-page-layout">
          <section className="cart-items-panel customer-order-detail-panel">
            {!customerLoading && !customer ? (
              <GuestPrompt language={language} t={t} />
            ) : customerLoading || (!order && !loadError) ? (
              <p className="cart-auth-copy">{t('cart.authLoading')}</p>
            ) : loadError ? (
              <ErrorState language={language} loadError={loadError} />
            ) : (
              <OrderDetailContent
                order={order}
                language={language}
                t={t}
                paymentStatus={paymentStatus}
                isSnapReady={isSnapReady}
                onPayAgain={handlePayAgain}
              />
            )}
          </section>
        </section>
      </main>
    </OrderPageShell>
  )
}

function OrderDetailContent({ order, language, t, paymentStatus, isSnapReady, onPayAgain }) {
  return (
    <>
      <div className="customer-order-detail-header">
        <div>
          <span>{language === 'en' ? 'Order number' : 'Nomor order'}</span>
          <h2>{order.order_number}</h2>
        </div>
        <OrderStatusBadge order={order} language={language} />
      </div>

      <div className="customer-order-items">
        {order.items?.map((item) => (
          <article key={`${item.product_slug}-${item.product_size}`} className="customer-order-item">
            <div>
              <strong>{item.product_name}</strong>
              <p>
                {item.product_size ? `${item.product_size} · ` : ''}
                {language === 'en' ? 'Qty' : 'Jml'}: {item.quantity}
              </p>
            </div>
            <span>{formatOrderAmount(item.line_net_amount_minor, item.currency || order.currency)}</span>
          </article>
        ))}
      </div>

      <div className="customer-order-summary">
        <div>
          <span>{language === 'en' ? 'Subtotal' : 'Subtotal'}</span>
          <strong>{formatOrderAmount(order.summary?.net_total_amount_minor, order.currency)}</strong>
        </div>
        {order.summary?.shipping_fee_amount_minor ? (
          <ShippingFeeRow order={order} language={language} />
        ) : null}
        <div className="customer-order-grand-total">
          <span>{language === 'en' ? 'Grand total' : 'Total bayar'}</span>
          <strong>
            {formatOrderAmount(order.summary?.grand_total_amount_minor ?? order.grand_total_amount_minor, order.currency)}
          </strong>
        </div>
      </div>

      {order.payment_expires_at && order.can_pay ? (
        <p className="customer-order-expiry-note">
          {language === 'en' ? 'Pay before' : 'Bayar sebelum'}{' '}
          {new Date(order.payment_expires_at).toLocaleString(language === 'en' ? 'en-ID' : 'id-ID')}
        </p>
      ) : null}

      {order.is_payment_expired ? (
        <p className="cart-status error">
          {language === 'en'
            ? 'This payment link has expired. Please create a new order if you still want to purchase.'
            : 'Batas waktu pembayaran sudah habis. Silakan buat order baru jika masih ingin memesan.'}
        </p>
      ) : null}

      {order.can_pay ? (
        <div className="customer-order-pay">
          <button
            className="cart-submit-button"
            type="button"
            disabled={paymentStatus.state === 'loading' || !isSnapReady}
            onClick={onPayAgain}
          >
            <CreditCard size={18} />
            <span>
              {paymentStatus.state === 'loading'
                ? t('common.submitting')
                : language === 'en'
                  ? 'Pay now'
                  : 'Bayar sekarang'}
            </span>
          </button>
          {paymentStatus.message ? (
            <p className={`cart-status ${paymentStatus.state === 'error' ? 'error' : 'success'}`}>{paymentStatus.message}</p>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

function OrderStatusBadge({ order, language }) {
  return (
    <div className={`customer-order-status customer-order-status-${order.status}`}>
      {getStatusLabel(order.status, language)}
    </div>
  )
}

function ShippingFeeRow({ order, language }) {
  return (
    <div>
      <span>{language === 'en' ? 'Shipping' : 'Ongkir'}</span>
      <strong>{formatOrderAmount(order.summary.shipping_fee_amount_minor, order.currency)}</strong>
    </div>
  )
}

function OrderDetailHeading({ language }) {
  return (
    <div className="section-heading heading-inline cart-heading">
      <div>
        <span>{language === 'en' ? 'Orders' : 'Pesanan'}</span>
        <h1>{language === 'en' ? 'Order Detail' : 'Detail Pesanan'}</h1>
      </div>
      <p>
        {language === 'en'
          ? 'Check payment status and pay again without creating a new order.'
          : 'Cek status pembayaran dan bayar ulang tanpa membuat order baru.'}
      </p>
    </div>
  )
}

function GuestPrompt({ language, t }) {
  return (
    <div className="cart-empty-state">
      <Package size={28} />
      <h2>{language === 'en' ? 'Login required' : 'Login diperlukan'}</h2>
      <p>{t('cart.loginBody')}</p>
      <Link className="cta-button cta-button-dark" to="/akun">
        {language === 'en' ? 'Go to account' : 'Ke halaman akun'}
      </Link>
    </div>
  )
}

function ErrorState({ language, loadError }) {
  return (
    <div className="cart-empty-state">
      <Package size={28} />
      <h2>{language === 'en' ? 'Order not found' : 'Pesanan tidak ditemukan'}</h2>
      <p>{loadError}</p>
      <Link className="cta-button cta-button-dark" to="/akun">
        {language === 'en' ? 'Back to account' : 'Kembali ke akun'}
      </Link>
    </div>
  )
}

function OrderPageShell({ pageContent, itemCount, t, consentPreferences, setConsentPreferencesState, children }) {
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
      {children}
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
          onAcceptAll={() => {
            const nextPreferences = { analytics: 'accepted', personalization: 'accepted' }
            setConsentPreferences(nextPreferences)
            setConsentPreferencesState(nextPreferences)
          }}
          onAcceptAnalyticsOnly={() => {
            const nextPreferences = { analytics: 'accepted', personalization: 'rejected' }
            setConsentPreferences(nextPreferences)
            setConsentPreferencesState(nextPreferences)
          }}
          onAcceptPersonalizationOnly={() => {
            const nextPreferences = { analytics: 'rejected', personalization: 'accepted' }
            setConsentPreferences(nextPreferences)
            setConsentPreferencesState(nextPreferences)
          }}
          onRejectAll={() => {
            const nextPreferences = { analytics: 'rejected', personalization: 'rejected' }
            setConsentPreferences(nextPreferences)
            setConsentPreferencesState(nextPreferences)
          }}
        />
      ) : null}
    </div>
  )
}
