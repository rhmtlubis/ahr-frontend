function normalizeCategoryKey(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
}

const WORLD_CUP_CATEGORY_KEYS = new Set(['world_cup', 'world_cup_series', 'world_cup_series_fantasy'])

export function shouldShowCssFantasyDisclaimer(product = {}) {
  const categoryKey = normalizeCategoryKey(product.categoryId || product.category_slug || product.category)
  const categoryLabel = String(product.category || product.category_label || '').toLowerCase()
  const productSlug = String(product.slug || '').toLowerCase()

  if (WORLD_CUP_CATEGORY_KEYS.has(categoryKey)) {
    return true
  }

  if (categoryKey.includes('world_cup') || categoryLabel.includes('world cup')) {
    return true
  }

  return productSlug.includes('cswrdcup') || productSlug.includes('football-c')
}

export function getCssProductFantasyDisclaimer(locale = 'id') {
  return locale === 'en'
    ? 'This is a fantasy / streetwear-inspired design by CS Studio. It is not official FIFA, PSSI, or national federation merchandise. Logos and marks are stylized for fashion purposes only.'
    : 'Ini desain fantasy / inspirasi streetwear dari CS Studio. Bukan merchandise resmi FIFA, PSSI, atau federasi sepak bola. Logo dan tanda dipakai sebagai gaya fashion saja.'
}

export function getCssProductFaqItems(product = {}, locale = 'id') {
  const categoryKey = normalizeCategoryKey(product.categoryId || product.category_slug || product.category)

  if (shouldShowCssFantasyDisclaimer(product)) {
    return getCssWorldCupFaqItems(locale)
  }

  if (categoryKey === 'padel') {
    return getCssPadelFaqItems(locale)
  }

  if (categoryKey === 'sepak_bola' || categoryKey === 'sepakbola') {
    return getCssFootballCustomFaqItems(locale)
  }

  return getCssGeneralApparelFaqItems(locale)
}

function getCssWorldCupFaqItems(locale = 'id') {
  const isEnglish = locale === 'en'

  return [
    {
      id: 'official',
      question: isEnglish ? 'Is this an official national team jersey?' : 'Apakah ini jersey timnas resmi?',
      answer: isEnglish
        ? 'No. CS Studio sells fantasy streetwear inspired by World Cup culture — not licensed federation products.'
        : 'Tidak. CS Studio menjual apparel fantasy streetwear terinspirasi budaya World Cup — bukan produk berlisensi federasi.',
    },
    {
      id: 'material',
      question: isEnglish ? 'What is the fabric like?' : 'Bahan jersey seperti apa?',
      answer: isEnglish
        ? 'Lightweight sublimation polyester, comfortable for daily wear and casual sport. Full-color print stays vibrant after wash when cared for properly.'
        : 'Polyester sublimasi ringan, nyaman untuk daily wear dan olahraga santai. Print full-color tetap tajam setelah dicuci bila dirawat dengan benar.',
    },
    {
      id: 'size',
      question: isEnglish ? 'How do I pick the right size?' : 'Bagaimana memilih ukuran yang pas?',
      answer: isEnglish
        ? 'Use the size chart on this page. Between sizes? Chat us on WhatsApp — we will help before you checkout.'
        : 'Pakai size chart di halaman ini. Antara dua ukuran? Chat kami via WhatsApp — kami bantu sebelum checkout.',
    },
    {
      id: 'production',
      question: isEnglish ? 'How long is production?' : 'Berapa lama produksi?',
      answer: isEnglish
        ? 'Approximately 3 business days after payment is confirmed, before courier pickup. Custom notes may add 1–2 days.'
        : 'Sekitar 3 hari kerja setelah pembayaran dikonfirmasi, sebelum kurir mengambil paket. Catatan custom mungkin menambah 1–2 hari.',
    },
    {
      id: 'return',
      question: isEnglish ? 'Can I exchange if the size is wrong?' : 'Bisa tukar ukuran jika tidak pas?',
      answer: isEnglish
        ? 'Contact us within 3 days of delivery for size issues on unworn items. Production is made to order — see Terms & Conditions for details.'
        : 'Hubungi kami dalam 3 hari setelah paket sampai untuk masalah ukuran pada item yang belum dipakai. Produksi made to order — lihat Syarat & Ketentuan untuk detail.',
    },
  ]
}

