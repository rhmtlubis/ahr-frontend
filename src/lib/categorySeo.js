function normalizeCategoryValue(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

export function getCategoryKey(category = {}) {
  return normalizeCategoryValue(category.slug || category.id || category.label || '')
}

export function getCategoryRoute(categoryOrSlug = 'all') {
  if (typeof categoryOrSlug === 'string') {
    const normalized = normalizeCategoryValue(categoryOrSlug)
    return !normalized || normalized === 'all' ? '/all-products' : `/kategori/${normalized}`
  }

  const key = getCategoryKey(categoryOrSlug)
  return !key || key === 'all' ? '/all-products' : `/kategori/${key}`
}

export function normalizeCategoryHref(href = '') {
  const raw = String(href || '').trim()

  if (!raw.includes('/all-products?category=')) {
    return raw
  }

  const categoryId = raw.split('/all-products?category=')[1]?.split('&')[0]

  if (!categoryId) {
    return '/all-products'
  }

  return getCategoryRoute(decodeURIComponent(categoryId))
}

export function getCategorySeoContent(category = {}) {
  const label = String(category.label || 'Kategori Produk').trim()
  const lowerLabel = label.toLowerCase()

  return {
    label,
    title: `Koleksi ${label} Custom: Solusi Identitas Visual Premium`,
    intro: `Eksplorasi kurasi ${lowerLabel} terbaik yang dirancang khusus untuk memastikan setiap detail desain dan kualitas material memenuhi standar estetika serta performa tim Anda.`,
    keywords: `${lowerLabel} custom, premium ${lowerLabel} apparel, custom teamwear, sublimasi ${lowerLabel}, AHR printing`,
  }
}