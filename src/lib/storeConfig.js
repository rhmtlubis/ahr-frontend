import { CSS_WHATSAPP_NUMBER, getCssContactProfile, getCssFooterMessage, getCssInstagramUrl } from './cssStoreConfig'

const STORE_MODE = String(import.meta.env.VITE_STORE_MODE || 'hybrid').toLowerCase()
const BRAND_SKIN = String(import.meta.env.VITE_BRAND_SKIN || 'ahr').toLowerCase()
const SITE_URL = String(import.meta.env.VITE_SITE_URL || 'https://ahrcorporation.id').replace(/\/$/, '')
const MAIN_SITE_URL = String(import.meta.env.VITE_MAIN_SITE_URL || 'https://ahrcorporation.id').replace(/\/$/, '')
const STORE_BRAND_NAME = String(import.meta.env.VITE_STORE_BRAND_NAME || (BRAND_SKIN === 'css' ? 'CS Studio' : 'AHR'))

const B2B_PATH_PATTERN = /\/(b2b|kontak-kerja-sama)(\/|$)/i
const B2B_LABEL_PATTERN = /\b(corporate\s*kit|kerja\s*sama|vendor|wholesale|procurement|konsultasi(\s*desain|\s*awal)?|reorder\s*support|partner)\b/i

function isB2cExcludedLink(link = {}) {
  const href = String(link?.href || '')
  const label = String(link?.label || '')

  return B2B_PATH_PATTERN.test(href) || B2B_LABEL_PATTERN.test(label)
}

export function isB2cOnlyStore() {
  return STORE_MODE === 'b2c'
}

export function isCssStore() {
  return BRAND_SKIN === 'css'
}

export function getSiteUrl() {
  return SITE_URL
}

export function getMainSiteUrl() {
  return MAIN_SITE_URL
}

export function getStoreBrandName() {
  return STORE_BRAND_NAME
}

export function isB2bPath(pathname = '') {
  return B2B_PATH_PATTERN.test(String(pathname || ''))
}

export function filterB2cStoreLinks(links = []) {
  if (!isB2cOnlyStore()) {
    return links
  }

  return links.filter((link) => !isB2cExcludedLink(link))
}

export function filterB2cNavGroups(navGroups = []) {
  if (!isB2cOnlyStore()) {
    return navGroups
  }

  return navGroups
    .map((group) => ({
      ...group,
      columns: Array.isArray(group.columns)
        ? group.columns.map((column) => ({
            ...column,
            links: filterB2cStoreLinks(column.links),
          }))
        : [],
    }))
    .filter((group) => group.columns.some((column) => column.links.length > 0))
}

export function getRetailHeaderNav(locale = 'id') {
  if (!isCssStore()) {
    return null
  }

  const isEnglish = locale === 'en'

  return [
    { label: isEnglish ? 'SHOP' : 'TOKO', href: '/all-products' },
    { label: isEnglish ? 'ARTICLES' : 'ARTIKEL', href: '/artikel' },
  ]
}

export function getRetailHeaderActions(fallback = {}) {
  if (!isCssStore()) {
    return fallback
  }

  return {
    primaryActionLabel: null,
    onPrimaryAction: undefined,
  }
}

export function getStoreScopeParam() {
  return isCssStore() ? 'css' : 'ahr'
}

export function getRetailFooterContent(locale = 'id') {
  if (!isCssStore()) {
    return null
  }

  const isEnglish = locale === 'en'

  return {
    companyDescription: isEnglish
      ? 'Streetwear & fantasy apparel by CS Studio — retail storefront powered by AHR Corporation.'
      : 'Streetwear & apparel fantasy oleh CS Studio — toko retail dari AHR Corporation.',
    footerGroups: [
      {
        title: isEnglish ? 'Navigate' : 'Navigasi',
        links: [
          { label: 'Home', href: '/' },
          { label: isEnglish ? 'Products' : 'Produk', href: '/all-products' },
          { label: isEnglish ? 'Articles' : 'Artikel', href: '/artikel' },
        ],
      },
      {
        title: isEnglish ? 'Information' : 'Informasi',
        links: [
          { label: isEnglish ? 'Terms & Conditions' : 'Syarat & Ketentuan', href: '/syarat-ketentuan' },
          { label: isEnglish ? 'International Shipping' : 'Pengiriman Internasional', href: '/pengiriman-internasional' },
          { label: 'AHR Corporation', href: `${MAIN_SITE_URL}/` },
        ],
      },
    ],
    bottomText: isEnglish
      ? '© 2026 CS Studio. Crafting quality custom apparel.'
      : '© 2026 CS Studio. Apparel custom berkualitas.',
    hideContact: false,
    hideSocial: false,
    socialLinks: [
      {
        label: 'Instagram CS Studio',
        href: getCssInstagramUrl(),
        external: true,
      },
      {
        label: isEnglish ? 'WhatsApp CS Studio' : 'WhatsApp CS Studio',
        href: `https://wa.me/${CSS_WHATSAPP_NUMBER}`,
        external: true,
      },
    ],
    contactProfile: getCssContactProfile(locale),
    footerMessage: getCssFooterMessage(locale),
  }
}
