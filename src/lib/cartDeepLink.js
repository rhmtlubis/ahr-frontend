const DEFAULT_PRODUCT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const ITEM_ID_KEYS = ['item_id', 'product_id', 'id']

/**
 * Parse Merchant Center / shopping deep-link params from a cart URL.
 * Primary template: /cart?item_id={id} where {id} is the product offer_id (slug).
 */
export function parseCartDeepLinkParams(search = '') {
  const params = new URLSearchParams(typeof search === 'string' ? search : '')

  let itemId = ''

  for (const key of ITEM_ID_KEYS) {
    const value = String(params.get(key) || '').trim()

    if (value) {
      itemId = value
      break
    }
  }

  const size = String(params.get('size') || '').trim()
  const quantityRaw = params.get('qty') || params.get('quantity') || '1'
  const quantity = Number.parseInt(quantityRaw, 10)

  return {
    itemId,
    size: size || null,
    quantity: Number.isFinite(quantity) && quantity > 0 ? Math.min(quantity, 999) : 1,
    hasDeepLink: Boolean(itemId),
  }
}

export function stripCartDeepLinkParams(search = '') {
  const params = new URLSearchParams(typeof search === 'string' ? search : '')

  ITEM_ID_KEYS.forEach((key) => params.delete(key))
  params.delete('size')
  params.delete('qty')
  params.delete('quantity')

  const next = params.toString()

  return next ? `?${next}` : ''
}

function getSizeOptions(product) {
  if (Array.isArray(product?.sizeOptions) && product.sizeOptions.length > 0) {
    return [...new Set(product.sizeOptions.map((size) => String(size).trim()).filter(Boolean))]
  }

  if (product?.sizeStock && typeof product.sizeStock === 'object') {
    const stockSizes = Object.keys(product.sizeStock).filter(Boolean)

    if (stockSizes.length > 0) {
      return stockSizes
    }
  }

  return DEFAULT_PRODUCT_SIZES
}

export function pickDeepLinkSize(product, requestedSize = null) {
  const options = getSizeOptions(product)
  const sizeStock = product?.sizeStock && typeof product.sizeStock === 'object' ? product.sizeStock : {}

  if (requestedSize && options.includes(requestedSize)) {
    const stock = sizeStock[requestedSize]

    if (stock === undefined || stock === null || Number(stock) > 0) {
      return requestedSize
    }
  }

  const inStockSize = options.find((size) => {
    const stock = sizeStock[size]

    return stock === undefined || stock === null || Number(stock) > 0
  })

  return inStockSize || options[0] || 'M'
}

export function isProductAvailableForDeepLink(product) {
  if (!product?.slug) {
    return false
  }

  const availability = String(product.availability || '').toLowerCase()

  if (availability.includes('out') || availability.includes('habis')) {
    return false
  }

  const sizeStock = product.sizeStock && typeof product.sizeStock === 'object' ? product.sizeStock : null

  if (sizeStock && Object.keys(sizeStock).length > 0) {
    return Object.values(sizeStock).some((stock) => Number(stock) > 0)
  }

  return true
}
