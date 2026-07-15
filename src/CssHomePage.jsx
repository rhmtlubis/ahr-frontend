import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CircleHelp, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import './App.css'
import ArticleCategoryStrip from './components/articles/ArticleCategoryStrip'
import ProductFeaturedBadge from './components/catalog/ProductFeaturedBadge'
import ProductPrice from './components/catalog/ProductPrice'
import CssTrustBar from './components/css/CssTrustBar.jsx'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import WebsiteTour, { startTour } from './components/WebsiteTour'
import { initializeAnalyticsAndTrackCurrentPage, trackEvent, updateConsent } from './lib/analytics'
import { fetchCatalogLandingPage } from './lib/api'
import { fetchArticles } from './lib/articles.js'
import { buildArticleCategoryNavigation, filterArticlesByCategory } from './lib/articleCategories.js'
import { useCart } from './lib/cart.jsx'
import { categoryPlaceholderImage, normalizeProducts } from './lib/cmsContent.js'
import { getConsentPreferences, setConsentPreferences } from './lib/consent'
import { getFeaturedSectionTitle, pickFeaturedProducts } from './lib/cssFeaturedProducts'
import {
  buildCssWhatsAppUrl,
  getCssContactProfile,
  getCssFooterMessage,
  getCssHeroPanels,
} from './lib/cssStoreConfig'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { getMainSiteUrl, getRetailHeaderActions } from './lib/storeConfig'
import useDocumentTitle from './lib/useDocumentTitle'

