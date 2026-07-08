import { getApiUrl } from './api'
import { getStoreScopeParam, isCssStore } from './storeConfig'
import { articles as fallbackArticles, getArticleBySlug as getFallbackArticleBySlug } from '../content/articles.js'

function buildArticlesUrl(locale, store) {
  const params = new URLSearchParams({ locale })
  if (store) {
    params.set('store', store)
  }

  return getApiUrl(`/api/articles?${params.toString()}`)
}

function buildArticleUrl(slug, locale, store) {
  const params = new URLSearchParams({ locale })
  if (store) {
    params.set('store', store)
  }

  return getApiUrl(`/api/articles/${slug}?${params.toString()}`)
}

export async function fetchArticles(locale = 'id') {
  const store = getStoreScopeParam()

  try {
    const response = await fetch(buildArticlesUrl(locale, store), {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to load articles')
    }

    const payload = await response.json()
    const items = Array.isArray(payload?.data) ? payload.data : []

    if (items.length > 0) {
      return items
    }

    return isCssStore() ? [] : fallbackArticles
  } catch {
    return isCssStore() ? [] : fallbackArticles
  }
}

export async function fetchArticle(slug, locale = 'id') {
  if (!slug) {
    return null
  }

  const store = getStoreScopeParam()

  try {
    const response = await fetch(buildArticleUrl(slug, locale, store), {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to load article')
    }

    const payload = await response.json()

    return payload?.data || (isCssStore() ? null : getFallbackArticleBySlug(slug))
  } catch {
    return isCssStore() ? null : getFallbackArticleBySlug(slug)
  }
}

export function getFallbackArticles() {
  return isCssStore() ? [] : fallbackArticles
}
