import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, CalendarDays, Clock3 } from 'lucide-react'
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
  const remainingArticles = articles.slice(1)

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
          <div className="article-hero-copy">
            <span className="article-eyebrow">SEO Content Hub</span>
            <h1>
              {language === 'en'
                ? 'Articles that support search visibility and buyer education'
                : 'Artikel yang membantu SEO sekaligus mengedukasi calon pembeli'}
            </h1>
            <p>
              {language === 'en'
                ? 'Explore practical guides about custom jerseys, sublimation design, materials, and ordering workflows.'
                : 'Kumpulan artikel praktis seputar jersey custom, desain sublimasi, pemilihan bahan, dan alur pemesanan yang paling sering dicari calon buyer.'}
            </p>
          </div>
          <div className="article-hero-card">
            <BookOpen size={28} />
            <strong>{articles.length} artikel awal siap diindeks</strong>
            <p>
              Halaman ini dibuat untuk memperluas keyword informasional dan menguatkan halaman produk
              utama lewat internal link.
            </p>
          </div>
        </section>

        <section className="article-featured">
          <article className="featured-article-card">
            <div className="featured-article-media">
              <img
                src={featuredArticle.coverImage}
                alt={featuredArticle.coverImageAlt}
                width="1200"
                height="800"
              />
            </div>
            <div className="featured-article-body">
              <span className="article-category">{featuredArticle.category}</span>
              <h2>{featuredArticle.title}</h2>
              <p>{featuredArticle.description}</p>
              <div className="article-meta-row">
                <span>
                  <CalendarDays size={16} />
                  {formatArticleDate(featuredArticle.publishedAt, language)}
                </span>
                <span>
                  <Clock3 size={16} />
                  {featuredArticle.readingTime}
                </span>
              </div>
              <Link className="article-link-button" to={`/artikel/${featuredArticle.slug}`}>
                Baca artikel
                <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        </section>

        <section className="article-list-section">
          <div className="section-heading">
            <span>Topik Artikel</span>
            <h2>{language === 'en' ? 'Latest guidance from AHR' : 'Panduan terbaru dari AHR'}</h2>
          </div>

          <div className="article-grid">
            {remainingArticles.map((article) => (
              <article className="article-card" key={article.slug}>
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
                  <div className="article-meta-row">
                    <span>
                      <CalendarDays size={16} />
                      {formatArticleDate(article.publishedAt, language)}
                    </span>
                    <span>
                      <Clock3 size={16} />
                      {article.readingTime}
                    </span>
                  </div>
                  <Link className="article-link-inline" to={`/artikel/${article.slug}`}>
                    Baca selengkapnya
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
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
