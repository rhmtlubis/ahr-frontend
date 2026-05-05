import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Building2, MessageCircleMore, ShieldCheck, Users } from 'lucide-react'
import './App.css'
import './B2BLandingPage.css'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { getApiUrl } from './lib/api'
import { captureMarketingAttribution, getAttributionParams } from './lib/attribution'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import useDocumentTitle from './lib/useDocumentTitle'
import { trackEvent } from './lib/analytics'

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
    whatsapp_number: '6281234567890',
    response_time: 'Balas dalam 5-15 menit pada jam kerja',
  },
  hero: {
    eyebrow: 'Solusi Jersey B2B',
    title: 'Kontak & kerja sama untuk kebutuhan vendor, procurement, dan bulk order.',
    body:
      'Cocok untuk partnership reseller, kerja sama vendor, kebutuhan corporate, sekolah, EO, dan tim yang butuh respons cepat langsung ke WhatsApp.',
    primaryCta: 'Hubungi Kami',
    secondaryCta: 'Lihat Alur Kerja',
  },
  stats: [
    { value: '500+', label: 'proyek bulk order' },
    { value: '7 HK', label: 'estimasi produksi' },
    { value: '2x', label: 'revisi desain gratis' },
    { value: 'WhatsApp', label: 'respon cepat' },
  ],
  trust_bar: [
    'Sample fisik tersedia',
    'File desain tersimpan untuk reorder',
    'Pengiriman nasional',
  ],
  process_steps: [
    { title: 'Brief', detail: 'Sampaikan kebutuhan, jumlah, deadline, dan referensi desain.' },
    { title: 'Desain', detail: 'Tim kami menyiapkan draft dan revisi sesuai kebutuhan proyek.' },
    { title: 'Produksi', detail: 'Order masuk line produksi setelah approval final.' },
    { title: 'Kirim', detail: 'Produk dikirim dengan update status yang jelas.' },
  ],
  faqs: [
    { question: 'Minimal order berapa?', answer: 'Untuk jalur B2B, kami bisa bantu sesuaikan kebutuhan dan volume order.' },
    { question: 'Bisa kerja sama vendor?', answer: 'Bisa. Silakan isi form, lalu tim kami follow up via WhatsApp.' },
  ],
  section_content: {
    client_brands_eyebrow: 'Kenapa AHR',
    client_brands_title: 'Siap untuk kerja sama yang butuh respon cepat dan alur jelas.',
    client_brands_body: 'Fokus kami adalah mempermudah buyer B2B dari awal briefing sampai barang diterima.',
    process_eyebrow: 'Alur kerja',
    process_title: 'Jalur order dibuat singkat agar tim procurement lebih cepat ambil keputusan.',
    pricing_eyebrow: 'Kontak & Kerja Sama',
    pricing_title: 'Hubungi Kami',
    final_cta_eyebrow: 'Hubungi Kami',
    final_cta_title: 'Layanan B2B & Kerja Sama Vendor.',
    faq_eyebrow: 'FAQ',
    faq_title: 'Pertanyaan yang paling sering muncul sebelum lanjut ke WhatsApp.',
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
      mapUrl: '#contact',
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

async function submitB2BLead(payload) {
  const response = await fetch(getApiUrl('/api/b2b/leads'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      data?.message ||
        Object.values(data?.errors || {}).flat()[0] ||
        'Gagal menyimpan lead B2B',
    )
  }

  return data?.data || null
}

export default function B2BLandingPage() {
  const { language } = useLanguage()
  const [pageContent, setPageContent] = useState(b2bFallbackContent)
  const [form, setForm] = useState(defaultForm)
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  useDocumentTitle(
    'Kontak & Kerja Sama',
    'Landing B2B untuk kerja sama vendor, procurement, reseller, sekolah, EO, dan corporate yang butuh respon cepat via WhatsApp.',
    {
      canonicalPath: '/kontak-kerja-sama',
      image: '/og-preview.png',
      imageAlt: 'Kontak dan kerja sama AHR',
      keywords: 'kontak kerja sama, b2b jersey, vendor apparel, procurement, wholesale, WhatsApp AHR',
      locale: language,
      type: 'website',
    },
  )

  useEffect(() => {
    captureMarketingAttribution()

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
            eyebrow: payload.data.hero?.eyebrow || b2bFallbackContent.hero.eyebrow,
            title: payload.data.hero?.headline || b2bFallbackContent.hero.title,
            body: payload.data.hero?.subheadline || b2bFallbackContent.hero.body,
            primaryCta: payload.data.hero?.primary_cta || b2bFallbackContent.hero.primaryCta,
            secondaryCta: payload.data.hero?.secondary_cta || b2bFallbackContent.hero.secondaryCta,
          },
          stats: Array.isArray(payload.data.hero?.stats) && payload.data.hero.stats.length > 0 ? payload.data.hero.stats : b2bFallbackContent.stats,
          trust_bar: Array.isArray(payload.data.trust_bar) && payload.data.trust_bar.length > 0 ? payload.data.trust_bar : b2bFallbackContent.trust_bar,
          process_steps: Array.isArray(payload.data.process_steps) && payload.data.process_steps.length > 0 ? payload.data.process_steps : b2bFallbackContent.process_steps,
          faqs: Array.isArray(payload.data.faqs) && payload.data.faqs.length > 0 ? payload.data.faqs : b2bFallbackContent.faqs,
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
  }, [language])

  const contactProfile = pageContent.brand
  const companyProfile = pageContent.companyProfile
  const footerGroups = pageContent.footerGroups
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ state: 'loading', message: 'Mengirim data prospek...' })

    const attribution = getAttributionParams()
    const payload = {
      ...form,
      source_page: window.location.pathname,
      cta_context: 'b2b-landing-form',
      referrer_url: document.referrer || window.location.href,
      ...attribution,
    }

    try {
      await submitB2BLead(payload)
      trackEvent('b2b_landing_lead_submitted', {
        button_location: 'b2b-landing-form',
        buyer_type: form.buyer_type,
        market_type: form.market_type,
      })
      window.open(
        buildWhatsAppUrl(contactProfile.whatsapp_number, formMessage, 'b2b-landing-form'),
        '_blank',
        'noopener,noreferrer',
      )
      setStatus({ state: 'success', message: 'Lead tersimpan. WhatsApp sudah dibuka.' })
      setForm(defaultForm)
    } catch (error) {
      setStatus({
        state: 'error',
        message: error.message || 'Lead gagal tersimpan. Anda tetap bisa lanjut ke WhatsApp.',
      })
      window.open(
        buildWhatsAppUrl(contactProfile.whatsapp_number, formMessage, 'b2b-landing-form-fallback'),
        '_blank',
        'noopener,noreferrer',
      )
    }
  }

  return (
    <div className="app-shell b2b-landing-shell">
      <SiteHeader
        brandHref="/"
        navGroups={pageContent.navGroups}
        ticker={pageContent.ticker}
        utilityMessage={pageContent.utilityMessage}
        utilityLinks={pageContent.utilityLinks}
        cartItemCount={0}
        primaryActionLabel="Hubungi Kami"
        onPrimaryAction={() => {
          window.location.hash = '#final-cta'
        }}
      />

      <main className="b2b-landing-main">
        <section className="b2b-hero">
          <div className="b2b-hero-copy">
            <span className="section-kicker">{pageContent.hero.eyebrow}</span>
            <h1>{pageContent.hero.title}</h1>
            <p>{pageContent.hero.body}</p>
            <div className="hero-cta-row">
              <a className="cta-button cta-button-dark" href="#final-cta">
                {pageContent.hero.primaryCta}
              </a>
              <a className="cta-button cta-button-light" href={buildWhatsAppUrl(contactProfile.whatsapp_number, formMessage, 'hero-whatsapp')}>
                {pageContent.hero.secondaryCta}
              </a>
            </div>
          </div>

          <div className="b2b-hero-card">
            <div className="b2b-hero-card-top">
              <Building2 size={20} />
              <strong>Kontak & Kerja Sama</strong>
            </div>
            <p>Fokus pada B2B, reseller, vendor, dan procurement dengan respon cepat ke WhatsApp.</p>
            <div className="b2b-trust-list">
              {pageContent.trust_bar.map((item) => (
                <div key={item}>
                  <CheckCircle2 size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
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

        <section className="content-block section-soft b2b-form-section" id="final-cta" data-reveal>
          <div className="section-heading heading-inline">
            <div>
              <span>{pageContent.section_content.final_cta_eyebrow}</span>
              <h2>{pageContent.section_content.final_cta_title}</h2>
            </div>
            <a href={buildWhatsAppUrl(contactProfile.whatsapp_number, formMessage, 'final-cta')}>Respon cepat ke WhatsApp <ArrowRight size={16} /></a>
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
                  placeholder="Estimasi pcs"
                  value={form.quantity_estimate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, quantity_estimate: event.target.value }))
                  }
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

      <SiteFooter
        companyProfile={companyProfile}
        contactProfile={contactProfile}
        defaultMapLabel="Buka lokasi AHR Printing di Google Maps"
        footerGroups={footerGroups}
        footerMessage={formMessage}
        bottomText={pageContent.footerBottomText}
        onWhatsAppClick={(message) => {
          window.open(buildWhatsAppUrl(contactProfile.whatsapp_number, message, 'footer'), '_blank', 'noopener,noreferrer')
        }}
      />
    </div>
  )
}
