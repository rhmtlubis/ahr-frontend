import { getSiteUrl, isCssStore } from './storeConfig'

const MEDIA_CDN_ORIGIN = 'https://media.ahrcorporation.id'

export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') {
    return url
  }

  if (!isCssStore() || !url.startsWith(`${MEDIA_CDN_ORIGIN}/`)) {
    return url
  }

  const siteOrigin = getSiteUrl().replace(/\/$/, '')

  return `${siteOrigin}${url.slice(MEDIA_CDN_ORIGIN.length)}`
}

export function resolveMediaUrls(urls = []) {
  if (!Array.isArray(urls)) {
    return urls
  }

  return urls.map((url) => resolveMediaUrl(url))
}
