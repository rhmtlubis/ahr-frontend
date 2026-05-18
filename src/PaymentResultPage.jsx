import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle, Clock, MessageCircleMore, XCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import './App.css'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { getApiUrl } from './lib/api'
import { getConsentPreferences, setConsentPreferences } from './lib/consent'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { updateConsent } from './lib/analytics'
import useDocumentTitle from './lib/useDocumentTitle'

export default function PaymentResultPage({ status }) {
  const { language, t } = useLanguage()
  const [searchParams] = useSearchParams()
  const orderNumber = searchParams.get('order')
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )
  const [consentPreferences, setConsentPreferencesState] = useState(() => getConsentPreferences())

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
    fetch(getApiUrl(`/api/catalog/landing-page?locale=${language}`), {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Gagal memuat konten')
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
      actionLabel: language === 'en' ? 'Continue Shopping' : 'Lanjut Belanja',
      actionHref: '/all-products',
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
      actionLabel: language === 'en' ? 'Try Again' : 'Coba Lagi',
      actionHref: '/cart',
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
              <Link className="cta-button cta-button-dark" to={currentConfig.actionHref}>
                {currentConfig.actionLabel}
              </Link>

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
          </div>
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
