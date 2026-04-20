import { hasPersonalizationConsent } from './consent'

const PRODUCT_VIEWS_STORAGE_KEY = 'ahr_product_views'

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readProductViews() {
  if (!canUseBrowserStorage()) {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(PRODUCT_VIEWS_STORAGE_KEY)

    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw)

    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeProductViews(views) {
  if (!canUseBrowserStorage()) {
    return
  }

  window.localStorage.setItem(PRODUCT_VIEWS_STORAGE_KEY, JSON.stringify(views))
}

export function clearPersonalizationData() {
  if (!canUseBrowserStorage()) {
    return
  }

  window.localStorage.removeItem(PRODUCT_VIEWS_STORAGE_KEY)
}

export function recordProductView(product) {
  if (!hasPersonalizationConsent() || !product?.slug) {
    return
  }

  const views = readProductViews()
  const existingEntry = views[product.slug] || {}

  views[product.slug] = {
    count: Number(existingEntry.count || 0) + 1,
    name: product.name || existingEntry.name || '',
    category: product.category || existingEntry.category || '',
    lastViewedAt: new Date().toISOString(),
  }

  writeProductViews(views)
}

export function getProductViewScore(productSlug) {
  const entry = readProductViews()[productSlug]

  return Number(entry?.count || 0)
}

export function sortProductsByPersonalization(products = []) {
  if (!hasPersonalizationConsent()) {
    return products
  }

  return [...products]
    .map((product, index) => ({
      product,
      index,
      score: getProductViewScore(product.slug),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      return left.index - right.index
    })
    .map((entry) => entry.product)
}

export function getPersonalizedProducts(products = [], limit = 4) {
  if (!hasPersonalizationConsent()) {
    return []
  }

  return sortProductsByPersonalization(products)
    .filter((product) => getProductViewScore(product.slug) > 0)
    .slice(0, limit)
}