export default function CssHomePage() {
  const { language, t } = useLanguage()
  const { itemCount } = useCart()
  const contactProfile = getCssContactProfile(language)
  const mainSiteUrl = getMainSiteUrl()

  useDocumentTitle(
    language === 'en' ? 'CS Studio | World Cup Fantasy Jerseys' : 'CS Studio | Jersey World Cup Fantasy',
    language === 'en'
      ? 'Shop World Cup Fantasy jerseys by CS Studio. Streetwear-inspired Portugal, Brasil, Belanda, and more — order online with secure checkout.'
      : 'Belanja jersey World Cup Fantasy dari CS Studio. Inspirasi Portugal, Brasil, Belanda, dan koleksi fantasy — pesan online dengan checkout aman.',
    {
      canonicalPath: '/',
      image: '/css-brand-logo.gif',
      imageAlt: 'CS Studio logo',
      keywords:
        language === 'en'
          ? 'CS Studio, World Cup Fantasy jersey, custom supply studio, fantasy football jersey'
          : 'CS Studio, jersey fantasy world cup, custom supply studio, jersey portugal brasil belanda',
      locale: language,
      type: 'website',
    },
  )

  const [pageContent, setPageContent] = useState(() => getLandingChromeContent({}, { hashPrefix: '/', locale: language }))
  const [products, setProducts] = useState([])
  const [articles, setArticles] = useState([])
  const [activeArticleCategory, setActiveArticleCategory] = useState('all')
  const [consentPreferences, setConsentPreferencesState] = useState(() => getConsentPreferences())

  useEffect(() => {
    initializeAnalyticsAndTrackCurrentPage('/')
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchCatalogLandingPage(language)
      .then((payload) => {
        if (cancelled) {
          return
        }

        if (payload?.data) {
          setPageContent(getLandingChromeContent(payload.data, { hashPrefix: '/', locale: language }))
          setProducts(normalizeProducts(payload.data.catalog_items || [], language))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPageContent(getLandingChromeContent({}, { hashPrefix: '/', locale: language }))
        }
      })

    fetchArticles(language).then((items) => {
      if (!cancelled) {
        setArticles(items)
      }
    })

    return () => {
      cancelled = true
    }
  }, [language])

  const heroPanels = useMemo(() => getCssHeroPanels(language, articles), [language, articles])
  const featuredProducts = useMemo(() => pickFeaturedProducts(products), [products])
  const featuredSectionTitle = useMemo(
    () => getFeaturedSectionTitle(featuredProducts, language),
    [featuredProducts, language],
  )
  const articleSectionIntro =
    language === 'en'
      ? 'Read the latest CS Studio articles on World Cup Legend tees, fantasy jerseys, streetwear styling, and practical guides for buying custom apparel online in Indonesia.'
      : 'Baca artikel terbaru CS Studio seputar kaos World Cup Legend, jersey fantasy, tips styling streetwear, dan panduan belanja apparel custom online di Indonesia — langsung dari tim Custom Supply.'
  const articleCategories = useMemo(() => buildArticleCategoryNavigation(articles), [articles])
  const visibleArticles = useMemo(
    () => filterArticlesByCategory(articles, activeArticleCategory).slice(0, 3),
    [activeArticleCategory, articles],
  )

  const applyConsentPreferences = (nextPreferences) => {
    setConsentPreferences(nextPreferences)
    setConsentPreferencesState(nextPreferences)
    updateConsent(nextPreferences)

    if (nextPreferences.analytics === 'accepted') {
      initializeAnalyticsAndTrackCurrentPage('/')
    }
  }

  const handleFooterWhatsApp = (message) => {
    window.open(buildCssWhatsAppUrl(message), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="app-shell css-store-shell">
      <SiteHeader
        brandHref="/"
        navGroups={pageContent.navGroups}
        ticker={pageContent.ticker}
        utilityLinks={pageContent.utilityLinks}
        utilityMessage={pageContent.utilityMessage}
        cartItemCount={itemCount}
        {...getRetailHeaderActions()}
      />

      <main className="css-home-page">
        <section className="css-store-hero" id="hero">
          <div className={heroPanels.length === 1 ? 'css-store-hero-grid css-store-hero-grid--single' : 'css-store-hero-grid'}>
            {heroPanels.map((panel, index) => (
              <Link className="css-store-hero-panel" key={panel.href} to={panel.href}>
                <img
                  className="css-store-hero-media"
                  src={panel.image || categoryPlaceholderImage}
                  alt=""
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <div className="css-store-hero-overlay">
                  <span className="css-store-hero-eyebrow">{panel.eyebrow}</span>
                  {index === 0 ? (
                    <h1 className="css-store-hero-title">{panel.title}</h1>
                  ) : (
                    <h2 className="css-store-hero-title">{panel.title}</h2>
                  )}
                  <span className="css-store-hero-cta">{panel.cta}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <CssTrustBar />

        <section className="content-block section-plain css-store-catalog-intro">
          <div className="css-store-catalog-heading">
            <div>
              <p className="css-home-section-kicker">
                {language === 'en' ? 'Featured products' : 'Produk unggulan'}
              </p>
              <h2>{featuredSectionTitle}</h2>
            </div>
            <Link className="css-store-catalog-link" to="/all-products">
              {language === 'en' ? 'View all' : 'Lihat semua'}
            </Link>
          </div>

          <div className="all-products-grid css-home-product-grid">
            {featuredProducts.map((product) => (
              <article className={`product-card all-products-card tone-${product.tone}`} key={product.slug}>
                <Link className="product-card-link" to={`/produk/${product.slug}`} state={{ product }}>
                  <div className="product-media">
                    {product.isFeatured ? <ProductFeaturedBadge /> : null}
                    <img
                      className="product-image product-image-primary"
                      src={product.image}
                      alt={product.name}
                      width="800"
                      height="1000"
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: product.imagePosition || 'center center' }}
                    />
                    {product.gallery?.[1] ? (
                      <img
                        className="product-image product-image-hover"
                        src={product.gallery[1]}
                        alt={`${product.name} alternate`}
                        width="800"
                        height="1000"
                        loading="lazy"
                        decoding="async"
                        style={{ objectPosition: product.imagePosition || 'center center' }}
                      />
                    ) : null}
                  </div>
                  <div className="product-body">
                    <ProductPrice product={product} />
                    <h3 className="product-card-name">{product.name}</h3>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {articles.length > 0 ? (
          <section className="content-block section-soft css-home-articles">
            <div className="css-store-catalog-heading">
              <div>
                <p className="css-home-section-kicker">{language === 'en' ? 'Stories' : 'Artikel'}</p>
                <h2>{language === 'en' ? 'Latest articles' : 'Artikel terbaru'}</h2>
                <p className="css-home-article-intro">{articleSectionIntro}</p>
              </div>
              <Link className="css-store-catalog-link" to="/artikel">
                {language === 'en' ? 'All articles' : 'Semua artikel'}
              </Link>
            </div>

            <ArticleCategoryStrip
              categories={articleCategories}
              activeCategoryId={activeArticleCategory}
              onSelect={setActiveArticleCategory}
              allLabel={language === 'en' ? 'All topics' : 'Semua topik'}
            />

            <div className="css-home-article-grid">
              {visibleArticles.length === 0 ? (
                <p className="css-home-article-empty">
                  {language === 'en'
                    ? 'No articles in this category yet.'
                    : 'Belum ada artikel di kategori ini.'}
                </p>
              ) : (
                visibleArticles.map((article, index) => (
                  <Link
                    className={`css-home-article-card${index === 0 && activeArticleCategory === 'all' ? ' is-latest' : ''}`}
                    key={article.slug}
                    to={`/artikel/${article.slug}`}
                  >
                    <img src={article.coverImage || categoryPlaceholderImage} alt={article.coverImageAlt || article.title} loading="lazy" />
                    <div>
                      <span>{article.category}</span>
                      <strong>{article.title}</strong>
                      {article.excerpt ? <p className="css-home-article-excerpt">{article.excerpt}</p> : null}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        ) : null}

        <section className="content-block section-plain css-home-ahr-strip">
          <div className="css-home-ahr-copy">
            <p className="css-home-section-kicker">AHR Corporation</p>
            <h2>{language === 'en' ? 'Custom jerseys beyond fantasy retail' : 'Jersey custom di luar retail fantasy'}</h2>
            <p>
              {language === 'en'
                ? 'Need team uniforms, corporate apparel, or full custom sublimation? Visit our main site for B2B quotes and production at scale.'
                : 'Butuh jersey tim, apparel korporat, atau sublimasi custom skala produksi? Kunjungi situs utama AHR untuk penawaran B2B.'}
            </p>
          </div>
          <a className="css-home-ahr-link" href={mainSiteUrl} target="_blank" rel="noreferrer">
            {language === 'en' ? 'Visit ahrcorporation.id' : 'Kunjungi ahrcorporation.id'}
            <ExternalLink size={16} />
          </a>
        </section>

        <section className="content-block section-soft css-home-cta">
          <div>
            <p className="css-home-section-kicker">{language === 'en' ? 'Need help?' : 'Butuh bantuan?'}</p>
            <h2>{language === 'en' ? 'Chat before you checkout' : 'Chat dulu sebelum checkout'}</h2>
            <p>
              {language === 'en'
                ? 'Questions about size, stock, or delivery? Reach us on WhatsApp or Instagram.'
                : 'Tanya ukuran, stok, atau pengiriman? Hubungi kami via WhatsApp atau Instagram.'}
            </p>
          </div>
          <div className="css-home-cta-actions">
            <a className="css-home-cta-button" href={buildCssWhatsAppUrl(getCssFooterMessage(language))} target="_blank" rel="noreferrer">
              WhatsApp
              <ArrowRight size={16} />
            </a>
            <a className="css-home-cta-button css-home-cta-button--ghost" href={contactProfile.instagram_url} target="_blank" rel="noreferrer">
              Instagram
              <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>

      <SiteFooter
        footerGroups={pageContent.footerGroups}
        companyProfile={pageContent.companyProfile}
        contactProfile={contactProfile}
        defaultMapLabel={t('common.mapLabel')}
        footerMessage={getCssFooterMessage(language)}
        bottomText={pageContent.footerBottomText}
        onWhatsAppClick={handleFooterWhatsApp}
      />

      {consentPreferences.analytics === 'unknown' && consentPreferences.personalization === 'unknown' ? (
        <CookieConsentBanner
          onAcceptAll={() => {
            applyConsentPreferences({ analytics: 'accepted', personalization: 'accepted' })
            trackEvent('cookie_consent_updated', { choice: 'accepted-all', source_page: '/' })
          }}
          onAcceptAnalyticsOnly={() => {
            applyConsentPreferences({ analytics: 'accepted', personalization: 'rejected' })
            trackEvent('cookie_consent_updated', { choice: 'analytics-only', source_page: '/' })
          }}
          onAcceptPersonalizationOnly={() => {
            applyConsentPreferences({ analytics: 'rejected', personalization: 'accepted' })
            trackEvent('cookie_consent_updated', { choice: 'personalization-only', source_page: '/' })
          }}
          onRejectAll={() => {
            applyConsentPreferences({ analytics: 'rejected', personalization: 'rejected' })
            trackEvent('cookie_consent_updated', { choice: 'rejected-all', source_page: '/' })
          }}
        />
      ) : null}

      <WebsiteTour />
      <button
        className="ahr-tour-trigger"
        type="button"
        aria-label="Mulai tur website"
        onClick={() => startTour(true)}
      >
        <CircleHelp />
      </button>
    </div>
  )
}
