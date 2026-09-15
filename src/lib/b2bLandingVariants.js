import {
  b2bPricingDisclaimer,
  b2bPricingTiers,
  b2bProcessSteps,
  b2bWorkshop,
  getB2bFaqsForPath,
  b2bServicesByPath,
} from './b2bLandingTrustContent.js'

const sharedKeywords = 'ahr corporation, jersey custom, konveksi jersey, printing jersey, vendor jersey, jersey tim, jersey komunitas, b2b apparel'

const sharedStats = [
  { value: 'Rp 88rb', label: 'mulai per pcs' },
  { value: '5 pcs', label: 'MOQ mulai' },
  { value: '2-3 Hari', label: 'estimasi produksi' },
  { value: '500+', label: 'proyek bulk order' },
]

const sharedTrustBar = [
  'Mulai Rp 88.000/pcs',
  'Free desain & 2x revisi',
  'Full print sublimasi',
  'Produksi 2-3 hari kerja',
  'MOQ mulai 5 pcs',
]

export const b2bPortfolioItems = [
  {
    src: 'https://media.ahrcorporation.id/cms-media/dsc06564.webp',
    alt: 'Proses jahit jersey di workshop AHR',
    caption: 'Proses produksi jersey custom di workshop Katapang',
  },
  {
    src: 'https://media.ahrcorporation.id/cms-media/produksi.webp',
    alt: 'Hasil print jersey sublim AHR',
    caption: 'Hasil jersey full print sublim untuk tim',
  },
  {
    src: 'https://media.ahrcorporation.id/cms-media/argentina-1.jpg',
    alt: 'Detail jersey custom printing AHR',
    caption: 'Detail warna printing yang tajam dan rapi',
  },
]

export const b2bEmbedLinks = {
  instagramProfile: 'https://www.instagram.com/ahr.printingsublimasi/',
  tiktokProfile: 'https://www.tiktok.com/@ahrprintingsublimation',
}

export const b2bSocialLinks = [
  {
    platform: 'instagram',
    label: 'Instagram AHR',
    handle: '@ahr.printingsublimasi',
    href: 'https://www.instagram.com/ahr.printingsublimasi/',
    description: 'Portfolio hasil produksi, review pelanggan, dan update jersey terbaru.',
  },
  {
    platform: 'tiktok',
    label: 'TikTok AHR',
    handle: '@ahrprintingsublimation',
    href: 'https://www.tiktok.com/@ahrprintingsublimation',
    description: 'Video proses produksi, hasil printing, dan behind the scenes workshop.',
  },
]

const sharedTestimonials = [
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
]

const sharedHighlights = [
  { title: 'Free desain', detail: 'Tim desain AHR bantu dari nol atau dari file referensi Anda.' },
  { title: 'Full print sublim', detail: 'Hasil warna tajam, nyaman dipakai, cocok untuk tim & komunitas.' },
  { title: 'MOQ mulai 5 pcs', detail: 'Cocok untuk tim kecil, komunitas, hingga order bulk corporate.' },
  { title: 'Produksi cepat', detail: 'Estimasi 2-3 hari kerja setelah desain disetujui.' },
]

const sharedCtas = {
  primaryCta: 'Kirim Brief Order',
  secondaryCta: 'Chat WhatsApp Sekarang',
}

