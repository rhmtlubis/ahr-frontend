import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  Heart,
  MessageSquareMore,
  MapPin,
  LayoutGrid,
  Palette,
  MessageCircleMore,
  PackageCheck,
  Phone,
  ScanSearch,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Shirt,
  Truck,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './App.css'
import { trackEvent } from './lib/analytics'
import { getApiUrl } from './lib/api'
import { companyProfileContent } from './content/companyProfile'
import {
  sharedFooterGroups,
  sharedHeaderTicker,
  sharedHeaderUtilityMessage,
  sharedNavGroups,
  sharedUtilityLinks,
} from './content/siteChrome'
import {
  defaultShowcaseCategories,
  homepageProducts,
  normalizeProducts,
  productVisuals,
  slugifyCategoryLabel,
} from './content/productCatalog'
import { findAudiencePathById, getAudiencePaths } from './content/marketAudience'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'

const qualityHighlights = [
  {
    title: 'Bahan nyaman',
    detail: 'Material dipilih supaya enak dipakai dan tetap rapi.',
    icon: Shirt,
  },
  {
    title: 'Print tajam',
    detail: 'Warna dan detail desain dijaga tetap bersih.',
    icon: ScanSearch,
  },
  {
    title: 'Jahit rapi',
    detail: 'Finishing dibuat konsisten untuk pemakaian harian.',
    icon: ShieldCheck,
  },
  {
    title: 'Revisi mudah',
    detail: 'Arah desain dibahas singkat dan jelas.',
    icon: Palette,
  },
  {
    title: 'Produksi aman',
    detail: 'Alur kerja dibuat terpantau sampai selesai.',
    icon: PackageCheck,
  },
  {
    title: 'Layanan responsif',
    detail: 'Tim cepat membantu saat ada pertanyaan order.',
    icon: MessageSquareMore,
  },
]

const homepageContent = {
  brand: {
    name: 'AHR',
    lockup: 'CV AHR Printing',
    tagline: 'Apparel dan percetakan kustom dengan spesialisasi sublimasi jersey.',
    whatsapp_number: '6281234567890',
    response_time: 'Balas cepat di jam kerja untuk kebutuhan retail maupun bulk order',
  },
  companyProfile: companyProfileContent,
  utilityLinks: sharedUtilityLinks,
  footerGroups: sharedFooterGroups,
  navGroups: sharedNavGroups,
  ticker: sharedHeaderTicker,
  hero: {
    title: 'Produksi jersey kustom yang rapi, terbuka, dan nyaman diikuti prosesnya.',
    body:
      'Custom jersey untuk tim, komunitas, sekolah, event, dan personal dengan alur yang jelas dari desain sampai pengiriman.',
    primaryCta: 'Lihat pilihan',
    secondaryCta: 'Diskusi kebutuhan',
    eyebrow: 'AHR Production Motion',
  },
  stats: [
    { value: '500+', label: 'team, school, dan komunitas ditangani' },
    { value: '10 pcs', label: 'MOQ custom jersey mulai' },
    { value: '7-14 hari', label: 'estimasi produksi' },
    { value: '34 kota', label: 'cakupan pengiriman aktif' },
  ],
  capabilities: [
    {
      title: 'Design-to-Delivery Workflow',
      detail: 'Alur bulk order dijelaskan dari awal supaya tim procurement, EO, sekolah, dan klub bisa mengikuti dengan tenang.',
      icon: MessageCircleMore,
    },
    {
      title: 'Retail Collection Entry',
      detail: 'Jalur retail tetap ringan dan mudah dijelajahi untuk pembelian langsung tanpa terasa bercampur dengan flow produksi.',
      icon: ShoppingBag,
    },
    {
      title: 'QC dan Reorder Support',
      detail: 'Nomor, warna, size run, dan file desain dijaga rapi supaya repeat order lebih mudah saat dibutuhkan.',
      icon: ShieldCheck,
    },
    {
      title: 'Invoice & Shipment Ready',
      detail: 'Flow administrasi, approval, dan pengiriman dijelaskan dengan lebih terbuka agar buyer bisa menyesuaikan ritme kerjanya.',
      icon: Truck,
    },
  ],
  products: homepageProducts,
  clientBrands: [
    'Komunitas Futsal Bandung',
    'School League Series',
    'Corporate Fun Run',
    'Event Organizer Jawa Barat',
    'Campus Sports Week',
    'Brand Activation Team',
  ],
  pricingPackages: [
    {
      id: 'starter',
      name: 'Starter',
      quantity: '10 pcs',
      price: 'Mulai Rp 95.000 / pcs',
      featured: false,
      features: ['1 desain utama', '2x revisi gratis', 'Cocok untuk tim baru'],
    },
    {
      id: 'tim',
      name: 'Tim',
      quantity: '25 pcs',
      price: 'Mulai Rp 88.000 / pcs',
      featured: true,
      features: ['Harga paling ideal', 'Sample fisik opsional', 'Prioritas slot produksi'],
    },
    {
      id: 'komunitas',
      name: 'Komunitas',
      quantity: '100 pcs',
      price: 'Custom volume pricing',
      featured: false,
      features: ['Tier khusus reseller/EO', 'Split ukuran & chapter', 'Pendampingan reorder'],
    },
  ],
  processSteps: [
    {
      title: 'Brief',
      detail: 'Kebutuhan, jumlah, dan target deadline dibicarakan lebih dulu supaya arahnya sama.',
      icon: MessageCircleMore,
    },
    {
      title: 'Approval',
      detail: 'Mockup dan revisi final dirapikan sebelum masuk line produksi.',
      icon: FileCheck2,
    },
    {
      title: 'Production',
      detail: 'Tahap cut, print, sewing, dan quality check dijalankan dengan standar yang konsisten.',
      icon: PackageCheck,
    },
    {
      title: 'Ship',
      detail: 'Setelah selesai, pengiriman dan kebutuhan reorder berikutnya bisa disiapkan lebih mudah.',
      icon: ArrowRight,
    },
  ],
  faqs: [
    {
      question: 'Apakah layout ini meniru adidas secara persis?',
      answer:
        'Tidak. Kami mengambil pola navigasi dan komposisi visualnya, lalu menyesuaikan warna, copy, logo, dan fokus pesan agar konsisten dengan guideline brand AHR.',
    },
    {
      question: 'Apakah halaman ini tetap mendukung B2B dan B2C sekaligus?',
      answer:
        'Ya. Hero dan CTA sengaja dibuat dual-path agar shopper retail dan buyer wholesale bisa masuk ke jalur yang sesuai tanpa bingung.',
    },
    {
      question: 'Video hero bisa diganti dengan video brand AHR?',
      answer:
        'Bisa. Saya sudah set sebagai file lokal di frontend sehingga nanti tinggal ganti asset videonya tanpa ubah struktur layout.',
    },
  ],
}

