import { useEffect } from 'react'

const DEFAULT_TITLE = 'AHR'
const DEFAULT_DESCRIPTION =
  'AHR melayani jersey custom sublimasi, seragam printing, apparel olahraga, dan kebutuhan konveksi custom untuk tim, komunitas, sekolah, dan perusahaan.'
const DEFAULT_KEYWORDS =
  'jersey custom, jersey sublimasi, seragam printing, konveksi jersey, apparel olahraga, AHR'
const DEFAULT_SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://ahrcorporation.id').replace(/\/+$/, '')
const DEFAULT_OG_IMAGE = `${DEFAULT_SITE_URL}/og-preview.png`

export function buildPageTitle(pageTitle) {
  const trimmedTitle = String(pageTitle || '').trim()

  return trimmedTitle ? `${trimmedTitle} | ${DEFAULT_TITLE}` : DEFAULT_TITLE
}

function ensureMetaTag(selector, attributes) {
  let metaTag = document.querySelector(selector)

  if (!metaTag) {
    metaTag = document.createElement('meta')
    Object.entries(attributes).forEach(([key, value]) => {
      metaTag.setAttribute(key, value)
    })
    document.head.appendChild(metaTag)
  }

  return metaTag
}

function ensureLinkTag(selector, attributes) {
  let linkTag = document.querySelector(selector)

  if (!linkTag) {
    linkTag = document.createElement('link')
    Object.entries(attributes).forEach(([key, value]) => {
      linkTag.setAttribute(key, value)
    })
    document.head.appendChild(linkTag)
  }

  return linkTag
}

function buildCanonicalUrl(canonicalPath) {
  if (!canonicalPath) {
    return window.location.href
  }

  if (/^https?:\/\//i.test(canonicalPath)) {
    return canonicalPath
  }

  const normalizedPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`

  return `${DEFAULT_SITE_URL}${normalizedPath}`
}

export default function useDocumentTitle(pageTitle, pageDescription = DEFAULT_DESCRIPTION, options = {}) {
  useEffect(() => {
    const {
      canonicalPath,
      image,
      imageAlt,
      keywords = DEFAULT_KEYWORDS,
      locale = 'id',
      robots = 'index, follow',
      type = 'website',
    } = options
    const title = buildPageTitle(pageTitle)
    const description = String(pageDescription || DEFAULT_DESCRIPTION).trim()
    const canonicalUrl = buildCanonicalUrl(canonicalPath)
    const resolvedImage = image
      ? /^https?:\/\//i.test(image)
        ? image
        : `${DEFAULT_SITE_URL}${image.startsWith('/') ? image : `/${image}`}`
      : DEFAULT_OG_IMAGE
    const normalizedLocale = locale === 'en' ? 'en_US' : 'id_ID'
    const resolvedImageAlt = String(imageAlt || title || DEFAULT_TITLE).trim()

    document.title = title
    document.documentElement.lang = locale

    ensureMetaTag('meta[name="description"]', { name: 'description' }).setAttribute('content', description)
    ensureMetaTag('meta[name="keywords"]', { name: 'keywords' }).setAttribute('content', keywords)
    ensureMetaTag('meta[name="robots"]', { name: 'robots' }).setAttribute('content', robots)
    ensureMetaTag('meta[property="og:site_name"]', { property: 'og:site_name' }).setAttribute('content', DEFAULT_TITLE)
    ensureMetaTag('meta[property="og:locale"]', { property: 'og:locale' }).setAttribute('content', normalizedLocale)
    ensureMetaTag('meta[property="og:type"]', { property: 'og:type' }).setAttribute('content', type)
    ensureMetaTag('meta[property="og:title"]', { property: 'og:title' }).setAttribute('content', title)
    ensureMetaTag('meta[property="og:description"]', { property: 'og:description' }).setAttribute('content', description)
    ensureMetaTag('meta[property="og:url"]', { property: 'og:url' }).setAttribute('content', canonicalUrl)
    ensureMetaTag('meta[property="og:image"]', { property: 'og:image' }).setAttribute('content', resolvedImage)
    ensureMetaTag('meta[property="og:image:alt"]', { property: 'og:image:alt' }).setAttribute('content', resolvedImageAlt)
    ensureMetaTag('meta[name="twitter:card"]', { name: 'twitter:card' }).setAttribute('content', 'summary_large_image')
    ensureMetaTag('meta[name="twitter:title"]', { name: 'twitter:title' }).setAttribute('content', title)
    ensureMetaTag('meta[name="twitter:description"]', { name: 'twitter:description' }).setAttribute('content', description)
    ensureMetaTag('meta[name="twitter:image"]', { name: 'twitter:image' }).setAttribute('content', resolvedImage)
    ensureLinkTag('link[rel="canonical"]', { rel: 'canonical' }).setAttribute('href', canonicalUrl)
  }, [options, pageDescription, pageTitle])
}