export const b2bLandingVariants = {
  '/vendor-jersey-b2b': {
    canonicalPath: '/vendor-jersey-b2b',
    title: 'Vendor Jersey B2B Custom | MOQ 5 Pcs | AHR Corporation',
    description:
      'Vendor jersey B2B & supplier jersey custom untuk tim, komunitas, dan corporate. MOQ mulai 5 pcs, free desain, produksi 2-3 hari, chat WA cepat.',
    keywords: `${sharedKeywords}, vendor jersey, supplier jersey, jasa konveksi jersey`,
    hero: {
      eyebrow: 'Vendor Jersey B2B',
      title: 'Vendor jersey B2B — mulai Rp 88.000/pcs, MOQ 5 pcs.',
      body: 'Supplier jersey custom untuk tim, corporate, dan reseller. Free desain, full print sublimasi, produksi 2–3 hari kerja dari workshop Bandung. Harga turun seiring jumlah.',
      ...sharedCtas,
    },
    formTitle: 'Brief vendor / supplier',
    formSubtitle: 'Isi singkat — kami balas via WhatsApp dengan estimasi & opsi desain.',
    waContext: 'vendor jersey B2B',
    stats: sharedStats,
    trustBar: sharedTrustBar,
    testimonials: sharedTestimonials,
    highlights: sharedHighlights,
    socialLinks: b2bSocialLinks,
  },
  '/konveksi-jersey-printing': {
    canonicalPath: '/konveksi-jersey-printing',
    title: 'Printing Jersey & Pembuatan Jersey Custom | Konveksi AHR',
    description:
      'Printing jersey & pembuatan jersey custom full print sublim. Tempat bikin jersey mulai Rp 88.000/pcs, MOQ 5 pcs, free desain, produksi 2-3 hari. Chat WhatsApp.',
    keywords: `${sharedKeywords}, printing jersey, pembuatan jersey, tempat bikin jersey, konveksi jersey printing, jersey full print, jersey custom printing`,
    hero: {
      eyebrow: 'Printing Jersey · Konveksi',
      title: 'Printing jersey & pembuatan jersey — mulai Rp 88.000/pcs.',
      body: 'Tempat bikin jersey full print sublimasi untuk tim dan komunitas. MOQ 5 pcs, free desain, produksi 2–3 hari dari workshop Bandung. Isi brief atau chat WhatsApp untuk estimasi.',
      primaryCta: 'Kirim Brief Printing',
      secondaryCta: 'Chat WhatsApp Sekarang',
    },
    formTitle: 'Brief printing / pembuatan jersey',
    formSubtitle: 'Isi jumlah (min. 5 pcs) & deadline — kami balas estimasi via WA.',
    waContext: 'printing jersey konveksi',
    stats: [
      { value: 'Rp 88rb', label: 'mulai per pcs' },
      { value: '5 pcs', label: 'MOQ mulai' },
      { value: '2-3 Hari', label: 'estimasi produksi' },
      { value: '500+', label: 'proyek selesai' },
    ],
    trustBar: [
      'Mulai Rp 88.000/pcs',
      'Printing jersey full print',
      'Pembuatan jersey custom',
      'MOQ mulai 5 pcs',
      'Workshop Katapang, Bandung',
    ],
    testimonials: sharedTestimonials,
    highlights: [
      {
        title: 'Printing jersey',
        detail: 'Full print sublimasi warna tajam — cocok order tim berulang.',
      },
      {
        title: 'Pembuatan jersey',
        detail: 'Dari brief desain sampai produksi siap kirim, alur jelas.',
      },
      {
        title: 'Tempat bikin jersey',
        detail: 'Workshop di Katapang, Bandung. Konsultasi cepat via WhatsApp.',
      },
      {
        title: 'MOQ mulai 5 pcs',
        detail: 'Tidak perlu order ratusan pcs untuk mulai produksi.',
      },
    ],
    socialLinks: b2bSocialLinks,
  },
  '/jersey-tim-komunitas': {
    canonicalPath: '/jersey-tim-komunitas',
    title: 'Jersey Tim & Komunitas Custom | Beli 20 Gratis 1 | AHR',
    description:
      'Buat baju jersey tim, klub bola, dan komunitas custom full print. Beli 20 gratis 1, MOQ mulai 5 pcs, free desain. Chat WhatsApp AHR.',
    keywords: `${sharedKeywords}, jersey tim, jersey komunitas, buat baju jersey, custom jersey murah, jersey klub bola`,
    hero: {
      eyebrow: 'Jersey Tim & Komunitas',
      title: 'Buat baju jersey tim & komunitas — mulai Rp 88.000/pcs.',
      body: 'Jersey custom untuk futsal, bola, sekolah, dan komunitas. Free desain, full print sublimasi, MOQ 5 pcs, promo beli 20 gratis 1, respon cepat via WhatsApp.',
      ...sharedCtas,
    },
    formTitle: 'Brief jersey tim / komunitas',
    formSubtitle: 'Isi jumlah anggota tim — kami bantu desain & estimasi via WA.',
    waContext: 'jersey tim komunitas',
    stats: [
      { value: '20+1', label: 'promo beli 20 gratis 1' },
      { value: '200+', label: 'tim & komunitas' },
      { value: '5 pcs', label: 'MOQ mulai' },
      { value: '2-3 Hari', label: 'estimasi produksi' },
    ],
    trustBar: [
      'Beli 20 gratis 1 jersey',
      'Buat baju jersey custom',
      'MOQ mulai 5 pcs',
      'Free desain untuk tim',
      'Produksi 2-3 hari kerja',
    ],
    testimonials: sharedTestimonials,
    highlights: [
      { title: 'Untuk tim & klub', detail: 'Nama, nomor, dan logo klub bisa dikustom per pemain.' },
      { title: 'Promo komunitas', detail: 'Beli 20 pcs gratis 1 pcs untuk order tim.' },
      { title: 'MOQ mulai 5 pcs', detail: 'Cocok trial desain sebelum order full squad.' },
      { title: 'Chat WA cepat', detail: 'Kirim referensi desain — kami bantu revisi.' },
    ],
    socialLinks: b2bSocialLinks,
  },
  '/konveksi-jersey-bandung': {
    canonicalPath: '/konveksi-jersey-bandung',
    title: 'Konveksi Jersey Bandung | Mulai Rp 88.000/pcs | AHR',
    description:
      'Konveksi jersey Bandung & printing jersey Bandung. Harga mulai Rp 88.000/pcs, workshop Katapang, MOQ 5 pcs, free desain, kirim nasional.',
    keywords: `${sharedKeywords}, konveksi jersey bandung, jersey murah bandung, printing jersey bandung, vendor jersey bandung`,
    hero: {
      eyebrow: 'Konveksi Jersey Bandung',
      title: 'Konveksi jersey Bandung — mulai Rp 88.000/pcs.',
      body: 'Workshop di Katapang, Bandung. Printing jersey Bandung full print sublim. MOQ 5 pcs, free desain, produksi 2–3 hari, kirim nasional. Bandingkan MOQ — banyak vendor minta 12–24 pcs.',
      ...sharedCtas,
    },
    formTitle: 'Brief order Bandung',
    formSubtitle: 'Lokal Bandung atau kirim luar kota — isi brief, kami balas via WA.',
    waContext: 'konveksi jersey bandung',
    stats: [
      { value: 'Bandung', label: 'workshop Katapang' },
      { value: 'Rp 88rb', label: 'mulai per pcs' },
      { value: '2-3 Hari', label: 'estimasi produksi' },
      { value: '5 pcs', label: 'MOQ mulai' },
    ],
    trustBar: [
      'Mulai Rp 88.000/pcs',
      'Workshop Bandung (Katapang)',
      'Printing jersey Bandung',
      'Free desain & revisi',
      'MOQ mulai 5 pcs',
    ],
    testimonials: sharedTestimonials,
    highlights: sharedHighlights,
    socialLinks: b2bSocialLinks,
  },
  '/jersey-printing-jakarta': {
    canonicalPath: '/jersey-printing-jakarta',
    title: 'Jersey Custom Jakarta | Mulai Rp 88.000/pcs | AHR',
    description:
      'Jersey custom Jakarta & jersey printing Jakarta. Harga mulai Rp 88.000/pcs, produksi Bandung, kirim Jabodetabek, MOQ 5 pcs, free desain.',
    keywords: `${sharedKeywords}, jersey printing jakarta, konveksi jersey jakarta, vendor jersey jakarta, jersey custom jakarta, tempat bikin jersey jakarta`,
    hero: {
      eyebrow: 'Jersey Printing Jakarta',
      title: 'Jersey custom Jakarta — mulai Rp 88.000/pcs.',
      body: 'Tempat bikin jersey untuk tim Jabodetabek. Produksi workshop Bandung, pengiriman cepat ke Jakarta. MOQ 5 pcs, free desain, produksi 2–3 hari kerja.',
      ...sharedCtas,
    },
    formTitle: 'Brief order Jakarta',
    formSubtitle: 'Isi kebutuhan tim Jakarta — kami balas estimasi + opsi kirim via WA.',
    waContext: 'jersey printing jakarta',
    stats: [
      { value: 'Jakarta', label: 'kirim Jabodetabek' },
      { value: 'Rp 88rb', label: 'mulai per pcs' },
      { value: '2-3 Hari', label: 'estimasi produksi' },
      { value: '5 pcs', label: 'MOQ mulai' },
    ],
    trustBar: [
      'Mulai Rp 88.000/pcs',
      'Kirim cepat Jabodetabek',
      'MOQ mulai 5 pcs',
      'Free desain & revisi',
      'Full print sublimasi',
    ],
    testimonials: sharedTestimonials,
    highlights: [
      { title: 'Fokus Jakarta', detail: 'Alur order jelas untuk tim, komunitas, dan corporate Jabodetabek.' },
      { title: 'Kirim cepat', detail: 'Produksi Bandung dengan opsi pengiriman cepat ke Jakarta.' },
      { title: 'MOQ mulai 5 pcs', detail: 'Cocok trial sebelum order full tim.' },
      { title: 'Harga transparan', detail: 'Mulai Rp 88.000/pcs — estimasi final via WhatsApp.' },
    ],
    socialLinks: b2bSocialLinks,
  },
}

export function getB2bLandingVariant(pathname) {
  const normalized = pathname.replace(/\/$/, '') || '/kontak-kerja-sama'
  const variant = b2bLandingVariants[normalized]
  if (!variant) {
    return null
  }

  return {
    ...variant,
    socialLinks: b2bSocialLinks,
    portfolioItems: b2bPortfolioItems,
    embedLinks: b2bEmbedLinks,
    pricingTiers: b2bPricingTiers,
    pricingDisclaimer: b2bPricingDisclaimer,
    processSteps: b2bProcessSteps,
    workshop: b2bWorkshop,
    faqs: getB2bFaqsForPath(normalized),
    services: b2bServicesByPath[normalized] || b2bServicesByPath['/kontak-kerja-sama'],
  }
}
