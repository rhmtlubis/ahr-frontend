import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, MapPin, MessageCircleMore, ShieldCheck, Users } from 'lucide-react'
import {
  b2bPricingDisclaimer,
  b2bPricingTiers,
  b2bProcessSteps,
  b2bWorkshop,
  getB2bFaqsForPath,
  b2bServicesByPath,
} from './lib/b2bLandingTrustContent'
import './App.css'
import './B2BLandingPage.css'
import CookieConsentBanner from './components/layout/CookieConsentBanner'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { getApiUrl, saveB2BLead } from './lib/api'
import { captureMarketingAttribution, getAttributionParams } from './lib/attribution'
import {
  initializeAnalyticsAndTrackCurrentPage,
  setEnhancedConversionUserData,
  trackEvent,
  updateConsent,
} from './lib/analytics'
import { getConsentPreferences, setConsentPreferences } from './lib/consent'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { getB2bLandingVariant, b2bSocialLinks, b2bPortfolioItems, b2bEmbedLinks } from './lib/b2bLandingVariants'
import { useLocation } from 'react-router-dom'
import { FaInstagram, FaTiktok } from 'react-icons/fa6'
import { clearPersonalizationData } from './lib/personalization'
import { formatB2bQuantity, validateB2bQuantity } from './lib/b2bLeadForm'
import useDocumentTitle from './lib/useDocumentTitle'

const defaultForm = {
  name: '',
  phone: '',
  organization: '',
  quantity_estimate: '',
  notes: '',
  segment: 'school-corporate',
  buyer_type: 'b2b',
  market_type: 'b2b',
}

