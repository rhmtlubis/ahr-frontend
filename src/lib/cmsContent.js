const productTones = ['navy', 'sand', 'orange', 'black']

function createPlaceholderDataUrl(label, background, foreground = '#f8fafc') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="${background}" />
      <circle cx="180" cy="160" r="120" fill="rgba(255,255,255,0.08)" />
      <circle cx="1030" cy="720" r="180" fill="rgba(255,255,255,0.06)" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="${foreground}" font-family="Arial, sans-serif" font-size="54" font-weight="700">
        ${label}
      </text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export const productPlaceholderImage = createPlaceholderDataUrl('AHR Product', '#16324f')
export const categoryPlaceholderImage = createPlaceholderDataUrl('AHR Category', '#244c6a')
export const companyProfilePlaceholderImage = createPlaceholderDataUrl('AHR Profile', '#355d7a')
export const faqPlaceholderImage = createPlaceholderDataUrl('AHR FAQ', '#6b4f3b')

const fallbackAudiencePathsByLocale = {
  id: [
    {
      id: 'b2c-direct',
      label: 'Beli Langsung / Personal',
      audience: 'b2c',
      journey: 'customer_direct',
    },
  ],
  en: [
    {
      id: 'b2c-direct',
      label: 'Direct Purchase / Personal',
      audience: 'b2c',
      journey: 'customer_direct',
    },
  ],
}

export function slugifyCategoryLabel(label = '') {
  return String(label)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

export function getAudiencePaths(payloadAudiencePaths = [], locale = 'id') {
  if (Array.isArray(payloadAudiencePaths) && payloadAudiencePaths.length > 0) {
    return payloadAudiencePaths
  }

  return fallbackAudiencePathsByLocale[locale] || fallbackAudiencePathsByLocale.id
}

export function findAudiencePathById(audiencePaths = [], segmentId = '') {
  return audiencePaths.find((item) => item.id === segmentId) || null
}

function normalizeTextArray(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item || '').trim()).filter(Boolean)
    : []
}

function normalizeSizeStock(sizeStock) {
  return sizeStock && typeof sizeStock === 'object' ? sizeStock : {}
}

function normalizeGallery(gallery, fallbackImage) {
  if (Array.isArray(gallery) && gallery.length > 0) {
    return gallery.filter(Boolean)
  }

  return [fallbackImage]
}

function buildDetail(item) {
  if (item?.detail) {
    return item.detail
  }

  return [item?.material, item?.moq].filter(Boolean).join(' • ')
}

function buildProductImage(item) {
  return item?.image || item?.featured_image?.url || productPlaceholderImage
}

function normalizeCatalogProduct(item = {}, index = 0) {
  const image = buildProductImage(item)
  const categoryLabel = item.category_label || item.category || ''

  return {
    id: item.id || item.slug || `product-${index + 1}`,
    slug: item.slug || item.id || `product-${index + 1}`,
    name: item.name || 'Produk AHR',
    category: categoryLabel,
    categoryId: item.category || slugifyCategoryLabel(categoryLabel) || 'uncategorized',
    price: item.price || item.price_hint || '',
    originalPrice: item.originalPrice || (item.promo_price_hint ? item.price_hint : null),
    bestPrice: item.bestPrice || item.promo_price_hint || null,
    promoBadge: item.promoBadge || item.promo_badge || null,
    hasPromo: Boolean(item.hasPromo || item.promo_price_hint || item.bestPrice),
    pricing: item.pricing || null,
    detail: buildDetail(item),
    tone: item.tone || productTones[index % productTones.length],
    audience: item.audience || item.segment || '',
    image,
    imagePosition: item.imagePosition || 'center center',
    gallery: normalizeGallery(item.gallery, image),
    summary: item.summary || item.lead || '',
    availability: item.availability || item.production_estimate || '',
    color: item.color || item.colorway || '',
    description: normalizeTextArray(item.description),
    specifications: normalizeTextArray(item.specifications),
    careInstructions: normalizeTextArray(item.care_instructions || item.careInstructions),
    sizeStock: normalizeSizeStock(item.size_stock || item.sizeStock),
    material: item.material || '',
    moq: item.moq || '',
  }
}

export function normalizeProducts(catalogItems = []) {
  if (!Array.isArray(catalogItems) || catalogItems.length === 0) {
    return []
  }

  return catalogItems.map((item, index) => normalizeCatalogProduct(item, index))
}

export function normalizeProductDetail(item) {
  if (!item) {
    return null
  }

  return normalizeCatalogProduct(item, 0)
}

export function normalizeCategoryCard(category = {}, count = 0) {
  return {
    id: category.id || slugifyCategoryLabel(category.label) || 'category',
    label: category.label || 'Category',
    image: category.image || category.cover_image?.url || categoryPlaceholderImage,
    position: category.position || 'center center',
    audience: category.audience || 'hybrid',
    count,
  }
}
