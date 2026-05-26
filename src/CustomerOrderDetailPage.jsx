import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, CreditCard, LockKeyhole, MapPin, Package, Store, Wallet } from 'lucide-react'
import OrderShipmentTracking from './components/orders/OrderShipmentTracking'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { fetchCustomerOrder, getApiUrl, syncCustomerOrderShipment } from './lib/api'
import { useCart } from './lib/cart.jsx'
import { getConsentPreferences, setConsentPreferences } from './lib/consent'
import { useCustomer } from './lib/customer.jsx'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { useMidtransPayment } from './lib/useMidtransPayment'
import CheckoutTermsAgreement from './components/checkout/CheckoutTermsAgreement'
import { formatCurrencyAmount } from './lib/price'
import { savePendingPayment } from './lib/pendingPayment'
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
  const { customer, isLoading: customerLoading, refreshCustomer } = useCustomer()
  const [sessionExpired, setSessionExpired] = useState(false)
  const { payOrder, isSnapReady } = useMidtransPayment()
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )
  const [order, setOrder] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [paymentStatus, setPaymentStatus] = useState({ state: 'idle', message: '' })
  const [isRefreshingTracking, setIsRefreshingTracking] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsError, setTermsError] = useState('')
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
    setSessionExpired(false)

    try {
      const data = await fetchCustomerOrder(orderNumber)
      setOrder(data)

      if (data?.order_number && data?.payment_access_token) {
        savePendingPayment(data.order_number, data.payment_access_token)
      }
    } catch (error) {
      const message = error.message || ''
      const expired = message.toLowerCase().includes('unauthenticated')
      setSessionExpired(expired)
      setLoadError(expired ? '' : message)
      setOrder(null)

      if (expired) {
        await refreshCustomer()
      }
    }
  }, [orderNumber, refreshCustomer])

  const handleRefreshTracking = useCallback(async () => {
    if (!orderNumber) {
      return
    }

    setIsRefreshingTracking(true)

    try {
      const hasBiteshipShipment =
        order?.shipment?.waybill_id ||
        order?.shipment?.tracking_id ||
        order?.shipment_tracking?.waybill_id ||
        order?.shipment_tracking?.tracking_id

      if (hasBiteshipShipment) {
        try {
          const synced = await syncCustomerOrderShipment(orderNumber)

          if (synced) {
            setOrder(synced)

            return
          }
        } catch {
          // Fall back to a normal reload (still auto-syncs when stale on the server).
        }
      }

      await loadOrder()
    } catch (error) {
      setLoadError(error.message || '')
    } finally {
      setIsRefreshingTracking(false)
    }
  }, [loadOrder, order, orderNumber])

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

    if (!termsAccepted) {
      setTermsError(
        language === 'en'
          ? 'Please read and accept the Terms & Conditions before payment.'
          : 'Silakan baca dan setujui Syarat & Ketentuan sebelum pembayaran.',
      )
      return
    }

    setTermsError('')

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
                ? 'Payment window closed. Tap Pay now to reopen Midtrans or use the payment details below.'
                : 'Jendela pembayaran ditutup. Tekan Bayar sekarang untuk buka ulang Midtrans atau gunakan detail pembayaran di bawah.',
          })
          loadOrder()
        },
      })

      setPaymentStatus({
        state: 'idle',
        message:
          language === 'en'
            ? 'Complete your payment in the Midtrans window.'
            : 'Selesaikan pembayaran di jendela Midtrans.',
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

        <section className="content-block section-soft">
          <section className="customer-order-detail-shell">
            {!customerLoading && (!customer || sessionExpired) ? (
              <SessionPrompt language={language} t={t} expired={sessionExpired} />
            ) : customerLoading || (!order && !loadError && !sessionExpired) ? (
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
                onRefreshTracking={handleRefreshTracking}
                isRefreshingTracking={isRefreshingTracking}
                termsAccepted={termsAccepted}
                onTermsAcceptedChange={(value) => {
                  setTermsAccepted(value)
                  if (value) {
                    setTermsError('')
                  }
                }}
                termsError={termsError}
              />
            )}
          </section>
        </section>
      </main>
    </OrderPageShell>
  )
}

