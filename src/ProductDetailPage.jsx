import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Heart, MessageCircleMore, MoveLeft, X } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import gsap from 'gsap'
import './App.css'
import { normalizeProductDetail } from './content/productCatalog'
import { trackEvent } from './lib/analytics'
import { getApiUrl } from './lib/api'
import { companyProfileContent } from './content/companyProfile'
import howToMeasureImage from './assets/size-guide/how-to-measure.png'
import {
  sharedFooterGroups,
  sharedHeaderTicker,
  sharedHeaderUtilityMessage,
  sharedNavGroups,
  sharedUtilityLinks,
} from './content/siteChrome'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'

const detailPageChromeFallback = {
  brand: {
    name: 'AHR',
    lockup: 'CV AHR Printing',
    tagline: 'Apparel dan percetakan kustom dengan spesialisasi sublimasi jersey.',
    whatsapp_number: '6281234567890',
    response_time: 'Balas cepat di jam kerja untuk kebutuhan retail maupun bulk order',
  },
  utilityLinks: [
    ...sharedUtilityLinks.map((item) => ({
      ...item,
      href: item.href.startsWith('#') ? `/${item.href}` : item.href,
    })),
  ],
  footerGroups: sharedFooterGroups.map((group) => ({
    ...group,
    links: group.links.map((link) => ({
      ...link,
      href: link.href.startsWith('#') ? `/${link.href}` : link.href,
    })),
  })),
  ticker: sharedHeaderTicker,
}

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
function ProductAccordion({ title, items, open = false, onToggle }) {
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

      {open ? (
        <div className="product-detail-accordion-content">
          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default function ProductDetailPage() {
  const { productSlug } = useParams()
  const location = useLocation()
  const initialProduct = useMemo(
    () => (location.state?.product ? normalizeProductDetail(location.state.product) : null),
    [location.state],
  )
  const rootRef = useRef(null)
  const [product, setProduct] = useState(initialProduct)
  const [chromeContent, setChromeContent] = useState(detailPageChromeFallback)
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [productSlug])

  useEffect(() => {
    let cancelled = false

    setProduct(initialProduct)
    setStatus(initialProduct ? 'ready' : 'loading')

    Promise.all([
      fetch(getApiUrl(`/api/catalog/products/${productSlug}`), {
        headers: {
          Accept: 'application/json',
        },
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Gagal memuat detail produk')
        }

        return response.json()
      }),
      fetch(getApiUrl('/api/catalog/landing-page'), {
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

        setProduct(normalizeProductDetail(productPayload?.data))
        setStatus('ready')

        if (landingPayload?.data) {
          setChromeContent((current) => ({
            ...current,
            brand: {
              ...current.brand,
              ...landingPayload.data.brand,
              lockup: current.brand.lockup,
            },
            utilityLinks: landingPayload.data.utilityLinks?.length
              ? landingPayload.data.utilityLinks.map((item) => ({
                  label: item.label,
                  href: item.href?.startsWith('#') ? `/${item.href}` : item.href,
                }))
              : current.utilityLinks,
            footerGroups: landingPayload.data.footerGroups?.length
              ? landingPayload.data.footerGroups.map((group) => ({
                  ...group,
                  links: group.links.map((link) => ({
                    ...link,
                    href: link.href?.startsWith('#') ? `/${link.href}` : link.href,
                  })),
                }))
              : current.footerGroups,
            ticker: landingPayload.data.ticker || current.ticker,
          }))
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
  }, [initialProduct, productSlug])

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
  }, [productSlug])

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
          <p>Memuat detail produk...</p>
        </div>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="product-detail-shell">
        <div className="product-detail-empty">
          <p>Produk tidak ditemukan.</p>
          <Link to="/">Kembali ke katalog</Link>
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

  const handleInquiry = () => {
    trackEvent('product_detail_whatsapp_click', {
      product_name: product.name,
      product_category: product.category,
      product_size: selectedSize,
      product_price: product.price,
      product_stock: availableStock,
    })

    const message = encodeURIComponent(`
Halo AHR, saya tertarik dengan produk berikut:

Produk: ${product.name}
Kategori: ${product.category}
Harga: ${product.price}
Ukuran dipilih: ${selectedSize}
Stok ukuran ${selectedSize}: ${availableStock} pcs

Mohon info lanjutan untuk order produk ini ya.
    `.trim())

    window.open(
      `https://wa.me/${chromeContent.brand.whatsapp_number}?text=${message}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <div className="app-shell" ref={rootRef}>
      <SiteHeader
        brandHref="/"
        navGroups={sharedNavGroups.map((item) => ({
          ...item,
          columns: item.columns.map((column) => ({
            ...column,
            links: column.links.map((link) => ({
              ...link,
              href: link.href.startsWith('#') ? `/${link.href}` : link.href,
            })),
          })),
        }))}
        ticker={chromeContent.ticker}
        utilityAction={{ href: '/#contact', label: 'Hubungi tim' }}
        utilityLinks={chromeContent.utilityLinks}
        utilityMessage={sharedHeaderUtilityMessage}
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
        primaryActionLabel="Konsultasi"
      />

      <main className="product-detail-shell">
        <header className="product-detail-header">
          <Link className="product-detail-back" to="/">
            <MoveLeft size={18} />
            <span>Kembali</span>
          </Link>
          <span className="product-detail-breadcrumb">Beranda / Produk / {product.category}</span>
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
                  {showAllImages ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
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
              <p className="product-detail-price">{product.price}</p>

              <div className="product-detail-meta">
                <div>
                  <span>Warna</span>
                  <strong>{product.color}</strong>
                </div>
              </div>

              <div className="product-detail-size-block">
                <div className="product-detail-size-header">
                  <span>Ukuran</span>
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
                  Panduan ukuran
                </button>
                <p className="product-detail-stock">
                  Sisa produk ukuran {selectedSize}: <strong>{availableStock} pcs</strong>
                </p>
              </div>

              <div className="product-detail-actions">
                <button className="product-detail-primary" type="button" onClick={handleInquiry}>
                  <MessageCircleMore size={18} />
                  <span>Pesan via WhatsApp</span>
                </button>
                <button
                  className="product-detail-secondary"
                  type="button"
                  onClick={() =>
                    trackEvent('product_detail_favorite_click', {
                      product_name: product.name,
                    })
                  }
                >
                  <Heart size={18} />
                  <span>Simpan</span>
                </button>
              </div>
            </div>
          </aside>
        </section>

        <section className="product-detail-content">
          <div className="product-detail-accordion-list">
            <ProductAccordion
              items={product.specifications}
              onToggle={() => setOpenAccordion((current) => (current === 'detail' ? '' : 'detail'))}
              open={openAccordion === 'detail'}
              title="Detail"
            />
            <ProductAccordion
              items={product.careInstructions}
              onToggle={() => setOpenAccordion((current) => (current === 'care' ? '' : 'care'))}
              open={openAccordion === 'care'}
              title="Perawatan"
            />
          </div>
        </section>
      </main>

      <div
        className={sizeGuideOpen ? 'size-guide-backdrop visible' : 'size-guide-backdrop'}
        onClick={() => setSizeGuideOpen(false)}
      />
      <aside className={sizeGuideOpen ? 'size-guide-drawer open' : 'size-guide-drawer'} aria-label="Panduan ukuran">
        <div className="size-guide-drawer-header">
          <div>
            <span>Panduan ukuran</span>
            <h2>Size Chart Dewasa</h2>
          </div>
          <button type="button" onClick={() => setSizeGuideOpen(false)} aria-label="Tutup panduan ukuran">
            <X size={20} />
          </button>
        </div>

        <p className="size-guide-drawer-copy">
          Pilih ukuran yang paling mendekati ukuran baju yang biasa dipakai. Jika ingin lebih aman untuk order tim,
          ukur lebar dan panjang kaos pembanding lalu cocokkan ke tabel berikut.
        </p>

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
                <td>P x L</td>
                {adultSizeChart.map((item) => (
                  <td key={item.size}>{item.measurement}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <section className="size-guide-measurement">
          <h3>How to measure</h3>
          <p>
            Ambil meteran, catat ukuran badan, lalu cocokan dengan size chart untuk memilih ukuran yang paling pas.
          </p>

          <div className="size-guide-measurement-card">
            <img src={howToMeasureImage} alt="Panduan cara mengukur badan" />
            <div className="size-guide-measurement-copy">
              <p>Pegang meteran secara horizontal untuk mengukur:</p>
              <ol>
                <li>
                  <strong>Dada</strong>, di bagian paling lebar.
                </li>
                <li>
                  <strong>Pinggang</strong>, di bagian paling ramping.
                </li>
                <li>
                  <strong>Pinggul</strong>, di bagian paling lebar dengan kaki rapat.
                </li>
              </ol>

              <p>Pegang meteran secara vertikal untuk mengukur:</p>
              <ol start="4">
                <li>
                  <strong>Panjang kaki dalam</strong>, dari selangkangan ke bawah.
                </li>
                <li>
                  <strong>Tinggi badan</strong>, dari kepala sampai kaki dengan posisi tegak.
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section className="size-guide-footnote">
          <h3>Ukuran masih ragu?</h3>
          <p>
            Tidak masalah. Saat ini order masih dibantu via WhatsApp, jadi tim AHR bisa bantu cek ukuran paling aman sebelum produksi.
          </p>
        </section>
      </aside>

      {lightboxOpen ? (
        <div className="product-lightbox" onClick={() => setLightboxOpen(false)}>
          <button
            className="product-lightbox-close"
            type="button"
            aria-label="Tutup preview gambar"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={20} />
          </button>
          <button
            className="product-lightbox-arrow left"
            type="button"
            aria-label="Gambar sebelumnya"
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
            aria-label="Gambar berikutnya"
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
              {lightboxZoomed ? 'Klik gambar untuk kembali ke ukuran normal.' : 'Klik gambar untuk zoom detail.'}
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
        bottomText="© 2026 AHR Printing. Dibangun untuk kebutuhan retail dan teamwear."
        companyProfile={companyProfileContent}
        contactProfile={chromeContent.brand}
        defaultMapLabel="Buka lokasi AHR"
        footerGroups={chromeContent.footerGroups}
        footerMessage={`Halo AHR, saya ingin order ${product.name} ukuran ${selectedSize}.`}
        onWhatsAppClick={() => handleInquiry()}
      />
    </div>
  )
}
