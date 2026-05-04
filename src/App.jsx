import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FileCheck2,
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
  ShoppingCart,
  Store,
  Shirt,
  Truck,
} from 'lucide-react'
import './App.css'
import { initializeAnalytics, trackEvent, trackPageView } from './lib/analytics'
import { getApiUrl } from './lib/api'
import { getAttributionParams } from './lib/attribution'
import { useCart } from './lib/cart.jsx'
import {
  categoryPlaceholderImage,
  faqPlaceholderImage,
  findAudiencePathById,
  getAudiencePaths,
  normalizeCategoryCard,
  normalizeProducts,
} from './lib/cmsContent.js'
import CategoryFilterHeader from './components/landing/CategoryFilterHeader'
import ProductPrice from './components/catalog/ProductPrice'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { getConsentPreferences, setConsentPreferences } from './lib/consent'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { clearPersonalizationData, getPersonalizedProducts } from './lib/personalization'
import useDocumentTitle from './lib/useDocumentTitle'

const defaultLeadForm = {
  name: '',
  phone: '',
  organization: '',
  quantity_estimate: '',
  segment: 'b2c-direct',
}
const capabilityIcons = [MessageCircleMore, LayoutGrid, ShieldCheck, Truck]
const heroDesktopFallbackVideoUrl = '/videos/ahr-hero-desktop.m4v'
const heroMobileFallbackVideoUrl = '/videos/ahr-hero-mobile.mp4'

function isVideoUrl(url) {
  return typeof url === 'string' && /\.(mp4|m4v|webm|ogg|ogv)(?:$|\?)/i.test(url)
}