function OrderDetailContent({
  order,
  language,
  t,
  paymentStatus,
  isSnapReady,
  onPayAgain,
  onRefreshTracking,
  isRefreshingTracking,
  termsAccepted,
  onTermsAcceptedChange,
  termsError,
}) {
  return (
    <>
      <div className="customer-order-detail-header">
        <div className="customer-order-detail-header-main">
          <span>{language === 'en' ? 'Order number' : 'Nomor order'}</span>
          <p className="customer-order-number">{order.order_number}</p>
        </div>
        <OrderStatusBadge order={order} language={language} />
      </div>

      <div className="customer-order-items">
        {order.items?.map((item) => (
          <article key={`${item.product_slug}-${item.product_size}`} className="customer-order-item">
            <div className="customer-order-item-thumb-wrap">
              {item.image_url ? (
                <img
                  className="customer-order-item-thumb"
                  src={item.image_url}
                  alt={item.product_name}
                  loading="lazy"
                />
              ) : (
                <div className="customer-order-item-thumb customer-order-item-thumb-placeholder" aria-hidden="true">
                  <Package size={22} />
                </div>
              )}
            </div>
            <div className="customer-order-item-body">
              <strong>{item.product_name}</strong>
              {item.product_category ? (
                <p className="customer-order-item-category">{item.product_category}</p>
              ) : null}
              <p>
                {item.product_size ? `${item.product_size} · ` : ''}
                {language === 'en' ? 'Qty' : 'Jml'}: {item.quantity}
              </p>
            </div>
            <span className="customer-order-item-price">
              {formatOrderAmount(item.line_net_amount_minor, item.currency || order.currency)}
            </span>
          </article>
        ))}
      </div>

      <OrderFulfillmentInfo order={order} language={language} />

      <div className="customer-order-summary">
        <div>
          <span>{language === 'en' ? 'Subtotal' : 'Subtotal'}</span>
          <strong>{formatOrderAmount(order.summary?.net_total_amount_minor, order.currency)}</strong>
        </div>
        {order.summary?.shipping_fee_amount_minor ? (
          <ShippingFeeRow order={order} language={language} />
        ) : null}
        {order.summary?.voucher_discount_amount_minor || order.voucher_discount_amount_minor ? (
          <div>
            <span>
              {language === 'en' ? 'Voucher (products)' : 'Voucher produk'} ({order.voucher_code || order.summary?.voucher_code})
            </span>
            <strong>
              -
              {formatOrderAmount(
                order.summary?.voucher_discount_amount_minor ?? order.voucher_discount_amount_minor,
                order.currency,
              )}
            </strong>
          </div>
        ) : null}
        {order.summary?.voucher_shipping_discount_amount_minor || order.voucher_shipping_discount_amount_minor ? (
          <div>
            <span>{language === 'en' ? 'Voucher (shipping)' : 'Voucher ongkir'}</span>
            <strong>
              -
              {formatOrderAmount(
                order.summary?.voucher_shipping_discount_amount_minor ?? order.voucher_shipping_discount_amount_minor,
                order.currency,
              )}
            </strong>
          </div>
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

      <OrderPaymentInfo order={order} language={language} />

      <OrderShipmentTracking
        order={order}
        language={language}
        onRefresh={onRefreshTracking}
        isRefreshing={isRefreshingTracking}
      />

      {order.can_pay ? (
        <div className="customer-order-pay">
          {!isSnapReady ? (
            <p className="cart-status error">
              {language === 'en'
                ? 'Online payment is not ready yet. Refresh the page or contact support if this persists.'
                : 'Pembayaran online belum siap. Muat ulang halaman atau hubungi kami jika masalah berlanjut.'}
            </p>
          ) : null}
          <CheckoutTermsAgreement
            checked={termsAccepted}
            onChange={onTermsAcceptedChange}
            language={language}
            disabled={paymentStatus.state === 'loading'}
            error={termsError}
          />
          <button
            className="cart-submit-button customer-order-pay-button"
            type="button"
            disabled={paymentStatus.state === 'loading' || !isSnapReady || !termsAccepted}
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

function OrderFulfillmentInfo({ order, language }) {
  const isDelivery = order.fulfillment_method === 'delivery'
  const shipping = order.shipping

  if (!isDelivery && order.fulfillment_method !== 'pickup') {
    return null
  }

  const courierLine = [shipping?.courier_name, shipping?.service_name].filter(Boolean).join(' · ')
  const regionParts = [shipping?.district, shipping?.city, shipping?.province].filter(Boolean)

  return (
    <section className="customer-order-fulfillment">
      <div className="customer-order-payment-info-head">
        {isDelivery ? <MapPin size={18} /> : <Store size={18} />}
        <div>
          <strong>{language === 'en' ? 'Fulfillment' : 'Pengiriman pesanan'}</strong>
          <p>
            {isDelivery
              ? language === 'en'
                ? 'Your order will be sent to this address after payment is confirmed.'
                : 'Pesanan akan dikirim ke alamat berikut setelah pembayaran terkonfirmasi.'
              : language === 'en'
                ? 'Pick up your order at our workshop after payment is confirmed.'
                : 'Pesanan dapat diambil di workshop kami setelah pembayaran terkonfirmasi.'}
          </p>
        </div>
      </div>

      {isDelivery ? (
        <div className="customer-order-fulfillment-address">
          <span className="customer-order-fulfillment-label">
            {language === 'en' ? 'Ship to' : 'Dikirim ke'}
          </span>
          <p className="customer-order-fulfillment-address-line">
            {shipping?.address_line || shipping?.address || '-'}
          </p>
          {regionParts.length > 0 ? (
            <p className="customer-order-fulfillment-region">{regionParts.join(', ')}</p>
          ) : null}
          {courierLine ? (
            <p className="customer-order-fulfillment-courier">
              {language === 'en' ? 'Courier' : 'Kurir'}: <strong>{courierLine}</strong>
            </p>
          ) : null}
        </div>
      ) : (
        <p className="customer-order-fulfillment-pickup">
          {language === 'en' ? 'Pickup at AHR workshop' : 'Ambil di workshop AHR Corporation'}
        </p>
      )}

      {order.customer_notes ? (
        <p className="customer-order-fulfillment-notes">
          <span>{language === 'en' ? 'Order notes' : 'Catatan order'}:</span> {order.customer_notes}
        </p>
      ) : null}
    </section>
  )
}

function OrderPaymentInfo({ order, language }) {
  const payment = order.payment

  if (!payment?.has_midtrans_transaction && !payment?.instructions?.length) {
    return null
  }

  const statusLabel =
    payment.transaction_status_label ||
    (payment.transaction_status === 'pending'
      ? language === 'en'
        ? 'Awaiting payment'
        : 'Menunggu pembayaran'
      : payment.transaction_status)

  return (
    <section className="customer-order-payment-info">
      <div className="customer-order-payment-info-head">
        <Wallet size={18} />
        <div>
          <strong>{language === 'en' ? 'Payment details' : 'Detail pembayaran'}</strong>
          <p>
            {language === 'en'
              ? 'Use these details if you already chose a payment method in Midtrans.'
              : 'Gunakan detail ini jika Anda sudah memilih metode bayar di Midtrans.'}
          </p>
        </div>
      </div>

      <div className="customer-order-payment-info-meta">
        {statusLabel ? (
          <span>
            {language === 'en' ? 'Status' : 'Status'}: <strong>{statusLabel}</strong>
          </span>
        ) : null}
        {payment.payment_type_label ? (
          <span>
            {language === 'en' ? 'Method' : 'Metode'}: <strong>{payment.payment_type_label}</strong>
          </span>
        ) : null}
        {(order.payment_expires_at || payment.expiry_time) ? (
          <span>
            {language === 'en' ? 'Pay before' : 'Bayar sebelum'}:{' '}
            <strong>
              {new Date(order.payment_expires_at || payment.expiry_time).toLocaleString(
                language === 'en' ? 'en-ID' : 'id-ID',
              )}
            </strong>
          </span>
        ) : null}
      </div>

      {payment.instructions?.length ? (
        <ul className="customer-order-payment-info-list">
          {payment.instructions.map((instruction) => (
            <li key={`${instruction.kind}-${instruction.label}-${instruction.value}`}>
              <span>{instruction.label}</span>
              <strong>{instruction.value}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="customer-order-payment-info-hint">
          {language === 'en'
            ? 'Choose a payment method via Pay now to generate VA/QRIS details here.'
            : 'Pilih metode bayar lewat Bayar sekarang untuk menampilkan nomor VA/QRIS di sini.'}
        </p>
      )}
    </section>
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

function SessionPrompt({ language, t, expired }) {
  return (
    <div className="customer-account-notice">
      <div className="customer-account-notice-icon">
        <LockKeyhole size={22} />
      </div>
      <div>
        <h2>
          {expired
            ? language === 'en'
              ? 'Session expired'
              : 'Sesi berakhir'
            : language === 'en'
              ? 'Login required'
              : 'Login diperlukan'}
        </h2>
        <p>
          {expired
            ? language === 'en'
              ? 'Please sign in again to view this order.'
              : 'Silakan login ulang untuk melihat detail pesanan ini.'
            : t('cart.loginBody')}
        </p>
      </div>
      <Link className="cta-button cta-button-dark" to="/akun">
        {language === 'en' ? 'Go to account' : 'Ke halaman akun'}
      </Link>
    </div>
  )
}

function ErrorState({ language, loadError }) {
  return (
    <div className="customer-account-notice customer-account-notice-muted">
      <div className="customer-account-notice-icon">
        <Package size={22} />
      </div>
      <div>
        <h2>{language === 'en' ? 'Order not found' : 'Pesanan tidak ditemukan'}</h2>
        <p>{loadError}</p>
      </div>
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