const defaultLeadForm = {
  name: '',
  phone: '',
  organization: '',
  quantity_estimate: '',
  segment: 'b2c-direct',
}
const capabilityIcons = [MessageCircleMore, LayoutGrid, ShieldCheck, Truck]
const heroMessageFallback =
  'Halo AHR, saya ingin konsultasi bulk order untuk custom jersey dan teamwear.'
const finalMessageFallback =
  'Halo AHR, saya ingin konsultasi kebutuhan bulk order dan procurement.'
const footerMessageFallback =
  'Halo AHR, saya ingin berdiskusi tentang kebutuhan jersey atau apparel kustom.'
const defaultMapLabel = 'Buka lokasi AHR Printing di Google Maps'

function getUtmParams() {
  const searchParams = new URLSearchParams(window.location.search)

  return {
    utm_source: searchParams.get('utm_source') || '',
    utm_medium: searchParams.get('utm_medium') || '',
    utm_campaign: searchParams.get('utm_campaign') || '',
    utm_content: searchParams.get('utm_content') || '',
    utm_term: searchParams.get('utm_term') || '',
  }
}

function buildWhatsAppUrl(phoneNumber, message, ctaContext) {
  const utm = getUtmParams()
  const encodedMessage = encodeURIComponent(
    `${message}\n\nSumber: ${utm.utm_source || 'direct'} / ${utm.utm_medium || 'none'}\nKonteks CTA: ${ctaContext}`,
  )

  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
}

function buildInquiryMessage(leadForm) {
  return `Halo AHR, saya ${leadForm.name} dari ${leadForm.organization || 'tim/instansi'} ingin konsultasi ${leadForm.segment_label || leadForm.segment} sekitar ${leadForm.quantity_estimate || 'belum ditentukan'} pcs.`
}

function normalizeLinks(links = [], defaultHref = '#final-cta') {
  return links.map((link) =>
    typeof link === 'string'
      ? { label: link, href: defaultHref }
      : { label: link.label, href: link.href || defaultHref },
  )
}

function resolvePageSectionByDepth(depth) {
  if (depth >= 90) return 'contact'
  if (depth >= 75) return 'faq'
  if (depth >= 50) return 'final-cta'
  if (depth >= 25) return 'products'
  return 'hero'
}

