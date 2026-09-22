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
  instagramEmbed: 'https://www.instagram.com/ahr.printingsublimasi/embed',
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
    intentBlocks: [
      {
        title: 'Printing jersey full print sublim',
        body: 'Warna menyatu ke serat kain dry-fit — lebih tahan luntur dibanding sablon biasa. Cocok untuk desain full body, gradient, dan motif kompleks.',
      },
      {
        title: 'Pembuatan jersey dari brief sampai kirim',
        body: 'Anda kirim referensi atau deskripsi; tim AHR buat mockup gratis, revisi hingga approve, lalu produksi 2–3 hari kerja.',
      },
      {
        title: 'Tempat bikin jersey di Bandung',
        body: 'Workshop Katapang handle desain, printing, jahit, dan QC satu atap. Kirim nasional termasuk Jabodetabek.',
      },
    ],
    socialLinks: b2bSocialLinks,
  },
  '/pembuatan-jersey': {
    canonicalPath: '/pembuatan-jersey',
    title: 'Pembuatan Jersey Custom Full Print | MOQ 5 Pcs | AHR',
    description:
      'Pembuatan jersey custom full print sublim untuk tim & komunitas. Mulai Rp 88.000/pcs, MOQ 5 pcs, free desain, produksi 2–3 hari. Chat WhatsApp AHR.',
    keywords: `${sharedKeywords}, pembuatan jersey, jasa pembuatan jersey, buat jersey custom, order pembuatan jersey`,
    hero: {
      eyebrow: 'Pembuatan Jersey Custom',
      title: 'Pembuatan jersey custom — mulai Rp 88.000/pcs.',
      body: 'Jasa pembuatan jersey full print sublimasi dari brief desain sampai produksi siap kirim. MOQ 5 pcs, free desain & revisi, estimasi 2–3 hari kerja dari workshop Bandung.',
      primaryCta: 'Kirim Brief Pembuatan',
      secondaryCta: 'Chat WhatsApp Sekarang',
    },
    formTitle: 'Brief pembuatan jersey',
    formSubtitle: 'Isi jumlah (min. 5 pcs), deadline, dan referensi desain — kami balas via WA.',
    waContext: 'pembuatan jersey',
    stats: sharedStats,
    trustBar: [
      'Pembuatan jersey mulai Rp 88.000/pcs',
      'Free desain & revisi',
      'MOQ mulai 5 pcs',
      'Produksi 2–3 hari kerja',
      'Workshop Bandung',
    ],
    testimonials: sharedTestimonials,
    highlights: [
      {
        title: 'Dari ide ke jersey jadi',
        detail: 'Brief → mockup gratis → approve → produksi → QC & kirim.',
      },
      {
        title: 'Custom nama & nomor',
        detail: 'Setiap pcs bisa beda nama/nomor pemain tanpa ribet file.',
      },
      {
        title: 'MOQ mulai 5 pcs',
        detail: 'Cocok trial desain sebelum order full tim.',
      },
      {
        title: 'Harga transparan',
        detail: 'Acuan mulai Rp 88.000/pcs — turun seiring jumlah.',
      },
    ],
    intentBlocks: [
      {
        title: 'Apa yang termasuk di pembuatan jersey AHR?',
        body: 'Konsultasi singkat, mockup gratis, revisi hingga cocok, full print sublimasi, jahit, QC, dan update resi pengiriman.',
      },
      {
        title: 'Siapa yang cocok order pembuatan jersey di sini?',
        body: 'Tim futsal/bola, komunitas, sekolah, EO, dan corporate yang butuh seragam cepat tanpa MOQ ratusan pcs.',
      },
      {
        title: 'Berapa lama pembuatan jersey selesai?',
        body: 'Umumnya 2–3 hari kerja setelah desain final dan DP. Deadline ketat bisa dikonfirmasi saat brief WhatsApp.',
      },
    ],
    socialLinks: b2bSocialLinks,
  },
  '/printing-jersey': {
    canonicalPath: '/printing-jersey',
    title: 'Printing Jersey Full Print Sublimasi | Mulai Rp 88rb | AHR',
    description:
      'Printing jersey full print sublimasi warna tajam. Mulai Rp 88.000/pcs, MOQ 5 pcs, free desain, produksi 2–3 hari. Chat WhatsApp AHR Bandung.',
    keywords: `${sharedKeywords}, printing jersey, jasa printing jersey, jersey custom printing, full print sublimasi`,
    hero: {
      eyebrow: 'Printing Jersey Full Print',
      title: 'Printing jersey full print — mulai Rp 88.000/pcs.',
      body: 'Jasa printing jersey sublimasi untuk desain full body, logo klub, dan motif kompleks. Warna tajam, MOQ 5 pcs, free desain, produksi 2–3 hari dari workshop Bandung.',
      primaryCta: 'Kirim Brief Printing',
      secondaryCta: 'Chat WhatsApp Sekarang',
    },
    formTitle: 'Brief printing jersey',
    formSubtitle: 'Kirim referensi desain & jumlah — kami balas estimasi printing via WA.',
    waContext: 'printing jersey',
    stats: sharedStats,
    trustBar: [
      'Printing jersey mulai Rp 88.000/pcs',
      'Full print sublimasi',
      'Warna tajam & awet',
      'MOQ mulai 5 pcs',
      'Free desain',
    ],
    testimonials: sharedTestimonials,
    highlights: [
      {
        title: 'Full print sublimasi',
        detail: 'Warna menyatu ke serat kain — lebih tahan luntur vs sablon.',
      },
      {
        title: 'Desain kompleks OK',
        detail: 'Gradient, motif full body, dan branding klub tetap tajam.',
      },
      {
        title: 'Reorder cepat',
        detail: 'File tersimpan — order berikutnya lebih ringkas.',
      },
      {
        title: 'MOQ mulai 5 pcs',
        detail: 'Tidak perlu volume besar untuk mulai printing.',
      },
    ],
    intentBlocks: [
      {
        title: 'Kenapa pilih printing jersey sublimasi?',
        body: 'Hasil lebih detail untuk desain full print, nyaman dipakai olahraga, dan warna tidak mudah retak seperti sablon tebal.',
      },
      {
        title: 'File apa yang dibutuhkan untuk printing jersey?',
        body: 'Boleh AI/PSD/PNG resolusi tinggi, atau cukup referensi foto — tim AHR bantu mockup gratis sebelum produksi.',
      },
      {
        title: 'Printing jersey untuk tim berulang',
        body: 'Cocok klub yang sering ganti nama/nomor tiap musim — desain dasar tersimpan untuk reorder.',
      },
    ],
    socialLinks: b2bSocialLinks,
  },
  '/tempat-bikin-jersey': {
    canonicalPath: '/tempat-bikin-jersey',
    title: 'Tempat Bikin Jersey Custom Bandung | MOQ 5 Pcs | AHR',
    description:
      'Tempat bikin jersey custom di Bandung (Katapang). Mulai Rp 88.000/pcs, MOQ 5 pcs, free desain, produksi 2–3 hari, kirim nasional. Chat WhatsApp.',
    keywords: `${sharedKeywords}, tempat bikin jersey, tempat buat jersey, bikin jersey custom, workshop jersey bandung`,
    hero: {
      eyebrow: 'Tempat Bikin Jersey',
      title: 'Tempat bikin jersey custom — mulai Rp 88.000/pcs.',
      body: 'Workshop AHR di Katapang, Bandung: desain, printing sublimasi, jahit, dan QC satu atap. MOQ 5 pcs, free desain, produksi 2–3 hari, kirim nasional termasuk Jabodetabek.',
      primaryCta: 'Kirim Brief Order',
      secondaryCta: 'Chat WhatsApp Sekarang',
    },
    formTitle: 'Brief tempat bikin jersey',
    formSubtitle: 'Lokal Bandung atau kirim luar kota — isi brief, kami balas via WA.',
    waContext: 'tempat bikin jersey',
    stats: [
      { value: 'Bandung', label: 'workshop Katapang' },
      { value: 'Rp 88rb', label: 'mulai per pcs' },
      { value: '5 pcs', label: 'MOQ mulai' },
      { value: '2-3 Hari', label: 'estimasi produksi' },
    ],
    trustBar: [
      'Tempat bikin jersey di Bandung',
      'Mulai Rp 88.000/pcs',
      'MOQ mulai 5 pcs',
      'Produksi 1 atap',
      'Kirim nasional',
    ],
    testimonials: sharedTestimonials,
    highlights: [
      {
        title: 'Workshop nyata, bukan dropship',
        detail: 'Kunjungi dengan janji temu — lihat proses printing & jahit.',
      },
      {
        title: 'Satu atap',
        detail: 'Desain, print, jahit, QC di lokasi yang sama.',
      },
      {
        title: 'MOQ mulai 5 pcs',
        detail: 'Lebih fleksibel dari banyak konveksi yang minta 12–24 pcs.',
      },
      {
        title: 'Kirim ke luar kota',
        detail: 'Bandung produksi, Jabodetabek & nasional via ekspedisi.',
      },
    ],
    intentBlocks: [
      {
        title: 'Di mana tempat bikin jersey AHR?',
        body: 'Jl. Bojong Tanjung No.19, Katapang, Kabupaten Bandung. Bisa janji temu via WhatsApp sebelum berkunjung.',
      },
      {
        title: 'Harus datang ke workshop?',
        body: 'Tidak wajib. Mayoritas order via WhatsApp + brief online; datang hanya jika ingin lihat proses langsung.',
      },
      {
        title: 'Bisa bikin jersey lalu kirim ke luar Bandung?',
        body: 'Bisa. Produksi di Katapang, lalu kirim nasional — termasuk Jakarta dan kota lain.',
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
    intentBlocks: variant.intentBlocks || [],
  }
}
