import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Clock3, FileCheck2, MessageCircleMore, ShieldCheck, Truck } from 'lucide-react'
import './App.css'
import { trackEvent } from './lib/analytics'

const fallbackLandingPage = {
  brand: {
    name: 'AHR Jersey',
    tagline:
      'Spesialis jersey full printing untuk tim, komunitas, sekolah, dan corporate.',
    whatsapp_number: '6281234567890',
    response_time: 'Balas dalam 5-15 menit pada jam kerja',
  },
  hero: {
    eyebrow: 'Solusi Jersey B2B',
    headline:
      'Jersey full printing untuk tim dan komunitas, mulai 10 pcs, produksi 7 hari kerja.',
    subheadline:
      'Dapatkan 2x revisi desain gratis, sample fisik sebelum produksi massal, dan pengiriman gratis Jabodetabek untuk order yang memenuhi syarat.',
    primary_cta: 'Konsultasi Gratis',
    secondary_cta: 'Lihat Katalog',
    stats: [
      { value: '500+', label: 'tim & komunitas' },
      { value: '7 HK', label: 'estimasi produksi' },
      { value: '0%', label: 'target reject' },
      { value: '34+', label: 'kota pengiriman' },
    ],
  },
  trust_bar: [
    'Sample fisik tersedia',
    'Revisi desain gratis 2x',
    'File desain tersimpan',
    'Pengiriman nasional',
    'Garansi cetak ulang',
  ],
  catalog_categories: [
    { id: 'all', label: 'Semua' },
    { id: 'futsal', label: 'Futsal' },
    { id: 'sekolah', label: 'Sekolah' },
    { id: 'turnamen', label: 'Turnamen' },
    { id: 'reseller', label: 'Reseller' },
    { id: 'corporate', label: 'Corporate' },
    { id: 'komunitas', label: 'Komunitas' },
  ],
  catalog_items: [
    {
      id: 'jersey-futsal-pro',
      category: 'futsal',
      name: 'Jersey Tim Futsal Pro',
      material: 'Dryfit premium, full printing',
      moq: 'Min. 10 pcs',
      price_hint: 'Mulai 95rb/pcs',
      lead: 'Ideal untuk tim futsal yang butuh tampilan kompetitif dan repeat order cepat.',
    },
    {
      id: 'paket-sekolah',
      category: 'sekolah',
      name: 'Paket Event Sekolah',
      material: 'Dryfit aktif, warna aman, ukuran lengkap',
      moq: 'Min. 30 pcs',
      price_hint: 'Mulai 87rb/pcs',
      lead: 'Cocok untuk class meeting, ospek, dan kegiatan antarsekolah.',
    },
    {
      id: 'jersey-turnamen',
      category: 'turnamen',
      name: 'Jersey Event Turnamen',
      material: 'Dryfit ventilated + nomor peserta',
      moq: 'Min. 50 pcs',
      price_hint: 'Mulai 82rb/pcs',
      lead: 'Dirancang untuk EO yang butuh volume, timeline ketat, dan invoice.',
    },
    {
      id: 'reseller-pack',
      category: 'reseller',
      name: 'Paket Reseller Daerah',
      material: 'Harga tier + file desain permanen',
      moq: 'Min. 100 pcs',
      price_hint: 'Harga khusus reseller',
      lead: 'Untuk agen yang mengejar stabilitas margin dan kemudahan reorder.',
    },
    {
      id: 'corporate-active',
      category: 'corporate',
      name: 'Corporate Activewear',
      material: 'Premium texture + branding presisi',
      moq: 'Min. 25 pcs',
      price_hint: 'Mulai 120rb/pcs',
      lead: 'Pilihan untuk kantor, HRD, dan outing perusahaan dengan kebutuhan PO resmi.',
    },
    {
      id: 'community-bundle',
      category: 'komunitas',
      name: 'Bundle Komunitas Multi-Tim',
      material: 'Desain seri + sizing mix',
      moq: 'Min. 30 pcs',
      price_hint: 'Diskon volume komunitas',
      lead: 'Memudahkan komunitas dengan beberapa divisi atau chapter.',
    },
  ],
  process_steps: [
    {
      title: 'Konsultasi',
      detail: 'Diskusi kebutuhan, jumlah, timeline, dan referensi desain lewat WhatsApp.',
    },
    {
      title: 'Desain 2 Hari',
      detail: 'Tim desain menyiapkan draft awal dan memfasilitasi 2x revisi tanpa biaya.',
    },
    {
      title: 'Produksi 7 HK',
      detail: 'Setelah approval, produksi berjalan dengan QC warna dan material.',
    },
    {
      title: 'Kirim',
      detail: 'Pesanan dikirim ke seluruh Indonesia dengan update status yang jelas.',
    },
  ],
  testimonials: [
    {
      name: 'Coach Rian',
      organization: 'Tornado Futsal Depok',
      order_context: 'Order 24 pcs untuk liga komunitas',
      quote:
        'Warnanya sesuai mockup, cutting aman untuk semua pemain, dan repeat order berikutnya jauh lebih cepat.',
    },
    {
      name: 'Nadya Putri',
      organization: 'EO Campus Cup Bandung',
      order_context: 'Order 120 pcs untuk panitia & peserta',
      quote:
        'Kami butuh invoice, deadline rapat, dan hasil yang rapi. Semua terpenuhi tanpa drama produksi.',
    },
    {
      name: 'Arief Nugroho',
      organization: 'Komunitas Lari Selatan',
      order_context: 'Order 60 pcs untuk 3 chapter',
      quote:
        'Paling membantu saat urus ukuran campur dan file desain disimpan untuk batch berikutnya.',
    },
  ],
  guarantees: [
    'Garansi cetak ulang bila hasil warna meleset signifikan dari approval.',
    'File desain disimpan permanen untuk reorder tanpa biaya setup.',
    'Estimasi produksi jelas dan dikonfirmasi sebelum DP.',
    'Bisa bantu invoice dan kebutuhan administrasi order tim.',
  ],
  pricing_packages: [
    {
      id: 'starter',
      name: 'Starter',
      quantity: '10 pcs',
      price: 'Mulai 95rb/pcs',
      featured: false,
      features: ['1 desain utama', '2x revisi gratis', 'Cocok untuk tim baru'],
    },
    {
      id: 'tim',
      name: 'Tim',
      quantity: '25 pcs',
      price: 'Mulai 88rb/pcs',
      featured: true,
      features: [
        'Harga paling ideal untuk komunitas aktif',
        'Sample fisik opsional',
        'Prioritas slot produksi',
      ],
    },
    {
      id: 'komunitas',
      name: 'Komunitas',
      quantity: '100 pcs',
      price: 'Custom volume pricing',
      featured: false,
      features: [
        'Tier khusus reseller/EO',
        'Bisa split ukuran dan chapter',
        'Pendampingan reorder',
      ],
    },
  ],
  faqs: [
    {
      question: 'Berapa minimal order untuk jersey custom?',
      answer:
        'Minimal order reguler dimulai dari 10 pcs, dengan opsi harga tier untuk volume yang lebih besar.',
    },
    {
      question: 'Apakah bisa minta sample fisik sebelum produksi massal?',
      answer:
        'Bisa. Kami sediakan opsi sample fisik untuk order tertentu agar approval lebih aman sebelum produksi utama.',
    },
    {
      question: 'Berapa lama estimasi produksi?',
      answer:
        'Estimasi standar adalah 7 hari kerja setelah desain final disetujui dan DP diterima.',
    },
    {
      question: 'Apakah revisi desain dikenakan biaya?',
      answer:
        'Dua kali revisi awal gratis. Jika ada revisi besar tambahan, akan kami konfirmasi biayanya terlebih dahulu.',
    },
    {
      question: 'Bagaimana jika hasil warna meleset?',
      answer:
        'Kami punya garansi cetak ulang untuk kasus hasil warna yang meleset signifikan dari approval final.',
    },
    {
      question: 'Apakah bisa dibuatkan invoice atau dokumen PO?',
      answer:
        'Bisa. Kami melayani kebutuhan invoice, purchase order, dan administrasi dasar untuk sekolah maupun corporate.',
    },
    {
      question: 'Kalau ingin reorder, apakah harus desain ulang?',
      answer:
        'Tidak. File desain disimpan sehingga reorder jauh lebih cepat dan tidak ada biaya setup ulang.',
    },
  ],
}

