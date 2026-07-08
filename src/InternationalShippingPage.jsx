import { useEffect, useState } from 'react'
import { ArrowLeft, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'
import './App.css'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { fetchCatalogLandingPage } from './lib/api'
import { useCart } from './lib/cart.jsx'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { getRetailHeaderActions, getStoreBrandName, isCssStore } from './lib/storeConfig'
import useDocumentTitle from './lib/useDocumentTitle'

function buildWhatsAppUrl(phoneNumber, message) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
}

export default function InternationalShippingPage() {
  const { language, t } = useLanguage()
  const { itemCount } = useCart()
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )

  const policy = t('internationalShippingPolicy')
  const sections = Array.isArray(policy?.sections) ? policy.sections : []

  useDocumentTitle(
    policy?.title || (language === 'en' ? 'International Shipping' : 'Pengiriman Internasional'),
    policy?.metaDescription ||
      (language === 'en'
        ? 'International shipping policy, customs duties, and payment information for orders outside Indonesia.'
        : 'Kebijakan pengiriman internasional, bea cukai, dan informasi pembayaran untuk pesanan luar negeri.'),
    {
      canonicalPath: '/pengiriman-internasional',
      image: '/ahr-brand-logo.webp',
      locale: language,
      type: 'website',
    },
  )

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
            window.location.href = isCssStore() ? '/all-products' : '/all-products'
          },
        })}
      />

      <main className="cart-page terms-page">
        <section className="content-block section-plain cart-hero">
          <div className="all-products-breadcrumb">
            <Link to="/cart">
              <ArrowLeft size={16} />
              <span>{language === 'en' ? 'Back to cart' : 'Kembali ke cart'}</span>
            </Link>
          </div>
          <div className="section-heading heading-inline cart-heading">
            <div>
              <span>
                <Globe size={16} aria-hidden="true" /> {language === 'en' ? 'Shipping' : 'Pengiriman'}
              </span>
              <h1>{policy?.title}</h1>
            </div>
          </div>
        </section>

        <section className="content-block section-soft">
          <article className="terms-document">
            {policy?.intro ? <p className="terms-document-intro">{policy.intro}</p> : null}
            {sections.map((section) => (
              <section key={section.title} className="terms-document-section">
                <h2>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
            <p className="terms-document-intro">
              {language === 'en' ? (
                <>
                  See also our{' '}
                  <Link to="/syarat-ketentuan">Terms & Conditions</Link> for general store policies.
                </>
              ) : (
                <>
                  Lihat juga <Link to="/syarat-ketentuan">Syarat & Ketentuan</Link> untuk kebijakan toko umum.
                </>
              )}
            </p>
          </article>
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
        footerMessage={isCssStore() ? undefined : t('allProducts.footerMessage')}
        bottomText={pageContent.footerBottomText || `© ${new Date().getFullYear()} ${getStoreBrandName()}`}
      />
    </div>
  )
}
