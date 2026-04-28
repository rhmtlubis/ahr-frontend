import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, MessageSquareMore, ShoppingCart } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import './App.css'
import CategoryFilterHeader from './components/landing/CategoryFilterHeader'
import ProductPrice from './components/catalog/ProductPrice'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import {
  categoryPlaceholderImage,
  normalizeCategoryCard,
  normalizeProducts,
} from './lib/cmsContent.js'
import { initializeAnalytics, trackEvent, trackPageView } from './lib/analytics'
import { fetchCatalogPriceQuote, getApiUrl, getPreferredCurrency } from './lib/api'
import { useCart } from './lib/cart.jsx'
import { getConsentPreferences, hasAnalyticsConsent, setConsentPreferences } from './lib/consent'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { clearPersonalizationData } from './lib/personalization'
import useDocumentTitle from './lib/useDocumentTitle'

const PRODUCTS_PER_PAGE = 8

function buildWhatsAppUrl(phoneNumber, message) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
}

function normalizeListingContent(payload = {}, language = 'id') {
  const catalogCategories = Array.isArray(payload.catalog_categories) ? payload.catalog_categories : []
  const catalogItems = Array.isArray(payload.catalog_items) ? payload.catalog_items : []

  return {
    ...getLandingChromeContent(payload, { hashPrefix: '/', locale: language }),
    products: normalizeProducts(catalogItems, language),
    catalogCategories,
  }
}

function buildCategoryNavigationItems(products = [], catalogCategories = [], allCollectionsLabel) {
  const showcaseCategories =
    catalogCategories.length > 0
      ? catalogCategories.map((category) => normalizeCategoryCard(category, 0))
      : []

  const categoryProductCountMap = products.reduce((accumulator, product) => {
    const categoryId = product.categoryId || 'all'

    accumulator[categoryId] = (accumulator[categoryId] || 0) + 1

    return accumulator
  }, {})

  return [
    {
      id: 'all',
      label: allCollectionsLabel,
      image: showcaseCategories[0]?.image || products[0]?.image || categoryPlaceholderImage,
      position: showcaseCategories[0]?.position || products[0]?.imagePosition || 'center center',
      count: products.length,
    },
    ...showcaseCategories.map((category) => ({
      ...category,
      count: categoryProductCountMap[category.id] || 0,
    })),
  ]
}