function normalizeLandingPageContent(payload = {}) {
  const catalogCategories = Array.isArray(payload.catalog_categories) ? payload.catalog_categories : []
  const catalogItems = Array.isArray(payload.catalog_items) ? payload.catalog_items : []
  const heroStats = Array.isArray(payload.hero?.stats) ? payload.hero.stats : []
  const processSteps = Array.isArray(payload.process_steps) ? payload.process_steps : []
  const faqs = Array.isArray(payload.faqs) ? payload.faqs : []
  const guarantees = Array.isArray(payload.guarantees) ? payload.guarantees : []
  const trustBar = Array.isArray(payload.trust_bar) ? payload.trust_bar : []
  const testimonials = Array.isArray(payload.testimonials) ? payload.testimonials : []
  const pricingPackages = Array.isArray(payload.pricing_packages) ? payload.pricing_packages : []
  const audiencePaths = getAudiencePaths(payload.audience_paths)

  return {
    ...homepageContent,
    brand: {
      ...homepageContent.brand,
      ...payload.brand,
    },
    hero: payload.hero
      ? {
          ...homepageContent.hero,
          eyebrow: payload.hero.eyebrow || homepageContent.hero.eyebrow,
          title: payload.hero.headline || homepageContent.hero.title,
          body: payload.hero.subheadline || homepageContent.hero.body,
          primaryCta: payload.hero.primary_cta || homepageContent.hero.primaryCta,
          secondaryCta: payload.hero.secondary_cta || homepageContent.hero.secondaryCta,
        }
      : homepageContent.hero,
    stats:
      heroStats.length > 0
        ? heroStats.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        : homepageContent.stats,
    products: normalizeProducts(catalogItems),
    processSteps:
      processSteps.length > 0
        ? processSteps.map((item, index) => ({
            title: item.title,
            detail: item.detail,
            icon: capabilityIcons[index % capabilityIcons.length],
          }))
        : homepageContent.processSteps,
    faqs:
      faqs.length > 0
        ? faqs
        : homepageContent.faqs,
    capabilities:
      guarantees.length > 0
        ? guarantees.map((item, index) => ({
            title: trustBar[index] || `Keunggulan ${index + 1}`,
            detail: item,
            icon: capabilityIcons[index % capabilityIcons.length],
          }))
        : homepageContent.capabilities,
    utilityLinks:
      catalogCategories.length > 0
        ? catalogCategories.slice(0, 4).map((item) => ({ label: item.label, href: '#products' }))
        : homepageContent.utilityLinks,
    ticker:
      trustBar.length > 0
        ? trustBar.join(' • ')
        : homepageContent.ticker,
    footerGroups:
      catalogCategories.length > 0
        ? [
            {
              title: 'Segmen',
              links: catalogCategories.slice(0, 4).map((item) => ({
                label: item.label,
                href: '#products',
              })),
            },
            ...homepageContent.footerGroups.slice(1),
          ]
        : homepageContent.footerGroups,
    pricingPackages:
      pricingPackages.length > 0
        ? pricingPackages.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            featured: item.featured,
            features: item.features,
          }))
        : homepageContent.pricingPackages,
    testimonials,
    catalogCategories,
    audiencePaths,
    leadForm: payload.lead_form || {},
    marketPositioning: payload.market_positioning || {},
  }
}

