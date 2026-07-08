import { normalizeCategoryHref } from './categorySeo.js'
import {
  filterB2cNavGroups,
  filterB2cStoreLinks,
  getStoreBrandName,
  isB2cOnlyStore,
  isCssStore,
} from './storeConfig.js'
import { CSS_WHATSAPP_NUMBER } from './cssStoreConfig.js'

const localeDefaults = {
  id: {
    brand: {
      name: 'AHR',
      lockup: 'CV AHR Printing',
      tagline: '',
      whatsapp_number: '6281234567890',
      response_time: '',
    },
  },
  en: {
    brand: {
      name: 'AHR',
      lockup: 'CV AHR Printing',
      tagline: '',
      whatsapp_number: '6281234567890',
      response_time: '',
    },
  },
}

function getArticleLinkLabel(locale) {
  return locale === 'en' ? 'Articles' : 'Artikel'
}

function prefixHashHref(href, hashPrefix) {
  if (!href || !hashPrefix || !href.startsWith('#')) {
    return normalizeCategoryHref(href)
  }

  return `${hashPrefix}${href}`
}

function normalizeLinks(links = [], hashPrefix = '') {
  return links
    .filter((link) => typeof link === 'string' || (link?.label && link?.href))
    .map((link) =>
      typeof link === 'string'
        ? { label: link, href: hashPrefix ? `${hashPrefix}#products` : '#products' }
        : { label: link.label, href: prefixHashHref(link.href, hashPrefix) || '#' },
    )
}

function normalizeFooterGroups(groups = [], hashPrefix = '') {
  return groups
    .filter((group) => group?.title)
    .map((group) => ({
      ...group,
      links: normalizeLinks(group.links, hashPrefix),
    }))
}

function appendArticleShortcut(links = [], locale = 'id') {
  const hasArticleLink = links.some((link) => String(link?.href || '').includes('/artikel'))

  if (hasArticleLink) {
    return links
  }

  return [...links, { label: getArticleLinkLabel(locale), href: '/artikel' }]
}

function appendArticleFooterGroup(groups = [], locale = 'id') {
  const alreadyHasArticleGroup = groups.some((group) =>
    String(group?.title || '').toLowerCase().includes(locale === 'en' ? 'article' : 'artikel'),
  )

  if (alreadyHasArticleGroup) {
    return groups
  }

  return [
    ...groups,
    {
      title: getArticleLinkLabel(locale),
      links: [{ label: getArticleLinkLabel(locale), href: '/artikel' }],
    },
  ]
}

function normalizeNavGroups(groups = [], hashPrefix = '') {
  return groups
    .filter((group) => group?.id && group?.label)
    .map((group) => ({
      ...group,
      columns: Array.isArray(group.columns)
        ? group.columns.map((column) => ({
            ...column,
            links: normalizeLinks(column.links, hashPrefix),
          }))
        : [],
      feature: group.feature || { title: '', body: '' },
    }))
}

export function normalizeCompanyProfile(profile = {}) {
  return {
    about: '',
    history: '',
    commitment: '',
    reasons: Array.isArray(profile.reasons) ? profile.reasons : [],
    vision: '',
    missions: Array.isArray(profile.missions) ? profile.missions : [],
    ...profile,
    address: {
      label: '',
      line: '',
      mapUrl: '#contact',
      ...(profile.address || {}),
    },
  }
}

export function getLandingChromeContent(payload = {}, options = {}) {
  const { hashPrefix = '', locale = 'id' } = options
  const defaults = localeDefaults[locale] || localeDefaults.id
  const normalizedUtilityLinks = filterB2cStoreLinks(
    normalizeLinks(
      Array.isArray(payload.utility_links) && payload.utility_links.length > 0 ? payload.utility_links : [],
      hashPrefix,
    ),
  )
  const normalizedFooterGroups =
    Array.isArray(payload.footer_groups) && payload.footer_groups.length > 0
      ? normalizeFooterGroups(payload.footer_groups, hashPrefix).map((group) => ({
          ...group,
          links: filterB2cStoreLinks(group.links),
        }))
      : []

  const brandDefaults = {
    ...defaults.brand,
    ...(isCssStore()
      ? {
          name: getStoreBrandName(),
          lockup: getStoreBrandName(),
          tagline: isB2cOnlyStore()
            ? 'Streetwear & apparel fantasy — pesan online di CS Studio.'
            : defaults.brand.tagline,
          whatsapp_number: CSS_WHATSAPP_NUMBER,
        }
      : {}),
  }

  return {
    brand: {
      ...brandDefaults,
      ...(payload.brand || {}),
      ...(isCssStore()
        ? {
            name: getStoreBrandName(),
            lockup: getStoreBrandName(),
            whatsapp_number: CSS_WHATSAPP_NUMBER,
          }
        : {}),
    },
    utilityLinks: isCssStore()
      ? []
      : appendArticleShortcut(normalizedUtilityLinks, locale),
    footerGroups: appendArticleFooterGroup(normalizedFooterGroups, locale),
    navGroups: isCssStore()
      ? []
      : Array.isArray(payload.nav_groups) && payload.nav_groups.length > 0
        ? filterB2cNavGroups(normalizeNavGroups(payload.nav_groups, hashPrefix))
        : [],
    utilityMessage: isCssStore() ? '' : payload.utility_message || '',
    ticker: isCssStore() ? '' : payload.ticker || '',
    companyProfile: normalizeCompanyProfile(payload.company_profile || {}),
    decorativeMedia: payload.decorative_media || {},
    sectionContent: payload.section_content || {},
    qualityHighlights:
      Array.isArray(payload.quality_highlights) && payload.quality_highlights.length > 0
        ? payload.quality_highlights
        : [],
    footerBottomText: payload.footer_bottom_text || '',
  }
}

export const defaultBrand = localeDefaults.id.brand
export const defaultFooterBottomText = ''
export const defaultQualityHighlights = []
export const defaultSectionContent = {}