export default function AllProductsPage() {
  const { language, t } = useLanguage()
  useDocumentTitle(
    language === 'en' ? 'Custom Jersey & Sportswear Catalog' : 'Katalog Jersey Custom & Seragam Printing',
    language === 'en'
      ? 'Browse AHR custom jerseys, sublimation apparel, and sportswear collections for teams, events, schools, and organizations.'
      : 'Jelajahi katalog jersey custom, apparel sublimasi, dan seragam printing AHR untuk tim, event, sekolah, komunitas, dan instansi.',
    {
      canonicalPath: '/all-products',
      image: '/ahr-brand-logo.webp',
      imageAlt: 'Katalog jersey custom AHR',
      keywords:
        language === 'en'
          ? 'custom jersey catalog, sportswear catalog, sublimation apparel, team uniforms, AHR products'
          : 'katalog jersey custom, katalog seragam printing, apparel sublimasi, jersey tim, produk AHR',
      locale: language,
      type: 'website',
    },
  )
  const { addCartItem, itemCount } = useCart()
  const rootRef = useRef(null)
  const gsapRef = useRef(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [listingContent, setListingContent] = useState({
    ...getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
    products: [],
    catalogCategories: [],
  })
  const [consentPreferences, setConsentPreferencesState] = useState({
    analytics: 'unknown',
    personalization: 'unknown',
  })
  const [activeQuoteProduct, setActiveQuoteProduct] = useState('')
  const [animationsReady, setAnimationsReady] = useState(false)

  useEffect(() => {
    setConsentPreferencesState(getConsentPreferences())
  }, [])

  useEffect(() => {
    let cancelled = false

    import('gsap')
      .then((module) => {
        if (cancelled) {
          return
        }

        gsapRef.current = module.default
        setAnimationsReady(true)
      })
      .catch(() => {
        if (!cancelled) {
          setAnimationsReady(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hasAnalyticsConsent()) {
      return
    }

    initializeAnalytics()
    trackPageView(window.location.pathname + window.location.search)
  }, [searchParams])

  useEffect(() => {
    fetch(getApiUrl(`/api/catalog/landing-page?locale=${language}`), {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Gagal memuat listing produk')
        }

        return response.json()
      })
      .then((payload) => {
        if (payload?.data) {
          setListingContent(normalizeListingContent(payload.data, language))
        }
      })
      .catch(() => {
        setListingContent({
          ...getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
          products: [],
          catalogCategories: [],
        })
      })
  }, [language])

  const categoryNavigationItems = useMemo(
    () =>
      buildCategoryNavigationItems(
        listingContent.products,
        listingContent.catalogCategories,
        t('common.allCollections'),
      ),
    [listingContent.catalogCategories, listingContent.products, t],
  )

  const requestedCategory = searchParams.get('category') || 'all'
  const requestedPage = Number.parseInt(searchParams.get('page') || '1', 10)
  const activeCatalogFilter = categoryNavigationItems.some((category) => category.id === requestedCategory)
    ? requestedCategory
    : 'all'

  const activePage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1

  useEffect(() => {
    if (requestedCategory === activeCatalogFilter && requestedPage === activePage) {
      return
    }

    const nextSearchParams = new URLSearchParams(searchParams)

    if (activeCatalogFilter === 'all') {
      nextSearchParams.delete('category')
    } else {
      nextSearchParams.set('category', activeCatalogFilter)
    }

    if (activePage <= 1) {
      nextSearchParams.delete('page')
    } else {
      nextSearchParams.set('page', String(activePage))
    }

    setSearchParams(nextSearchParams, { replace: true })
  }, [activeCatalogFilter, activePage, requestedCategory, requestedPage, searchParams, setSearchParams])

  useEffect(() => {
    if (!rootRef.current || !animationsReady || !gsapRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const gsap = gsapRef.current
    const context = gsap.context(() => {
      gsap.fromTo(
        '[data-products-hero]',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out' },
      )

      gsap.fromTo(
        '[data-products-card]',
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.06,
          duration: 0.7,
          ease: 'power3.out',
          delay: 0.14,
        },
      )
    }, rootRef)

    return () => context.revert()
  }, [activeCatalogFilter, activePage, animationsReady])

  const visibleProducts =
    activeCatalogFilter === 'all'
      ? listingContent.products
      : listingContent.products.filter((product) => product.categoryId === activeCatalogFilter)
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PRODUCTS_PER_PAGE))
  const currentPage = Math.min(activePage, totalPages)
  const paginatedProducts = visibleProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  )

  const activeCategory =
    categoryNavigationItems.find((category) => category.id === activeCatalogFilter) || categoryNavigationItems[0]

  useEffect(() => {
    if (activePage === currentPage) {
      return
    }

    const nextSearchParams = new URLSearchParams(searchParams)

    if (currentPage <= 1) {
      nextSearchParams.delete('page')
    } else {
      nextSearchParams.set('page', String(currentPage))
    }

    setSearchParams(nextSearchParams, { replace: true })
  }, [activePage, currentPage, searchParams, setSearchParams])

  const handleCategorySelect = (categoryId) => {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (categoryId === 'all') {
      nextSearchParams.delete('category')
    } else {
      nextSearchParams.set('category', categoryId)
    }

    nextSearchParams.delete('page')

    trackEvent('catalog_filter_click', {
      filter_category: categoryId,
      previous_filter: activeCatalogFilter,
      source_page: '/all-products',
    })
    setSearchParams(nextSearchParams)
  }

  const handlePageChange = (nextPage) => {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (nextPage <= 1) {
      nextSearchParams.delete('page')
    } else {
      nextSearchParams.set('page', String(nextPage))
    }

    trackEvent('catalog_pagination_click', {
      source_page: '/all-products',
      active_filter: activeCatalogFilter,
      current_page: currentPage,
      next_page: nextPage,
    })
    setSearchParams(nextSearchParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleProductOpen = (product) => {
    trackEvent('product_detail_open', {
      product_name: product.name,
      product_category: product.category,
      destination: `/produk/${product.slug}`,
      source_page: '/all-products',
    })
  }

  const handleProductInquiry = async (product) => {
    setActiveQuoteProduct(product.slug)

    trackEvent('product_card_click', {
      product_name: product.name,
      product_category: product.category,
      source_page: '/all-products',
    })

    try {
      const quote = await fetchCatalogPriceQuote({
        productSlug: product.slug,
        quantity: 1,
        locale: language,
        currency: getPreferredCurrency(language),
        expectedTotalAmountMinor: product.pricing?.final_amount_minor ?? undefined,
      })

      window.open(
        buildWhatsAppUrl(
          listingContent.brand.whatsapp_number,
          `${t('allProducts.inquiryMessage', { name: product.name })}${quote?.formatted_unit_amount ? ` Harga tervalidasi saat ini: ${quote.formatted_unit_amount}.` : ''}`,
        ),
        '_blank',
        'noopener,noreferrer',
      )
    } catch {
      window.open(
        buildWhatsAppUrl(
          listingContent.brand.whatsapp_number,
          t('allProducts.inquiryMessage', { name: product.name }),
        ),
        '_blank',
        'noopener,noreferrer',
      )
    } finally {
      setActiveQuoteProduct('')
    }
  }

  const handleAddToCart = (product) => {
    addCartItem(product, {
      size: 'M',
      quantity: 1,
    })

    trackEvent('cart_add_item', {
      source_page: '/all-products',
      product_name: product.name,
      product_category: product.category,
      product_size: 'M',
      quantity: 1,
    })
  }

  const handleFooterWhatsApp = (message) => {
    trackEvent('footer_cta_click', {
      source_page: '/all-products',
      button_location: 'footer',
    })

    window.open(
      buildWhatsAppUrl(listingContent.brand.whatsapp_number, message),
      '_blank',
      'noopener,noreferrer',
    )
  }

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
      source_page: '/all-products',
    })
  }

  return (
    <div className="app-shell" ref={rootRef}>
      <SiteHeader
        brandHref="/"
        navGroups={listingContent.navGroups}
        ticker={listingContent.ticker}
        utilityLinks={listingContent.utilityLinks}
        utilityMessage={listingContent.utilityMessage}
        cartItemCount={itemCount}
        primaryActionLabel={t('allProducts.contactAhr')}
        onPrimaryAction={() => handleFooterWhatsApp(t('allProducts.footerMessage'))}
      />

      <main className="all-products-page">
        <section className="content-block section-plain all-products-hero" data-products-hero>
          <div className="all-products-breadcrumb">
            <Link to="/">
              <ArrowLeft size={16} />
              <span>{t('common.backToHome')}</span>
            </Link>
          </div>

          <div className="section-heading heading-inline all-products-heading">
            <div>
              <span>{t('allProducts.heroEyebrow')}</span>
            </div>
          </div>

          <CategoryFilterHeader
            categories={categoryNavigationItems}
            activeCategoryId={activeCatalogFilter}
            activeCategoryLabel={activeCategory?.label}
            productCount={visibleProducts.length}
            onCategorySelect={handleCategorySelect}
          />
        </section>

        <section className="content-block section-soft all-products-results">
          <div className="all-products-toolbar" data-products-hero>
            <div>
              <span className="all-products-toolbar-label">{t('common.activeCategory')}</span>
              <h2>{activeCategory?.label || t('common.allCollections')}</h2>
            </div>
            <div className="all-products-toolbar-meta">
              <p>{t('common.productsAvailable', { count: visibleProducts.length })}</p>
              <p>{t('common.showingProducts', { showing: paginatedProducts.length, page: currentPage, total: totalPages })}</p>
            </div>
          </div>

          <div className="all-products-grid">
            {paginatedProducts.map((product) => (
              <article className={`product-card all-products-card tone-${product.tone}`} key={product.slug} data-products-card>
                <Link
                  className="product-card-link"
                  to={`/produk/${product.slug}`}
                  state={{ product }}
                  onClick={() => handleProductOpen(product)}
                >
                  <div className="product-media">
                    <img
                      className="product-image product-image-primary"
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: product.imagePosition || 'center center' }}
                    />
                    {product.gallery?.[1] ? (
                      <img
                        className="product-image product-image-hover"
                        src={product.gallery[1]}
                        alt={`${product.name} alternate`}
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

                <div className="all-products-card-actions">
                  <button
                    className="all-products-cart"
                    type="button"
                    aria-label={`${t('cart.addToCart')} ${product.name}`}
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart size={16} />
                    <span>{t('cart.addShort')}</span>
                  </button>
                  <button
                    className="all-products-inquiry"
                    type="button"
                    onClick={() => handleProductInquiry(product)}
                    disabled={activeQuoteProduct === product.slug}
                  >
                    <MessageSquareMore size={16} />
                    <span>{t('common.askProduct')}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="all-products-pagination" data-products-hero>
              <button
                className="all-products-pagination-button"
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                {t('common.previous')}
              </button>

              <div className="all-products-pagination-status">
                <span>{t('common.pageStatus', { page: currentPage, total: totalPages })}</span>
              </div>

              <button
                className="all-products-pagination-button"
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {t('common.next')}
              </button>
            </div>
          ) : null}
        </section>
      </main>

      <SiteFooter
        footerGroups={listingContent.footerGroups}
        companyProfile={listingContent.companyProfile}
        contactProfile={listingContent.brand}
        defaultMapLabel={t('common.mapLabel')}
        onWhatsAppClick={handleFooterWhatsApp}
        footerMessage={t('allProducts.footerMessage')}
        bottomText={listingContent.footerBottomText}
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
