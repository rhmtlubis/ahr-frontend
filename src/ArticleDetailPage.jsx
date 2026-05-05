import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Clock3 } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import './App.css'
import './ArticlePage.css'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { getApiUrl } from './lib/api'
import { fetchArticle, fetchArticles } from './lib/articles.js'
import { useCart } from './lib/cart.jsx'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { buildArticleStructuredData } from './lib/structuredData.js'
import useDocumentTitle from './lib/useDocumentTitle'

function formatArticleDate(date, locale) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

function ArticleDetailPage() {
  const { articleSlug } = useParams()
  const { language, t } = useLanguage()
  const { itemCount } = useCart()
  const [article, setArticle] = useState(undefined)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )

  useDocumentTitle(article?.title, article?.description, {
    canonicalPath: article ? `/artikel/${article.slug}` : '/artikel',
    image: article?.coverImage || '/og-preview.png',
    imageAlt: article?.coverImageAlt || article?.title || 'Artikel AHR',
    keywords: article?.keywords,
    locale: language,
    type: 'article',
    structuredData: article ? buildArticleStructuredData(article) : [],
  })

  useEffect(() => {
    let cancelled = false

    if (!article) {
      fetchArticle(articleSlug, language).then((item) => {
        if (!cancelled) {
          setArticle(item)
        }
      })
    }

    fetchArticles(language).then((items) => {
      if (!cancelled) {
        setRelatedArticles(items.filter((item) => item.slug !== articleSlug).slice(0, 2))
      }
    })

    fetch(getApiUrl(`/api/catalog/landing-page?locale=${language}`), {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load article detail chrome content')
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
  }, [articleSlug, language])

  if (article === undefined) {
    return (
      <div className="app-shell article-page-shell">
        <main className="article-main">
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  if (article === null) {
    return <Navigate to="/artikel" replace />
  }

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

  return (
    <div className="app-shell article-page-shell">
      <SiteHeader
        brandHref="/"
        navGroups={navGroups}
        ticker={ticker}
        utilityAction={{ href: '/artikel', label: 'Artikel' }}
        utilityLinks={utilityLinks}
        utilityMessage={utilityMessage}
        cartItemCount={itemCount}
        onPrimaryAction={() => {
          window.location.href = '/#contact'
        }}
        primaryActionLabel={t('common.chatWhatsApp')}
      />

      <main className="article-main article-detail-main">
        <section className="article-breadcrumbs">
          <Link to="/artikel">
            <ArrowLeft size={16} />
            Semua artikel
          </Link>
        </section>

        <article className="article-detail-layout">
          <header className="article-detail-header">
            <span className="article-category">{article.category}</span>
            <h1>{article.title}</h1>
            <p>{article.description}</p>
            <div className="article-meta-row">
              <span>
                <CalendarDays size={16} />
                {formatArticleDate(article.publishedAt, language)}
              </span>
              <span>
                <Clock3 size={16} />
                {article.readingTime}
              </span>
              <span>Oleh {article.author}</span>
            </div>
          </header>

          <div className="article-detail-cover">
            <img src={article.coverImage} alt={article.coverImageAlt} width="1200" height="800" />
          </div>

          <div className="article-detail-body">
            {article.sections.map((section) => (
              <section className="article-copy-block" key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {Array.isArray(section.bullets) && section.bullets.length > 0 ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {article.faqs.length > 0 ? (
              <section className="article-copy-block article-faq-block">
                <h2>Pertanyaan yang sering muncul</h2>
                <div className="article-faq-list">
                  {article.faqs.map((faq) => (
                    <article className="article-faq-item" key={faq.question}>
                      <h3>{faq.question}</h3>
                      <p>{faq.answer}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="article-cta-card">
              <h2>Butuh konsultasi order jersey custom?</h2>
              <p>
                Tim AHR bisa bantu dari pilihan bahan, penyesuaian desain, sampai alur produksi untuk
                komunitas, sekolah, event, dan perusahaan.
              </p>
              <div className="article-cta-actions">
                <a
                  className="article-link-button"
                  href={`https://wa.me/${brand.whatsapp_number}?text=${encodeURIComponent('Halo AHR, saya ingin konsultasi order jersey custom.')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Konsultasi via WhatsApp
                  <ArrowRight size={16} />
                </a>
                <Link className="article-link-inline" to="/all-products">
                  Lihat katalog produk
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          </div>
        </article>

        {relatedArticles.length > 0 ? (
          <section className="article-list-section">
            <div className="section-heading">
              <span>Artikel Terkait</span>
              <h2>Baca juga topik lainnya</h2>
            </div>

            <div className="article-grid">
              {relatedArticles.map((relatedArticle) => (
                <article className="article-card" key={relatedArticle.slug}>
                  <img
                    className="article-card-image"
                    src={relatedArticle.coverImage}
                    alt={relatedArticle.coverImageAlt}
                    width="1200"
                    height="800"
                  />
                  <div className="article-card-body">
                    <span className="article-category">{relatedArticle.category}</span>
                    <h3>{relatedArticle.title}</h3>
                    <p>{relatedArticle.excerpt}</p>
                    <Link className="article-link-inline" to={`/artikel/${relatedArticle.slug}`}>
                      Baca selengkapnya
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter
        companyProfile={companyProfile}
        contactProfile={brand}
        defaultMapLabel={t('common.mapLabel')}
        footerGroups={footerGroups}
        footerMessage="Halo AHR, saya ingin konsultasi order jersey custom."
        bottomText={footerBottomText}
        onWhatsAppClick={(message) => {
          window.open(`https://wa.me/${brand.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
        }}
      />
    </div>
  )
}

export default ArticleDetailPage