function App() {
  const rootRef = useRef(null)
  const faqContentRefs = useRef([])
  const [landingPageContent, setLandingPageContent] = useState(homepageContent)
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  const [activeCatalogFilter, setActiveCatalogFilter] = useState('all')
  const [leadForm, setLeadForm] = useState(defaultLeadForm)
  const [leadStatus, setLeadStatus] = useState({ state: 'idle', message: '' })
  const contactProfile = landingPageContent.brand
  const companyProfile = landingPageContent.companyProfile
  const leadSegments = getAudiencePaths(landingPageContent.audiencePaths)

  useEffect(() => {
    const start = Date.now()
    const depths = [25, 50, 75, 90]
    const seenDepths = new Set()

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight

      if (documentHeight <= 0) {
        return
      }

      const currentDepth = Math.round((scrollTop / documentHeight) * 100)

      depths.forEach((depth) => {
        if (currentDepth >= depth && !seenDepths.has(depth)) {
          seenDepths.add(depth)
          trackEvent('scroll_depth', {
            depth_percentage: depth,
            page_section: resolvePageSectionByDepth(depth),
          })
        }
      })
    }

    const handleUnload = () => {
      const durationInSeconds = Math.round((Date.now() - start) / 1000)
      trackEvent('time_on_page', { seconds: durationInSeconds })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('beforeunload', handleUnload)

    fetch(getApiUrl('/api/catalog/landing-page'), {
      headers: {
        Accept: 'application/json',
      },
    })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Gagal memuat konten landing page')
          }

          return response.json()
        })
        .then((payload) => {
          if (payload?.data) {
            setLandingPageContent(normalizeLandingPageContent(payload.data))
          }
        })
        .catch(() => {
          setLandingPageContent(homepageContent)
        })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [])

  useEffect(() => {
    if (!rootRef.current) {
      return undefined
    }

    gsap.registerPlugin(ScrollTrigger)

    const hoverCleanups = []
    const context = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return
      }

      const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      heroTimeline
        .from('.hero-video', {
          scale: 1.16,
          duration: 1.5,
        })
        .from(
          '.hero-overlay',
          {
            opacity: 0,
            duration: 1,
          },
          0.1,
        )
        .from(
          '.hero-orb',
          {
            opacity: 0,
            scale: 0.6,
            stagger: 0.12,
            duration: 1.1,
          },
          0.15,
        )
        .from(
          '.hero-content > *',
          {
            y: 36,
            opacity: 0,
            stagger: 0.12,
            duration: 0.85,
          },
          0.2,
        )
        .from(
          '.metric-card',
          {
            y: 24,
            opacity: 0,
            stagger: 0.08,
            duration: 0.6,
          },
          0.55,
        )

      gsap.utils.toArray('[data-reveal]').forEach((section) => {
        const items = section.querySelectorAll('[data-reveal-item]')

        gsap.from(items, {
          y: 44,
          opacity: 0,
          stagger: 0.1,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 78%',
            once: true,
          },
        })
      })

      gsap.utils.toArray('.product-card, .capability-card, .process-card, .faq-item').forEach((card) => {
        const media = card.querySelector('.product-media')

        const enter = () => {
          gsap.to(card, {
            y: -10,
            rotateX: 2,
            rotateY: 0,
            boxShadow: '0 24px 60px rgba(2, 37, 84, 0.16)',
            duration: 0.35,
            ease: 'power2.out',
          })

          if (media) {
            gsap.to(media, {
              scale: 1.04,
              duration: 0.45,
              ease: 'power2.out',
            })
          }
        }

        const leave = () => {
          gsap.to(card, {
            y: 0,
            rotateX: 0,
            rotateY: 0,
            boxShadow: '0 12px 30px rgba(2, 37, 84, 0)',
            duration: 0.35,
            ease: 'power2.out',
          })

          if (media) {
            gsap.to(media, {
              scale: 1,
              duration: 0.45,
              ease: 'power2.out',
            })
          }
        }

        card.addEventListener('mouseenter', enter)
        card.addEventListener('mouseleave', leave)

        hoverCleanups.push(() => {
          card.removeEventListener('mouseenter', enter)
          card.removeEventListener('mouseleave', leave)
        })
      })

      gsap.to('.hero-orb-one', {
        yPercent: -18,
        xPercent: 10,
        scrollTrigger: {
          trigger: '.hero-video-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      gsap.to('.hero-orb-two', {
        yPercent: -24,
        xPercent: -8,
        scrollTrigger: {
          trigger: '.hero-video-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      })
    }, rootRef)

    return () => {
      hoverCleanups.forEach((cleanup) => cleanup())
      context.revert()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  useEffect(() => {
    const availableLeadSegments =
      getAudiencePaths(landingPageContent.audiencePaths)

    if (availableLeadSegments.some((segment) => segment.id === leadForm.segment)) {
      return
    }

    setLeadForm((current) => ({
      ...current,
      segment: availableLeadSegments[0]?.id || defaultLeadForm.segment,
    }))
  }, [leadForm.segment, landingPageContent.catalogCategories])

  useEffect(() => {
    faqContentRefs.current.forEach((element, index) => {
      if (!element) {
        return
      }

      const inner = element.firstElementChild

      if (!inner) {
        return
      }

      const isOpen = openFaqIndex === index

      gsap.killTweensOf(element)
      gsap.killTweensOf(inner)

      if (isOpen) {
        gsap.set(element, {
          height: 'auto',
        })

        const contentHeight = element.offsetHeight

        gsap.fromTo(
          element,
          {
            height: 0,
          },
          {
            height: contentHeight,
            duration: 0.42,
            ease: 'power2.out',
            onComplete: () => gsap.set(element, { height: 'auto' }),
          },
        )

        gsap.fromTo(
          inner,
          {
            y: -10,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.32,
            ease: 'power2.out',
            delay: 0.08,
          },
        )

        return
      }

      gsap.to(inner, {
        y: -8,
        opacity: 0,
        duration: 0.18,
        ease: 'power1.in',
      })

      gsap.to(element, {
        height: 0,
        duration: 0.32,
        ease: 'power2.inOut',
      })
    })
  }, [openFaqIndex, landingPageContent.faqs])

  const showcaseCategories =
    landingPageContent.catalogCategories?.length > 0
      ? landingPageContent.catalogCategories.map((category, index) => ({
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
  const catalogFilters = [{ id: 'all', label: 'Semua' }, ...showcaseCategories]
  const visibleProducts =
    activeCatalogFilter === 'all'
      ? landingPageContent.products
      : landingPageContent.products.filter((product) => product.categoryId === activeCatalogFilter)

  const scrollToSection = (sectionId) => {
    const target = document.querySelector(sectionId)

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleWhatsAppClick = (eventName, eventParams, message) => {
    trackEvent(eventName, eventParams)
    window.open(
      buildWhatsAppUrl(
        contactProfile.whatsapp_number,
        message,
        eventParams.intent || eventParams.button_location || 'direct-whatsapp',
      ),
      '_blank',
      'noopener,noreferrer',
    )
  }

  const submitLead = async (event) => {
    event.preventDefault()
    setLeadStatus({ state: 'loading', message: 'Mengirim data prospek...' })

    const payload = {
      ...leadForm,
      segment_label: findAudiencePathById(leadSegments, leadForm.segment)?.label,
      market_type: findAudiencePathById(leadSegments, leadForm.segment)?.audience || 'hybrid',
      buyer_type: findAudiencePathById(leadSegments, leadForm.segment)?.journey || 'consultative_bulk',
      source_page: window.location.pathname,
      cta_context: 'unified-homepage-form',
      referrer_url: document.referrer || undefined,
      ...getUtmParams(),
    }

    try {
      const response = await fetch(getApiUrl('/api/catalog/leads'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const responsePayload = await response.json().catch(() => null)
        const errorMessage =
          responsePayload?.message ||
          Object.values(responsePayload?.errors || {}).flat()[0] ||
          'Gagal menyimpan lead'

        throw new Error(errorMessage)
      }

      setLeadStatus({
        state: 'success',
        message: 'Prospek tersimpan. Kami bukakan WhatsApp untuk follow-up yang lebih cepat.',
      })
      setLeadForm({
        ...defaultLeadForm,
        segment: leadSegments[0]?.id || defaultLeadForm.segment,
      })

      handleWhatsAppClick(
        'final_cta_wa_click',
        {
          button_location: 'lead-form',
          intent: 'submit-inquiry-success',
          section: 'final-cta',
        },
        buildInquiryMessage(leadForm),
      )
    } catch (error) {
      setLeadStatus({
        state: 'error',
        message: error.message || 'Lead belum tersimpan ke server. Anda tetap bisa lanjut ke WhatsApp.',
      })

      handleWhatsAppClick(
        'final_cta_wa_click',
        {
          button_location: 'lead-form',
          intent: 'submit-inquiry-fallback',
          section: 'final-cta',
        },
        buildInquiryMessage(leadForm),
      )
    }
  }

  const handleProductInquiry = (product) => {
    handleWhatsAppClick(
      'product_card_click',
      {
        product_name: product.name,
        product_category: product.category,
        product_moq: product.detail?.split('•')[1]?.trim() || 'not-set',
      },
      `Halo AHR, saya tertarik dengan ${product.name}. Mohon info detail bahan, MOQ, dan estimasi produksinya.`,
    )
  }

  const handleProductNavigate = (product) => {
    trackEvent('product_detail_open', {
      product_name: product.name,
      product_category: product.category,
      destination: `/produk/${product.slug}`,
    })
  }

  const handleCatalogFilterClick = (filterId) => {
    trackEvent('catalog_filter_click', {
      filter_category: filterId,
      previous_filter: activeCatalogFilter,
    })
    setActiveCatalogFilter(filterId)
  }

  const handleCategoryNavigation = (category) => {
    trackEvent('category_navigation_click', {
      category_name: category.label,
      destination: 'products',
    })

    if (category.id) {
      setActiveCatalogFilter(category.id)
    }

    scrollToSection('#products')
  }

  const handlePricingInquiry = (pricingPackage) => {
    handleWhatsAppClick(
      'pricing_cta_click',
      {
        package: pricingPackage.id,
        is_featured: pricingPackage.featured,
        button_location: 'pricing-section',
      },
      `Halo AHR, saya ingin konsultasi paket ${pricingPackage.name} untuk kebutuhan jersey custom. Mohon info detail harga dan prosesnya.`,
    )
  }

  return (
    <div className="app-shell" ref={rootRef}>
      <SiteHeader
        brandHref="/"
        navGroups={landingPageContent.navGroups}
        ticker={landingPageContent.ticker}
        utilityAction={{ href: '#contact', label: 'Lihat workshop' }}
        utilityLinks={landingPageContent.utilityLinks}
        utilityMessage={sharedHeaderUtilityMessage}
        onNavInteraction={(navItem, surface) => trackEvent('nav_click', { nav_item: navItem, surface })}
        onPrimaryAction={() => {
          trackEvent('nav_click', {
            nav_item: 'konsultasi',
            surface: 'header-cta',
          })
          scrollToSection('#final-cta')
        }}
        onUtilityInteraction={(label, surface) => trackEvent('nav_click', { nav_item: label, surface })}
        primaryActionLabel="Konsultasi"
      />

      <main>
        <section className="hero-video-section" id="hero">
          <video
            className="hero-video hero-video-desktop"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/ahr-logo.webp"
          >
            <source src="/videos/ahr-hero-desktop.m4v" type="video/mp4" />
          </video>
          <video
            className="hero-video hero-video-mobile"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/ahr-logo.webp"
          >
            <source src="/videos/ahr-hero-mobile.mp4" type="video/mp4" />
          </video>
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-cta-row">
              <button
                className="cta-button cta-button-outline"
                onClick={() =>
                  handleWhatsAppClick(
                    'hero_cta_click',
                    {
                      button_text: landingPageContent.hero.secondaryCta,
                      button_type: 'whatsapp',
                      intent: 'konsultasi-gratis',
                    },
                    heroMessageFallback,
                  )
                }
              >
                {landingPageContent.hero.secondaryCta}
              </button>
              <a
                className="cta-button cta-button-light"
                href="#products"
                onClick={() =>
                  trackEvent('hero_cta_click', {
                    button_text: landingPageContent.hero.primaryCta,
                    button_type: 'anchor',
                    intent: 'lihat-katalog',
                  })
                }
              >
                {landingPageContent.hero.primaryCta}
                <ChevronRight size={18} />
              </a>
            </div>
          </div>
        </section>

        <section className="metrics-strip">
          {landingPageContent.stats.map((item) => (
            <article className="metric-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </section>

        <section className="content-block section-soft" data-reveal>
          <div className="section-heading" data-reveal-item>
            <span>AHR Unified Direction</span>
            <h2>Tampilan dibuat lebih ringan agar orang cepat paham pilihan dan alur ordernya.</h2>
            <p>
              Fokus utamanya tetap pada produk, proses, dan titik kontak yang mudah dijangkau.
            </p>
          </div>

          <div className="capability-grid">
            {landingPageContent.capabilities.map((item) => {
              const Icon = item.icon

              return (
                <article className="capability-card" key={item.title} data-reveal-item>
                  <Icon size={18} />
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="content-block section-plain category-showcase" id="categories" data-reveal>
          <div className="section-heading heading-inline" data-reveal-item>
            <div>
              <span>Temukan Kategori</span>
              <h2>Pilih kategori dulu, lalu lanjut lihat koleksinya.</h2>
            </div>
            <a href="#products">
              Lihat produk
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="category-slider" data-reveal-item>
            {showcaseCategories.map((category) => (
              <button
                className="category-card"
                key={category.id || category.label}
                type="button"
                onClick={() => handleCategoryNavigation(category)}
              >
                <img
                  className="category-card-image"
                  src={category.image}
                  alt={category.label}
                  style={{ objectPosition: category.position }}
                />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="content-block section-plain" id="products" data-reveal>
          <div className="section-heading heading-inline" data-reveal-item>
            <div>
              <span>Discover Our Product</span>
              <h2>Pilih model yang paling dekat dengan kebutuhanmu.</h2>
              <p>Fokus pada visual, geser untuk lihat koleksi.</p>
            </div>
            <a href="#final-cta">
              Mulai konsultasi
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="discover-grid" data-reveal-item>
            <div className="quality-panel">
              <div className="quality-panel-heading">
                <h3>We offer quality</h3>
                <p>Material terbaik, proses rapi, dan layanan yang tetap mudah diikuti.</p>
              </div>

              <div className="quality-grid">
                {qualityHighlights.map((item) => {
                  const Icon = item.icon

                  return (
                  <article className="quality-card" key={item.title}>
                    <Icon size={18} />
                    <h4>{item.title}</h4>
                    <p>{item.detail}</p>
                  </article>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="catalog-filter-row" data-reveal-item>
            {catalogFilters.map((filter) => (
              <button
                className={activeCatalogFilter === filter.id ? 'catalog-filter active' : 'catalog-filter'}
                key={filter.id}
                type="button"
                onClick={() => handleCatalogFilterClick(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="product-slider" data-reveal-item>
            <div className="product-slider-toolbar">
              <p className="product-slider-meta">{visibleProducts.length} produk. Geser ke samping untuk melihat semuanya.</p>
            </div>

            <div className="product-slider-viewport">
              <div className="product-slider-track">
                {visibleProducts.map((product) => (
                  <article className={`product-card tone-${product.tone}`} key={product.name}>
                    <Link
                      className="product-card-link"
                      to={`/produk/${product.slug}`}
                      state={{ product }}
                      onClick={() => handleProductNavigate(product)}
                      aria-label={`Lihat detail ${product.name}`}
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
                        <span className="product-price">{product.price}</span>
                      </div>
                    </Link>
                    <button
                      className="wishlist-button"
                      type="button"
                      aria-label={`Tanya produk ${product.name}`}
                      onClick={() => handleProductInquiry(product)}
                    >
                      <Heart size={18} />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="content-block section-soft client-brand-section" data-reveal>
          <div className="section-heading heading-inline" data-reveal-item>
            <div>
              <span>Our Client Brand</span>
              <h2>Dipercaya brand, komunitas, sekolah, dan tim yang membutuhkan produksi lebih rapi dan mudah dikoordinasikan.</h2>
            </div>
            <p className="client-brand-caption">Beberapa tipe klien dan kolaborator yang paling sering bekerja sama dengan AHR Printing.</p>
          </div>

          <div className="client-brand-grid">
            {landingPageContent.clientBrands.map((brand) => (
              <article className="client-brand-card" key={brand} data-reveal-item>
                <span>{brand}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="content-block section-soft process-layout" id="process" data-reveal>
          <div className="section-heading" data-reveal-item>
            <span>Bulk order process</span>
            <h2>Bagian proses membantu menjelaskan apa yang terjadi setelah percakapan dimulai.</h2>
          </div>

          <div className="process-grid">
            {landingPageContent.processSteps.map((item, index) => {
              const Icon = item.icon

              return (
                <article className="process-card" key={item.title} data-reveal-item>
                  <div className="process-index">
                    <strong>0{index + 1}</strong>
                    <Icon size={18} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="content-block section-soft pricing-layout" id="pricing" data-reveal>
          <div className="section-heading heading-inline" data-reveal-item>
            <div>
              <span>Paket Harga</span>
              <h2>Pilih paket yang paling mendekati kebutuhan order, lalu lanjutkan konsultasi untuk detail finalnya.</h2>
            </div>
            <a href="#final-cta">
              Minta penawaran
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="pricing-grid">
            {landingPageContent.pricingPackages.map((pricingPackage) => (
              <article
                className={pricingPackage.featured ? 'pricing-card featured' : 'pricing-card'}
                key={pricingPackage.id}
                data-reveal-item
              >
                <span className="pricing-quantity">{pricingPackage.quantity}</span>
                <h3>{pricingPackage.name}</h3>
                <strong>{pricingPackage.price}</strong>
                <ul className="pricing-feature-list">
                  {pricingPackage.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button
                  className={pricingPackage.featured ? 'cta-button cta-button-dark' : 'cta-button cta-button-light'}
                  type="button"
                  onClick={() => handlePricingInquiry(pricingPackage)}
                >
                  Tanya Paket Ini
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="final-panel section-accent" id="final-cta" data-reveal>
          <div className="final-panel-copy" data-reveal-item>
            <span>Final CTA</span>
            <h2>Pilih jalur yang paling sesuai, lalu lanjutkan percakapannya dengan cara yang nyaman.</h2>
            <div className="final-actions">
              <button
                className="cta-button cta-button-dark"
                onClick={() =>
                  handleWhatsAppClick(
                    'final_cta_wa_click',
                    {
                      button_location: 'final-panel',
                      intent: 'wholesale-consultation',
                      section: 'final-cta',
                    },
                    finalMessageFallback,
                  )
                }
              >
                Wholesale Consultation
              </button>
              <a
                className="cta-button cta-button-light"
                href="#products"
                onClick={() =>
                  trackEvent('hero_cta_click', {
                    button_text: 'Shop Collection',
                    button_type: 'anchor',
                    intent: 'shop-collection',
                  })
                }
              >
                Shop Collection
              </a>
            </div>
          </div>

          <form className="lead-form" onSubmit={submitLead} data-reveal-item>
            <input
              aria-label="Nama PIC"
              placeholder="Nama PIC"
              value={leadForm.name}
              onChange={(event) => setLeadForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <input
              aria-label="Nomor WhatsApp"
              placeholder="Nomor WhatsApp"
              value={leadForm.phone}
              onChange={(event) => setLeadForm((current) => ({ ...current, phone: event.target.value }))}
              required
            />
            <input
              aria-label="Nama tim atau instansi"
              placeholder="Tim / instansi / brand"
              value={leadForm.organization}
              onChange={(event) =>
                setLeadForm((current) => ({ ...current, organization: event.target.value }))
              }
            />
            <div className="lead-form-row">
              <input
                aria-label="Estimasi jumlah pcs"
                placeholder="Estimasi pcs"
                value={leadForm.quantity_estimate}
                onChange={(event) =>
                  setLeadForm((current) => ({
                    ...current,
                    quantity_estimate: event.target.value,
                  }))
                }
              />
              <select
                aria-label="Segmen"
                value={leadForm.segment}
                onChange={(event) =>
                  setLeadForm((current) => ({ ...current, segment: event.target.value }))
                }
              >
                {leadSegments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.label}
                  </option>
                ))}
              </select>
            </div>
            <button className="submit-button" type="submit" disabled={leadStatus.state === 'loading'}>
              {leadStatus.state === 'loading' ? 'Mengirim...' : 'Submit Inquiry'}
            </button>
            {leadStatus.message ? <small className={`lead-status ${leadStatus.state}`}>{leadStatus.message}</small> : null}
          </form>
        </section>

        <section className="content-block section-plain faq-layout" id="faq" data-reveal>
          <div className="section-heading heading-inline" data-reveal-item>
            <div>
              <span>FAQ</span>
              <h2>Beberapa hal yang biasanya ingin diketahui sebelum lanjut lebih jauh.</h2>
            </div>
            <div className="faq-badge">
              <Store size={16} />
              <span>{contactProfile.response_time}</span>
            </div>
          </div>

          <div className="faq-layout-grid">
            <article className="faq-visual-card" data-reveal-item>
              <div
                className="faq-visual-media"
                style={{ backgroundImage: `url(${productVisuals[3]})` }}
              />
              <div className="faq-visual-copy">
                <span>Masih ragu sebelum order?</span>
                <p>
                  FAQ ini kami susun untuk menjawab pertanyaan yang paling sering muncul dari buyer tim,
                  sekolah, komunitas, maupun customer personal sebelum masuk ke tahap konsultasi.
                </p>
              </div>
            </article>

            <div className="faq-list">
              {landingPageContent.faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index

                return (
                  <article
                    className={isOpen ? 'faq-item open' : 'faq-item'}
                    key={faq.question}
                    data-reveal-item
                  >
                    <button
                      className="faq-button"
                      type="button"
                      onClick={() => {
                        setOpenFaqIndex(isOpen ? -1 : index)
                        trackEvent('faq_open', {
                          question_text: faq.question,
                          question_index: index + 1,
                        })
                      }}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown size={18} />
                    </button>
                    <div
                      className="faq-answer"
                      ref={(element) => {
                        faqContentRefs.current[index] = element
                      }}
                    >
                      <div className="faq-answer-inner">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="content-block section-soft contact-layout" id="contact" data-reveal>
          <div className="section-heading heading-inline" data-reveal-item>
            <div>
              <span>Alamat & Kontak</span>
              <h2>Kunjungi workshop kami di Katapang atau mulai konsultasi lewat WhatsApp dan Google Maps.</h2>
            </div>
            <a href={companyProfile.address.mapUrl} target="_blank" rel="noreferrer">
              Buka Maps
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="contact-grid">
            <article className="contact-card" data-reveal-item>
              <MapPin size={20} />
              <div>
                <h3>{companyProfile.address.label}</h3>
                <p>{companyProfile.address.line}</p>
              </div>
            </article>
            <article className="contact-card" data-reveal-item>
              <Phone size={20} />
              <div>
                <h3>Hubungi Tim AHR</h3>
                <p>{contactProfile.response_time}</p>
              </div>
            </article>
          </div>

          <div className="contact-actions" data-reveal-item>
            <a
              className="cta-button cta-button-dark"
              href={companyProfile.address.mapUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={defaultMapLabel}
            >
              Buka Lokasi di Google Maps
            </a>
            <button
              className="cta-button cta-button-light"
              onClick={() =>
                handleWhatsAppClick(
                  'nav_wa_click',
                  {
                    button_location: 'contact-section',
                    intent: 'contact-whatsapp',
                  },
                  footerMessageFallback,
                )
              }
            >
              Chat WhatsApp Sekarang
            </button>
          </div>
        </section>

      </main>

      <SiteFooter
        companyProfile={companyProfile}
        contactProfile={contactProfile}
        defaultMapLabel={defaultMapLabel}
        footerGroups={landingPageContent.footerGroups.map((group) => ({
          ...group,
          links: normalizeLinks(group.links),
        }))}
        footerMessage={footerMessageFallback}
        onWhatsAppClick={(message) =>
          handleWhatsAppClick(
            'nav_wa_click',
            {
              button_location: 'footer',
              intent: 'footer-whatsapp',
            },
            message,
          )
        }
      />
    </div>
  )
}

export default App
