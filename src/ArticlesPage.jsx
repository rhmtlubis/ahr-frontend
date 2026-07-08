import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, Clock3 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import './App.css'
import './ArticlePage.css'
import ArticleCategoryStrip from './components/articles/ArticleCategoryStrip'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { fetchCatalogLandingPage } from './lib/api'
import { fetchArticles, getFallbackArticles } from './lib/articles.js'
import { buildArticleCategoryNavigation, filterArticlesByCategory } from './lib/articleCategories.js'
import { useCart } from './lib/cart.jsx'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { getRetailHeaderActions, getStoreBrandName, isCssStore } from './lib/storeConfig'
import { buildArticleListingStructuredData } from './lib/structuredData.js'
import useDocumentTitle from './lib/useDocumentTitle'

function formatArticleDate(date, locale) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

function ArticlesPage() {
  const { language, t } = useLanguage()
  const { itemCount } = useCart()
  const [searchParams] = useSearchParams()
  const activeCategoryId = searchParams.get('kategori') || 'all'
  const [articles, setArticles] = useState(() => getFallbackArticles())
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )

  useDocumentTitle(
    isCssStore()
      ? language === 'en'
        ? 'CS Studio Articles'
        : 'Artikel CS Studio'
      : language === 'en'
        ? 'Articles About Custom Jerseys, Sublimation, and Ordering Tips'
        : 'Artikel Jersey Custom, Sublimasi, dan Tips Pemesanan',
    isCssStore()
      ? language === 'en'
        ? 'Stories, styling notes, and practical guides from CS Studio.'
        : 'Cerita, catatan styling, dan panduan praktis dari CS Studio.'
      : language === 'en'
        ? 'Browse AHR articles about custom jerseys, sublimation apparel, design tips, material selection, and ordering guidance.'
        : 'Baca artikel AHR seputar jersey custom, apparel sublimasi, desain, bahan, dan tips pemesanan untuk tim, komunitas, sekolah, dan perusahaan.',
    {
      canonicalPath: '/artikel',
      image: '/og-preview.png',
      imageAlt: 'Artikel jersey custom AHR',
      keywords:
        language === 'en'
          ? 'custom jersey articles, sublimation tips, jersey design tips, sportswear ordering guide, AHR blog'
          : 'artikel jersey custom, tips sublimasi, tips desain jersey, panduan order jersey, blog AHR',
      locale: language,
      type: 'website',
      structuredData: buildArticleListingStructuredData(articles),
    },
  )

  useEffect(() => {
    let cancelled = false

    fetchArticles(language).then((items) => {
      if (!cancelled) {
        setArticles(items)
      }
    })

    fetchCatalogLandingPage(language)
      .then((payload) => {
        if (payload?.data) {
          setPageContent(getLandingChromeContent(payload.data, { hashPrefix: '/', locale: language }))
        }
      })
      .catch(() => {
        setPageContent(getLandingChromeContent({}, { hashPrefix: '/', locale: language }))
      })

    return () => {
      cancelled = true
    }
  }, [language])

  const {
    brand,
    companyProfile,
    footerBottomText,
    footerGroups,
    navGroups,
    ticker,
    utilityLinks,
    utilityMessage,
  } = pageContent

  const featuredArticle = articles[0]
  const articleCategories = useMemo(() => buildArticleCategoryNavigation(articles), [articles])
  const visibleArticles = useMemo(
    () => filterArticlesByCategory(articles, activeCategoryId),
    [activeCategoryId, articles],
  )
  const activeCategoryLabel =
    activeCategoryId === 'all'
      ? language === 'en'
        ? 'All topics'
        : 'Semua topik'
      : articleCategories.find((category) => category.id === activeCategoryId)?.label || activeCategoryId
  return (
    <div className="app-shell article-page-shell">
      <SiteHeader
        brandHref="/"
        navGroups={navGroups}
        ticker={ticker}
        utilityAction={{ href: '/#contact', label: t('profile.utilityAction') }}
        utilityLinks={utilityLinks}
        utilityMessage={utilityMessage}
        cartItemCount={itemCount}
        {...getRetailHeaderActions({
          primaryActionLabel: t('common.chatWhatsApp'),
          onPrimaryAction: () => {
            window.location.href = '/#contact'
          },
        })}
      />

      <main className="article-main">
        <section className="article-hero">
          <div className="article-hero-media" aria-hidden="true">
            <img
              src={featuredArticle?.coverImage || '/og-preview.png'}
              alt=""
            />
          </div>
          <div className="article-hero-copy">
            <span className="article-hero-kicker">{isCssStore() ? getStoreBrandName() : 'News hub'}</span>
            <h1>{language === 'en' ? 'Latest articles' : 'Artikel terbaru'}</h1>
            <p>
              {isCssStore()
                ? language === 'en'
                  ? 'Explore CS Studio articles on World Cup Legend tees, fantasy jerseys, streetwear styling, and custom apparel guides — published by Custom Supply for buyers across Indonesia.'
                  : 'Jelajahi artikel CS Studio tentang kaos World Cup Legend, jersey fantasy, styling streetwear, dan panduan apparel custom — diterbitkan Custom Supply untuk pembeli di seluruh Indonesia.'
                : language === 'en'
                  ? 'Editorial notes, production insights, and practical guides for custom jersey buyers.'
                  : 'Catatan editorial, insight produksi, dan panduan praktis untuk buyer jersey custom.'}
            </p>
            <div className="article-hero-actions">
              <Link className="article-pill-link" to="/all-products">
                {language === 'en' ? 'See products' : 'Lihat produk'}
                <ArrowRight size={16} />
              </Link>
              {!isCssStore() ? (
                <Link className="article-pill-link" to="/#contact">
                  {language === 'en' ? 'Talk to team' : 'Konsultasi tim'}
                  <ArrowRight size={16} />
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="article-list-section">
          <div className="article-section-title">
            <h2>{language === 'en' ? 'Latest news' : 'Berita terbaru'}</h2>
            <div className="article-filter-note">
              {language === 'en' ? 'Filter by:' : 'Filter:'} {activeCategoryLabel}
            </div>
          </div>

          {isCssStore() ? (
            <ArticleCategoryStrip
              categories={articleCategories}
              activeCategoryId={activeCategoryId}
              allLabel={language === 'en' ? 'All topics' : 'Semua topik'}
              getCategoryHref={(categoryId) =>
                categoryId === 'all' ? '/artikel' : `/artikel?kategori=${categoryId}`
              }
            />
          ) : null}

          <div className="article-grid">
            {visibleArticles.length === 0 ? (
              <p className="article-empty-state">
                {language === 'en'
                  ? 'No articles published for CS Studio yet.'
                  : 'Belum ada artikel yang dipublikasikan untuk CS Studio.'}
              </p>
            ) : (
              visibleArticles.map((article) => (
              <Link className="article-card" key={article.slug} to={`/artikel/${article.slug}`}>
                <img
                  className="article-card-image"
                  src={article.coverImage}
                  alt={article.coverImageAlt}
                  width="1200"
                  height="800"
                />
                <div className="article-card-body">
                  <span className="article-category">{article.category}</span>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <div className="article-card-meta">
                    <span>
                      <CalendarDays size={16} />
                      {formatArticleDate(article.publishedAt, language)}
                    </span>
                    <span>
                      <Clock3 size={16} />
                      {article.readingTime}
                    </span>
                  </div>
                  <span className="article-card-link">
                    Baca selengkapnya
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
              ))
            )}
          </div>
        </section>
      </main>

      <SiteFooter
        companyProfile={companyProfile}
        contactProfile={brand}
        defaultMapLabel={t('common.mapLabel')}
        footerGroups={footerGroups}
        footerMessage={language === 'en' ? 'Hello AHR, I want to discuss a custom jersey order.' : 'Halo AHR, saya ingin konsultasi order jersey custom.'}
        bottomText={footerBottomText}
        onWhatsAppClick={(message) => {
          window.open(`https://wa.me/${brand.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
        }}
      />
    </div>
  )
}

export default ArticlesPage
