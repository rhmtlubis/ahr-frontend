import { getCompanyProfileContent } from '../content/companyProfile'
import { getSiteChromeContent } from '../content/siteChrome'

const localeDefaults = {
  id: {
    brand: {
      name: 'AHR',
      lockup: 'CV AHR Printing',
      tagline: 'Apparel dan percetakan kustom dengan spesialisasi sublimasi jersey.',
      whatsapp_number: '6281234567890',
      response_time: 'Balas cepat di jam kerja untuk kebutuhan retail maupun bulk order',
    },
    footerBottomText: '© 2026 AHR Printing. Dibangun untuk kebutuhan retail dan teamwear.',
    sectionContent: {
      unified_direction_eyebrow: 'AHR Unified Direction',
      unified_direction_title: 'Tampilan dibuat lebih ringan agar orang cepat paham pilihan dan alur ordernya.',
      unified_direction_body: 'Fokus utamanya tetap pada produk, proses, dan titik kontak yang mudah dijangkau.',
      quality_panel_title: 'We offer quality',
      quality_panel_body: 'Material terbaik, proses rapi, dan layanan yang tetap mudah diikuti.',
      client_brands_eyebrow: 'Our Client Brand',
      client_brands_title:
        'Dipercaya brand, komunitas, sekolah, dan tim yang membutuhkan produksi lebih rapi dan mudah dikoordinasikan.',
      client_brands_body: 'Beberapa tipe klien dan kolaborator yang paling sering bekerja sama dengan AHR Printing.',
      process_eyebrow: 'Bulk order process',
      process_title: 'Bagian proses membantu menjelaskan apa yang terjadi setelah percakapan dimulai.',
      pricing_eyebrow: 'Paket Harga',
      pricing_title: 'Pilih paket yang paling mendekati kebutuhan order, lalu lanjutkan konsultasi untuk detail finalnya.',
      final_cta_eyebrow: 'Final CTA',
      final_cta_title: 'Pilih jalur yang paling sesuai, lalu lanjutkan percakapannya dengan cara yang nyaman.',
      faq_eyebrow: 'FAQ',
      faq_title: 'Beberapa hal yang biasanya ingin diketahui sebelum lanjut lebih jauh.',
      faq_visual_title: 'Masih ragu sebelum order?',
      faq_visual_body:
        'FAQ ini kami susun untuk menjawab pertanyaan yang paling sering muncul dari buyer tim, sekolah, komunitas, maupun customer personal sebelum masuk ke tahap konsultasi.',
      contact_eyebrow: 'Alamat & Kontak',
      contact_title: 'Kunjungi workshop kami di Katapang atau mulai konsultasi lewat WhatsApp dan Google Maps.',
      company_profile_intro_title:
        'Informasi perusahaan AHR kami pisahkan ke halaman ini agar halaman depan tetap ringkas.',
      company_profile_intro_body:
        'Di sini pengunjung bisa membaca profil, visi, misi, dan lokasi perusahaan tanpa mengganggu fokus halaman utama yang sekarang lebih diarahkan ke produk dan konsultasi.',
      company_profile_about_heading:
        'AHR PRINTING fokus pada jersey custom dengan proses yang rapi dan pelayanan yang responsif.',
      company_profile_vision_heading:
        'Visi dan misi tetap tersedia, tetapi sekarang ada di halaman khusus agar lebih nyaman dibaca.',
      company_profile_contact_heading: 'Kunjungi workshop kami atau lanjutkan diskusi lewat WhatsApp.',
    },
    qualityHighlights: [
      { title: 'Bahan nyaman', detail: 'Material dipilih supaya enak dipakai dan tetap rapi.' },
      { title: 'Print tajam', detail: 'Warna dan detail desain dijaga tetap bersih.' },
      { title: 'Jahit rapi', detail: 'Finishing dibuat konsisten untuk pemakaian harian.' },
      { title: 'Revisi mudah', detail: 'Arah desain dibahas singkat dan jelas.' },
      { title: 'Produksi aman', detail: 'Alur kerja dibuat terpantau sampai selesai.' },
      { title: 'Layanan responsif', detail: 'Tim cepat membantu saat ada pertanyaan order.' },
    ],
  },
  en: {
    brand: {
      name: 'AHR',
      lockup: 'CV AHR Printing',
      tagline: 'Custom apparel and printing with a focus on sublimation jerseys.',
      whatsapp_number: '6281234567890',
      response_time: 'Fast replies during business hours for retail and bulk orders',
    },
    footerBottomText: '© 2026 AHR Printing. Built for retail and teamwear needs.',
    sectionContent: {
      unified_direction_eyebrow: 'AHR Unified Direction',
      unified_direction_title: 'The layout is kept lighter so visitors quickly understand the options and order flow.',
      unified_direction_body: 'The main focus stays on products, process, and contact points that are easy to reach.',
      quality_panel_title: 'We offer quality',
      quality_panel_body: 'Better materials, neater production, and service that is still easy to follow.',
      client_brands_eyebrow: 'Our Client Brand',
      client_brands_title:
        'Trusted by brands, communities, schools, and teams that need production that is neater and easier to coordinate.',
      client_brands_body: 'Some of the client and collaborator types that work most often with AHR Printing.',
      process_eyebrow: 'Bulk order process',
      process_title: 'The process section helps explain what happens after the conversation begins.',
      pricing_eyebrow: 'Pricing Packages',
      pricing_title: 'Choose the package closest to your order needs, then continue the consultation for final details.',
      final_cta_eyebrow: 'Final CTA',
      final_cta_title: 'Choose the path that fits best, then continue the conversation in the way that feels easiest.',
      faq_eyebrow: 'FAQ',
      faq_title: 'A few things people usually want to know before moving forward.',
      faq_visual_title: 'Still unsure before ordering?',
      faq_visual_body:
        'We put this FAQ together to answer the questions that come up most often from team buyers, schools, communities, and personal customers before they move into consultation.',
      contact_eyebrow: 'Address & Contact',
      contact_title: 'Visit our workshop in Katapang or start a consultation through WhatsApp and Google Maps.',
      company_profile_intro_title:
        'We moved AHR company information to this page so the homepage can stay concise.',
      company_profile_intro_body:
        'Here, visitors can read the company profile, vision, mission, and location without distracting from the homepage focus on products and consultation.',
      company_profile_about_heading:
        'AHR PRINTING focuses on custom jerseys with a neat process and responsive service.',
      company_profile_vision_heading:
        'The vision and mission are still available, but now live on a dedicated page for easier reading.',
      company_profile_contact_heading: 'Visit our workshop or continue the conversation through WhatsApp.',
    },
    qualityHighlights: [
      { title: 'Comfortable fabric', detail: 'Materials are chosen to feel good and stay presentable.' },
      { title: 'Sharp print', detail: 'Colors and design details are kept clean and crisp.' },
      { title: 'Neat stitching', detail: 'Finishing stays consistent for daily wear.' },
      { title: 'Easy revisions', detail: 'Design direction is discussed briefly and clearly.' },
      { title: 'Safe production', detail: 'The workflow stays monitored until completion.' },
      { title: 'Responsive service', detail: 'The team helps quickly when order questions come up.' },
    ],
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

export function normalizeCompanyProfile(profile = {}, locale = 'id') {
  const defaultCompanyProfile = getCompanyProfileContent(locale)

  return {
    ...defaultCompanyProfile,
    ...profile,
    reasons: Array.isArray(profile.reasons) && profile.reasons.length > 0 ? profile.reasons : defaultCompanyProfile.reasons,
    missions:
      Array.isArray(profile.missions) && profile.missions.length > 0 ? profile.missions : defaultCompanyProfile.missions,
    address: {
      ...defaultCompanyProfile.address,
      ...(profile.address || {}),
    },
  }
}

export function getLandingChromeContent(payload = {}, options = {}) {
  const { hashPrefix = '', locale = 'id' } = options
  const defaults = localeDefaults[locale] || localeDefaults.id
  const {
    sharedFooterGroups,
    sharedHeaderTicker,
    sharedHeaderUtilityMessage,
    sharedNavGroups,
    sharedUtilityLinks,
  } = getSiteChromeContent(locale)

  return {
    brand: {
      ...defaults.brand,
      ...(payload.brand || {}),
    },
    utilityLinks:
      Array.isArray(payload.utility_links) && payload.utility_links.length > 0
        ? normalizeLinks(payload.utility_links, hashPrefix)
        : normalizeLinks(sharedUtilityLinks, hashPrefix),
    footerGroups:
      Array.isArray(payload.footer_groups) && payload.footer_groups.length > 0
        ? normalizeFooterGroups(payload.footer_groups, hashPrefix)
        : normalizeFooterGroups(sharedFooterGroups, hashPrefix),
    navGroups:
      Array.isArray(payload.nav_groups) && payload.nav_groups.length > 0
        ? normalizeNavGroups(payload.nav_groups, hashPrefix)
        : normalizeNavGroups(sharedNavGroups, hashPrefix),
    utilityMessage: payload.utility_message || sharedHeaderUtilityMessage,
    ticker: payload.ticker || sharedHeaderTicker,
    companyProfile: normalizeCompanyProfile(payload.company_profile, locale),
    decorativeMedia: payload.decorative_media || {},
    sectionContent: {
      ...defaults.sectionContent,
      ...(payload.section_content || {}),
    },
    qualityHighlights:
      Array.isArray(payload.quality_highlights) && payload.quality_highlights.length > 0
        ? payload.quality_highlights
        : defaults.qualityHighlights,
    footerBottomText: payload.footer_bottom_text || defaults.footerBottomText,
  }
}

export const defaultBrand = localeDefaults.id.brand
export const defaultFooterBottomText = localeDefaults.id.footerBottomText
export const defaultQualityHighlights = localeDefaults.id.qualityHighlights
export const defaultSectionContent = localeDefaults.id.sectionContent
