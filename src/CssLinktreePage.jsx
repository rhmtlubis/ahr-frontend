import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Globe,
  Link2,
  MessageCircle,
  Phone,
  Share2,
  ShoppingBag,
  Store,
  X,
} from 'lucide-react'
import { FaFacebookF, FaInstagram, FaWhatsapp, FaXTwitter } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import './CssLinktreePage.css'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import { initializeAnalyticsAndTrackCurrentPage, updateConsent } from './lib/analytics'
import { fetchCatalogLandingPage } from './lib/api'
import { normalizeProducts, productPlaceholderImage } from './lib/cmsContent.js'
import { getConsentPreferences, setConsentPreferences } from './lib/consent'
import { pickLinktreeFeaturedProducts } from './lib/cssFeaturedProducts'
import {
  buildCssWhatsAppUrl,
  getCssContactProfile,
  getCssFooterMessage,
  getCssInstagramUrl,
  getCssLinktreeShareOptions,
  getCssShopChannels,
} from './lib/cssStoreConfig'
import { useLanguage } from './lib/i18n.jsx'
import useDocumentTitle from './lib/useDocumentTitle'

export default function CssLinktreePage() {
  const { language } = useLanguage()
  const contactProfile = getCssContactProfile(language)
  const shopChannels = getCssShopChannels(language)
  const shareOptions = getCssLinktreeShareOptions(language)
  const isEnglish = language === 'en'
  const [activeTab, setActiveTab] = useState('links')
  const [products, setProducts] = useState([])
  const [shareOpen, setShareOpen] = useState(false)
  const [copyState, setCopyState] = useState('idle')
  const [consentPreferences, setConsentPreferencesState] = useState(() => getConsentPreferences())

  useDocumentTitle(
    isEnglish ? 'CS Studio | Links & Shop' : 'CS Studio | Link & Belanja',
    isEnglish
      ? 'All CS Studio links in one place — shop featured World Cup Fantasy jerseys, chat on WhatsApp, and explore the full catalog.'
      : 'Semua link CS Studio dalam satu halaman — belanja jersey fantasy unggulan, chat WhatsApp, dan jelajahi katalog lengkap.',
    {
      canonicalPath: '/linktree',
      image: '/css-brand-logo.gif',
      imageAlt: 'CS Studio logo',
      keywords: isEnglish
        ? 'CS Studio linktree, World Cup Fantasy jersey, custom supply studio shop'
        : 'CS Studio linktree, jersey fantasy world cup, belanja CS Studio',
      locale: language,
      type: 'website',
    },
  )

  useEffect(() => {
    initializeAnalyticsAndTrackCurrentPage('/linktree')
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchCatalogLandingPage(language)
      .then((payload) => {
        if (cancelled || !payload?.data) {
          return
        }

        setProducts(normalizeProducts(payload.data.catalog_items || [], language))
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [language])

  const featuredProducts = useMemo(() => pickLinktreeFeaturedProducts(products), [products])
  const featuredCount = featuredProducts.length
  const whatsappMessage = getCssFooterMessage(language)

  const applyConsentPreferences = (nextPreferences) => {
    setConsentPreferences(nextPreferences)
    setConsentPreferencesState(nextPreferences)
    updateConsent(nextPreferences)

    if (nextPreferences.analytics === 'accepted') {
      initializeAnalyticsAndTrackCurrentPage('/linktree')
    }
  }

  const openWhatsApp = () => {
    window.open(buildCssWhatsAppUrl(whatsappMessage), '_blank', 'noopener,noreferrer')
  }

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareOptions.pageUrl)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      setCopyState('idle')
    }
  }

  const shareChannels = [
    {
      id: 'copy',
      label: copyState === 'copied' ? shareOptions.copiedLabel : shareOptions.copyLabel,
      icon: Link2,
      onClick: copyShareLink,
    },
    {
      id: 'whatsapp',
      label: shareOptions.whatsappLabel,
      icon: FaWhatsapp,
      href: `https://wa.me/?text=${encodeURIComponent(`${shareOptions.shareText} ${shareOptions.pageUrl}`)}`,
    },
    {
      id: 'facebook',
      label: shareOptions.facebookLabel,
      icon: FaFacebookF,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareOptions.pageUrl)}`,
    },
    {
      id: 'x',
      label: shareOptions.xLabel,
      icon: FaXTwitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareOptions.pageUrl)}&text=${encodeURIComponent(shareOptions.shareText)}`,
    },
  ]

  const shareModal =
    shareOpen && typeof document !== 'undefined'
      ? createPortal(
          <div className="css-linktree-share-overlay" onClick={() => setShareOpen(false)}>
            <div
              className="css-linktree-share-dialog"
              role="dialog"
              aria-modal="true"
              aria-label={shareOptions.title}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="css-linktree-share-header">
                <h2>{shareOptions.title}</h2>
                <button type="button" className="css-linktree-share-close" onClick={() => setShareOpen(false)} aria-label={isEnglish ? 'Close' : 'Tutup'}>
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="css-linktree-share-preview">
                <div className="css-linktree-share-preview-avatar">
                  <img src="/css-brand-logo.gif" alt="" width="56" height="56" loading="lazy" decoding="async" />
                </div>
                <strong>{contactProfile.lockup}</strong>
                <span>{shareOptions.pageUrl.replace(/^https?:\/\//, '')}</span>
              </div>

              <div className="css-linktree-share-row">
                {shareChannels.map((channel) => {
                  const Icon = channel.icon

                  if (channel.href) {
                    return (
                      <a
                        className="css-linktree-share-option"
                        key={channel.id}
                        href={channel.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className={`css-linktree-share-icon css-linktree-share-icon--${channel.id}`}>
                          <Icon size={18} aria-hidden="true" />
                        </span>
                        <span>{channel.label}</span>
                      </a>
                    )
                  }

                  return (
                    <button type="button" className="css-linktree-share-option" key={channel.id} onClick={channel.onClick}>
                      <span className={`css-linktree-share-icon css-linktree-share-icon--${channel.id}`}>
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <span>{channel.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <main className="css-linktree-shell">
      <section className="css-linktree-card">
        <div className="css-linktree-topbar">
          <Link className="css-linktree-back" to="/">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{isEnglish ? 'Back to store' : 'Kembali ke toko'}</span>
          </Link>
          <button
            type="button"
            className="css-linktree-share-trigger"
            onClick={() => setShareOpen(true)}
            aria-label={shareOptions.title}
          >
            <Share2 size={18} aria-hidden="true" />
          </button>
        </div>

        <header className="css-linktree-profile">
          <div className="css-linktree-avatar">
            <img src="/css-brand-logo.gif" alt="CS Studio" width="72" height="72" loading="eager" decoding="async" />
          </div>
          <h1>{contactProfile.lockup}</h1>
          <p>{contactProfile.tagline}</p>
          <div className="css-linktree-socials">
            <Link to="/" aria-label={isEnglish ? 'CS Studio website' : 'Website CS Studio'}>
              <Globe size={18} aria-hidden="true" />
            </Link>
            <a href={`tel:+${contactProfile.whatsapp_number}`} aria-label="Telepon CS Studio">
              <Phone size={18} aria-hidden="true" />
            </a>
            <a href={getCssInstagramUrl()} target="_blank" rel="noreferrer" aria-label="Instagram CS Studio">
              <FaInstagram size={18} aria-hidden="true" />
            </a>
          </div>
        </header>

        <div className="css-linktree-tabs" role="tablist" aria-label={isEnglish ? 'Page sections' : 'Bagian halaman'}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'links'}
            className={['css-linktree-tab', activeTab === 'links' ? 'is-active' : ''].filter(Boolean).join(' ')}
            onClick={() => setActiveTab('links')}
          >
            {isEnglish ? 'Links' : 'Link'}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'shop'}
            className={['css-linktree-tab', activeTab === 'shop' ? 'is-active' : ''].filter(Boolean).join(' ')}
            onClick={() => setActiveTab('shop')}
          >
            {isEnglish ? 'Shop' : 'Belanja'}
          </button>
        </div>

        <button type="button" className="css-linktree-ask" onClick={openWhatsApp}>
          <span>
            <strong>{isEnglish ? 'Ask about our jerseys' : 'Tanya tentang jersey kami'}</strong>
            <span>{isEnglish ? 'Chat on WhatsApp' : 'Chat lewat WhatsApp'}</span>
          </span>
          <MessageCircle className="css-linktree-ask-icon" size={22} aria-hidden="true" />
        </button>

        {featuredCount > 0 ? (
          <Link className="css-linktree-featured" to="/all-products">
            <div className="css-linktree-featured-grid">
              {featuredProducts.map((product) => (
                <div className="css-linktree-featured-cell" key={product.slug}>
                  <img
                    src={product.image || productPlaceholderImage}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
            <div className="css-linktree-featured-caption">
              <strong>{isEnglish ? 'Shop our collection' : 'Belanja koleksi kami'}</strong>
              <span>
                {featuredCount} {isEnglish ? (featuredCount === 1 ? 'product' : 'products') : 'produk'}
              </span>
            </div>
          </Link>
        ) : null}

        {activeTab === 'links' ? (
          <div className="css-linktree-stack">
            <button type="button" className="css-linktree-link-card" onClick={openWhatsApp}>
              <span>
                <strong>WhatsApp CS Studio</strong>
                <span>{contactProfile.whatsapp_display}</span>
              </span>
              <MessageCircle size={18} aria-hidden="true" />
            </button>

            <Link className="css-linktree-link-card" to="/all-products">
              <span>
                <strong>{isEnglish ? 'View all products' : 'Lihat semua produk'}</strong>
                <span>{isEnglish ? 'World Cup Fantasy jerseys' : 'Jersey World Cup Fantasy'}</span>
              </span>
              <ShoppingBag size={18} aria-hidden="true" />
            </Link>

            <Link className="css-linktree-link-card" to="/artikel">
              <span>
                <strong>{isEnglish ? 'Articles & style tips' : 'Artikel & inspirasi gaya'}</strong>
                <span>{isEnglish ? 'Stories from CS Studio' : 'Cerita dari CS Studio'}</span>
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <a className="css-linktree-link-card" href={contactProfile.main_site_url} target="_blank" rel="noreferrer">
              <span>
                <strong>{isEnglish ? 'Visit AHR Corporation' : 'Kunjungi AHR Corporation'}</strong>
                <span>{isEnglish ? 'Custom jersey production partner' : 'Mitra produksi jersey custom'}</span>
              </span>
              <ExternalLink size={18} aria-hidden="true" />
            </a>
          </div>
        ) : (
          <div className="css-linktree-shop-grid">
            <div className="css-linktree-shop-channels">
              <p className="css-linktree-shop-kicker">{shopChannels.sectionLabel}</p>
              <p className="css-linktree-shop-tip">{shopChannels.websiteTip}</p>
              <div className="css-linktree-channel-stack">
                {shopChannels.channels.map((channel) => {
                  const className = [
                    'css-linktree-channel-card',
                    channel.recommended ? 'css-linktree-channel-card--recommended' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                  const content = (
                    <>
                      <span className="css-linktree-channel-copy">
                        <span className="css-linktree-channel-title-row">
                          <strong>{channel.label}</strong>
                          {channel.badge ? (
                            <span className="css-linktree-channel-badge">{channel.badge}</span>
                          ) : null}
                        </span>
                        <span className="css-linktree-channel-description">{channel.description}</span>
                      </span>
                      {channel.id === 'website' ? (
                        <Globe size={18} aria-hidden="true" />
                      ) : (
                        <Store size={18} aria-hidden="true" />
                      )}
                    </>
                  )

                  if (channel.internal) {
                    return (
                      <Link className={className} key={channel.id} to={channel.href}>
                        {content}
                      </Link>
                    )
                  }

                  return (
                    <a className={className} key={channel.id} href={channel.href} target="_blank" rel="noreferrer">
                      {content}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <p className="css-linktree-footer">
          {isEnglish ? 'Produced by ' : 'Produksi '}
          <a href={contactProfile.main_site_url} target="_blank" rel="noreferrer">
            AHR Corporation
          </a>
        </p>
      </section>

      {consentPreferences.analytics === 'unknown' && consentPreferences.personalization === 'unknown' ? (
        <CookieConsentBanner
          onAcceptAll={() =>
            applyConsentPreferences({
              analytics: 'accepted',
              personalization: 'accepted',
            })
          }
          onAcceptAnalyticsOnly={() =>
            applyConsentPreferences({
              analytics: 'accepted',
              personalization: 'rejected',
            })
          }
          onAcceptPersonalizationOnly={() =>
            applyConsentPreferences({
              analytics: 'rejected',
              personalization: 'accepted',
            })
          }
          onRejectAll={() =>
            applyConsentPreferences({
              analytics: 'rejected',
              personalization: 'rejected',
            })
          }
        />
      ) : null}

      {shareModal}
    </main>
  )
}
