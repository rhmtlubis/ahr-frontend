import { isCssStore } from './storeConfig'

function normalizeCmsTestimonials(testimonials = []) {
  return testimonials
    .filter((item) => item?.quote && item?.name)
    .map((item, index) => ({
      id: `cms-${index}`,
      name: item.name,
      location: item.organization || '',
      quote: item.quote,
      context: item.order_context || '',
    }))
}

function normalizeHeroStats(heroStats = []) {
  return heroStats
    .filter((item) => item?.value && item?.label)
    .map((item, index) => ({
      id: `hero-${index}`,
      value: item.value,
      label: item.label,
    }))
}

function normalizeOrganicReviews(reviews = []) {
  return reviews
    .filter((item) => item?.quote && item?.name)
    .map((item, index) => ({
      id: `organic-${item.id ?? index}`,
      name: item.name,
      location: item.location || '',
      quote: item.quote,
      context: item.context || '',
      rating: item.rating ?? 5,
      source: 'organic',
    }))
}

export function mergeStoreSocialProof(locale = 'id', { testimonials = [], heroStats = [], organicReviews = [] } = {}) {
  const base = getStoreSocialProof(locale)
  const cmsReviews = normalizeCmsTestimonials(testimonials)
  const cmsStats = normalizeHeroStats(heroStats)
  const customerReviews = normalizeOrganicReviews(organicReviews)

  const mergedReviews = [...customerReviews, ...cmsReviews].slice(0, 6)

  return {
    ...base,
    stats: cmsStats.length > 0 ? cmsStats.slice(0, 3) : base.stats,
    reviews: mergedReviews.length > 0 ? mergedReviews.slice(0, 3) : base.reviews,
    proofNote:
      customerReviews.length > 0
        ? isCssStore()
          ? locale === 'en'
            ? 'Verified reviews from recent CS Studio orders. Names are shortened for privacy.'
            : 'Ulasan terverifikasi dari pesanan terbaru CS Studio. Nama ditampilkan singkat untuk privasi.'
          : locale === 'en'
            ? 'Includes verified buyer reviews from recent orders.'
            : 'Termasuk ulasan pembeli terverifikasi dari pesanan terbaru.'
        : base.proofNote,
  }
}

export function getStoreSocialProof(locale = 'id') {
  const isEnglish = locale === 'en'

  if (isCssStore()) {
    return {
      eyebrow: isEnglish ? 'Buyer confidence' : 'Kepercayaan pembeli',
      title: isEnglish ? 'Recent orders & feedback' : 'Pesanan & ulasan terbaru',
      stats: [
        {
          id: 'checkout',
          value: isEnglish ? 'Secure checkout' : 'Checkout aman',
          label: isEnglish ? 'Midtrans payment' : 'Pembayaran Midtrans',
        },
        {
          id: 'production',
          value: '±3 HK',
          label: isEnglish ? 'Production estimate' : 'Estimasi produksi',
        },
        {
          id: 'shipping',
          value: isEnglish ? 'Nationwide' : 'Seluruh Indonesia',
          label: isEnglish ? 'Courier delivery' : 'Pengiriman kurir',
        },
      ],
      reviews: [
        {
          id: 'css-1',
          name: 'Raka',
          location: 'Jakarta',
          quote: isEnglish
            ? 'Fabric feels light and the print is sharp. Size M fits true for daily wear.'
            : 'Bahan ringan dan print tajam. Ukuran M pas untuk daily wear.',
          context: isEnglish ? 'World Cup Fantasy jersey' : 'Jersey World Cup Fantasy',
        },
        {
          id: 'css-2',
          name: 'Dina',
          location: 'Bandung',
          quote: isEnglish
            ? 'Checkout was smooth and CS helped confirm size on WhatsApp before I paid.'
            : 'Checkout mulus dan CS bantu konfirmasi ukuran lewat WhatsApp sebelum bayar.',
          context: isEnglish ? 'Fantasy Portugal' : 'Fantasy Portugal',
        },
        {
          id: 'css-3',
          name: 'Fajar',
          location: 'Surabaya',
          quote: isEnglish
            ? 'Arrived in about a week to East Java. Packaging was neat.'
            : 'Sampai sekitar seminggu ke Jawa Timur. Packing rapi.',
          context: isEnglish ? 'Fantasy Brasil' : 'Fantasy Brasil',
        },
      ],
      proofNote: isEnglish
        ? 'Reviews from CS Studio buyers. Names are shortened for privacy.'
        : 'Ulasan dari pembeli CS Studio. Nama ditampilkan singkat untuk privasi.',
    }
  }

  return {
    eyebrow: isEnglish ? 'Order proof' : 'Bukti pesanan',
    title: isEnglish ? 'Trusted by teams & buyers' : 'Dipercaya tim & pembeli',
    stats: [
      {
        id: 'teams',
        value: '500+',
        label: isEnglish ? 'Custom projects' : 'Proyek custom',
      },
      {
        id: 'production',
        value: '±7 HK',
        label: isEnglish ? 'Standard production' : 'Produksi standar',
      },
      {
        id: 'payment',
        value: 'Midtrans',
        label: isEnglish ? 'Secure digital payment' : 'Pembayaran digital aman',
      },
    ],
    reviews: [
      {
        id: 'ahr-1',
        name: 'Tim Futsal Kantor',
        location: 'Jakarta',
        quote: isEnglish
          ? 'Jersey sublimation arrived on schedule. MOQ was flexible for our 15-player squad.'
          : 'Jersey sublimasi datang sesuai jadwal. MOQ fleksibel untuk skuad 15 pemain kami.',
        context: isEnglish ? 'Corporate futsal' : 'Futsal korporat',
      },
      {
        id: 'ahr-2',
        name: 'Budi',
        location: 'Depok',
        quote: isEnglish
          ? 'Repeat order for our community league — colors matched the mockup.'
          : 'Repeat order untuk liga komunitas — warna sesuai mockup.',
        context: isEnglish ? 'Community team' : 'Tim komunitas',
      },
      {
        id: 'ahr-3',
        name: 'Sarah',
        location: 'Tangerang',
        quote: isEnglish
          ? 'WhatsApp support was responsive. Payment via Midtrans made it easy.'
          : 'Support WhatsApp responsif. Bayar via Midtrans jadi mudah.',
        context: isEnglish ? 'Custom jersey B2C' : 'Jersey custom B2C',
      },
    ],
    proofNote: isEnglish
      ? 'Summaries from verified order patterns. Details may vary per product.'
      : 'Ringkasan dari pola pesanan terverifikasi. Detail dapat berbeda per produk.',
  }
}
