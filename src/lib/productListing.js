export function getProductSortAmount(product) {
  return (
    product?.pricing?.final_amount_minor ??
    product?.pricing?.source_final_amount_minor ??
    product?.pricing?.original_amount_minor ??
    product?.pricing?.source_original_amount_minor ??
    Number.MAX_SAFE_INTEGER
  )
}

function getProductCreatedAtTime(product) {
  const parsed = Date.parse(product?.createdAt || '')

  return Number.isFinite(parsed) ? parsed : 0
}

function sortByCreatedAt(products, direction = 'desc') {
  return [...products].sort((left, right) => {
    const delta = getProductCreatedAtTime(left) - getProductCreatedAtTime(right)

    return direction === 'desc' ? -delta : delta
  })
}

export function sortProducts(products = [], sortKey = 'newest') {
  if (sortKey === 'priceDesc') {
    return [...products].sort(
      (left, right) => getProductSortAmount(right) - getProductSortAmount(left),
    )
  }

  if (sortKey === 'priceAsc') {
    return [...products].sort(
      (left, right) => getProductSortAmount(left) - getProductSortAmount(right),
    )
  }

  return sortByCreatedAt(products, 'desc')
}
