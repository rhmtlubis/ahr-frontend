import { getApiUrl } from './api'
import { articles as fallbackArticles, getArticleBySlug as getFallbackArticleBySlug } from '../content/articles.js'

export async function fetchArticles(locale = 'id') {
  try {
    const response = await fetch(getApiUrl(`/api/articles?locale=${locale}`), {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to load articles')
    }

    const payload = await response.json()
    const items = Array.isArray(payload?.data) ? payload.data : []

    return items.length > 0 ? items : fallbackArticles
  } catch {
    return fallbackArticles
  }
}

export async function fetchArticle(slug, locale = 'id') {
  if (!slug) {
    return null
  }

  try {
    const response = await fetch(getApiUrl(`/api/articles/${slug}?locale=${locale}`), {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to load article')
    }

    const payload = await response.json()

    return payload?.data || getFallbackArticleBySlug(slug)
  } catch {
    return getFallbackArticleBySlug(slug)
  }
}

export function getFallbackArticles() {
  return fallbackArticles
}
