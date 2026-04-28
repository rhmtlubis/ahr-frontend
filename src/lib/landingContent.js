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

function prefixHashHref(href, hashPrefix) {
  if (!href || !hashPrefix || !href.startsWith('#')) {
    return href
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

  return {
    brand: {
      ...defaults.brand,
      ...(payload.brand || {}),
    },
    utilityLinks:
      Array.isArray(payload.utility_links) && payload.utility_links.length > 0
        ? normalizeLinks(payload.utility_links, hashPrefix)
        : [],
    footerGroups:
      Array.isArray(payload.footer_groups) && payload.footer_groups.length > 0
        ? normalizeFooterGroups(payload.footer_groups, hashPrefix)
        : [],
    navGroups:
      Array.isArray(payload.nav_groups) && payload.nav_groups.length > 0
        ? normalizeNavGroups(payload.nav_groups, hashPrefix)
        : [],
    utilityMessage: payload.utility_message || '',
    ticker: payload.ticker || '',
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