const b2bFallbackContent = {
  brand: {
    name: 'AHR Jersey',
    lockup: 'CV AHR Printing',
    tagline: 'Spesialis jersey full printing untuk tim, komunitas, sekolah, dan corporate.',
    whatsapp_number: '6287711868290',
    response_time: 'Balas dalam 5-15 menit pada jam kerja',
  },
  hero: {
    eyebrow: 'Solusi Jersey B2B',
    title: 'Kontak & kerja sama untuk kebutuhan vendor, procurement, dan bulk order.',
    body:
      'Cocok untuk partnership reseller, kerja sama vendor, kebutuhan corporate, sekolah, EO, dan tim yang butuh respons cepat langsung ke WhatsApp.',
    primaryCta: 'Kirim Brief Order',
    secondaryCta: 'Chat WhatsApp Sekarang',
  },
  formTitle: 'Brief order B2B',
  formSubtitle: 'Isi singkat — kami balas estimasi via WhatsApp.',
  stats: [
    { value: '500+', label: 'proyek bulk order' },
    { value: '200+', label: 'tim & komunitas' },
    { value: '5 pcs', label: 'MOQ mulai' },
    { value: '2-3 Hari', label: 'estimasi produksi' },
  ],
  trust_bar: [
    'Free desain & 2x revisi',
    'Full print sublimasi',
    'Produksi 2-3 hari kerja',
    'Pengiriman nasional',
    'MOQ mulai 5 pcs',
  ],
  testimonials: [
    {
      quote: 'Proses order tim futsal kami jadi lebih cepat. Desain direvisi sampai cocok dan hasil printing-nya tajam.',
      author: 'Koordinator Tim Futsal',
      org: 'Komunitas Jabodetabek',
    },
    {
      quote: 'MOQ fleksibel dan respon WhatsApp cepat. Cocok untuk kebutuhan jersey komunitas yang butuh deadline ketat.',
      author: 'PIC Event Organizer',
      org: 'EO Olahraga',
    },
    {
      quote: 'Sebagai vendor apparel, AHR membantu kami handle order bulk dengan alur yang jelas dari brief sampai kirim.',
      author: 'Owner Reseller Apparel',
      org: 'Partner B2B',
    },
    {
      quote: 'Jersey seragam sekolah kami selesai dalam 3 hari setelah desain fix. Kualitas bahan dan jahitannya rapi.',
      author: 'Guru Olahraga',
      org: 'SMA di Bandung Raya',
    },
    {
      quote: 'Repeat order ke-4 untuk jersey klub. File desain tersimpan, jadi reorder tim baru tinggal ganti nama dan nomor.',
      author: 'Manager Klub Bola',
      org: 'Liga Amatir Lokal',
    },
    {
      quote: 'Butuh jersey corporate run event cepat — tim AHR bantu desain dan produksi dalam 2 hari kerja. On time.',
      author: 'HR Corporate',
      org: 'Perusahaan Manufaktur',
    },
    {
      quote: 'Hasil sublimnya awet, warna tidak mudah pudar setelah beberapa kali cuci. Tim komunitas lari kami puas.',
      author: 'Ketua Komunitas',
      org: 'Running Community',
    },
    {
      quote: 'Cek dulu portofolionya di Instagram, langsung yakin. Hasil real-nya sesuai yang ditampilkan di feed.',
      author: 'Admin Komunitas Voli',
      org: 'Tim Putri Regional',
    },
  ],
  social_links: b2bSocialLinks,
  portfolio_items: b2bPortfolioItems,
  embed_links: b2bEmbedLinks,
  highlights: [
    { title: 'Free desain', detail: 'Tim desain AHR bantu dari nol atau dari file referensi Anda.' },
    { title: 'Full print sublim', detail: 'Hasil warna tajam, nyaman dipakai, cocok untuk tim & komunitas.' },
    { title: 'MOQ mulai 5 pcs', detail: 'Cocok untuk tim kecil, komunitas, hingga order bulk corporate.' },
    { title: 'Produksi cepat', detail: 'Estimasi 2-3 hari kerja setelah desain disetujui.' },
  ],
  process_steps: b2bProcessSteps,
  faqs: getB2bFaqsForPath('/kontak-kerja-sama'),
  pricing_tiers: b2bPricingTiers,
  pricing_disclaimer: b2bPricingDisclaimer,
  workshop: b2bWorkshop,
  services: b2bServicesByPath['/kontak-kerja-sama'],
  intent_blocks: [],
  section_content: {
    client_brands_eyebrow: 'Kenapa AHR',
    client_brands_title: 'Siap untuk kerja sama yang butuh respon cepat dan alur jelas.',
    client_brands_body: 'Fokus kami adalah mempermudah buyer B2B dari awal briefing sampai barang diterima.',
    process_eyebrow: 'Alur kerja',
    process_title: 'Dari brief sampai kirim — 4 langkah yang jelas.',
    pricing_eyebrow: 'Harga transparan',
    pricing_title: 'Acuan harga jersey custom full print sublim.',
    services_eyebrow: 'Layanan',
    services_title: 'Yang bisa kami kerjakan untuk tim Anda.',
    workshop_eyebrow: 'Lokasi workshop',
    workshop_title: 'Produksi langsung di Katapang, Bandung.',
    final_cta_eyebrow: 'Hubungi Kami',
    final_cta_title: 'Kirim brief — dapat estimasi via WhatsApp.',
    faq_eyebrow: 'FAQ',
    faq_title: 'Pertanyaan sebelum order jersey custom.',
    contact_eyebrow: 'Kontak',
    contact_title: 'Respon cepat langsung ke WhatsApp.',
  },
  footerGroups: [
    {
      title: 'Navigasi',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Profil', href: '/profil' },
        { label: 'Kontak & Kerja Sama', href: '/kontak-kerja-sama' },
      ],
    },
  ],
  footerBottomText: '© 2026 AHR Printing.',
  companyProfile: {
    about: 'CV AHR Printing melayani produksi apparel custom dan kerja sama B2B.',
    address: {
      label: 'Workshop & Kantor AHR Printing',
      line: 'Jl. Bojong Tanjung No.19, Katapang, Kabupaten Bandung, Jawa Barat 40921',
      mapUrl: 'https://maps.app.goo.gl/V6fxMXch8Q5bcwrGA',
    },
  },
  utilityLinks: [],
  ticker: 'Kontak & Kerja Sama Vendor',
  utilityMessage: 'Layanan B2B & kerja sama vendor.',
  navGroups: [],
}

