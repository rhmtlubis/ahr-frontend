import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  Heart,
  MapPin,
  LayoutGrid,
  Menu,
  MessageCircleMore,
  PackageCheck,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  User,
  X,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './App.css'
import { trackEvent } from './lib/analytics'
import { getApiUrl } from './lib/api'

const homepageContent = {
  brand: {
    name: 'AHR',
    lockup: 'CV AHR Printing',
    tagline: 'Apparel dan percetakan kustom dengan spesialisasi sublimasi jersey.',
    whatsapp_number: '6281234567890',
    response_time: 'Balas cepat di jam kerja untuk kebutuhan retail maupun bulk order',
  },
  companyProfile: {
    about:
      'Kami adalah perusahaan spesialis pembuatan jersey custom terbaik yang berlokasi di Katapang, Kabupaten Bandung. Dengan pengalaman dan dedikasi tinggi dalam industri printing, kami siap memenuhi kebutuhan jersey untuk tim olahraga, komunitas, sekolah, event, hingga kebutuhan personal. Kami mengutamakan kualitas bahan, ketepatan desain, dan kepuasan dalam hasil produksi. Dapatkan layanan cepat, desain menarik, dan hasil cetak yang awet hanya di AHR PRINTING.',
    history:
      'Sejak tahun 2020, AHR PRINTING hadir dengan tekad dan keyakinan usaha yang berfokus pada layanan printing cetak jersey. Berawal dari langkah sederhana, kami menjadikan komitmen, integritas, dan konsistensi sebagai fondasi utama dalam perjalanan bisnis kami. Dalam setiap proses, kami berpegang pada nilai jujur, amanah, dan penuh tanggung jawab untuk melayani pelanggan sekaligus membangun kemitraan jangka panjang.',
    commitment:
      'Kini AHR PRINTING berkembang menjadi penyedia cetak jersey yang dipercaya karena selalu mengutamakan kualitas, ketepatan waktu, dan kepuasan pelanggan. Dengan dukungan tim yang solid dan semangat inovasi, kami berkomitmen menghadirkan produk berkualitas prima dengan hasil cetak yang tajam, tahan lama, desain yang sesuai identitas pelanggan, serta pelayanan ramah dan profesional. Kami juga terus berinvestasi pada pembaruan mesin dan peralatan produksi untuk menjaga produktivitas dan daya saing perusahaan.',
    reasons: [
      {
        title: 'Terpercaya',
        detail:
          'Sejak berdiri pada tahun 2020, AHR PRINTING tumbuh dengan reputasi yang dibangun dari kejujuran, tanggung jawab, kualitas hasil cetak, dan ketepatan waktu pengerjaan.',
      },
      {
        title: 'Responsif',
        detail:
          'Tim kami siap merespons kebutuhan pelanggan dengan cepat, memberi solusi yang sesuai, dan memastikan setiap proses pemesanan berjalan lancar dari awal sampai selesai.',
      },
      {
        title: 'Service Excellent',
        detail:
          'Kami menghadirkan pelayanan yang ramah, profesional, dan berorientasi pada kepuasan sehingga hubungan jangka panjang dengan pelanggan dapat terjaga dengan baik.',
      },
    ],
    vision:
      'Menciptakan jersey berkualitas tinggi, terpercaya dengan kualitas terbaik dan pelayanan unggul.',
    missions: [
      'Memberikan jersey berkualitas tinggi dengan standar cetak terbaik.',
      'Menyediakan desain yang kreatif dan inovatif.',
      'Menjaga ketepatan waktu dalam setiap proses produksi.',
      'Menjalin hubungan jangka panjang dengan pelanggan melalui layanan profesional.',
    ],
    address: {
      label: 'Workshop & Kantor AHR Printing',
      line: 'Jl. Bojong Tanjung No.19, RW.005, Sangkanhurip, Kec. Katapang, Kabupaten Bandung, Jawa Barat 40921',
      mapUrl: 'https://maps.app.goo.gl/68jDN3VNQZbLxG4o6',
    },
  },
  utilityLinks: [
    { label: 'Tentang Kami', href: '#about' },
    { label: 'Visi & Misi', href: '#vision-mission' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Alamat', href: '#contact' },
  ],
  footerGroups: [
    {
      title: 'Navigasi',
      links: [
        { label: 'Home', href: '#hero' },
        { label: 'Tentang Kami', href: '#about' },
        { label: 'Produk', href: '#products' },
        { label: 'Kontak', href: '#contact' },
      ],
    },
    {
      title: 'Layanan',
      links: [
        { label: 'Custom Jersey', href: '#products' },
        { label: 'Corporate Kit', href: '#products' },
        { label: 'Reorder Support', href: '#process' },
        { label: 'Konsultasi Desain', href: '#final-cta' },
      ],
    },
    {
      title: 'Informasi',
      links: [
        { label: 'Sejarah Kami', href: '#about' },
        { label: 'Visi & Misi', href: '#vision-mission' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Alamat Lengkap', href: '#contact' },
      ],
    },
  ],
  navGroups: [
    {
      id: 'custom-jersey',
      label: 'CUSTOM JERSEY',
      columns: [
        {
          title: 'Produk Utama',
          links: [
            { label: 'Jersey Tim', href: '#products' },
            { label: 'Jersey Event', href: '#products' },
            { label: 'Corporate Kit', href: '#products' },
            { label: 'Order Personal', href: '#final-cta' },
          ],
        },
        {
          title: 'Alur Pesan',
          links: [
            { label: 'Konsultasi Awal', href: '#process' },
            { label: 'Desain', href: '#process' },
            { label: 'Produksi', href: '#process' },
            { label: 'Pengiriman', href: '#contact' },
          ],
        },
      ],
      feature: {
        title: 'Mulai dari kebutuhan nyata',
        body: 'Custom jersey AHR dirancang untuk tim, komunitas, sekolah, event, dan kebutuhan personal dengan hasil yang rapi dan siap dipakai.',
      },
    },
    {
      id: 'katalog',
      label: 'KATALOG',
      columns: [
        {
          title: 'Segmentasi',
          links: [
            { label: 'Tim Olahraga', href: '#products' },
            { label: 'Sekolah & Kampus', href: '#products' },
            { label: 'Komunitas', href: '#products' },
            { label: 'Corporate', href: '#products' },
          ],
        },
        {
          title: 'Kebutuhan',
          links: [
            { label: 'MOQ & Harga', href: '#products' },
            { label: 'Request Sample', href: '#final-cta' },
            { label: 'Reorder', href: '#process' },
            { label: 'Tanya Produk', href: '#contact' },
          ],
        },
      ],
      feature: {
        title: 'Katalog yang relevan',
        body: 'Pilihan produk difokuskan pada jenis order yang paling sering dibutuhkan pelanggan AHR, bukan menu retail generik.',
      },
    },
    {
      id: 'layanan',
      label: 'LAYANAN',
      columns: [
        {
          title: 'Pelayanan',
          links: [
            { label: 'Konsultasi Desain', href: '#final-cta' },
            { label: 'Proses Produksi', href: '#process' },
            { label: 'Quality Control', href: '#process' },
            { label: 'Support Reorder', href: '#faq' },
          ],
        },
        {
          title: 'Keunggulan',
          links: [
            { label: 'Terpercaya', href: '#about' },
            { label: 'Responsif', href: '#about' },
            { label: 'Service Excellent', href: '#about' },
            { label: 'Layanan Cepat', href: '#contact' },
          ],
        },
      ],
      feature: {
        title: 'Layanan yang bisa diandalkan',
        body: 'Mulai dari briefing sampai hasil jadi, semua tahapan dibuat jelas agar pelanggan merasa aman selama proses order.',
      },
    },
    {
      id: 'tentang',
      label: 'TENTANG KAMI',
      columns: [
        {
          title: 'Profil AHR',
          links: [
            { label: 'Tentang Kami', href: '#about' },
            { label: 'Sejarah Kami', href: '#about' },
            { label: 'Visi & Misi', href: '#vision-mission' },
            { label: 'Alamat Lengkap', href: '#contact' },
          ],
        },
        {
          title: 'Komitmen',
          links: [
            { label: 'Kualitas Bahan', href: '#about' },
            { label: 'Ketepatan Desain', href: '#about' },
            { label: 'Ketepatan Waktu', href: '#vision-mission' },
            { label: 'Hubungan Jangka Panjang', href: '#vision-mission' },
          ],
        },
      ],
      feature: {
        title: 'Perusahaan yang terus bertumbuh',
        body: 'AHR PRINTING berkembang dari fondasi kejujuran, amanah, dan tanggung jawab untuk menjaga kepercayaan pelanggan.',
      },
    },
    {
      id: 'faq',
      label: 'FAQ',
      columns: [
        {
          title: 'Pertanyaan Umum',
          links: [
            { label: 'MOQ', href: '#faq' },
            { label: 'Sample Fisik', href: '#faq' },
            { label: 'Estimasi Produksi', href: '#faq' },
            { label: 'Invoice & PO', href: '#faq' },
          ],
        },
        {
          title: 'Butuh Jawaban Cepat',
          links: [
            { label: 'Chat WhatsApp', href: '#contact' },
            { label: 'Isi Form Inquiry', href: '#final-cta' },
            { label: 'Lihat Proses', href: '#process' },
            { label: 'Lokasi Workshop', href: '#contact' },
          ],
        },
      ],
      feature: {
        title: 'Jawaban sebelum order',
        body: 'FAQ dibuat untuk menjawab keberatan yang paling sering muncul sebelum pelanggan masuk ke tahap konsultasi lebih lanjut.',
      },
    },
  ],
  ticker: 'AHR Unified Homepage. Bulk order consultation and retail collection in one flow.',
  hero: {
    title: 'Produksi jersey kustom yang rapi, terbuka, dan nyaman diikuti prosesnya.',
    body:
      'AHR hadir sebagai partner produksi yang profesional tapi tetap akrab. Detail teknis kami jelaskan dengan sederhana, prosesnya terlihat jelas, dan alurnya dibuat nyaman untuk buyer retail maupun bulk order.',
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
  products: [
    {
      name: 'Matchday Teamwear',
      category: 'Teamwear',
      price: 'Rp 189.000',
      tone: 'navy',
    },
    {
      name: 'Training Capsule Top',
      category: 'Retail',
      price: 'Rp 149.000',
      tone: 'sand',
    },
    {
      name: 'Corporate Active Kit',
      category: 'B2B Capsule',
      price: 'Rp 229.000',
      tone: 'orange',
    },
    {
      name: 'Slides Summer Edit',
      category: 'Lifestyle',
      price: 'Rp 129.000',
      tone: 'black',
    },
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
  segment: 'teamwear-b2b',
}
const capabilityIcons = [MessageCircleMore, LayoutGrid, ShieldCheck, Truck]
const productTones = ['navy', 'sand', 'orange', 'black']
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
  return `Halo AHR, saya ${leadForm.name} dari ${leadForm.organization || 'tim/instansi'} ingin konsultasi ${leadForm.segment} sekitar ${leadForm.quantity_estimate || 'belum ditentukan'} pcs.`
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
    products:
      catalogItems.length > 0
        ? catalogItems.map((item, index) => ({
            id: item.id || `product-${index + 1}`,
            name: item.name,
            category:
              catalogCategories.find((category) => category.id === item.category)?.label || item.category,
            categoryId: item.category,
            price: item.price_hint,
            detail: `${item.material} • ${item.moq}`,
            tone: productTones[index % productTones.length],
          }))
        : homepageContent.products.map((item, index) => ({
            ...item,
            id: item.id || `product-${index + 1}`,
            categoryId: item.category?.toLowerCase().replace(/\s+/g, '-') || `category-${index + 1}`,
          })),
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
  }
}

function App() {
  const rootRef = useRef(null)
  const faqContentRefs = useRef([])
  const [landingPageContent, setLandingPageContent] = useState(homepageContent)
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  const [activeNav, setActiveNav] = useState('custom-jersey')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCatalogFilter, setActiveCatalogFilter] = useState('all')
  const [leadForm, setLeadForm] = useState(defaultLeadForm)
  const [leadStatus, setLeadStatus] = useState({ state: 'idle', message: '' })
  const contactProfile = landingPageContent.brand
  const companyProfile = landingPageContent.companyProfile
  const leadSegments =
    landingPageContent.catalogCategories?.length > 0
      ? landingPageContent.catalogCategories
      : [
          { id: 'teamwear-b2b', label: 'Teamwear B2B' },
          { id: 'school-event', label: 'School / Campus Event' },
          { id: 'corporate-kit', label: 'Corporate Kit' },
          { id: 'retail-collab', label: 'Retail Collab' },
        ]

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

    fetch(getApiUrl('/api/b2b/landing-page'), {
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
      landingPageContent.catalogCategories?.length > 0
        ? landingPageContent.catalogCategories
        : [
            { id: 'teamwear-b2b', label: 'Teamwear B2B' },
            { id: 'school-event', label: 'School / Campus Event' },
            { id: 'corporate-kit', label: 'Corporate Kit' },
            { id: 'retail-collab', label: 'Retail Collab' },
          ]

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

  const activeGroup =
    landingPageContent.navGroups.find((group) => group.id === activeNav) ?? landingPageContent.navGroups[0]
  const catalogFilters =
    landingPageContent.catalogCategories?.length > 0
      ? [{ id: 'all', label: 'Semua' }, ...landingPageContent.catalogCategories]
      : [{ id: 'all', label: 'Semua' }]
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
      source_page: window.location.pathname,
      cta_context: 'unified-homepage-form',
      referrer_url: document.referrer || undefined,
      ...getUtmParams(),
    }

    try {
      const response = await fetch(getApiUrl('/api/b2b/leads'), {
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

  return (
    <div className="app-shell" ref={rootRef}>
      <header className="site-header">
        <div className="utility-bar">
          <div className="utility-message">14 DAYS *EASY RETURN</div>
          <button className="utility-toggle" type="button" aria-label="Expand utility">
            <ChevronDown size={14} />
          </button>
        </div>

        <div className="utility-links-row">
          <div />
          <div className="utility-links">
            {landingPageContent.utilityLinks.map((item) => (
              <a href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div
          className="header-menu-shell"
          onMouseLeave={() => {
            setMenuOpen(false)
          }}
        >
          <div className="main-header">
          <a className="brand" href="#hero" aria-label="AHR Home">
            <img className="brand-mark" src="/ahr-brand-logo.webp" alt="AHR logo" />
          </a>

          <button
            className="mobile-menu-button"
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className={mobileMenuOpen ? 'main-nav open' : 'main-nav'}>
            {landingPageContent.navGroups.map((item) => (
              <button
                className={activeNav === item.id ? 'nav-tab active' : 'nav-tab'}
                key={item.id}
                type="button"
                onMouseEnter={() => {
                  setActiveNav(item.id)
                  setMenuOpen(true)
                }}
                onFocus={() => {
                  setActiveNav(item.id)
                  setMenuOpen(true)
                }}
                onClick={() => {
                  setActiveNav(item.id)
                  setMenuOpen((current) => !current)
                  trackEvent('nav_click', { nav_item: item.id })
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="header-actions">
            <label className="search-box">
              <input
                aria-label="Cari section atau kebutuhan"
                placeholder="Cari produk atau info"
                onFocus={() => scrollToSection('#products')}
                readOnly
              />
              <Search size={18} />
            </label>
            <button
              className="icon-button"
              type="button"
              aria-label="Tentang AHR"
              onClick={() => scrollToSection('#about')}
            >
              <User size={20} />
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label="Keunggulan AHR"
              onClick={() => scrollToSection('#about')}
            >
              <Heart size={20} />
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label="Konsultasi Produk"
              onClick={() => scrollToSection('#final-cta')}
            >
              <ShoppingBag size={20} />
            </button>
          </div>
          </div>

          <div className="ticker-bar">
            <span>{landingPageContent.ticker}</span>
            <ArrowRight size={16} />
          </div>

          <section
            className={menuOpen || mobileMenuOpen ? 'mega-menu visible' : 'mega-menu'}
            aria-label="Category menu"
            onMouseEnter={() => setMenuOpen(true)}
          >
            <div className="mega-menu-columns">
              {activeGroup.columns.map((column) => (
                <div key={column.title}>
                  <h3>{column.title}</h3>
                  <ul>
                    {normalizeLinks(column.links, '#products').map((link) => (
                      <li key={link.label}>
                        <a href={link.href}>{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <aside className="mega-menu-feature">
              <div className="feature-thumb" />
              <div className="feature-card-body">
                <strong>{activeGroup.feature.title}</strong>
                <p>{activeGroup.feature.body}</p>
              </div>
            </aside>
          </section>
        </div>
      </header>

      <main>
        <section className="hero-video-section" id="hero">
          <video
            className="hero-video"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/ahr-logo.webp"
          >
            <source src="/videos/ahr-hero.mp4" type="video/mp4" />
          </video>
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <span className="hero-eyebrow">{landingPageContent.hero.eyebrow}</span>
            <h1>{landingPageContent.hero.title}</h1>
            <p>{landingPageContent.hero.body}</p>
            <div className="hero-cta-row">
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
            <h2>Struktur visual yang modern, tapi tetap dekat dengan cara kerja AHR sehari-hari.</h2>
            <p>
              Bagian atas dibuat lebih ringan dan eksploratif, sementara isi halamannya tetap
              menonjolkan capability produksi, alur kerja, dan titik kontak yang jelas.
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

        <section className="content-block section-plain company-story" id="about" data-reveal>
          <div className="about-hero-grid">
            <div className="section-heading about-heading" data-reveal-item>
              <span>Tentang Kami</span>
              <h2>AHR PRINTING hadir sebagai spesialis jersey custom yang bertumbuh dari komitmen dan konsistensi.</h2>
              <p>{companyProfile.about}</p>
            </div>

            <article className="about-highlight-card" data-reveal-item>
              <strong>Katapang, Kabupaten Bandung</strong>
              <p>
                Workshop kami menjadi titik kerja untuk desain, printing, finishing, dan koordinasi
                order agar hasil tetap rapi, tajam, dan tahan lama.
              </p>
              <div className="about-highlight-meta">
                <span>Sejak 2020</span>
                <span>Fokus pada jersey custom</span>
              </div>
            </article>
          </div>

          <div className="story-grid">
            <article className="story-card story-card-primary" data-reveal-item>
              <span>Sejarah dan Komitmen Kami</span>
              <p>{companyProfile.history}</p>
            </article>
            <article className="story-card story-card-secondary" data-reveal-item>
              <span>Perkembangan Perusahaan</span>
              <p>{companyProfile.commitment}</p>
            </article>
          </div>

          <div className="reason-grid">
            {companyProfile.reasons.map((reason) => (
              <article className="reason-card" key={reason.title} data-reveal-item>
                <h3>{reason.title}</h3>
                <p>{reason.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-block section-plain" id="products" data-reveal>
          <div className="section-heading heading-inline" data-reveal-item>
            <div>
              <span>WHAT'S HOT</span>
              <h2>Pilihan produk ditampilkan lebih ringkas agar pengunjung bisa cepat menangkap arahnya.</h2>
            </div>
            <a href="#final-cta">
              View all
              <ArrowRight size={16} />
            </a>
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

          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className={`product-card tone-${product.tone}`} key={product.name} data-reveal-item>
                <div className="product-media">
                  <button
                    className="wishlist-button"
                    type="button"
                    aria-label={`Tanya produk ${product.name}`}
                    onClick={() => handleProductInquiry(product)}
                  >
                    <Heart size={18} />
                  </button>
                </div>
                <div className="product-body">
                  <span>{product.price}</span>
                  <h3>{product.name}</h3>
                  <p>{product.detail || product.category}</p>
                </div>
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

        <section className="content-block section-plain vision-layout" id="vision-mission" data-reveal>
          <div className="section-heading" data-reveal-item>
            <span>Visi & Misi</span>
            <h2>Visi yang jelas dan misi yang konsisten menjadi dasar cara AHR PRINTING bekerja.</h2>
          </div>

          <div className="vision-grid">
            <article className="vision-card" data-reveal-item>
              <span>Visi AHR Printing</span>
              <p>{companyProfile.vision}</p>
            </article>
            <article className="vision-card" data-reveal-item>
              <span>Misi AHR Printing</span>
              <ul className="mission-list">
                {companyProfile.missions.map((mission) => (
                  <li key={mission}>{mission}</li>
                ))}
              </ul>
            </article>
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

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <img className="footer-logo" src="/ahr-brand-logo.webp" alt="AHR logo" />
            <p>
              CV AHR Printing bergerak di bidang apparel dan percetakan kustom, dengan fokus pada
              sublimasi jersey serta kebutuhan teamwear yang rapi dan mudah diikuti prosesnya.
            </p>
            <div className="footer-social">
              <a href={companyProfile.address.mapUrl} aria-label={defaultMapLabel} target="_blank" rel="noreferrer">
                <MapPin size={18} />
              </a>
              <a href="#about" aria-label="Profil AHR">
                <Store size={18} />
              </a>
              <a href="#final-cta" aria-label="WhatsApp AHR">
                <Phone size={18} />
              </a>
            </div>
          </div>

          <div className="footer-links-grid">
            {landingPageContent.footerGroups.map((group) => (
              <div key={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {normalizeLinks(group.links).map((link) => (
                    <li key={link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="footer-contact-card">
            <span>Kontak</span>
            <h3>{contactProfile.lockup}</h3>
            <p>{contactProfile.tagline}</p>
            <button
              className="cta-button cta-button-dark"
              onClick={() =>
                handleWhatsAppClick(
                  'nav_wa_click',
                  {
                    button_location: 'footer',
                    intent: 'footer-whatsapp',
                  },
                  footerMessageFallback,
                )
              }
            >
              Hubungi via WhatsApp
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 AHR Printing. Dibangun untuk kebutuhan retail dan teamwear.</span>
          <div className="footer-bottom-links">
            <a href="#about">Tentang Kami</a>
            <a href="#vision-mission">Visi & Misi</a>
            <a href="#hero">Kembali ke atas</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
