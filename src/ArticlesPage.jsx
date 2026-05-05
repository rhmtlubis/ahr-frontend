import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import './App.css'
import './ArticlePage.css'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { getApiUrl } from './lib/api'
import { fetchArticles, getFallbackArticles } from './lib/articles.js'
import { useCart } from './lib/cart.jsx'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
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
  const [articles, setArticles] = useState(() => getFallbackArticles())
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )

  useDocumentTitle(
    language === 'en'
      ? 'Articles About Custom Jerseys, Sublimation, and Ordering Tips'
      : 'Artikel Jersey Custom, Sublimasi, dan Tips Pemesanan',
    language === 'en'
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

    fetch(getApiUrl(`/api/catalog/landing-page?locale=${language}`), {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load article page chrome content')
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
  const visibleArticles = articles.slice(0)
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
        onPrimaryAction={() => {
          window.location.href = '/#contact'
        }}
        primaryActionLabel={t('common.chatWhatsApp')}
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
            <span className="article-hero-kicker">News hub</span>
            <h1>{language === 'en' ? 'Latest articles' : 'Artikel terbaru'}</h1>
            <p>
              {language === 'en'
                ? 'Editorial notes, production insights, and practical guides for custom jersey buyers.'
                : 'Catatan editorial, insight produksi, dan panduan praktis untuk buyer jersey custom.'}
            </p>
            <div className="article-hero-actions">
              <Link className="article-pill-link" to="/all-products">
                {language === 'en' ? 'See products' : 'Lihat produk'}
                <ArrowRight size={16} />
              </Link>
              <Link className="article-pill-link" to="/#contact">
                {language === 'en' ? 'Talk to team' : 'Konsultasi tim'}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section className="article-list-section">
          <div className="article-section-title">
            <h2>{language === 'en' ? 'Latest news' : 'Berita terbaru'}</h2>
            <div className="article-filter-note">
              {language === 'en' ? 'Filter by: All topics' : 'Filter: semua topik'}
            </div>
          </div>

          <div className="article-grid">
            {visibleArticles.map((article) => (
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
            ))}
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
