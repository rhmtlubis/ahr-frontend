import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import './App.css'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { getApiUrl } from './lib/api'
import { fetchCheckoutTerms } from './lib/checkoutTerms'
import { useCart } from './lib/cart.jsx'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import useDocumentTitle from './lib/useDocumentTitle'

function buildWhatsAppUrl(phoneNumber, message) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
}

export default function TermsAndConditionsPage() {
  const { language, t } = useLanguage()
  const { itemCount } = useCart()
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )
  const [terms, setTerms] = useState(null)
  const [loadError, setLoadError] = useState('')

  useDocumentTitle(
    language === 'en' ? 'Terms & Conditions' : 'Syarat & Ketentuan',
    language === 'en'
      ? 'Terms and conditions for ordering products from AHR Corporation online store.'
      : 'Syarat dan ketentuan pemesanan produk melalui toko online AHR Corporation.',
    {
      canonicalPath: '/syarat-ketentuan',
      image: '/ahr-brand-logo.webp',
      locale: language,
      type: 'website',
    },
  )

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
    setLoadError('')
    fetchCheckoutTerms(language)
      .then((data) => setTerms(data))
      .catch((error) => {
        setTerms(null)
        setLoadError(error.message)
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
        onPrimaryAction={() => {
          window.location.href = '/all-products'
        }}
        primaryActionLabel={t('cart.continueShopping')}
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
              <span>{language === 'en' ? 'Legal' : 'Ketentuan'}</span>
              <h1>{terms?.title || (language === 'en' ? 'Terms & Conditions' : 'Syarat & Ketentuan')}</h1>
            </div>
            {terms?.updated_at ? (
              <p>
                {language === 'en' ? 'Last updated' : 'Diperbarui'}: {terms.updated_at}
                {terms.version ? ` · v${terms.version}` : ''}
              </p>
            ) : null}
          </div>
        </section>

        <section className="content-block section-soft">
          <article className="terms-document">
            {loadError ? <p className="cart-status error">{loadError}</p> : null}
            {!terms && !loadError ? (
              <p className="cart-auth-copy">{language === 'en' ? 'Loading...' : 'Memuat...'}</p>
            ) : null}
            {terms?.intro ? <p className="terms-document-intro">{terms.intro}</p> : null}
            {terms?.sections?.map((section) => (
              <section key={section.title} className="terms-document-section">
                <h2>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
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
        footerMessage={t('allProducts.footerMessage')}
        bottomText={pageContent.footerBottomText}
      />
    </div>
  )
}
