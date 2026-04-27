import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, MessageCircleMore, Minus, MoveLeft, Plus, ShoppingCart, X } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import gsap from 'gsap'
import './App.css'
import { normalizeProductDetail } from './content/productCatalog'
import { initializeAnalytics, trackEvent, trackPageView } from './lib/analytics'
import { fetchCatalogPriceQuote, getApiUrl, getPreferredCurrency } from './lib/api'
import { useCart } from './lib/cart.jsx'
import howToMeasureImage from './assets/size-guide/how-to-measure.png'
import ProductPrice from './components/catalog/ProductPrice'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { getConsentPreferences, hasAnalyticsConsent, setConsentPreferences } from './lib/consent'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { clearPersonalizationData, recordProductView } from './lib/personalization'

const productSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const adultSizeChart = [
  { size: 'XS', measurement: '66 x 46' },
  { size: 'S', measurement: '68 x 48' },
  { size: 'M', measurement: '70 x 50' },
  { size: 'L', measurement: '72 x 52' },
  { size: 'XL', measurement: '74 x 54' },
  { size: 'XXL', measurement: '76 x 56' },
  { size: 'XXXL', measurement: '78 x 58' },
]
function ProductAccordion({ title, items, open = false, onToggle, isList = true }) {
  return (
    <div className={open ? 'product-detail-accordion open' : 'product-detail-accordion'}>
      <button
        className="product-detail-accordion-trigger"
        type="button"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown size={18} />
      </button>

      {open && items?.length > 0 ? (
        <div className="product-detail-accordion-content">
          {isList ? (
            <ul>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <div className="product-detail-accordion-text" style={{ color: 'var(--text-700)', lineHeight: 1.8 }}>
              {items.map((item, index) => (
                <p key={index} style={{ margin: index === items.length - 1 ? 0 : '0 0 12px' }}>{item}</p>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default function ProductDetailPage() {
  const { language, t } = useLanguage()
  const { addCartItem, itemCount } = useCart()
  const { productSlug } = useParams()
  const location = useLocation()
  const initialProduct = useMemo(
    () => (location.state?.product ? normalizeProductDetail(location.state.product, language) : null),
    [language, location.state],
  )
  const rootRef = useRef(null)
  const [product, setProduct] = useState(initialProduct)
  const [chromeContent, setChromeContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )
  const [selectedSize, setSelectedSize] = useState('M')
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [showAllImages, setShowAllImages] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [zoomOrigins, setZoomOrigins] = useState({})
  const [lightboxZoomed, setLightboxZoomed] = useState(false)
  const [lightboxZoomOrigin, setLightboxZoomOrigin] = useState('50% 50%')
  const [openAccordion, setOpenAccordion] = useState('detail')
  const [status, setStatus] = useState(initialProduct ? 'ready' : 'loading')
  const [hasAnimatedEntry, setHasAnimatedEntry] = useState(false)
  const [quoteStatus, setQuoteStatus] = useState('idle')
  const [cartQuantity, setCartQuantity] = useState(1)
  const [cartNotice, setCartNotice] = useState('')
  const [consentPreferences, setConsentPreferencesState] = useState({
    analytics: 'unknown',
    personalization: 'unknown',
  })

  useEffect(() => {
    setConsentPreferencesState(getConsentPreferences())
  }, [])

  useEffect(() => {
    if (!hasAnalyticsConsent()) {
      return
    }

    initializeAnalytics()
    trackPageView(window.location.pathname + window.location.search)
  }, [productSlug])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [productSlug])

  useEffect(() => {
    let cancelled = false

    setProduct(initialProduct)
    setStatus(initialProduct ? 'ready' : 'loading')

    Promise.all([
      fetch(getApiUrl(`/api/catalog/products/${productSlug}?locale=${language}`), {
        headers: {
          Accept: 'application/json',
        },
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Gagal memuat detail produk')
        }

        return response.json()
      }),
      fetch(getApiUrl(`/api/catalog/landing-page?locale=${language}`), {
        headers: {
          Accept: 'application/json',
        },
      })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null),
    ])
      .then(([productPayload, landingPayload]) => {
        if (cancelled) {
          return
        }

        setProduct(normalizeProductDetail(productPayload?.data, language))
        setStatus('ready')

        if (landingPayload?.data) {
          setChromeContent(getLandingChromeContent(landingPayload.data, { hashPrefix: '/', locale: language }))
        }
      })
      .catch(() => {
        if (cancelled) {
          return
        }

        if (!initialProduct) {
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [initialProduct, language, productSlug])

  useEffect(() => {
    setSelectedSize('M')
    setSizeGuideOpen(false)
    setShowAllImages(false)
    setLightboxOpen(false)
    setLightboxIndex(0)
    setZoomOrigins({})
    setLightboxZoomed(false)
    setLightboxZoomOrigin('50% 50%')
    setOpenAccordion('detail')
    setHasAnimatedEntry(false)
    setCartQuantity(1)
    setCartNotice('')
  }, [productSlug])

  useEffect(() => {
    if (status !== 'ready' || !product || consentPreferences.personalization !== 'accepted') {
      return
    }

    recordProductView(product)
  }, [product, status, consentPreferences])

  const applyConsentPreferences = (nextPreferences) => {
    setConsentPreferences(nextPreferences)
    setConsentPreferencesState(nextPreferences)

    if (nextPreferences.analytics === 'accepted') {
      initializeAnalytics()
    }

    if (nextPreferences.personalization === 'rejected') {
      clearPersonalizationData()
    }

    trackEvent('cookie_consent_updated', {
      analytics_consent: nextPreferences.analytics,
      personalization_consent: nextPreferences.personalization,
      personalization_scope: 'homepage-top-listing',
      source_page: `/produk/${productSlug}`,
    })
  }

  useEffect(() => {
    if (!rootRef.current || status !== 'ready' || !product) {
      return undefined
    }

    const context = gsap.context(() => {
      if (!hasAnimatedEntry) {
        gsap.fromTo(
          '.product-detail-header',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
        )

        gsap.fromTo(
          '.product-detail-thumb',
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: 'power3.out',
            delay: 0.08,
          },
        )

        gsap.fromTo(
          '.product-detail-panel-inner > *',
          { x: 18, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.42,
            stagger: 0.05,
            ease: 'power2.out',
            delay: 0.12,
          },
        )
      }
    }, rootRef)

    return () => context.revert()
  }, [product, status, hasAnimatedEntry])

  useEffect(() => {
    if (status !== 'ready' || !product || hasAnimatedEntry) {
      return
    }

    setHasAnimatedEntry(true)
  }, [hasAnimatedEntry, product, status])

  useEffect(() => {
    if (!rootRef.current || status !== 'ready') {
      return
    }

    const thumbs = rootRef.current.querySelectorAll('.product-detail-thumb')

    if (!thumbs.length) {
      return
    }

    gsap.fromTo(
      thumbs,
      { y: 16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.36,
        stagger: 0.04,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      },
    )
  }, [showAllImages, status])

  if (status === 'loading') {
    return (
      <main className="product-detail-shell">
        <div className="product-detail-empty">
          <p>{t('common.loadingProductDetail')}</p>
        </div>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="product-detail-shell">
        <div className="product-detail-empty">
          <p>{t('common.productNotFound')}</p>
          <Link to="/">{t('common.backToCatalog')}</Link>
        </div>
      </main>
    )
  }

  if (!product) {
    return null
  }

  const availableStock = product.sizeStock?.[selectedSize] ?? 0
  const visibleGallery = showAllImages ? product.gallery : product.gallery.slice(0, 4)
  const hasMoreImages = product.gallery.length > 4

  const handleGalleryMouseMove = (event, index) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    setZoomOrigins((current) => ({
      ...current,
      [index]: `${x}% ${y}%`,
    }))
  }

  const handleLightboxMouseMove = (event) => {
    if (!lightboxZoomed) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    setLightboxZoomOrigin(`${x}% ${y}%`)
  }

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxZoomed(false)
    setLightboxZoomOrigin('50% 50%')
    setLightboxOpen(true)
  }

  const moveLightbox = (direction) => {
    setLightboxZoomed(false)
    setLightboxZoomOrigin('50% 50%')
    setLightboxIndex((current) => {
      const nextIndex = current + direction

      if (nextIndex < 0) {
        return product.gallery.length - 1
      }

      if (nextIndex >= product.gallery.length) {
        return 0
      }

      return nextIndex
    })
  }

  const handleAddToCart = () => {
    const addedItem = addCartItem(product, {
      size: selectedSize,
      quantity: cartQuantity,
    })

    if (!addedItem) {
      return
    }

    trackEvent('cart_add_item', {
      source_page: `/produk/${product.slug}`,
      product_name: product.name,
      product_category: product.category,
      product_size: selectedSize,
      quantity: cartQuantity,
    })

    setCartNotice(
      t('cart.addedNotice', {
        quantity: cartQuantity,
        name: product.name,
        size: selectedSize,
      }),
    )
  }

  const handleInquiry = async () => {
    setQuoteStatus('loading')

    trackEvent('product_detail_whatsapp_click', {
      product_name: product.name,
      product_category: product.category,
      product_size: selectedSize,
      product_price: product.price,
      product_stock: availableStock,
    })

    try {
      const quote = await fetchCatalogPriceQuote({
        productSlug: product.slug,
        quantity: 1,
        locale: language,
        currency: getPreferredCurrency(language),
        expectedTotalAmountMinor: product.pricing?.final_amount_minor ?? undefined,
      })

      const message = encodeURIComponent(
        `${t('productDetail.inquiryMessage', {
          name: product.name,
          category: product.category,
          price: quote?.formatted_unit_amount || product.price,
          size: selectedSize,
          stock: availableStock,
        })}${quote?.amount_validation?.is_valid === false ? ' Tolong cek ulang harga sebelum checkout.' : ''}`,
      )

      window.open(
        `https://wa.me/${chromeContent.brand.whatsapp_number}?text=${message}`,
        '_blank',
        'noopener,noreferrer',
      )
    } finally {
      setQuoteStatus('idle')
    }
  }

  return (
    <div className="app-shell" ref={rootRef}>
      <SiteHeader
        brandHref="/"
        navGroups={chromeContent.navGroups}
        ticker={chromeContent.ticker}
        utilityAction={{ href: '/#contact', label: t('productDetail.utilityAction') }}
        utilityLinks={chromeContent.utilityLinks}
        utilityMessage={chromeContent.utilityMessage}
        cartItemCount={itemCount}
        onNavInteraction={(navItem, surface) => trackEvent('nav_click', { nav_item: navItem, surface })}
        onPrimaryAction={() => {
          trackEvent('nav_click', {
            nav_item: 'konsultasi',
            surface: 'header-cta',
            product_name: product.name,
          })
          window.location.href = '/#final-cta'
        }}
        onUtilityInteraction={(label, surface) => trackEvent('nav_click', { nav_item: label, surface })}
        primaryActionLabel={t('common.consult')}
      />

      <main className="product-detail-shell">
        <header className="product-detail-header">
          <Link className="product-detail-back" to="/">
            <MoveLeft size={18} />
            <span>{t('common.back')}</span>
          </Link>
          <span className="product-detail-breadcrumb">
            {t('productDetail.breadcrumb', { category: product.category })}
          </span>
        </header>

        <section className="product-detail-hero">
          <div className="product-detail-gallery">
            <div className="product-detail-gallery-grid">
              {visibleGallery.map((image, index) => {
                const actualIndex = showAllImages ? index : index

                return (
                  <button
                    className="product-detail-thumb"
                    key={`${product.slug}-${actualIndex + 1}`}
                    type="button"
                    onClick={() => openLightbox(actualIndex)}
                    onMouseMove={(event) => handleGalleryMouseMove(event, actualIndex)}
                    onMouseLeave={() =>
                      setZoomOrigins((current) => ({
                        ...current,
                        [actualIndex]: '50% 50%',
                      }))
                    }
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${actualIndex + 1}`}
                      style={{
                        objectPosition: product.imagePosition,
                        transformOrigin: zoomOrigins[actualIndex] || '50% 50%',
                      }}
                    />
                  </button>
                )
              })}
            </div>

            {hasMoreImages ? (
              <div className="product-detail-gallery-actions">
                <button
                  className="product-detail-more-button"
                  type="button"
                  onClick={() => setShowAllImages((current) => !current)}
                >
                  {showAllImages ? t('common.showLess') : t('common.showMore')}
                  <ChevronDown size={18} />
                </button>
              </div>
            ) : null}
          </div>

          <aside className="product-detail-panel">
            <div className="product-detail-panel-inner">
              <p className="product-detail-category">
                {product.audience} • {product.category}
              </p>
              <h1>{product.name}</h1>
              <ProductPrice product={product} variant="detail" />

              <div className="product-detail-meta">
                <div>
                  <span>{t('common.color')}</span>
                  <strong>{product.color}</strong>
                </div>
              </div>

              <div className="product-detail-size-block">
                <div className="product-detail-size-header">
                  <span>{t('common.size')}</span>
                  <strong>{selectedSize}</strong>
                </div>
                <div className="product-detail-size-options">
                  {productSizes.map((size) => (
                    <button
                      key={size}
                      className={selectedSize === size ? 'product-detail-size-option active' : 'product-detail-size-option'}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <button
                  className="product-detail-size-guide"
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                >
                  {t('common.sizeGuide')}
                </button>
                <p className="product-detail-stock">
                  {t('productDetail.stockLeft', { size: selectedSize, stock: availableStock })}
                </p>
              </div>

              <div className="product-detail-quantity-block">
                <div className="product-detail-quantity-header">
                  <span>{t('cart.quantity')}</span>
                  <strong>{cartQuantity}</strong>
                </div>
                <div className="quantity-stepper">
                  <button
                    type="button"
                    onClick={() => setCartQuantity((current) => Math.max(1, current - 1))}
                    disabled={cartQuantity <= 1}
                    aria-label={t('cart.decreaseQuantity')}
                  >
                    <Minus size={16} />
                  </button>
                  <span>{cartQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setCartQuantity((current) => Math.min(999, current + 1))}
                    aria-label={t('cart.increaseQuantity')}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="product-detail-actions">
                <button className="product-detail-primary" type="button" onClick={handleAddToCart}>
                  <ShoppingCart size={18} />
                  <span>{t('cart.addToCart')}</span>
                </button>
                <button
                  className="product-detail-secondary"
                  type="button"
                  onClick={handleInquiry}
                  disabled={quoteStatus === 'loading'}
                >
                  <MessageCircleMore size={18} />
                  <span>{t('common.orderViaWhatsApp')}</span>
                </button>
              </div>

              {cartNotice ? (
                <p className="product-detail-cart-notice">
                  {cartNotice} <Link to="/cart">{t('cart.viewCart')}</Link>
                </p>
              ) : null}
            </div>
          </aside>
        </section>

        <section className="product-detail-content">
          <div className="product-detail-accordion-list">
            <ProductAccordion
              items={product.description}
              isList={false}
              onToggle={() => setOpenAccordion((current) => (current === 'detail' ? '' : 'detail'))}
              open={openAccordion === 'detail'}
              title={t('common.detail')}
            />
            <ProductAccordion
              items={product.specifications}
              onToggle={() => setOpenAccordion((current) => (current === 'specification' ? '' : 'specification'))}
              open={openAccordion === 'specification'}
              title={t('common.specification')}
            />
            <ProductAccordion
              items={product.careInstructions}
              onToggle={() => setOpenAccordion((current) => (current === 'care' ? '' : 'care'))}
              open={openAccordion === 'care'}
              title={t('common.care')}
            />
          </div>
        </section>
      </main>

      <div
        className={sizeGuideOpen ? 'size-guide-backdrop visible' : 'size-guide-backdrop'}
        onClick={() => setSizeGuideOpen(false)}
      />
      <aside
        className={sizeGuideOpen ? 'size-guide-drawer open' : 'size-guide-drawer'}
        aria-label={t('productDetail.sizeGuide.title')}
      >
        <div className="size-guide-drawer-header">
          <div>
            <span>{t('productDetail.sizeGuide.title')}</span>
            <h2>{t('productDetail.sizeGuide.subtitle')}</h2>
          </div>
          <button
            type="button"
            onClick={() => setSizeGuideOpen(false)}
            aria-label={t('productDetail.sizeGuide.closeLabel')}
          >
            <X size={20} />
          </button>
        </div>

        <p className="size-guide-drawer-copy">{t('productDetail.sizeGuide.body')}</p>

        <div className="size-guide-table-wrap">
          <table className="size-guide-table">
            <thead>
              <tr>
                <th>Size</th>
                {adultSizeChart.map((item) => (
                  <th key={item.size}>{item.size}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('productDetail.sizeGuide.sizeAxis')}</td>
                {adultSizeChart.map((item) => (
                  <td key={item.size}>{item.measurement}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <section className="size-guide-measurement">
          <h3>{t('productDetail.sizeGuide.howToMeasureTitle')}</h3>
          <p>{t('productDetail.sizeGuide.howToMeasureBody')}</p>

          <div className="size-guide-measurement-card">
            <img src={howToMeasureImage} alt={t('productDetail.sizeGuide.imageAlt')} />
            <div className="size-guide-measurement-copy">
              <p>{t('productDetail.sizeGuide.horizontalTitle')}</p>
              <ol>
                {t('productDetail.sizeGuide.measurements')
                  .slice(0, 3)
                  .map((measurement) => (
                    <li key={measurement} dangerouslySetInnerHTML={{ __html: measurement }} />
                  ))}
              </ol>

              <p>{t('productDetail.sizeGuide.verticalTitle')}</p>
              <ol start="4">
                {t('productDetail.sizeGuide.measurements')
                  .slice(3)
                  .map((measurement) => (
                    <li key={measurement} dangerouslySetInnerHTML={{ __html: measurement }} />
                  ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="size-guide-footnote">
          <h3>{t('productDetail.sizeGuide.footnoteTitle')}</h3>
          <p>{t('productDetail.sizeGuide.footnoteBody')}</p>
        </section>
      </aside>

      {lightboxOpen ? (
        <div className="product-lightbox" onClick={() => setLightboxOpen(false)}>
          <button
            className="product-lightbox-close"
            type="button"
            aria-label={t('productDetail.lightbox.close')}
            onClick={() => setLightboxOpen(false)}
          >
            <X size={20} />
          </button>
          <button
            className="product-lightbox-arrow left"
            type="button"
            aria-label={t('productDetail.lightbox.previous')}
            onClick={(event) => {
              event.stopPropagation()
              moveLightbox(-1)
            }}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            className="product-lightbox-arrow right"
            type="button"
            aria-label={t('productDetail.lightbox.next')}
            onClick={(event) => {
              event.stopPropagation()
              moveLightbox(1)
            }}
          >
            <ChevronRight size={28} />
          </button>
          <div className="product-lightbox-body" onClick={(event) => event.stopPropagation()}>
            <div
              className={lightboxZoomed ? 'product-lightbox-image-frame is-zoomed' : 'product-lightbox-image-frame'}
              onClick={() => {
                setLightboxZoomed((current) => {
                  const next = !current

                  if (!next) {
                    setLightboxZoomOrigin('50% 50%')
                  }

                  return next
                })
              }}
              onMouseMove={handleLightboxMouseMove}
              onMouseLeave={() => {
                if (lightboxZoomed) {
                  setLightboxZoomOrigin('50% 50%')
                }
              }}
            >
              <img
                className="product-lightbox-image"
                src={product.gallery[lightboxIndex]}
                alt={`${product.name} preview ${lightboxIndex + 1}`}
                style={{
                  transform: lightboxZoomed ? 'scale(2.25)' : 'scale(1)',
                  transformOrigin: lightboxZoomOrigin,
                }}
              />
            </div>
            <p className="product-lightbox-hint">
              {lightboxZoomed ? t('productDetail.lightbox.zoomOut') : t('productDetail.lightbox.zoomIn')}
            </p>
            <div className="product-lightbox-thumbs">
              {product.gallery.map((image, index) => (
                <button
                  key={`${product.slug}-preview-${index + 1}`}
                  className={lightboxIndex === index ? 'product-lightbox-thumb active' : 'product-lightbox-thumb'}
                  type="button"
                  onClick={() => {
                    setLightboxZoomed(false)
                    setLightboxZoomOrigin('50% 50%')
                    setLightboxIndex(index)
                  }}
                >
                  <img src={image} alt={`${product.name} thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <SiteFooter
        bottomText={chromeContent.footerBottomText}
        companyProfile={chromeContent.companyProfile}
        contactProfile={chromeContent.brand}
        defaultMapLabel={t('common.mapLabel')}
        footerGroups={chromeContent.footerGroups}
        footerMessage={t('productDetail.footerMessage', { name: product.name, size: selectedSize })}
        onWhatsAppClick={() => handleInquiry()}
      />

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
    </div>
  )
}
