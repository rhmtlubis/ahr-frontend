const CSS_MAIN_SITE_URL = String(import.meta.env.VITE_MAIN_SITE_URL || 'https://ahrcorporation.id').replace(/\/$/, '')
const CSS_STORE_SITE_URL = String(import.meta.env.VITE_SITE_URL || 'https://css.ahrcorporation.id').replace(/\/$/, '')
const CSS_STORE_BRAND_NAME = String(import.meta.env.VITE_STORE_BRAND_NAME || 'CS Studio')
const CSS_INSTAGRAM_URL =
  String(import.meta.env.VITE_CSS_INSTAGRAM_URL || '').trim() ||
  'https://www.instagram.com/customsupplystudio/'

export const CSS_SHOPEE_URL =
  String(import.meta.env.VITE_CSS_SHOPEE_URL || '').trim() ||
  'https://shopee.co.id/ahrcustomsupply?categoryId=100637&entryPoint=ShopByPDP&itemId=42879547429&upstream=search'

const CSS_WHATSAPP_RAW =
  String(import.meta.env.VITE_CSS_WHATSAPP_NUMBER || import.meta.env.VITE_CSS_WHATSAPP_DISPLAY || '').trim() ||
  '089653616294'

export function normalizeCssWhatsAppNumber(value = CSS_WHATSAPP_RAW) {
  const digits = String(value || '').replace(/\D/g, '')

  if (!digits) {
    return '6289653616294'
  }

  if (digits.startsWith('62')) {
    return digits
  }

  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`
  }

  return digits
}

export const CSS_WHATSAPP_NUMBER = normalizeCssWhatsAppNumber()

export function formatCssWhatsAppDisplay(number = CSS_WHATSAPP_NUMBER) {
  const digits = String(number || '').replace(/\D/g, '')

  if (digits.startsWith('62') && digits.length >= 10) {
    return `0${digits.slice(2)}`
  }

  return CSS_WHATSAPP_RAW
}

export function buildCssWhatsAppUrl(message = 'Halo CS Studio, saya ingin tanya produk World Cup Fantasy.') {
  return `https://wa.me/${CSS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function getCssInstagramUrl() {
  return CSS_INSTAGRAM_URL
}

export function getCssShopeeUrl() {
  return CSS_SHOPEE_URL
}

export function getCssStoreUrl() {
  return CSS_STORE_SITE_URL
}

export function getCssLinktreeShareOptions(locale = 'id') {
  const isEnglish = locale === 'en'
  const pageUrl = `${CSS_STORE_SITE_URL}/linktree`
  const shareText = isEnglish
    ? 'Check out CS Studio — World Cup Fantasy jerseys and official store links.'
    : 'Lihat CS Studio — jersey World Cup Fantasy dan link toko resmi.'

  return {
    pageUrl,
    shareText,
    title: isEnglish ? 'Share CS Studio' : 'Bagikan CS Studio',
    copyLabel: isEnglish ? 'Copy link' : 'Salin link',
    copiedLabel: isEnglish ? 'Copied' : 'Tersalin',
    whatsappLabel: 'WhatsApp',
    facebookLabel: 'Facebook',
    xLabel: 'X',
  }
}

export function getCssShopChannels(locale = 'id') {
  const isEnglish = locale === 'en'

  return {
    sectionLabel: isEnglish ? 'Online official store' : 'Online official store',
    websiteTip: isEnglish
      ? 'Shop on our website for direct pricing from CS Studio, and free shipping on eligible orders.'
      : 'Belanja di website untuk harga langsung dari CS Studio, plus gratis ongkir untuk order yang memenuhi syarat.',
    channels: [
      {
        id: 'website',
        label: isEnglish ? 'Website' : 'Website',
        badge: isEnglish ? 'Free shipping' : 'Gratis ongkir',
        description: isEnglish ? 'Best price — shop direct from CS Studio' : 'Harga terbaik — belanja langsung dari CS Studio',
        href: '/all-products',
        internal: true,
        recommended: true,
      },
      {
        id: 'shopee',
        label: 'Shopee Custom Supply Studio',
        description: isEnglish ? 'Official store on Shopee' : 'Toko resmi di Shopee',
        href: CSS_SHOPEE_URL,
        internal: false,
        recommended: false,
      },
    ],
  }
}