const sectionIcons = [
  <MessageCircleMore key="consult" size={18} />,
  <FileCheck2 key="design" size={18} />,
  <Clock3 key="production" size={18} />,
  <Truck key="shipping" size={18} />,
]

const guaranteeIcons = [
  <ShieldCheck key="g1" size={18} />,
  <FileCheck2 key="g2" size={18} />,
  <Clock3 key="g3" size={18} />,
  <MessageCircleMore key="g4" size={18} />,
]

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

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

function App() {
  const [landingPage, setLandingPage] = useState(fallbackLandingPage)
  const [activeCategory, setActiveCategory] = useState('all')
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    organization: '',
    quantity_estimate: '',
    segment: 'klub-futsal',
  })
  const [leadStatus, setLeadStatus] = useState({ state: 'idle', message: '' })

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
          trackEvent('scroll_depth', { depth })
        }
      })
    }

    const handleUnload = () => {
      const durationInSeconds = Math.round((Date.now() - start) / 1000)
      trackEvent('time_on_page', { duration_in_seconds: durationInSeconds })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('beforeunload', handleUnload)

    if (apiBaseUrl) {
      fetch(`${apiBaseUrl}/api/b2b/landing-page`)
        .then((response) => response.json())
        .then((payload) => {
          if (payload?.data) {
            setLandingPage(payload.data)
          }
        })
        .catch(() => {
          setLandingPage(fallbackLandingPage)
        })
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [])

  const filteredCatalog = useMemo(() => {
    if (activeCategory === 'all') {
      return landingPage.catalog_items
    }

    return landingPage.catalog_items.filter((item) => item.category === activeCategory)
  }, [activeCategory, landingPage.catalog_items])

  const categories = useMemo(() => {
    const hasAll = landingPage.catalog_categories.some((category) => category.id === 'all')

    if (hasAll) {
      return landingPage.catalog_categories
    }

    return [{ id: 'all', label: 'Semua' }, ...landingPage.catalog_categories]
  }, [landingPage.catalog_categories])

  const handleWhatsAppClick = (eventName, ctaContext, message) => {
    trackEvent(eventName, { cta_context: ctaContext })
    window.open(
      buildWhatsAppUrl(landingPage.brand.whatsapp_number, message, ctaContext),
      '_blank',
      'noopener,noreferrer',
    )
  }

  const submitLead = async (event) => {
    event.preventDefault()
    setLeadStatus({ state: 'loading', message: 'Mengirim data prospek...' })

    const payload = {
      ...leadForm,
      source_page: window.location.pathname,
      cta_context: 'lead-form',
      referrer_url: document.referrer || undefined,
      ...getUtmParams(),
    }

    if (!apiBaseUrl) {
      setLeadStatus({
        state: 'success',
        message: 'Form lokal tersimpan. Lanjutkan ke WhatsApp untuk percakapan cepat.',
      })
      handleWhatsAppClick(
        'final_cta_wa_click',
        'lead-form-fallback',
        `Halo AHR Jersey, saya ${leadForm.name} dari ${leadForm.organization || 'tim/instansi'}, ingin konsultasi order sekitar ${leadForm.quantity_estimate || 'belum ditentukan'} pcs.`,
      )
      return
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/b2b/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Gagal menyimpan lead')
      }

      setLeadStatus({
        state: 'success',
        message: 'Prospek berhasil tersimpan. Kami buka WhatsApp agar Anda bisa lanjut lebih cepat.',
      })

      trackEvent('final_cta_wa_click', { cta_context: 'lead-form' })
      window.open(
        buildWhatsAppUrl(
          landingPage.brand.whatsapp_number,
          `Halo AHR Jersey, saya ${leadForm.name} dari ${leadForm.organization || 'tim/instansi'}, ingin konsultasi order sekitar ${leadForm.quantity_estimate || 'belum ditentukan'} pcs.`,
          'lead-form',
        ),
        '_blank',
        'noopener,noreferrer',
      )
    } catch {
      setLeadStatus({
        state: 'error',
        message: 'Lead belum tersimpan ke server. Anda tetap bisa lanjut via WhatsApp.',
      })
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#hero">
          <span className="brand-mark">AHR</span>
          <div>
            <strong>{landingPage.brand.name}</strong>
            <span>{landingPage.brand.tagline}</span>
          </div>
        </a>

        <nav className="nav-links">
          <a href="#katalog">Katalog</a>
          <a href="#proses">Proses</a>
          <a href="#harga">Harga</a>
          <a href="#faq">FAQ</a>
        </nav>

        <button
          className="button button-primary"
          onClick={() =>
            handleWhatsAppClick(
              'nav_wa_click',
              'navbar',
              'Halo AHR Jersey, saya mau konsultasi gratis untuk kebutuhan jersey tim.',
            )
          }
        >
          Konsultasi Gratis
        </button>
      </header>

      <main>
        <section className="hero-section" id="hero">
          <div className="hero-copy">
            <span className="eyebrow">{landingPage.hero.eyebrow}</span>
            <h1>{landingPage.hero.headline}</h1>
            <p>{landingPage.hero.subheadline}</p>

            <div className="hero-actions">
              <button
                className="button button-primary"
                onClick={() =>
                  handleWhatsAppClick(
                    'hero_cta_click',
                    'hero-primary',
                    'Halo AHR Jersey, saya tertarik konsultasi order jersey B2B.',
                  )
                }
              >
                {landingPage.hero.primary_cta}
              </button>
              <a
                className="button button-secondary"
                href="#katalog"
                onClick={() => trackEvent('hero_cta_click', { cta_context: 'hero-secondary' })}
              >
                {landingPage.hero.secondary_cta}
              </a>
            </div>

            <div className="stats-grid">
              {landingPage.hero.stats.map((stat) => (
                <article className="stat-card" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>

          <aside className="hero-panel">
            <div className="panel-badge">Slot Produksi Minggu Ini</div>
            <h2>Amankan harga sebelum material naik.</h2>
            <p>
              Tim kami bantu dari diskusi kebutuhan, draft desain, sampai pengiriman. Cocok
              untuk klub, sekolah, event organizer, reseller, dan corporate.
            </p>
            <ul>
              <li>MOQ fleksibel mulai 10 pcs</li>
              <li>2x revisi desain tanpa biaya</li>
              <li>Support invoice, reorder, dan pengiriman nasional</li>
            </ul>
          </aside>
        </section>

        <section className="trust-bar">
          {landingPage.trust_bar.map((item) => (
            <div className="trust-pill" key={item}>
              <ShieldCheck size={16} />
              <span>{item}</span>
            </div>
          ))}
        </section>

        <section className="section-block" id="katalog">
          <div className="section-heading">
            <span className="eyebrow">Katalog B2B</span>
            <h2>Pilih solusi yang paling dekat dengan skala order Anda.</h2>
            <p>
              Setiap kategori dirancang untuk keberatan yang berbeda: MOQ, kecepatan produksi,
              administrasi, sampai kebutuhan reorder.
            </p>
          </div>

          <div className="category-filter">
            {categories.map((category) => (
              <button
                key={category.id}
                className={category.id === activeCategory ? 'filter-chip active' : 'filter-chip'}
                onClick={() => {
                  setActiveCategory(category.id)
                  trackEvent('catalog_filter_click', { category: category.id })
                }}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="catalog-grid">
            {filteredCatalog.map((item) => (
              <article className="catalog-card" key={item.id}>
                <span className="catalog-tag">{item.category}</span>
                <h3>{item.name}</h3>
                <p>{item.lead}</p>
                <dl>
                  <div>
                    <dt>Material</dt>
                    <dd>{item.material}</dd>
                  </div>
                  <div>
                    <dt>MOQ</dt>
                    <dd>{item.moq}</dd>
                  </div>
                  <div>
                    <dt>Estimasi Harga</dt>
                    <dd>{item.price_hint}</dd>
                  </div>
                </dl>
                <button
                  className="button button-dark"
                  onClick={() =>
                    handleWhatsAppClick(
                      'product_card_click',
                      item.id,
                      `Halo AHR Jersey, saya mau tanya harga untuk ${item.name}.`,
                    )
                  }
                >
                  Tanya Harga
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block process-section" id="proses">
          <div className="section-heading">
            <span className="eyebrow">Alur Produksi</span>
            <h2>Proses simpel, jelas, dan cocok untuk pembelian tim.</h2>
          </div>

          <div className="process-grid">
            {landingPage.process_steps.map((step, index) => (
              <article className="process-card" key={step.title}>
                <div className="process-index">
                  <span>0{index + 1}</span>
                  {sectionIcons[index]}
                </div>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block testimonial-section">
          <div className="section-heading">
            <span className="eyebrow">Social Proof</span>
            <h2>Testimoni yang relevan untuk pembeli B2B.</h2>
          </div>

          <div className="testimonial-grid">
            {landingPage.testimonials.map((testimonial) => (
              <article className="testimonial-card" key={testimonial.name}>
                <p className="quote">“{testimonial.quote}”</p>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.organization}</span>
                <small>{testimonial.order_context}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="guarantee-strip">
          {landingPage.guarantees.map((guarantee, index) => (
            <article className="guarantee-card" key={guarantee}>
              {guaranteeIcons[index]}
              <p>{guarantee}</p>
            </article>
          ))}
        </section>

        <section className="section-block pricing-section" id="harga">
          <div className="section-heading">
            <span className="eyebrow">Paket Harga B2B</span>
            <h2>Pilih paket berdasarkan skala order dan kebutuhan follow-up.</h2>
          </div>

          <div className="pricing-grid">
            {landingPage.pricing_packages.map((pack) => (
              <article
                className={pack.featured ? 'pricing-card featured' : 'pricing-card'}
                key={pack.id}
              >
                <span className="pricing-quantity">{pack.quantity}</span>
                <h3>{pack.name}</h3>
                <strong>{pack.price}</strong>
                <ul>
                  {pack.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button
                  className={pack.featured ? 'button button-primary' : 'button button-secondary'}
                  onClick={() =>
                    handleWhatsAppClick(
                      'pricing_cta_click',
                      pack.id,
                      `Halo AHR Jersey, saya tertarik dengan paket ${pack.name}.`,
                    )
                  }
                >
                  Ambil Penawaran
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block faq-section" id="faq">
          <div className="section-heading">
            <span className="eyebrow">FAQ</span>
            <h2>Jawaban untuk keberatan yang paling sering muncul.</h2>
          </div>

          <div className="faq-list">
            {landingPage.faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index

              return (
                <article className={isOpen ? 'faq-item open' : 'faq-item'} key={faq.question}>
                  <button
                    className="faq-button"
                    onClick={() => {
                      setOpenFaqIndex(isOpen ? -1 : index)
                      trackEvent('faq_open', { question: faq.question })
                    }}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown size={18} />
                  </button>
                  {isOpen ? <p>{faq.answer}</p> : null}
                </article>
              )
            })}
          </div>
        </section>

        <section className="final-cta">
          <div>
            <span className="eyebrow">Siap Diskusi?</span>
            <h2>Masuk ke WhatsApp dan kami bantu hitung paket terbaik untuk tim Anda.</h2>
            <p>
              {landingPage.brand.response_time}. Cantumkan jumlah pcs, deadline, dan referensi
              desain agar kami bisa kasih estimasi lebih cepat.
            </p>
          </div>
          <form className="lead-form" onSubmit={submitLead}>
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
              placeholder="Nama tim / instansi"
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
                <option value="klub-futsal">Klub Futsal</option>
                <option value="sekolah">Sekolah / Kampus</option>
                <option value="eo">EO Turnamen</option>
                <option value="reseller">Reseller</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
            <button className="button button-primary" type="submit" disabled={leadStatus.state === 'loading'}>
              {leadStatus.state === 'loading' ? 'Mengirim...' : 'Kirim & Lanjut WhatsApp'}
            </button>
            {leadStatus.message ? <small className={`lead-status ${leadStatus.state}`}>{leadStatus.message}</small> : null}
          </form>
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>{landingPage.brand.name}</strong>
          <p>{landingPage.brand.tagline}</p>
        </div>
        <div className="footer-links">
          <a href="#hero">Home</a>
          <a href="#katalog">Katalog</a>
          <a href="#harga">Harga</a>
          <a href="#faq">FAQ</a>
        </div>
      </footer>
    </div>
  )
}

export default App