function buildWhatsAppUrl(phoneNumber, message, ctaContext) {
  const attribution = getAttributionParams()
  const body = [
    message,
    `Sumber: ${attribution.utm_source || 'direct'} / ${attribution.utm_medium || 'none'}`,
    `Konteks CTA: ${ctaContext}`,
  ].join('\n\n')

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(body)}`
}

export default function B2BLandingPage() {
  const { language } = useLanguage()
  const { pathname } = useLocation()
  const landingVariant = getB2bLandingVariant(pathname)
  const [pageContent, setPageContent] = useState(b2bFallbackContent)
  const [form, setForm] = useState(defaultForm)
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [consentPreferences, setConsentPreferencesState] = useState({
    analytics: 'unknown',
    personalization: 'unknown',
  })
  const [showStickyContact, setShowStickyContact] = useState(true)
  const [showInstagramEmbed, setShowInstagramEmbed] = useState(false)
  const formSectionRef = useRef(null)
  const instagramEmbedRef = useRef(null)
  const instagramSectionRef = useRef(null)
  const instagramScalerRef = useRef(null)

  useDocumentTitle(
    landingVariant?.title || 'AHR Corporation Kontak & Kerja Sama',
    landingVariant?.description ||
      'Landing B2B AHR Corporation untuk kerja sama vendor, procurement, reseller, sekolah, EO, dan corporate yang butuh respon cepat via WhatsApp.',
    {
      canonicalPath: landingVariant?.canonicalPath || '/kontak-kerja-sama',
      image: '/og-preview.png',
      imageAlt: landingVariant?.title || 'Kontak dan kerja sama AHR Corporation',
      keywords:
        landingVariant?.keywords ||
        'ahr corporation, kontak kerja sama, b2b jersey, vendor apparel, procurement, wholesale, WhatsApp AHR Corporation',
      locale: language,
      type: 'website',
    },
  )

  useEffect(() => {
    setConsentPreferencesState(getConsentPreferences())
  }, [])

  useEffect(() => {
    const variant = getB2bLandingVariant(pathname)
    if (!variant) {
      return
    }

    setPageContent((current) => ({
      ...current,
      hero: {
        ...current.hero,
        eyebrow: variant.hero?.eyebrow || current.hero.eyebrow,
        title: variant.hero?.title || current.hero.title,
        body: variant.hero?.body || current.hero.body,
        primaryCta: variant.hero?.primaryCta || current.hero.primaryCta,
        secondaryCta: variant.hero?.secondaryCta || current.hero.secondaryCta,
      },
      formTitle: variant.formTitle || current.formTitle,
      formSubtitle: variant.formSubtitle || current.formSubtitle,
      stats: variant.stats || current.stats,
      trust_bar: variant.trustBar || current.trust_bar,
      testimonials: variant.testimonials || current.testimonials,
      highlights: variant.highlights || current.highlights,
      social_links: variant.socialLinks || current.social_links,
      portfolio_items: variant.portfolioItems || current.portfolio_items,
      embed_links: variant.embedLinks || current.embed_links,
      faqs: variant.faqs || current.faqs,
      process_steps: variant.processSteps || current.process_steps,
      pricing_tiers: variant.pricingTiers || current.pricing_tiers,
      pricing_disclaimer: variant.pricingDisclaimer || current.pricing_disclaimer,
      workshop: variant.workshop || current.workshop,
      services: variant.services || current.services,
      intent_blocks: variant.intentBlocks || current.intent_blocks || [],
    }))
  }, [pathname])

  useEffect(() => {
    const formSection = formSectionRef.current
    if (!formSection) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyContact(!entry.isIntersecting)
      },
      {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -72px 0px',
      },
    )

    observer.observe(formSection)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const shell = instagramEmbedRef.current
    const scaler = instagramScalerRef.current
    if (!showInstagramEmbed || !shell || !scaler || typeof ResizeObserver === 'undefined') {
      return undefined
    }

    const INSTAGRAM_EMBED_WIDTH = 540
    const INSTAGRAM_EMBED_HEIGHT = 780

    const syncScale = () => {
      if (window.matchMedia('(max-width: 640px)').matches) {
        scaler.style.transform = ''
        shell.style.height = ''
        return
      }

      const available = shell.clientWidth
      const scale = Math.max(1, available / INSTAGRAM_EMBED_WIDTH)
      scaler.style.transform = `scale(${scale})`
      shell.style.height = `${INSTAGRAM_EMBED_HEIGHT * scale}px`
    }

    syncScale()
    const observer = new ResizeObserver(syncScale)
    observer.observe(shell)
    window.addEventListener('resize', syncScale)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncScale)
    }
  }, [showInstagramEmbed])

  useEffect(() => {
    const section = instagramSectionRef.current
    if (!section || showInstagramEmbed) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowInstagramEmbed(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [showInstagramEmbed])

  useEffect(() => {

    fetch(getApiUrl(`/api/b2b/landing-page?locale=${language}`), {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (!ok || !payload?.data) {
          return
        }

        const normalizedContent = getLandingChromeContent(payload.data, { hashPrefix: '/', locale: language })

        setPageContent({
          ...b2bFallbackContent,
          ...normalizedContent,
          brand: {
            ...b2bFallbackContent.brand,
            ...normalizedContent.brand,
          },
          hero: {
            ...b2bFallbackContent.hero,
            eyebrow: landingVariant?.hero?.eyebrow || payload.data.hero?.eyebrow || b2bFallbackContent.hero.eyebrow,
            title: landingVariant?.hero?.title || payload.data.hero?.headline || b2bFallbackContent.hero.title,
            body: landingVariant?.hero?.body || payload.data.hero?.subheadline || b2bFallbackContent.hero.body,
            primaryCta:
              landingVariant?.hero?.primaryCta ||
              payload.data.hero?.primary_cta ||
              b2bFallbackContent.hero.primaryCta,
            secondaryCta:
              landingVariant?.hero?.secondaryCta ||
              payload.data.hero?.secondary_cta ||
              b2bFallbackContent.hero.secondaryCta,
          },
          formTitle: landingVariant?.formTitle || b2bFallbackContent.formTitle,
          formSubtitle: landingVariant?.formSubtitle || b2bFallbackContent.formSubtitle,
          stats: landingVariant?.stats || (Array.isArray(payload.data.hero?.stats) && payload.data.hero.stats.length > 0 ? payload.data.hero.stats : b2bFallbackContent.stats),
          trust_bar: landingVariant?.trustBar || (Array.isArray(payload.data.trust_bar) && payload.data.trust_bar.length > 0 ? payload.data.trust_bar : b2bFallbackContent.trust_bar),
          testimonials: landingVariant?.testimonials || b2bFallbackContent.testimonials,
          highlights: landingVariant?.highlights || b2bFallbackContent.highlights,
          social_links: landingVariant?.socialLinks || b2bFallbackContent.social_links,
          portfolio_items: landingVariant?.portfolioItems || b2bFallbackContent.portfolio_items,
          embed_links: landingVariant?.embedLinks || b2bFallbackContent.embed_links,
          process_steps: landingVariant?.processSteps || b2bFallbackContent.process_steps,
          faqs: landingVariant?.faqs || b2bFallbackContent.faqs,
          pricing_tiers: landingVariant?.pricingTiers || b2bFallbackContent.pricing_tiers,
          pricing_disclaimer: landingVariant?.pricingDisclaimer || b2bFallbackContent.pricing_disclaimer,
          workshop: landingVariant?.workshop || b2bFallbackContent.workshop,
          services: landingVariant?.services || b2bFallbackContent.services,
          intent_blocks: landingVariant?.intentBlocks || b2bFallbackContent.intent_blocks,
          section_content: {
            ...b2bFallbackContent.section_content,
            ...(normalizedContent.sectionContent || {}),
          },
          footerGroups:
            Array.isArray(normalizedContent.footerGroups) && normalizedContent.footerGroups.length > 0
              ? normalizedContent.footerGroups
              : b2bFallbackContent.footerGroups,
          footerBottomText: normalizedContent.footerBottomText || b2bFallbackContent.footerBottomText,
          companyProfile: {
            ...b2bFallbackContent.companyProfile,
            ...normalizedContent.companyProfile,
          },
          utilityLinks:
            Array.isArray(normalizedContent.utilityLinks) && normalizedContent.utilityLinks.length > 0
              ? normalizedContent.utilityLinks
              : b2bFallbackContent.utilityLinks,
          ticker: normalizedContent.ticker || b2bFallbackContent.ticker,
          utilityMessage: normalizedContent.utilityMessage || b2bFallbackContent.utilityMessage,
          navGroups: normalizedContent.navGroups || b2bFallbackContent.navGroups,
        })
      })
      .catch(() => {})
  }, [language, landingVariant])

  const contactProfile = pageContent.brand
  const companyProfile = pageContent.companyProfile
  const footerGroups = pageContent.footerGroups
  const applyConsentPreferences = (nextPreferences) => {
    setConsentPreferences(nextPreferences)
    setConsentPreferencesState(nextPreferences)

    updateConsent(nextPreferences)

    if (nextPreferences.analytics === 'accepted') {
      initializeAnalyticsAndTrackCurrentPage()
    }

    if (nextPreferences.personalization === 'rejected') {
      clearPersonalizationData()
    }

    trackEvent('cookie_consent_updated', {
      analytics_consent: nextPreferences.analytics,
      personalization_consent: nextPreferences.personalization,
      personalization_scope: 'b2b-landing',
      source_page: window.location.pathname,
    })
  }

  const formMessage = useMemo(
    () =>
      [
        'Halo AHR, saya ingin diskusi kerja sama B2B.',
        `Nama: ${form.name || '-'}`,
        `Perusahaan / Instansi: ${form.organization || '-'}`,
        `Kebutuhan: ${form.quantity_estimate || '-'} pcs`,
        `Catatan: ${form.notes || '-'}`,
      ].join('\n'),
    [form],
  )

  const trackB2bLeadConversion = async (buttonLocation) => {
    // Enhanced Conversions: hash phone before Ads conversion fires.
    if (form.phone?.trim()) {
      await setEnhancedConversionUserData({ phone: form.phone })
    }

    trackEvent('b2b_landing_lead_submitted', {
      button_location: buttonLocation,
      buyer_type: form.buyer_type,
      market_type: form.market_type,
    })
  }

  const openB2bWhatsApp = async (ctaContext, message = formMessage) => {
    await trackB2bLeadConversion(ctaContext)
    window.open(
      buildWhatsAppUrl(contactProfile.whatsapp_number, message, ctaContext),
      '_blank',
      'noopener,noreferrer',
    )
  }

  const handleWhatsAppCtaClick = (event, ctaContext) => {
    event.preventDefault()
    void openB2bWhatsApp(ctaContext)
  }

  const handleSubmit = async (event, ctaContext = 'b2b-landing-form') => {
    event.preventDefault()

    const quantityError = validateB2bQuantity(form.quantity_estimate)
    if (quantityError) {
      setStatus({ state: 'error', message: quantityError })
      return
    }

    setStatus({ state: 'loading', message: 'Mengirim data prospek...' })

    const attribution = getAttributionParams()
    const payload = {
      ...form,
      quantity_estimate: `${formatB2bQuantity(form.quantity_estimate)} pcs`,
      source_page: window.location.pathname,
      cta_context: ctaContext,
      referrer_url: document.referrer || window.location.href,
      ...attribution,
    }

    try {
      await saveB2BLead(payload)
      await openB2bWhatsApp(ctaContext)
      setStatus({ state: 'success', message: 'Lead tersimpan. WhatsApp sudah dibuka.' })
      setForm(defaultForm)
    } catch (error) {
      setStatus({
        state: 'error',
        message: error.message || 'Lead gagal tersimpan. Anda tetap bisa lanjut ke WhatsApp.',
      })
      await openB2bWhatsApp(`${ctaContext}-fallback`)
    }
  }

  return (
    <div className={`app-shell b2b-landing-shell${showStickyContact ? ' b2b-landing-shell--sticky-dock' : ''}`}>
      <SiteHeader
        brandHref="/"
        navGroups={pageContent.navGroups}
        ticker={pageContent.ticker}
        utilityMessage={pageContent.utilityMessage}
        utilityLinks={pageContent.utilityLinks}
        cartItemCount={0}
        primaryActionLabel="Hubungi Kami"
        onPrimaryAction={() => {
          window.location.hash = '#hero-lead'
        }}
      />

      <main className="b2b-landing-main">
        <section className="b2b-hero">
          <div className="b2b-hero-copy">
            <span className="section-kicker">{pageContent.hero.eyebrow}</span>
            <h1>{pageContent.hero.title}</h1>
            <p>{pageContent.hero.body}</p>
            <div className="hero-cta-row b2b-hero-cta-row">
              <a className="cta-button cta-button-dark" href="#hero-lead">
                {pageContent.hero.primaryCta}
              </a>
              <a
                className="cta-button cta-button-light b2b-hero-wa-cta"
                href={buildWhatsAppUrl(contactProfile.whatsapp_number, formMessage, 'hero-whatsapp')}
                onClick={(event) => handleWhatsAppCtaClick(event, 'hero-whatsapp')}
              >
                {pageContent.hero.secondaryCta}
              </a>
            </div>
          </div>

          <div className="b2b-hero-card" id="hero-lead" ref={formSectionRef}>
            <div className="b2b-hero-card-top">
              <MessageCircleMore size={20} />
              <strong>{pageContent.formTitle || 'Brief order B2B'}</strong>
            </div>
            <p className="b2b-hero-form-subtitle">
              {pageContent.formSubtitle || 'Isi singkat — kami balas estimasi via WhatsApp.'}
            </p>
            <form
              className="lead-form b2b-lead-form b2b-hero-lead-form"
              onSubmit={(event) => handleSubmit(event, 'b2b-hero-form')}
            >
              <input
                required
                name="name"
                placeholder="Nama PIC"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <input
                required
                name="phone"
                placeholder="No. WhatsApp"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <input
                name="organization"
                placeholder="Tim / perusahaan"
                value={form.organization}
                onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
              />
              <input
                required
                name="quantity_estimate"
                placeholder="Jumlah (min. 5 pcs)"
                value={form.quantity_estimate}
                onChange={(e) => setForm((f) => ({ ...f, quantity_estimate: e.target.value }))}
              />
              <button className="cta-button cta-button-dark" type="submit" disabled={status.state === 'loading'}>
                {status.state === 'loading' ? 'Mengirim...' : pageContent.hero.primaryCta}
              </button>
            </form>
            <div className="b2b-trust-list b2b-hero-trust-compact">
              {pageContent.trust_bar.slice(0, 4).map((item) => (
                <div key={item}>
                  <CheckCircle2 size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            {status.message ? (
              <p className={`b2b-hero-form-status b2b-hero-form-status--${status.state}`}>{status.message}</p>
            ) : null}
          </div>
        </section>

        <section className="content-block section-soft b2b-stats" data-reveal>
          {pageContent.stats.map((stat) => (
            <article className="b2b-stat-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </section>

        <section className="content-block section-plain b2b-highlights" data-reveal>
          <div className="section-heading">
            <span>Kenapa AHR</span>
            <h2>Keunggulan yang dibutuhkan tim, komunitas, dan corporate.</h2>
          </div>
          <div className="b2b-highlight-grid">
            {pageContent.highlights.map((item) => (
              <article className="b2b-highlight-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        {pageContent.intent_blocks?.length ? (
          <section className="content-block section-soft b2b-intent" data-reveal>
            <div className="section-heading">
              <span>Detail layanan</span>
              <h2>Yang biasanya ditanyakan sebelum order.</h2>
            </div>
            <div className="b2b-intent-grid">
              {pageContent.intent_blocks.map((item) => (
                <article className="b2b-intent-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="content-block section-soft b2b-pricing" id="pricing" data-reveal>
          <div className="section-heading">
            <span>{pageContent.section_content.pricing_eyebrow}</span>
            <h2>{pageContent.section_content.pricing_title}</h2>
          </div>
          <div className="b2b-pricing-grid">
            {pageContent.pricing_tiers.map((tier) => (
              <article className="b2b-pricing-card" key={tier.qty}>
                <span className="b2b-pricing-qty">{tier.qty}</span>
                <strong>{tier.price}</strong>
                <p>{tier.note}</p>
              </article>
            ))}
          </div>
          <p className="b2b-pricing-note">{pageContent.pricing_disclaimer}</p>
        </section>

        <section className="content-block section-plain b2b-services" data-reveal>
          <div className="section-heading">
            <span>{pageContent.section_content.services_eyebrow}</span>
            <h2>{pageContent.section_content.services_title}</h2>
          </div>
          <ul className="b2b-services-list">
            {pageContent.services.map((service) => (
              <li key={service}>
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="content-block section-soft b2b-testimonials" id="testimonials" data-reveal>
          <div className="section-heading">
            <span>Dipercaya tim & komunitas</span>
            <h2>Testimoni dari partner yang sudah produksi jersey bersama AHR.</h2>
          </div>
          <div className="b2b-testimonial-grid">
            {pageContent.testimonials.map((item) => (
              <article className="b2b-testimonial-card" key={`${item.author}-${item.org}`}>
                <p>"{item.quote}"</p>
                <div>
                  <strong>{item.author}</strong>
                  <span>{item.org}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-block section-soft b2b-portfolio" data-reveal>
          <div className="section-heading">
            <span>Portofolio produksi</span>
            <h2>Hasil nyata dari workshop AHR — bukan mockup.</h2>
          </div>
          <div className="b2b-portfolio-grid">
            {pageContent.portfolio_items.map((item) => (
              <a
                className="b2b-portfolio-card"
                href={pageContent.embed_links.instagramProfile}
                key={`${item.src}-${item.caption}`}
                rel="noreferrer"
                target="_blank"
                onClick={() =>
                  trackEvent('b2b_portfolio_click', {
                    source_page: window.location.pathname,
                    destination: 'instagram',
                  })
                }
              >
                <img alt={item.alt} loading="lazy" src={item.src} />
                <span>{item.caption}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="content-block section-plain b2b-social-proof" id="instagram" data-reveal ref={instagramSectionRef}>
          <div className="section-heading">
            <span>Portofolio & review</span>
            <h2>Lihat hasil produksi nyata di Instagram AHR.</h2>
          </div>
          <p className="b2b-social-proof-lead">
            Feed resmi @ahr.printingsublimasi — portfolio printing, proses workshop, dan review pelanggan.
          </p>

          <div className="b2b-instagram-embed" ref={instagramEmbedRef}>
            <div className="b2b-instagram-embed-scaler" ref={instagramScalerRef}>
              {showInstagramEmbed ? (
                <iframe
                  title="Instagram AHR Printing Sublimasi"
                  src={pageContent.embed_links.instagramEmbed || 'https://www.instagram.com/ahr.printingsublimasi/embed'}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="encrypted-media; clipboard-write"
                />
              ) : (
                <div className="b2b-instagram-embed-placeholder" aria-hidden="true">
                  Memuat portofolio Instagram…
                </div>
              )}
            </div>
          </div>

          <div className="b2b-social-grid">
            {pageContent.social_links.map((link) => {
              const Icon = link.platform === 'instagram' ? FaInstagram : FaTiktok

              return (
                <a
                  className={`b2b-social-card b2b-social-card--${link.platform}`}
                  href={link.href}
                  key={link.platform}
                  rel="noreferrer"
                  target="_blank"
                  onClick={() =>
                    trackEvent('b2b_social_link_click', {
                      platform: link.platform,
                      source_page: window.location.pathname,
                    })
                  }
                >
                  <div className="b2b-social-card-top">
                    <Icon size={22} aria-hidden="true" />
                    <div>
                      <strong>{link.label}</strong>
                      <span>{link.handle}</span>
                    </div>
                  </div>
                  <p>{link.description}</p>
                </a>
              )
            })}
          </div>
          <div className="b2b-embed-actions">
            <a
              className="b2b-embed-action b2b-embed-action--instagram"
              href={pageContent.embed_links.instagramProfile}
              rel="noreferrer"
              target="_blank"
              onClick={() =>
                trackEvent('b2b_instagram_embed_open_profile', {
                  source_page: window.location.pathname,
                })
              }
            >
              <FaInstagram size={18} aria-hidden="true" />
              Buka profil Instagram
            </a>
            <a
              className="b2b-embed-action b2b-embed-action--tiktok"
              href={pageContent.embed_links.tiktokProfile}
              rel="noreferrer"
              target="_blank"
            >
              <FaTiktok size={18} aria-hidden="true" />
              Tonton proses produksi di TikTok
            </a>
          </div>
        </section>

        <section className="content-block section-soft b2b-process" id="process" data-reveal>
          <div className="section-heading">
            <span>{pageContent.section_content.process_eyebrow}</span>
            <h2>{pageContent.section_content.process_title}</h2>
          </div>
          <div className="b2b-process-grid">
            {pageContent.process_steps.map((step, index) => (
              <article className="b2b-process-card" key={step.title}>
                <span>0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-block section-plain b2b-workshop" id="workshop" data-reveal>
          <div className="section-heading">
            <span>{pageContent.section_content.workshop_eyebrow}</span>
            <h2>{pageContent.section_content.workshop_title}</h2>
          </div>
          <div className="b2b-workshop-card">
            <div className="b2b-workshop-card-top">
              <MapPin size={20} aria-hidden="true" />
              <div>
                <strong>{pageContent.workshop.title}</strong>
                <p>{pageContent.workshop.line}</p>
              </div>
            </div>
            <ul className="b2b-workshop-points">
              {pageContent.workshop.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <a
              className="cta-button cta-button-light"
              href={pageContent.workshop.mapUrl}
              rel="noreferrer"
              target="_blank"
            >
              Buka di Google Maps
            </a>
          </div>
        </section>

        <section className="content-block section-soft b2b-form-section" id="final-cta" data-reveal>
          <div className="section-heading heading-inline">
            <div>
              <span>{pageContent.section_content.final_cta_eyebrow}</span>
              <h2>{pageContent.section_content.final_cta_title}</h2>
            </div>
            <a
              href={buildWhatsAppUrl(contactProfile.whatsapp_number, formMessage, 'final-cta')}
              onClick={(event) => handleWhatsAppCtaClick(event, 'final-cta')}
            >
              Respon cepat ke WhatsApp <ArrowRight size={16} />
            </a>
          </div>

          <div className="b2b-form-layout">
            <form className="lead-form b2b-lead-form" onSubmit={handleSubmit}>
              <input
                aria-label="Nama"
                placeholder="Nama"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
              <input
                aria-label="Nomor WhatsApp"
                placeholder="Nomor WhatsApp"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                required
              />
              <input
                aria-label="Perusahaan / Instansi"
                placeholder="Perusahaan / Instansi"
                value={form.organization}
                onChange={(event) => setForm((current) => ({ ...current, organization: event.target.value }))}
              />
              <div className="lead-form-row">
                <input
                  aria-label="Estimasi pcs"
                  placeholder="Jumlah pcs (min. 5) *"
                  inputMode="numeric"
                  min="5"
                  value={form.quantity_estimate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, quantity_estimate: event.target.value }))
                  }
                  required
                />
                <select
                  aria-label="Jenis kebutuhan"
                  value={form.segment}
                  onChange={(event) => setForm((current) => ({ ...current, segment: event.target.value }))}
                >
                  <option value="school-corporate">Sekolah / Corporate</option>
                  <option value="team-order">Tim / Komunitas</option>
                  <option value="reseller-collab">Reseller / Kolaborasi</option>
                  <option value="vendor-partnership">Kerja Sama Vendor</option>
                </select>
              </div>
              <textarea
                aria-label="Catatan"
                placeholder="Ceritakan kebutuhan singkat"
                rows="4"
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
              <button className="submit-button" type="submit" disabled={status.state === 'loading'}>
                {status.state === 'loading' ? 'Mengirim...' : 'Hubungi Kami'}
              </button>
              {status.message ? <small className={`lead-status ${status.state}`}>{status.message}</small> : null}
            </form>

            <aside className="b2b-contact-card" id="contact">
              <div>
                <span>{pageContent.section_content.contact_eyebrow}</span>
                <h3>{pageContent.section_content.contact_title}</h3>
                <p>{contactProfile.response_time}</p>
              </div>
              <div className="b2b-contact-points">
                <div>
                  <MessageCircleMore size={18} />
                  <span>Layanan B2B & Kerja Sama Vendor.</span>
                </div>
                <div>
                  <ShieldCheck size={18} />
                  <span>Respon cepat langsung ke WhatsApp.</span>
                </div>
                <div>
                  <Users size={18} />
                  <span>Siap untuk reseller, procurement, dan corporate.</span>
                </div>
              </div>
              <a
                className="cta-button cta-button-dark"
                href={buildWhatsAppUrl(contactProfile.whatsapp_number, formMessage, 'contact-card')}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => handleWhatsAppCtaClick(event, 'contact-card')}
              >
                Hubungi Kami
              </a>
            </aside>
          </div>
        </section>

        <section className="content-block section-plain b2b-faq" data-reveal>
          <div className="section-heading">
            <span>{pageContent.section_content.faq_eyebrow}</span>
            <h2>{pageContent.section_content.faq_title}</h2>
          </div>
          <div className="b2b-faq-list">
            {pageContent.faqs.map((faq) => (
              <article className="b2b-faq-item" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div
        className={`b2b-sticky-contact${showStickyContact ? ' is-visible' : ''}`}
        aria-hidden={!showStickyContact}
      >
        <a className="b2b-sticky-contact-form" href="#hero-lead">
          Isi Form
        </a>
        <button
          className="b2b-sticky-contact-wa"
          type="button"
          onClick={() => {
            void openB2bWhatsApp('sticky-mobile-dock')
          }}
        >
          <MessageCircleMore size={18} aria-hidden="true" />
          WhatsApp
        </button>
      </div>

      <SiteFooter
        companyProfile={companyProfile}
        contactProfile={contactProfile}
        defaultMapLabel="Buka lokasi AHR Printing di Google Maps"
        footerGroups={footerGroups}
        footerMessage={formMessage}
        bottomText={pageContent.footerBottomText}
        onWhatsAppClick={(message) => {
          openB2bWhatsApp('footer', message)
        }}
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
