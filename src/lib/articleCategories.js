export function slugifyArticleCategory(category = '') {
  return String(category)
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildArticleCategoryNavigation(articles = []) {
  const buckets = new Map()

  for (const article of articles) {
    const label = String(article.category || '').trim()

    if (!label) {
      continue
    }

    const id = slugifyArticleCategory(label)
    const publishedAt = Date.parse(article.publishedAt || '') || 0
    const existing = buckets.get(id)

    if (!existing) {
      buckets.set(id, {
        id,
        label,
        count: 1,
        latestAt: publishedAt,
        coverImage: article.coverImage || null,
      })
      continue
    }

    existing.count += 1

    if (publishedAt >= existing.latestAt) {
      existing.latestAt = publishedAt
      existing.coverImage = article.coverImage || existing.coverImage
    }
  }

  return Array.from(buckets.values()).sort((left, right) => right.latestAt - left.latestAt)
}

export function filterArticlesByCategory(articles = [], categoryId = 'all') {
  if (!categoryId || categoryId === 'all') {
    return articles
  }

  return articles.filter((article) => slugifyArticleCategory(article.category) === categoryId)
}