function getCssPadelFaqItems(locale = 'id') {
  const isEnglish = locale === 'en'

  return [
    {
      id: 'material',
      question: isEnglish ? 'What is the fabric like?' : 'Bahan apparel padel seperti apa?',
      answer: isEnglish
        ? 'Breathable performance fabric designed for court movement — lightweight, quick-dry, and comfortable for training or match play.'
        : 'Bahan performa breathable untuk gerakan di lapangan — ringan, cepat kering, dan nyaman untuk latihan maupun main match.',
    },
    {
      id: 'size',
      question: isEnglish ? 'How do I pick the right size?' : 'Bagaimana memilih ukuran yang pas?',
      answer: isEnglish
        ? 'Check the size chart on this page. Prefer a relaxed fit? Size up one step and confirm with us on WhatsApp before checkout.'
        : 'Lihat size chart di halaman ini. Mau fit lebih longgar? Naik satu ukuran dan konfirmasi lewat WhatsApp sebelum checkout.',
    },
    {
      id: 'production',
      question: isEnglish ? 'How long is production?' : 'Berapa lama produksi?',
      answer: isEnglish
        ? 'Around 3 business days after payment is confirmed. Custom print or notes may add 1–2 days.'
        : 'Sekitar 3 hari kerja setelah pembayaran dikonfirmasi. Custom print atau catatan bisa menambah 1–2 hari.',
    },
    {
      id: 'care',
      question: isEnglish ? 'How should I care for printed logos?' : 'Bagaimana merawat area logo print?',
      answer: isEnglish
        ? 'Wash with normal water, avoid scrubbing printed areas, and skip high-heat drying to keep the logo sharp.'
        : 'Cuci dengan air normal, hindari menggosok area logo, dan jangan gunakan pengering suhu tinggi agar logo tetap tajam.',
    },
    {
      id: 'return',
      question: isEnglish ? 'Can I exchange if the size is wrong?' : 'Bisa tukar ukuran jika tidak pas?',
      answer: isEnglish
        ? 'Contact us within 3 days of delivery for unworn items. Made-to-order items follow our Terms & Conditions.'
        : 'Hubungi kami dalam 3 hari setelah paket sampai untuk item yang belum dipakai. Produk made to order mengikuti Syarat & Ketentuan kami.',
    },
  ]
}

function getCssFootballCustomFaqItems(locale = 'id') {
  const isEnglish = locale === 'en'

  return [
    {
      id: 'custom',
      question: isEnglish ? 'Can I order for a team or community?' : 'Bisa order untuk tim atau komunitas?',
      answer: isEnglish
        ? 'Yes. Add quantities per size in cart or contact us on WhatsApp for mixed sizes and bulk notes.'
        : 'Bisa. Tambahkan jumlah per ukuran di cart atau hubungi kami via WhatsApp untuk ukuran campur dan catatan bulk.',
    },
    {
      id: 'material',
      question: isEnglish ? 'What is the fabric like?' : 'Bahan jersey seperti apa?',
      answer: isEnglish
        ? 'Lightweight sublimation polyester suitable for futsal, football, and regular training.'
        : 'Polyester sublimasi ringan, cocok untuk futsal, sepak bola, dan latihan rutin.',
    },
    {
      id: 'size',
      question: isEnglish ? 'How do I pick the right size?' : 'Bagaimana memilih ukuran yang pas?',
      answer: isEnglish
        ? 'Use the size chart on this page. We can help confirm sizing on WhatsApp before you pay.'
        : 'Pakai size chart di halaman ini. Kami bisa bantu konfirmasi ukuran lewat WhatsApp sebelum bayar.',
    },
    {
      id: 'production',
      question: isEnglish ? 'How long is production?' : 'Berapa lama produksi?',
      answer: isEnglish
        ? 'Approximately 3 business days after payment is confirmed, before courier pickup.'
        : 'Sekitar 3 hari kerja setelah pembayaran dikonfirmasi, sebelum kurir mengambil paket.',
    },
    {
      id: 'return',
      question: isEnglish ? 'Can I exchange if the size is wrong?' : 'Bisa tukar ukuran jika tidak pas?',
      answer: isEnglish
        ? 'Contact us within 3 days of delivery for size issues on unworn items.'
        : 'Hubungi kami dalam 3 hari setelah paket sampai untuk masalah ukuran pada item yang belum dipakai.',
    },
  ]
}

function getCssGeneralApparelFaqItems(locale = 'id') {
  const isEnglish = locale === 'en'

  return [
    {
      id: 'material',
      question: isEnglish ? 'What is the fabric like?' : 'Bahan produk seperti apa?',
      answer: isEnglish
        ? 'Comfort-focused materials for daily wear and light activity. See specifications above for fabric details on this item.'
        : 'Material nyaman untuk daily wear dan aktivitas ringan. Lihat spesifikasi di atas untuk detail bahan produk ini.',
    },
    {
      id: 'size',
      question: isEnglish ? 'How do I pick the right size?' : 'Bagaimana memilih ukuran yang pas?',
      answer: isEnglish
        ? 'Use the size chart on this page or message us on WhatsApp if you are between sizes.'
        : 'Pakai size chart di halaman ini atau chat kami via WhatsApp jika Anda di antara dua ukuran.',
    },
    {
      id: 'production',
      question: isEnglish ? 'How long is production?' : 'Berapa lama produksi?',
      answer: isEnglish
        ? 'Around 3 business days after payment is confirmed, unless noted otherwise on the product.'
        : 'Sekitar 3 hari kerja setelah pembayaran dikonfirmasi, kecuali ada catatan berbeda di produk.',
    },
    {
      id: 'care',
      question: isEnglish ? 'How should I care for this item?' : 'Bagaimana merawat produk ini?',
      answer: isEnglish
        ? 'Follow the care instructions above. Avoid high heat on printed areas when applicable.'
        : 'Ikuti petunjuk perawatan di atas. Hindari suhu tinggi pada area print bila ada.',
    },
    {
      id: 'return',
      question: isEnglish ? 'Can I exchange if the size is wrong?' : 'Bisa tukar ukuran jika tidak pas?',
      answer: isEnglish
        ? 'Contact us within 3 days of delivery for unworn items. Made-to-order production applies.'
        : 'Hubungi kami dalam 3 hari setelah paket sampai untuk item yang belum dipakai. Produksi made to order berlaku.',
    },
  ]
}
