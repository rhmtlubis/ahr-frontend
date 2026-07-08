export const fallbackSiteData = {
  siteName: 'AHR',
  siteUrl: 'https://ahrcorporation.id',
  defaultImage: '/og-preview.png',
  whatsappNumber: '6281234567890',
  brandDescription:
    'AHR melayani jersey custom sublimasi, seragam printing, apparel olahraga, dan kebutuhan konveksi custom untuk tim, komunitas, sekolah, dan perusahaan.',
  companyProfileDescription:
    'Kenali AHR sebagai perusahaan konveksi jersey custom, apparel sublimasi, dan seragam printing untuk brand, tim, dan instansi.',
  linktreeDescription:
    'Hubungi tim marketing AHR untuk order jersey custom, konsultasi desain sublimasi, dan informasi pemesanan apparel printing.',
  orianaChannelDescription:
    'Temukan Oriana Apparel di Shopee, WhatsApp, dan Instagram. Jersey original dan apparel olahraga.',
  faqItems: [
    {
      question: 'Berapa minimal order untuk jersey custom?',
      answer: 'Minimal order reguler dimulai dari 10 pcs, dengan opsi harga tier untuk volume yang lebih besar.',
    },
    {
      question: 'Apakah bisa minta sample fisik sebelum produksi massal?',
      answer: 'Bisa. Kami sediakan opsi sample fisik untuk order tertentu agar approval lebih aman sebelum produksi utama.',
    },
    {
      question: 'Berapa lama estimasi produksi?',
      answer: 'Estimasi standar adalah 7 hari kerja setelah desain final disetujui dan DP diterima.',
    },
  ],
  categories: [],
  // Keep this empty so a failed API fetch does not accidentally publish legacy product URLs.
  products: [],
}

export const legacyProductRedirects = [
  { from: '/produk/jersey-badminton', to: '/all-products?category=badminton' },
  { from: '/produk/jersey-baseball', to: '/all-products?category=baseball' },
  { from: '/produk/jersey-futsal-pro', to: '/all-products?category=futsal' },
  { from: '/produk/jersey-sepak-bola', to: '/all-products?category=sepak-bola' },
  { from: '/produk/jersey-trail', to: '/all-products?category=trail' },
  { from: '/produk/paket-esport', to: '/all-products?category=e-sport' },
]
