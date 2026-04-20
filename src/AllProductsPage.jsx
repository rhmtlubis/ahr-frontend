import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Heart, MessageSquareMore } from 'lucide-react'
import gsap from 'gsap'
import { Link, useSearchParams } from 'react-router-dom'
import './App.css'
import CategoryFilterHeader from './components/landing/CategoryFilterHeader'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { companyProfileContent } from './content/companyProfile'
import {
  defaultShowcaseCategories,
  homepageProducts,
  normalizeProducts,
  slugifyCategoryLabel,
} from './content/productCatalog'
import {
  sharedFooterGroups,
  sharedHeaderTicker,
  sharedHeaderUtilityMessage,
  sharedNavGroups,
  sharedUtilityLinks,
} from './content/siteChrome'
import { initializeAnalytics, trackEvent, trackPageView } from './lib/analytics'
import { getApiUrl } from './lib/api'
import { getConsentPreferences, hasAnalyticsConsent, setConsentPreferences } from './lib/consent'
import { clearPersonalizationData } from './lib/personalization'

const defaultBrand = {
  name: 'AHR',
  lockup: 'CV AHR Printing',
  tagline: 'Apparel dan percetakan kustom dengan spesialisasi sublimasi jersey.',
  whatsapp_number: '6281234567890',
}

const defaultMapLabel = 'Buka lokasi AHR Printing di Google Maps'
const footerMessage =
  'Halo AHR, saya ingin berdiskusi tentang kebutuhan jersey atau apparel kustom.'
const PRODUCTS_PER_PAGE = 8

function buildWhatsAppUrl(phoneNumber, message) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
}

function normalizeListingContent(payload = {}) {
  const catalogCategories = Array.isArray(payload.catalog_categories) ? payload.catalog_categories : []
  const catalogItems = Array.isArray(payload.catalog_items) ? payload.catalog_items : []

  return {
    brand: {
      ...defaultBrand,
      ...payload.brand,
    },
    products: normalizeProducts(catalogItems),
    catalogCategories,
  }
}

function buildCategoryNavigationItems(products = [], catalogCategories = []) {
  const showcaseCategories =
    catalogCategories.length > 0
      ? catalogCategories.map((category, index) => ({
          id: category.id,
          label: category.label,
          image: defaultShowcaseCategories[index % defaultShowcaseCategories.length]?.image,
          position: defaultShowcaseCategories[index % defaultShowcaseCategories.length]?.position || 'center center',
          audience: category.audience,
        }))
      : defaultShowcaseCategories.map((category) => ({
          ...category,
          id: slugifyCategoryLabel(category.label),
        }))

  const categoryProductCountMap = products.reduce((accumulator, product) => {
    const categoryId = product.categoryId || 'all'

    accumulator[categoryId] = (accumulator[categoryId] || 0) + 1

    return accumulator
  }, {})

  return [
    {
      id: 'all',
      label: 'Semua Koleksi',
      image: showcaseCategories[0]?.image || products[0]?.image,
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
  const rootRef = useRef(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [listingContent, setListingContent] = useState({
    brand: defaultBrand,
    products: homepageProducts,
    catalogCategories: [],
  })
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
  }, [searchParams])

  useEffect(() => {
    fetch(getApiUrl('/api/catalog/landing-page'), {
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
          setListingContent(normalizeListingContent(payload.data))
        }
      })
      .catch(() => {
        setListingContent({
          brand: defaultBrand,
          products: homepageProducts,
          catalogCategories: [],
        })
      })
  }, [])

  const categoryNavigationItems = useMemo(
    () => buildCategoryNavigationItems(listingContent.products, listingContent.catalogCategories),
    [listingContent.catalogCategories, listingContent.products],
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
    if (!rootRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

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
  }, [activeCatalogFilter, activePage])

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

  const handleProductInquiry = (product) => {
    trackEvent('product_card_click', {
      product_name: product.name,
      product_category: product.category,
      source_page: '/all-products',
    })

    window.open(
      buildWhatsAppUrl(
        listingContent.brand.whatsapp_number,
        `Halo AHR, saya tertarik dengan ${product.name}. Mohon info detail bahan, MOQ, dan estimasi produksinya.`,
      ),
      '_blank',
      'noopener,noreferrer',
    )
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
        navGroups={sharedNavGroups}
        ticker={sharedHeaderTicker}
        utilityLinks={sharedUtilityLinks}
        utilityMessage={sharedHeaderUtilityMessage}
        primaryActionLabel="Hubungi AHR"
        onPrimaryAction={() => handleFooterWhatsApp(footerMessage)}
      />

      <main className="all-products-page">
        <section className="content-block section-plain all-products-hero" data-products-hero>
          <div className="all-products-breadcrumb">
            <Link to="/">
              <ArrowLeft size={16} />
              <span>Kembali ke beranda</span>
            </Link>
          </div>

          <div className="section-heading heading-inline all-products-heading">
            <div>
              <span>Product Listing</span>
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
              <span className="all-products-toolbar-label">Kategori aktif</span>
              <h2>{activeCategory?.label || 'Semua Koleksi'}</h2>
            </div>
            <div className="all-products-toolbar-meta">
              <p>{visibleProducts.length} produk tersedia.</p>
              <p>
                Menampilkan {paginatedProducts.length} produk di halaman {currentPage} dari {totalPages}.
              </p>
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
                      className="product-image"
                      src={product.image}
                      alt={product.name}
                      style={{ objectPosition: product.imagePosition || 'center center' }}
                    />
                  </div>
                  <div className="product-body">
                    <p className="product-category">{product.category}</p>
                    <h3>{product.name}</h3>
                    <p className="all-products-summary">{product.summary}</p>
                    <span className="product-price">{product.price}</span>
                  </div>
                </Link>

                <div className="all-products-card-actions">
                  <button
                    className="wishlist-button"
                    type="button"
                    aria-label={`Tanya produk ${product.name}`}
                    onClick={() => handleProductInquiry(product)}
                  >
                    <Heart size={18} />
                  </button>
                  <button className="all-products-inquiry" type="button" onClick={() => handleProductInquiry(product)}>
                    <MessageSquareMore size={16} />
                    <span>Tanya Produk</span>
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
                Sebelumnya
              </button>

              <div className="all-products-pagination-status">
                <span>Halaman {currentPage} dari {totalPages}</span>
              </div>

              <button
                className="all-products-pagination-button"
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Berikutnya
              </button>
            </div>
          ) : null}
        </section>
      </main>

      <SiteFooter
        footerGroups={sharedFooterGroups}
        companyProfile={companyProfileContent}
        contactProfile={listingContent.brand}
        defaultMapLabel={defaultMapLabel}
        onWhatsAppClick={handleFooterWhatsApp}
        footerMessage={footerMessage}
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
