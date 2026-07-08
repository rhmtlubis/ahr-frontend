function sortProductsByNewest(products = []) {
  return [...products].sort((left, right) => {
    const rightTime = Date.parse(right.createdAt || '') || 0
    const leftTime = Date.parse(left.createdAt || '') || 0

    return rightTime - leftTime
  })
}

function mergeUniqueProducts(existing = [], candidates = [], limit = 4) {
  const merged = [...existing]

  for (const product of candidates) {
    if (merged.length >= limit) {
      break
    }

    if (!merged.some((item) => item.slug === product.slug)) {
      merged.push(product)
    }
  }

  return merged.slice(0, limit)
}

/** Homepage grid: featured terbaru dulu, isi sisa dengan produk terbaru jika kurang dari 4. */
export function pickFeaturedProducts(products = [], limit = 4) {
  const featured = sortProductsByNewest(products.filter((product) => product.isFeatured))

  if (featured.length >= limit) {
    return featured.slice(0, limit)
  }

  return mergeUniqueProducts(featured, sortProductsByNewest(products), limit)
}

/** Linktree grid: hanya produk featured, urutan terbaru dulu (created_at DESC). */
export function pickLinktreeFeaturedProducts(products = [], limit = 4) {
  return sortProductsByNewest(products.filter((product) => product.isFeatured)).slice(0, limit)
}

export function getFeaturedSectionTitle(products = [], language = 'id') {
  if (!products.length) {
    return language === 'en' ? 'Featured picks' : 'Koleksi pilihan'
  }

  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))]

  if (categories.length === 1) {
    return categories[0]
  }

  return language === 'en' ? 'Latest picks' : 'Koleksi terbaru'
}