export function getCssTrustItems(locale = 'id') {
  const isEnglish = locale === 'en'

  return [
    {
      id: 'midtrans',
      label: isEnglish ? 'Secure payment via Midtrans' : 'Pembayaran aman via Midtrans',
    },
    {
      id: 'ahr',
      label: isEnglish ? 'Produced by AHR Corporation' : 'Produksi AHR Corporation',
    },
    {
      id: 'shipping',
      label: isEnglish ? 'Indonesia & international delivery' : 'Pengiriman Indonesia & internasional',
    },
    {
      id: 'production',
      label: isEnglish ? 'Production ±3 business days' : 'Produksi ±3 hari kerja',
    },
  ]
}

export function getCssCartShippingNote(locale = 'id') {
  return locale === 'en'
    ? 'Shipping cost is calculated after you enter your delivery address at checkout. Free Jabodetabek shipping may apply to eligible orders.'
    : 'Biaya ongkir dihitung setelah alamat pengiriman diisi di checkout. Gratis ongkir Jabodetabek berlaku untuk order yang memenuhi syarat.'
}

export function getCssContactProfile(locale = 'id') {
  const isEnglish = locale === 'en'

  return {
    lockup: CSS_STORE_BRAND_NAME,
    tagline: isEnglish
      ? 'Streetwear & fantasy apparel — order online or chat with us.'
      : 'Streetwear & apparel fantasy — pesan online atau chat dengan kami.',
    whatsapp_number: CSS_WHATSAPP_NUMBER,
    whatsapp_display: formatCssWhatsAppDisplay(),
    instagram_url: getCssInstagramUrl(),
    store_site_url: CSS_STORE_SITE_URL,
    main_site_url: CSS_MAIN_SITE_URL,
  }
}

export function getCssFooterMessage(locale = 'id') {
  return locale === 'en'
    ? 'Hello CS Studio, I would like to ask about World Cup Fantasy jerseys.'
    : 'Halo CS Studio, saya ingin tanya produk World Cup Fantasy.'
}

export function getCssHeroPanels(locale = 'id', articles = []) {
  const defaults = [
    {
      eyebrow: 'World Cup Fantasy 2026',
      title: locale === 'en' ? 'Shop the collection' : 'Koleksi jersey fantasy',
      cta: locale === 'en' ? 'View all products' : 'Lihat semua produk',
      href: '/all-products',
      image: '/og-preview.png',
    },
    {
      eyebrow: 'CS Studio',
      title: locale === 'en' ? 'Style inspiration' : 'Inspirasi gaya tim favorit',
      cta: locale === 'en' ? 'Read articles' : 'Baca artikel',
      href: '/artikel',
      image: '/og-preview.png',
    },
  ]

  if (articles.length >= 2) {
    return articles.slice(0, 2).map((article) => ({
      eyebrow: article.category || 'World Cup Fantasy',
      title: article.title.replace(/\s*World Cup Fantasy.*$/i, '').trim() || article.title,
      cta: locale === 'en' ? 'Explore' : 'Jelajahi',
      href: `/artikel/${article.slug}`,
      image: article.coverImage || article.cover_image?.url || '/og-preview.png',
    }))
  }

  if (articles.length === 1) {
    return [
      {
        eyebrow: articles[0].category || 'World Cup Fantasy',
        title: locale === 'en' ? 'Featured story' : 'Cerita unggulan',
        cta: locale === 'en' ? 'Read article' : 'Baca artikel',
        href: `/artikel/${articles[0].slug}`,
        image: articles[0].coverImage || '/og-preview.png',
      },
      defaults[0],
    ]
  }

  return defaults
}
