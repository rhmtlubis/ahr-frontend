import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle, Clock, CreditCard, MessageCircleMore, Package, XCircle } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './App.css'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { fetchCatalogLandingPage, getApiUrl, fetchOrderConversionContext } from './lib/api'
import { useCart } from './lib/cart.jsx'
import { useCustomer } from './lib/customer.jsx'
import { getConsentPreferences, setConsentPreferences } from './lib/consent'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import PostPurchaseReviewPrompt from './components/cart/PostPurchaseReviewPrompt'
import { clearPendingPayment, getPendingPayment } from './lib/pendingPayment'
import {
  getPurchaseContext,
  isPurchaseTracked,
  markPurchaseTracked,
  resolvePurchaseContext,
} from './lib/checkoutConversion'
import { initializeAnalyticsAndTrackCurrentPage, setEnhancedConversionUserData, trackPurchaseConversion, updateConsent } from './lib/analytics'
import { useMidtransPayment } from './lib/useMidtransPayment'
import useDocumentTitle from './lib/useDocumentTitle'

export default function PaymentResultPage({ status }) {
  const { language, t } = useLanguage()
  const navigate = useNavigate()
  const { customer } = useCustomer()
  const { clearCart } = useCart()
  const { payOrder, isSnapReady } = useMidtransPayment()
  const [searchParams] = useSearchParams()
  const orderNumber = searchParams.get('order')
  const paymentAccessToken = useMemo(() => {
    if (!orderNumber) {
      return null
    }

    return getPendingPayment(orderNumber)?.paymentAccessToken || null
  }, [orderNumber])
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )
  const [consentPreferences, setConsentPreferencesState] = useState(() => getConsentPreferences())
  const [paymentStatus, setPaymentStatus] = useState({ state: 'idle', message: '' })
  const canRetryPayment = (status === 'pending' || status === 'error') && Boolean(orderNumber)

  useDocumentTitle(
    status === 'success'
      ? language === 'en' ? 'Payment Successful' : 'Pembayaran Berhasil'
      : status === 'pending'
        ? language === 'en' ? 'Payment Pending' : 'Pembayaran Pending'
        : language === 'en' ? 'Payment Failed' : 'Pembayaran Gagal',
    status === 'success'
      ? language === 'en'
        ? 'Your payment has been processed successfully.'
        : 'Pembayaran Anda telah berhasil diproses.'
      : status === 'pending'
        ? language === 'en'
          ? 'Your payment is being processed. Please complete the payment.'
          : 'Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran.'
        : language === 'en'
          ? 'Payment failed or was cancelled.'
          : 'Pembayaran gagal atau dibatalkan.',
    {
      canonicalPath: `/payment/${status}`,
      image: '/ahr-brand-logo.webp',
      robots: 'noindex, nofollow',
      locale: language,
      type: 'website',
    },
  )

  useEffect(() => {
    if (status !== 'success' || !orderNumber || isPurchaseTracked(orderNumber)) {
      return
    }

    let cancelled = false

    void (async () => {
      initializeAnalyticsAndTrackCurrentPage(`/payment/success?order=${encodeURIComponent(orderNumber)}`)

      const purchaseContext = await resolvePurchaseContext(orderNumber, {
        getStoredContext: getPurchaseContext,
        getPaymentToken: (currentOrderNumber) => getPendingPayment(currentOrderNumber)?.paymentAccessToken || null,
        fetchConversionContext: fetchOrderConversionContext,
      })

      if (cancelled || !purchaseContext) {
        return
      }

      await setEnhancedConversionUserData(purchaseContext.customer)
      trackPurchaseConversion(purchaseContext)
      markPurchaseTracked(orderNumber)
    })()

    return () => {
      cancelled = true
    }
  }, [status, orderNumber])

  useEffect(() => {
    if (status === 'success') {
      clearCart()
      if (orderNumber) {
        clearPendingPayment()
      }
    }
  }, [status, orderNumber, clearCart])

  useEffect(() => {
    fetchCatalogLandingPage(language)
      .then((payload) => {
        if (payload?.data) {
          setPageContent(getLandingChromeContent(payload.data, { hashPrefix: '/', locale: language }))
        }
      })
      .catch(() => {
        setPageContent(getLandingChromeContent({}, { hashPrefix: '/', locale: language }))
      })
  }, [language])

  const config = {
    success: {
      icon: CheckCircle,
      iconColor: '#22c55e',
      title: language === 'en' ? 'Payment Successful!' : 'Pembayaran Berhasil!',
      message: language === 'en'
        ? 'Your payment has been processed successfully. We will confirm your order shortly.'
        : 'Pembayaran Anda telah berhasil diproses. Kami akan segera mengkonfirmasi order Anda.',
      actionLabel: language === 'en' ? 'Continue Shopping' : 'Lanjut Belanja',
      actionHref: '/all-products',
      trackOrderHref: orderNumber ? `/akun/pesanan/${orderNumber}` : null,
      secondaryAction: pageContent.brand?.whatsapp_number
        ? {
            label: language === 'en' ? 'Contact via WhatsApp' : 'Hubungi via WhatsApp',
            href: `https://wa.me/${pageContent.brand.whatsapp_number}?text=${encodeURIComponent(`Halo AHR, saya ingin konfirmasi order ${orderNumber || '-'} yang sudah dibayar.`)}`,
          }
        : null,
    },
    pending: {
      icon: Clock,
      iconColor: '#f59e0b',
      title: language === 'en' ? 'Payment Pending' : 'Pembayaran Pending',
      message: language === 'en'
        ? 'Your payment is being processed. Please complete the payment according to the instructions sent.'
        : 'Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran sesuai instruksi yang dikirim.',
      actionLabel: language === 'en' ? 'View order detail' : 'Lihat detail pesanan',
      actionHref: orderNumber ? `/akun/pesanan/${orderNumber}` : '/akun',
      secondaryAction: pageContent.brand?.whatsapp_number
        ? {
            label: language === 'en' ? 'Contact via WhatsApp' : 'Hubungi via WhatsApp',
            href: `https://wa.me/${pageContent.brand.whatsapp_number}?text=${encodeURIComponent(`Halo AHR, saya ingin tanya status pembayaran order ${orderNumber || '-'}.`)}`,
          }
        : null,
    },
    error: {
      icon: XCircle,
      iconColor: '#ef4444',
      title: language === 'en' ? 'Payment Failed' : 'Pembayaran Gagal',
      message: language === 'en'
        ? 'Your payment failed or was cancelled. You can try again or contact us for assistance.'
        : 'Pembayaran Anda gagal atau dibatalkan. Anda dapat mencoba lagi atau hubungi kami untuk bantuan.',
      actionLabel: language === 'en' ? 'View order detail' : 'Lihat detail pesanan',
      actionHref: orderNumber ? `/akun/pesanan/${orderNumber}` : '/akun',
      secondaryAction: pageContent.brand?.whatsapp_number
        ? {
            label: language === 'en' ? 'Contact via WhatsApp' : 'Hubungi via WhatsApp',
            href: `https://wa.me/${pageContent.brand.whatsapp_number}?text=${encodeURIComponent(`Halo AHR, saya mengalami masalah pembayaran untuk order ${orderNumber || '-'}.`)}`,
          }
        : null,
    },
  }

  const currentConfig = config[status] || config.error
  const IconComponent = currentConfig.icon

  const handlePayAgain = async () => {
    if (!orderNumber) {
      return
    }

    setPaymentStatus({
      state: 'loading',
      message: language === 'en' ? 'Opening payment...' : 'Membuka pembayaran...',
    })

    try {
      await payOrder(orderNumber, paymentAccessToken, {
        onSuccess: () => {
          clearPendingPayment()
          setPaymentStatus({ state: 'idle', message: '' })
          navigate(`/payment/success?order=${orderNumber}`)
        },
        onPending: () => {
          setPaymentStatus({ state: 'idle', message: '' })
          if (customer) {
            navigate(`/akun/pesanan/${orderNumber}`)
            return
          }

          navigate(`/payment/pending?order=${orderNumber}`)
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
                : 'Pembayaran ditutup. Anda bisa mencoba lagi kapan saja.',
          })
        },
      }, { paymentSource: 'payment_result' })
    } catch (error) {
      setPaymentStatus({ state: 'error', message: error.message })
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
        cartItemCount={0}
        onPrimaryAction={() => {
          window.location.href = '/all-products'
        }}
        primaryActionLabel={t('cart.continueShopping')}
      />

      <main className="payment-result-page">
        <section className="content-block section-plain payment-result-hero">
          <div className="all-products-breadcrumb">
            <Link to="/all-products">
              <ArrowLeft size={16} />
              <span>{t('cart.backToProducts')}</span>
            </Link>
          </div>

          <div className="payment-result-content">
            <div className="payment-result-icon" style={{ color: currentConfig.iconColor }}>
              <IconComponent size={64} />
            </div>

            <h1>{currentConfig.title}</h1>

            {orderNumber && (
              <p className="payment-result-order">
                {language === 'en' ? 'Order Number' : 'Nomor Order'}: <strong>{orderNumber}</strong>
              </p>
            )}

            <p className="payment-result-message">{currentConfig.message}</p>

            <div className="payment-result-actions">
              {canRetryPayment ? (
                <button
                  className="cta-button cta-button-dark"
                  type="button"
                  disabled={paymentStatus.state === 'loading' || !isSnapReady}
                  onClick={handlePayAgain}
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
              ) : null}

              <Link className="cta-button cta-button-light" to={currentConfig.actionHref}>
                {currentConfig.actionLabel}
              </Link>

              {status === 'success' && currentConfig.trackOrderHref ? (
                <Link className="cta-button cta-button-light" to={currentConfig.trackOrderHref}>
                  <Package size={18} />
                  <span>{language === 'en' ? 'Track shipment' : 'Lacak pengiriman'}</span>
                </Link>
              ) : null}

              {currentConfig.secondaryAction && (
                <a
                  className="cta-button cta-button-light"
                  href={currentConfig.secondaryAction.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircleMore size={18} />
                  <span>{currentConfig.secondaryAction.label}</span>
                </a>
              )}
            </div>

            {paymentStatus.message ? (
              <p className={`cart-status ${paymentStatus.state === 'error' ? 'error' : 'success'}`}>{paymentStatus.message}</p>
            ) : null}
          </div>

          {status === 'success' ? (
            <PostPurchaseReviewPrompt
              orderNumber={orderNumber}
              paymentAccessToken={paymentAccessToken}
            />
          ) : null}
        </section>
      </main>

      <SiteFooter
        footerGroups={pageContent.footerGroups}
        companyProfile={pageContent.companyProfile}
        contactProfile={pageContent.brand}
        defaultMapLabel={t('common.mapLabel')}
        onWhatsAppClick={(message) => {
          window.open(`https://wa.me/${pageContent.brand.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
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
            updateConsent(nextPreferences)
          }}
          onAcceptAnalyticsOnly={() => {
            const nextPreferences = { analytics: 'accepted', personalization: 'rejected' }
            setConsentPreferences(nextPreferences)
            setConsentPreferencesState(nextPreferences)
            updateConsent(nextPreferences)
          }}
          onAcceptPersonalizationOnly={() => {
            const nextPreferences = { analytics: 'rejected', personalization: 'accepted' }
            setConsentPreferences(nextPreferences)
            setConsentPreferencesState(nextPreferences)
            updateConsent(nextPreferences)
          }}
          onRejectAll={() => {
            const nextPreferences = { analytics: 'rejected', personalization: 'rejected' }
            setConsentPreferences(nextPreferences)
            setConsentPreferencesState(nextPreferences)
            updateConsent(nextPreferences)
          }}
        />
      ) : null}
    </div>
  )
}
