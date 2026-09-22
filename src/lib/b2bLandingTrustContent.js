/** Shared trust/SEO content for B2B Google Ads landing pages. */

export const b2bPricingTiers = [
  {
    qty: '5–11 pcs',
    price: 'Mulai Rp 88.000/pcs',
    note: 'MOQ fleksibel — cocok trial desain & tim kecil.',
  },
  {
    qty: '12–59 pcs',
    price: 'Harga lebih hemat',
    note: 'Pilihan favorit klub & komunitas.',
  },
  {
    qty: '60–120 pcs',
    price: 'Harga komunitas',
    note: 'Cocok turnamen, sekolah, dan event.',
  },
  {
    qty: '121 pcs+',
    price: 'Harga corporate / event',
    note: 'Volume besar — estimasi khusus via WhatsApp.',
  },
]

export const b2bPricingDisclaimer =
  'Harga acuan atasan dewasa full print sublim; final menyesuaikan bahan, finishing, dan jumlah. Konfirmasi estimasi via form atau WhatsApp.'

export const b2bWorkshop = {
  title: 'Workshop Katapang, Bandung',
  line: 'Jl. Bojong Tanjung No.19, Katapang, Kabupaten Bandung, Jawa Barat 40921',
  mapUrl: 'https://maps.app.goo.gl/V6fxMXch8Q5bcwrGA',
  points: [
    'Produksi 1 atap: desain, printing sublimasi, jahit, QC.',
    'Bisa kirim nasional — termasuk Jabodetabek.',
    'Kunjungi workshop dengan janji temu via WhatsApp.',
  ],
}

export const b2bProcessSteps = [
  {
    title: 'Brief',
    detail: 'Isi form atau chat WA: jumlah, deadline, referensi desain, dan ukuran.',
  },
  {
    title: 'Desain gratis',
    detail: 'Tim AHR bantu mockup gratis + revisi hingga Anda approve.',
  },
  {
    title: 'Produksi 2–3 hari',
    detail: 'Setelah desain & DP OK, masuk line printing sublimasi dan jahit.',
  },
  {
    title: 'QC & kirim',
    detail: 'Dicek kualitas, dikemas, lalu dikirim dengan update resi.',
  },
]

export const b2bBaseFaqs = [
  {
    question: 'Minimal order berapa pcs?',
    answer:
      'MOQ mulai 5 pcs per desain. Lebih fleksibel dibanding banyak konveksi yang minta 12–24 pcs. Volume lebih besar mendapat harga lebih hemat.',
  },
  {
    question: 'Berapa harga jersey custom / printing?',
    answer:
      'Acuan mulai Rp 88.000/pcs untuk atasan dewasa full print sublim (qty kecil). Harga turun seiring jumlah. Estimasi final kami kirim via WhatsApp setelah brief.',
  },
  {
    question: 'Berapa lama estimasi produksi?',
    answer:
      'Umumnya 2–3 hari kerja setelah desain final disetujui dan DP diterima. Deadline ketat bisa dikonfirmasi saat brief.',
  },
  {
    question: 'Apakah desain gratis?',
    answer:
      'Ya. Free desain dari nol atau dari file referensi Anda, plus revisi hingga approve sebelum produksi.',
  },
  {
    question: 'Bahan dan teknik cetak apa yang dipakai?',
    answer:
      'Full print sublimasi pada bahan dry-fit sport. Warna menyatu ke serat kain sehingga lebih tahan luntur dibanding sablon biasa.',
  },
  {
    question: 'Bisa kirim ke luar Bandung / Jakarta?',
    answer:
      'Bisa. Produksi di workshop Katapang, Bandung, dengan pengiriman nasional (termasuk Jabodetabek) via ekspedisi.',
  },
  {
    question: 'Bisa lihat hasil produksi dulu?',
    answer:
      'Bisa. Cek portofolio di halaman ini, Instagram @ahr.printingsublimasi, atau TikTok @ahrprintingsublimation.',
  },
  {
    question: 'Bisa kerja sama vendor / reseller / maklon?',
    answer:
      'Bisa. Pilih segmen vendor di form brief — kami follow-up alur partnership, white label, atau produksi berulang.',
  },
]