function buildWhatsAppUrl(phoneNumber, message, ctaContext) {
  const utm = getAttributionParams()
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

function normalizeLandingPageContent(payload = {}, homepageContent, language) {
  const catalogCategories = Array.isArray(payload.catalog_categories) ? payload.catalog_categories : []
  const catalogItems = Array.isArray(payload.catalog_items) ? payload.catalog_items : []
  const heroStats = Array.isArray(payload.hero?.stats) ? payload.hero.stats : []
  const processSteps = Array.isArray(payload.process_steps) ? payload.process_steps : []
  const faqs = Array.isArray(payload.faqs) ? payload.faqs : []
  const guarantees = Array.isArray(payload.guarantees) ? payload.guarantees : []
  const trustBar = Array.isArray(payload.trust_bar) ? payload.trust_bar : []
  const testimonials = Array.isArray(payload.testimonials) ? payload.testimonials : []
  const pricingPackages = Array.isArray(payload.pricing_packages) ? payload.pricing_packages : []
  const clientBrands = Array.isArray(payload.client_brands) ? payload.client_brands : []
  const audiencePaths = getAudiencePaths(payload.audience_paths, language)
  const chromeContent = getLandingChromeContent(payload, { locale: language })
  const qualityHighlights = chromeContent.qualityHighlights.map((item, index) => ({
    ...item,
    icon: [Shirt, ScanSearch, ShieldCheck, Palette, PackageCheck, MessageSquareMore][index % 6],
  }))

  return {
    ...homepageContent,
    ...chromeContent,
    qualityHighlights,
    hero: payload.hero
      ? {
          ...homepageContent.hero,
          eyebrow: payload.hero.eyebrow || homepageContent.hero.eyebrow,
          title: payload.hero.headline || homepageContent.hero.title,
          body: payload.hero.subheadline || homepageContent.hero.body,
          primaryCta: payload.hero.primary_cta || homepageContent.hero.primaryCta,
          secondaryCta: payload.hero.secondary_cta || homepageContent.hero.secondaryCta,
          desktopMedia: payload.hero.desktop_media || null,
          mobileMedia: payload.hero.mobile_media || null,
        }
      : homepageContent.hero,
    stats:
      heroStats.length > 0
        ? heroStats.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        : homepageContent.stats,
    products: normalizeProducts(catalogItems, language),
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
    clientBrands:
      clientBrands.length > 0
        ? clientBrands.map((item) =>
            typeof item === 'string'
              ? { label: item, image: null, url: null }
              : {
                  label: item.label,
                  image: item.image || item.logo?.url || null,
                  url: item.url || null,
                },
          )
        : homepageContent.clientBrands.map((brand) =>
            typeof brand === 'string' ? { label: brand, image: null, url: null } : brand,
          ),
    catalogCategories: catalogCategories.map((item) => {
      return {
        ...item,
        image: item.image || item.cover_image?.url || categoryPlaceholderImage,
        position: item.position || 'center center',
      }
    }),
    audiencePaths,
    leadForm: payload.lead_form || {},
    marketPositioning: payload.market_positioning || {},
  }
}

function getHomepageContent(language, t) {
  return {
    brand: {
      name: 'AHR',
      lockup: 'CV AHR Printing',
      tagline: t('homepage.brand.tagline'),
      whatsapp_number: '6281234567890',
      response_time: t('homepage.brand.responseTime'),
    },
    ...getLandingChromeContent({}, { locale: language }),
    qualityHighlights: [],
    hero: t('homepage.hero'),
    stats: t('homepage.stats'),
    capabilities: t('homepage.capabilities').map((item, index) => ({
      ...item,
      icon: [MessageCircleMore, ShoppingBag, ShieldCheck, Truck][index % 4],
    })),
    products: [],
    clientBrands: [],
    pricingPackages: t('homepage.pricingPackages'),
    processSteps: t('homepage.processSteps').map((item, index) => ({
      ...item,
      icon: [MessageCircleMore, FileCheck2, PackageCheck, ArrowRight][index % 4],
    })),
    faqs: t('homepage.faqs'),
  }
}

function App() {
  const { language, t } = useLanguage()
  useDocumentTitle(
    language === 'en'
      ? 'Custom Sublimation Jerseys & Sportswear Manufacturer'
      : 'Jersey Custom Sublimasi, Seragam Printing & Konveksi',
    language === 'en'
      ? 'AHR produces custom sublimation jerseys, team uniforms, sportswear, and made-to-order apparel for clubs, schools, communities, and companies.'
      : 'AHR melayani pembuatan jersey custom sublimasi, seragam printing, dan konveksi apparel custom untuk tim, sekolah, komunitas, dan perusahaan.',
    {
      canonicalPath: '/',
      image: '/ahr-brand-logo.webp',
      imageAlt: 'AHR jersey custom sublimasi',
      keywords:
        language === 'en'
          ? 'custom jerseys, sublimation jerseys, sportswear manufacturer, team uniforms, custom apparel, AHR'
          : 'jersey custom, jersey sublimasi, seragam printing, konveksi apparel, apparel olahraga, AHR',
      locale: language,
      type: 'website',
    },
  )
  const { addCartItem, itemCount } = useCart()
  const rootRef = useRef(null)
  const gsapRef = useRef(null)
  const scrollTriggerRef = useRef(null)
  const homepageContent = useMemo(() => getHomepageContent(language, t), [language, t])
  const [landingPageContent, setLandingPageContent] = useState(homepageContent)
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  const [activeCatalogFilter, setActiveCatalogFilter] = useState('all')
  const [leadForm, setLeadForm] = useState(defaultLeadForm)
  const [leadStatus, setLeadStatus] = useState({ state: 'idle', message: '' })
  const [consentPreferences, setConsentPreferencesState] = useState({
    analytics: 'unknown',
    personalization: 'unknown',
  })
  const [animationsReady, setAnimationsReady] = useState(false)
  const [shouldPlayHeroVideo, setShouldPlayHeroVideo] = useState(false)
  const [showHeroVideoHint, setShowHeroVideoHint] = useState(false)
  const heroVideoRef = useRef(null)
  const contactProfile = landingPageContent.brand
  const companyProfile = landingPageContent.companyProfile
  const decorativeMedia = landingPageContent.decorativeMedia
  const sectionContent = landingPageContent.sectionContent
  const leadSegments = getAudiencePaths(landingPageContent.audiencePaths, language)
  const heroMessageFallback = t('homepage.heroMessage')
  const finalMessageFallback = t('homepage.finalMessage')
  const footerMessageFallback = t('homepage.footerMessage')
  const defaultMapLabel = t('common.mapLabel')

  useEffect(() => {
    setLandingPageContent(homepageContent)
  }, [homepageContent])

  useEffect(() => {
    setConsentPreferencesState(getConsentPreferences())
  }, [])

  useEffect(() => {
    let cancelled = false
    let idleCallbackId
    let timeoutId

    const loadAnimations = () => {
      Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
        .then(([gsapModule, scrollTriggerModule]) => {
          if (cancelled) {
            return
          }

          const gsapInstance = gsapModule.default
          const scrollTrigger = scrollTriggerModule.ScrollTrigger

          gsapInstance.registerPlugin(scrollTrigger)
          gsapRef.current = gsapInstance
          scrollTriggerRef.current = scrollTrigger
          setAnimationsReady(true)
        })
        .catch(() => {
          if (!cancelled) {
            setAnimationsReady(false)
          }
        })
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleCallbackId = window.requestIdleCallback(loadAnimations, { timeout: 1800 })
    } else {
      timeoutId = window.setTimeout(loadAnimations, 900)
    }

    return () => {
      cancelled = true

      if (typeof window !== 'undefined' && idleCallbackId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleCallbackId)
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const tryPlay = () => {
      const video = heroVideoRef.current

      if (!video) {
        return
      }

      video.muted = true
      video.playsInline = true
      video.load()
      video.play()?.catch(() => {})
    }

    const interactionEvents = ['pointerdown', 'keydown', 'touchstart']
    const handleUserGesture = () => {
      tryPlay()
    }

    interactionEvents.forEach((eventName) =>
      window.addEventListener(eventName, handleUserGesture, { passive: true }),
    )
    window.addEventListener('focus', tryPlay)

    const autoplayHintId = window.setTimeout(() => {
      setShowHeroVideoHint((current) => (shouldPlayHeroVideo ? false : current || true))
    }, 1800)
    const timeoutId = window.setTimeout(tryPlay, 200)

    return () => {
      interactionEvents.forEach((eventName) =>
        window.removeEventListener(eventName, handleUserGesture),
      )
      window.removeEventListener('focus', tryPlay)
      window.clearTimeout(autoplayHintId)
      window.clearTimeout(timeoutId)
    }
  }, [heroDesktopVideoUrl, heroMobileVideoUrl, shouldPlayHeroVideo])

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

    fetch(getApiUrl(`/api/catalog/landing-page?locale=${language}`), {
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
            setLandingPageContent({
              ...normalizeLandingPageContent(payload.data, homepageContent, language),
            })
          }
        })
        .catch(() => {
          setLandingPageContent(homepageContent)
        })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [homepageContent, language])

  useEffect(() => {
    if (!rootRef.current || !animationsReady || !gsapRef.current || !scrollTriggerRef.current) {
      return undefined
    }

    const gsap = gsapRef.current
    const ScrollTrigger = scrollTriggerRef.current
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
      context.revert()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [animationsReady])

  useEffect(() => {
    const availableLeadSegments = getAudiencePaths(landingPageContent.audiencePaths, language)

    if (availableLeadSegments.some((segment) => segment.id === leadForm.segment)) {
      return
    }

    setLeadForm((current) => ({
      ...current,
      segment: availableLeadSegments[0]?.id || defaultLeadForm.segment,
    }))
  }, [language, leadForm.segment, landingPageContent.audiencePaths])

  const showcaseCategories =
    landingPageContent.catalogCategories?.length > 0
      ? landingPageContent.catalogCategories.map((category) =>
          normalizeCategoryCard(category, 0),
        )
      : []
  const categoryProductCountMap = landingPageContent.products.reduce((accumulator, product) => {
    const categoryId = product.categoryId || 'all'

    accumulator[categoryId] = (accumulator[categoryId] || 0) + 1

    return accumulator
  }, {})
  const categoryNavigationItems = [
    {
      id: 'all',
      label: t('common.allCollections'),
      image: showcaseCategories[0]?.image || landingPageContent.products[0]?.image || categoryPlaceholderImage,
      position: showcaseCategories[0]?.position || landingPageContent.products[0]?.imagePosition,
      count: landingPageContent.products.length,
    },
    ...showcaseCategories.map((category) => ({
      ...category,
      count: categoryProductCountMap[category.id] || 0,
    })),
  ]
  const personalizedProducts = useMemo(
    () => getPersonalizedProducts(landingPageContent.products, 4),
    [landingPageContent.products],
  )
  const visibleProducts =
    activeCatalogFilter === 'all'
      ? landingPageContent.products
      : landingPageContent.products.filter((product) => product.categoryId === activeCatalogFilter)
  const activeCategory =
    categoryNavigationItems.find((category) => category.id === activeCatalogFilter) || categoryNavigationItems[0]

  const scrollToSection = (sectionId) => {
    const target = document.querySelector(sectionId)

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const applyConsentPreferences = (nextPreferences) => {
    setConsentPreferences(nextPreferences)
    setConsentPreferencesState(nextPreferences)

    if (nextPreferences.analytics === 'accepted') {
      initializeAnalytics()
      trackPageView(window.location.pathname + window.location.search)
    }

    if (nextPreferences.personalization === 'rejected') {
      clearPersonalizationData()
    }

    trackEvent('cookie_consent_updated', {
      analytics_consent: nextPreferences.analytics,
      personalization_consent: nextPreferences.personalization,
      personalization_scope: 'homepage-top-listing',
    })
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
      ...getAttributionParams(),
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

  const handleProductNavigate = (product) => {
    trackEvent('product_detail_open', {
      product_name: product.name,
      product_category: product.category,
      destination: `/produk/${product.slug}`,
    })
  }

  const handleAddToCart = (product) => {
    addCartItem(product, {
      size: 'M',
      quantity: 1,
    })

    trackEvent('cart_add_item', {
      source_page: '/',
      product_name: product.name,
      product_category: product.category,
      product_size: 'M',
      quantity: 1,
    })
  }

  const handleCatalogFilterClick = (filterId) => {
    trackEvent('catalog_filter_click', {
      filter_category: filterId,
      previous_filter: activeCatalogFilter,
    })
    setActiveCatalogFilter(filterId)
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

  const heroDesktopMediaUrl = landingPageContent.hero.desktopMedia?.url || null
  const heroMobileMediaUrl = landingPageContent.hero.mobileMedia?.url || heroDesktopMediaUrl
  const isIosDevice =
    typeof navigator !== 'undefined' && /iP(hone|od|ad)/i.test(navigator.userAgent || '')
  const isMobileViewport =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  const useMobileHeroVideo = isIosDevice || isMobileViewport
  const heroDesktopVideoUrl = isVideoUrl(heroDesktopMediaUrl)
    ? heroDesktopMediaUrl
    : heroDesktopFallbackVideoUrl
  const heroMobileVideoUrl = isVideoUrl(heroMobileMediaUrl)
    ? heroMobileMediaUrl
    : heroMobileFallbackVideoUrl
  const heroPosterDesktopUrl =
    heroDesktopMediaUrl && !isVideoUrl(heroDesktopMediaUrl) ? heroDesktopMediaUrl : '/og-preview.png'
  const heroPosterMobileUrl =
    heroMobileMediaUrl && !isVideoUrl(heroMobileMediaUrl)
      ? heroMobileMediaUrl
      : heroPosterDesktopUrl
  const heroAltText =
    landingPageContent.hero.mobileMedia?.alt_text ||
    landingPageContent.hero.desktopMedia?.alt_text ||
    landingPageContent.hero.title
  const faqVisualUrl = decorativeMedia.faq_visual?.url || faqPlaceholderImage

  return (
    <div className="app-shell" ref={rootRef}>
      <SiteHeader
        brandHref="/"
        navGroups={landingPageContent.navGroups}
        ticker={landingPageContent.ticker}
        utilityAction={{ href: '#contact', label: 'Lihat workshop' }}
        utilityLinks={landingPageContent.utilityLinks}
        utilityMessage={landingPageContent.utilityMessage}
        cartItemCount={itemCount}
        onNavInteraction={(navItem, surface) => trackEvent('nav_click', { nav_item: navItem, surface })}
        onPrimaryAction={() => {
          trackEvent('nav_click', {
            nav_item: 'konsultasi',
            surface: 'header-cta',
          })
          scrollToSection('#final-cta')
        }}
        onUtilityInteraction={(label, surface) => trackEvent('nav_click', { nav_item: label, surface })}
        primaryActionLabel={t('common.consult')}
      />

      <main>
        <section className="hero-video-section" id="hero">
          {useMobileHeroVideo ? null : (
            <picture className={shouldPlayHeroVideo ? 'hero-poster hero-poster-hidden' : 'hero-poster'}>
              <source media="(max-width: 767px)" srcSet={heroPosterMobileUrl} />
              <img
                className="hero-video hero-poster-media"
                src={heroPosterDesktopUrl}
                alt={heroAltText}
                width="1440"
                height="900"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                sizes="100vw"
              />
            </picture>
          )}
          <video
            ref={heroVideoRef}
            className="hero-video hero-motion-media"
            autoPlay
            loop
            muted
            playsInline
            webkit-playsinline="true"
            preload="auto"
            poster={useMobileHeroVideo ? '' : heroPosterMobileUrl}
            aria-hidden="true"
            onPlaying={() => setShouldPlayHeroVideo(true)}
            onPlay={() => setShowHeroVideoHint(false)}
            onCanPlay={() => heroVideoRef.current?.play()?.catch(() => {})}
            onLoadedData={() => heroVideoRef.current?.play()?.catch(() => {})}
            src={useMobileHeroVideo ? heroMobileVideoUrl : heroDesktopVideoUrl}
          >
          </video>
          {!shouldPlayHeroVideo && showHeroVideoHint ? (
            <button
              className="hero-video-hint"
              type="button"
              onClick={() => heroVideoRef.current?.play()?.catch(() => {})}
            >
              Putar video
            </button>
          ) : null}
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-cta-row">
              <Link
                className="cta-button cta-button-outline"
                to="/all-products"
                onClick={() =>
                  trackEvent('hero_cta_click', {
                    button_text: landingPageContent.hero.secondaryCta,
                    button_type: 'link',
                    intent: 'lihat-katalog',
                    destination: '/all-products',
                  })
                }
              >
                {landingPageContent.hero.secondaryCta}
              </Link>
              <button
                className="cta-button cta-button-light"
                onClick={() =>
                  handleWhatsAppClick(
                    'hero_cta_click',
                    {
                      button_text: landingPageContent.hero.primaryCta,
                      button_type: 'whatsapp',
                      intent: 'konsultasi-gratis',
                    },
                    heroMessageFallback,
                  )
                }
              >
                {landingPageContent.hero.primaryCta}
                <ChevronRight size={18} />
              </button>
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
            <span>{sectionContent.unified_direction_eyebrow}</span>
            <h2>{sectionContent.unified_direction_title}</h2>
            <p>{sectionContent.unified_direction_body}</p>
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

        <section className="content-block section-plain" id="products" data-reveal>
          <CategoryFilterHeader
            categories={categoryNavigationItems}
            activeCategoryId={activeCatalogFilter}
            activeCategoryLabel={activeCategory?.label}
            productCount={visibleProducts.length}
            onCategorySelect={handleCatalogFilterClick}
            getCategoryHref={(category) =>
              category.id === 'all' ? '/all-products' : `/all-products?category=${category.id}`
            }
          />

          <div className="discover-grid" data-reveal-item>
            <div className="quality-panel">
              <div className="quality-panel-heading">
                <h3>{sectionContent.quality_panel_title}</h3>
                <p>{sectionContent.quality_panel_body}</p>
              </div>

              <div className="quality-grid">
                {landingPageContent.qualityHighlights.map((item) => {
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

          {consentPreferences.personalization === 'accepted' && personalizedProducts.length > 0 ? (
            <div className="personalized-products-panel" data-reveal-item>
              <div className="personalized-products-heading">
                <div>
                  <span>{t('homepage.personalized.eyebrow')}</span>
                  <h3>{t('homepage.personalized.title')}</h3>
                </div>
                <p>{t('homepage.personalized.body')}</p>
              </div>

              <div className="personalized-products-grid">
                {personalizedProducts.map((product) => (
                  <article className={`product-card tone-${product.tone}`} key={`personalized-${product.slug}`}>
                    <Link
                      className="product-card-link"
                      to={`/produk/${product.slug}`}
                      state={{ product }}
                      onClick={() => handleProductNavigate(product)}
                      aria-label={`${t('common.detail')} ${product.name}`}
                    >
                      <div className="product-media">
                        <img
                          className="product-image product-image-primary"
                          src={product.image}
                          alt={product.name}
                          width="800"
                          height="1000"
                          loading="lazy"
                          decoding="async"
                          style={{ objectPosition: product.imagePosition || 'center center' }}
                        />
                        {product.gallery?.[1] ? (
                          <img
                            className="product-image product-image-hover"
                            src={product.gallery[1]}
                            alt={`${product.name} alternate`}
                            width="800"
                            height="1000"
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
                    <button
                      className="wishlist-button"
                      type="button"
                      aria-label={`${t('cart.addToCart')} ${product.name}`}
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <div className="product-slider" data-reveal-item>
            <div className="product-slider-toolbar">
              <p className="product-slider-meta">
                {t('homepage.slider.meta', { count: visibleProducts.length })}
              </p>
              <Link
                className="product-slider-view-all"
                to={activeCatalogFilter === 'all' ? '/all-products' : `/all-products?category=${activeCatalogFilter}`}
                onClick={() =>
                  trackEvent('catalog_view_all_click', {
                    active_filter: activeCatalogFilter,
                    destination: '/all-products',
                  })
                }
              >
                {t('homepage.slider.viewAll')}
              </Link>
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
                      aria-label={`${t('common.detail')} ${product.name}`}
                    >
                      <div className="product-media">
                        <img
                          className="product-image product-image-primary"
                          src={product.image}
                          alt={product.name}
                          width="800"
                          height="1000"
                          loading="lazy"
                          decoding="async"
                          style={{ objectPosition: product.imagePosition || 'center center' }}
                        />
                        {product.gallery?.[1] ? (
                          <img
                            className="product-image product-image-hover"
                            src={product.gallery[1]}
                            alt={`${product.name} alternate`}
                            width="800"
                            height="1000"
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
                    <button
                      className="wishlist-button"
                      type="button"
                      aria-label={`${t('cart.addToCart')} ${product.name}`}
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart size={18} />
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
              <span>{sectionContent.client_brands_eyebrow}</span>
              <h2>{sectionContent.client_brands_title}</h2>
            </div>
            <p className="client-brand-caption">{sectionContent.client_brands_body}</p>
          </div>

          <div className="client-brand-grid">
            {landingPageContent.clientBrands.map((brand, index) => {
              const brandKey = `${brand.label}-${brand.url || brand.image || index}`

              return (
              brand.url ? (
                <a
                  className="client-brand-card"
                  key={brandKey}
                  data-reveal-item
                  href={brand.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {brand.image ? (
                    <img className="client-brand-logo" src={brand.image} alt={brand.label} width="132" height="44" loading="lazy" decoding="async" />
                  ) : (
                    <span>{brand.label}</span>
                  )}
                </a>
              ) : (
                <article className="client-brand-card" key={brandKey} data-reveal-item>
                  {brand.image ? (
                    <img className="client-brand-logo" src={brand.image} alt={brand.label} width="132" height="44" loading="lazy" decoding="async" />
                  ) : (
                    <span>{brand.label}</span>
                  )}
                </article>
              )
              )
            })}
          </div>
        </section>

        <section className="content-block section-soft process-layout" id="process" data-reveal>
          <div className="section-heading" data-reveal-item>
            <span>{sectionContent.process_eyebrow}</span>
            <h2>{sectionContent.process_title}</h2>
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
              <span>{sectionContent.pricing_eyebrow}</span>
              <h2>{sectionContent.pricing_title}</h2>
            </div>
            <a href="#final-cta">
              {t('homepage.pricing.requestQuote')}
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
                  {t('homepage.pricing.askThisPackage')}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="final-panel section-accent" id="final-cta" data-reveal>
          <div className="final-panel-copy" data-reveal-item>
            <span>{sectionContent.final_cta_eyebrow}</span>
            <h2>{sectionContent.final_cta_title}</h2>
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
                {t('homepage.finalCta.wholesaleConsultation')}
              </button>
              <Link
                className="cta-button cta-button-light"
                to="/all-products"
                onClick={() =>
                  trackEvent('hero_cta_click', {
                    button_text: t('homepage.finalCta.shopCollection'),
                    button_type: 'link',
                    intent: 'shop-collection',
                    destination: '/all-products',
                  })
                }
              >
                {t('homepage.finalCta.shopCollection')}
              </Link>
            </div>
          </div>

          <form className="lead-form" onSubmit={submitLead} data-reveal-item>
            <input
              aria-label={t('homepage.leadForm.name')}
              placeholder={t('homepage.leadForm.name')}
              value={leadForm.name}
              onChange={(event) => setLeadForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <input
              aria-label={t('homepage.leadForm.phone')}
              placeholder={t('homepage.leadForm.phone')}
              value={leadForm.phone}
              onChange={(event) => setLeadForm((current) => ({ ...current, phone: event.target.value }))}
              required
            />
            <input
              aria-label={t('homepage.leadForm.organization')}
              placeholder={t('homepage.leadForm.organizationPlaceholder')}
              value={leadForm.organization}
              onChange={(event) =>
                setLeadForm((current) => ({ ...current, organization: event.target.value }))
              }
            />
            <div className="lead-form-row">
              <input
                aria-label={t('homepage.leadForm.quantity')}
                placeholder={t('homepage.leadForm.quantityPlaceholder')}
                value={leadForm.quantity_estimate}
                onChange={(event) =>
                  setLeadForm((current) => ({
                    ...current,
                    quantity_estimate: event.target.value,
                  }))
                }
              />
              <select
                aria-label={t('homepage.leadForm.segment')}
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
              {leadStatus.state === 'loading' ? t('common.submitting') : t('common.submitInquiry')}
            </button>
            {leadStatus.message ? <small className={`lead-status ${leadStatus.state}`}>{leadStatus.message}</small> : null}
          </form>
        </section>

        <section className="content-block section-plain faq-layout" id="faq" data-reveal>
          <div className="section-heading heading-inline" data-reveal-item>
            <div>
              <span>{sectionContent.faq_eyebrow}</span>
              <h2>{sectionContent.faq_title}</h2>
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
                style={{ backgroundImage: `url(${faqVisualUrl})` }}
              />
              <div className="faq-visual-copy">
                <span>{sectionContent.faq_visual_title}</span>
                <p>{sectionContent.faq_visual_body}</p>
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
              <span>{sectionContent.contact_eyebrow}</span>
              <h2>{sectionContent.contact_title}</h2>
            </div>
            <a href={companyProfile.address.mapUrl} target="_blank" rel="noreferrer">
              {t('common.openMaps')}
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
                <h3>{t('homepage.contact.teamTitle')}</h3>
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
              {t('common.openLocationInMaps')}
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
              {t('common.chatWhatsAppNow')}
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
        bottomText={landingPageContent.footerBottomText}
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

export default App