export const b2bServicesByPath = {
  '/konveksi-jersey-bandung': [
    'Konveksi jersey Bandung full print sublim',
    'Printing jersey Bandung untuk tim & komunitas',
    'Vendor jersey Bandung (MOQ mulai 5 pcs)',
    'Custom nama, nomor, dan logo klub',
  ],
  '/konveksi-jersey-printing': [
    'Printing jersey custom full print',
    'Pembuatan jersey tim & komunitas',
    'Tempat bikin jersey — workshop Bandung',
    'Jersey custom printing sublimasi',
  ],
  '/pembuatan-jersey': [
    'Pembuatan jersey custom full print',
    'Jasa buat jersey tim & komunitas',
    'Custom nama, nomor, dan logo',
    'MOQ mulai 5 pcs — produksi 2–3 hari',
  ],
  '/printing-jersey': [
    'Printing jersey full print sublimasi',
    'Jersey custom printing warna tajam',
    'Desain full body & gradient',
    'Reorder file tersimpan untuk tim berulang',
  ],
  '/tempat-bikin-jersey': [
    'Tempat bikin jersey di workshop Bandung',
    'Produksi 1 atap: desain, print, jahit, QC',
    'Bisa kunjungi dengan janji temu',
    'Kirim nasional termasuk Jabodetabek',
  ],
  '/jersey-printing-jakarta': [
    'Jersey custom Jakarta & Jabodetabek',
    'Jersey printing Jakarta — kirim cepat',
    'Tempat bikin jersey untuk tim Jakarta',
    'Vendor jersey Jakarta (produksi Bandung)',
  ],
  '/vendor-jersey-b2b': [
    'Vendor jersey B2B & supplier custom',
    'Partner produksi untuk reseller / brand',
    'Order corporate, sekolah, dan EO',
    'Repeat order dengan file desain tersimpan',
  ],
  '/jersey-tim-komunitas': [
    'Jersey tim futsal, bola, dan komunitas',
    'Promo beli 20 gratis 1',
    'Custom nama & nomor per pemain',
    'MOQ mulai 5 pcs untuk trial desain',
  ],
  '/kontak-kerja-sama': [
    'Kerja sama vendor & procurement',
    'Bulk order corporate & sekolah',
    'Reseller / kolaborasi brand',
    'Konsultasi cepat via WhatsApp',
  ],
}

export function getB2bFaqsForPath(pathname = '') {
  const path = pathname.replace(/\/$/, '') || '/kontak-kerja-sama'
  const extras = {
    '/konveksi-jersey-bandung': [
      {
        question: 'Workshop AHR di mana di Bandung?',
        answer:
          'Workshop di Jl. Bojong Tanjung No.19, Katapang, Kabupaten Bandung. Bisa kunjungi dengan janji temu via WhatsApp.',
      },
    ],
    '/jersey-printing-jakarta': [
      {
        question: 'Produksi di Jakarta atau Bandung?',
        answer:
          'Produksi di workshop Bandung (Katapang), lalu dikirim cepat ke Jakarta/Jabodetabek. Cocok untuk tim yang butuh vendor terpercaya tanpa harus ke Bandung dulu.',
      },
    ],
    '/vendor-jersey-b2b': [
      {
        question: 'Apa bedanya jalur vendor B2B?',
        answer:
          'Fokus partnership berulang: brief jelas, file tersimpan untuk reorder, dan opsi white label/reseller sesuai kesepakatan.',
      },
    ],
    '/pembuatan-jersey': [
      {
        question: 'Apa saja tahapan pembuatan jersey di AHR?',
        answer:
          'Brief kebutuhan → mockup gratis → revisi hingga approve → produksi full print → QC → kirim dengan update resi.',
      },
    ],
    '/printing-jersey': [
      {
        question: 'Printing jersey AHR pakai teknik apa?',
        answer:
          'Full print sublimasi pada bahan dry-fit sport. Warna menyatu ke serat kain sehingga lebih detail dan tahan luntur dibanding sablon biasa.',
      },
    ],
    '/tempat-bikin-jersey': [
      {
        question: 'Di mana alamat tempat bikin jersey AHR?',
        answer:
          'Workshop di Jl. Bojong Tanjung No.19, Katapang, Kabupaten Bandung. Bisa kunjungi dengan janji temu via WhatsApp, atau order penuh online.',
      },
    ],
  }

  return [...b2bBaseFaqs, ...(extras[path] || [])]
}

export function buildB2bPrerenderPayload(pathname, variant) {
  const path = pathname.replace(/\/$/, '') || '/kontak-kerja-sama'
  const faqs = getB2bFaqsForPath(path)
  const services = b2bServicesByPath[path] || b2bServicesByPath['/kontak-kerja-sama']

  return {
    title: variant?.hero?.title || variant?.title || 'Kontak & Kerja Sama AHR',
    intro: variant?.hero?.body || '',
    priceLead: 'Harga mulai Rp 88.000/pcs · MOQ 5 pcs · Produksi 2–3 hari kerja',
    trustBar: variant?.trustBar || [],
    highlights: variant?.highlights || [],
    intentBlocks: variant?.intentBlocks || [],
    services,
    pricingTiers: b2bPricingTiers,
    pricingDisclaimer: b2bPricingDisclaimer,
    processSteps: b2bProcessSteps,
    faqs,
    workshop: b2bWorkshop,
    testimonials: (variant?.testimonials || []).slice(0, 4),
  }
}
