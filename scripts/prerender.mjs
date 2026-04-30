import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fallbackSiteData } from './prerender-fallback-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const distRoot = path.join(projectRoot, 'dist')
const indexPath = path.join(distRoot, 'index.html')
const siteUrl = normalizeBaseUrl(process.env.VITE_SITE_URL || fallbackSiteData.siteUrl)
const apiCandidates = [
  process.env.VITE_PRERENDER_API_BASE_URL,
  process.env.VITE_API_BASE_URL,
  process.env.VITE_API_PROXY_TARGET,
]
  .map((value) => normalizeApiBaseUrl(value))
  .filter(Boolean)

async function main() {
  const template = await readFile(indexPath, 'utf8')
  const remotePayload = await loadLandingPayload()
  const siteData = buildSiteData(remotePayload)
  const productPages = siteData.products.map((product) => ({
    routePath: `/produk/${product.slug}`,
    filePath: path.join(distRoot, 'produk', product.slug, 'index.html'),
    title: `${product.name}${product.category ? ` - ${product.category} Custom Sublimasi` : ''}`,
    description: truncateText(
      product.summary ||
        `Lihat detail ${product.name}, spesifikasi, dan informasi order custom bersama AHR.`,
      200,
    ),
    image: resolveAbsoluteUrl(product.image || siteData.defaultImage),
    imageAlt: product.name,
    type: 'product',
    bodyContent: buildProductBodyContent(product, siteData),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        category: product.category || undefined,
        description: truncateText(product.summary || siteData.brandDescription, 400),
        image: [resolveAbsoluteUrl(product.image || siteData.defaultImage)],
        brand: {
          '@type': 'Brand',
          name: siteData.siteName,
        },
        url: `${siteUrl}/produk/${product.slug}`,
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: siteUrl },
        { name: 'Produk', url: `${siteUrl}/all-products` },
        { name: product.name, url: `${siteUrl}/produk/${product.slug}` },
      ]),
    ],
  }))

  const staticPages = [
    {
      routePath: '/',
      filePath: indexPath,
      title: 'Jersey Custom Sublimasi, Seragam Printing & Konveksi',
      description: siteData.brandDescription,
      image: resolveAbsoluteUrl(siteData.defaultImage),
      imageAlt: 'AHR custom jersey and sublimation apparel',
      type: 'website',
      bodyContent: buildHomepageBodyContent(siteData),
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: siteData.siteName,
          url: siteUrl,
          logo: resolveAbsoluteUrl(siteData.defaultImage),
          description: siteData.brandDescription,
          contactPoint: [
            {
              '@type': 'ContactPoint',
              telephone: formatTelephoneForSchema(siteData.whatsappNumber),
              contactType: 'customer service',
              availableLanguage: ['id', 'en'],
            },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteData.siteName,
          url: siteUrl,
          description: siteData.brandDescription,
        },
        buildFaqSchema(siteData.faqItems),
      ],
    },
    {
      routePath: '/all-products',
      filePath: path.join(distRoot, 'all-products', 'index.html'),
      title: 'Katalog Jersey Custom & Seragam Printing',
      description:
        'Jelajahi katalog jersey custom, apparel sublimasi, dan seragam printing AHR untuk tim, event, sekolah, komunitas, dan instansi.',
      image: resolveAbsoluteUrl(siteData.defaultImage),
      imageAlt: 'Katalog jersey custom AHR',
      type: 'website',
      bodyContent: buildListingBodyContent(siteData),
      jsonLd: [
        buildBreadcrumbSchema([
          { name: 'Home', url: siteUrl },
          { name: 'Produk', url: `${siteUrl}/all-products` },
        ]),
      ],
    },
    {
      routePath: '/profil',
      filePath: path.join(distRoot, 'profil', 'index.html'),
      title: 'Profil Perusahaan Konveksi & Sublimasi',
      description: siteData.companyProfileDescription,
      image: resolveAbsoluteUrl(siteData.defaultImage),
      imageAlt: 'Profil perusahaan AHR',
      type: 'website',
      bodyContent: buildSimplePageBodyContent(
        'Profil Perusahaan AHR',
        siteData.companyProfileDescription,
        [
          'AHR melayani kebutuhan jersey custom sublimasi, apparel printing, dan produksi seragam untuk tim, komunitas, sekolah, dan perusahaan.',
          'Halaman ini memuat ringkasan profil perusahaan untuk membantu pengunjung dan crawler memahami identitas brand AHR.',
        ],
      ),
      jsonLd: [
        buildBreadcrumbSchema([
          { name: 'Home', url: siteUrl },
          { name: 'Profil', url: `${siteUrl}/profil` },
        ]),
      ],
    },
    {
      routePath: '/linktree',
      filePath: path.join(distRoot, 'linktree', 'index.html'),
      title: 'Kontak Marketing Jersey Custom & Sublimasi',
      description: siteData.linktreeDescription,
      image: resolveAbsoluteUrl(siteData.defaultImage),
      imageAlt: 'Kontak marketing AHR',
      type: 'website',
      bodyContent: buildSimplePageBodyContent(
        'Kontak Marketing AHR',
        siteData.linktreeDescription,
        [
          'Gunakan halaman ini untuk menghubungi tim AHR, membuka WhatsApp, dan menemukan jalur tercepat menuju katalog serta company profile.',
        ],
      ),
      jsonLd: [
        buildBreadcrumbSchema([
          { name: 'Home', url: siteUrl },
          { name: 'Linktree', url: `${siteUrl}/linktree` },
        ]),
      ],
    },
  ]

  for (const page of [...staticPages, ...productPages]) {
    await ensureDirectory(path.dirname(page.filePath))
    await writeFile(page.filePath, injectMetadata(template, page), 'utf8')
  }

  await writeFile(
    path.join(distRoot, 'sitemap.xml'),
    buildSitemap([...staticPages, ...productPages]),
    'utf8',
  )
}

function normalizeBaseUrl(value) {
  const raw = String(value || '').trim() || fallbackSiteData.siteUrl

  return raw.replace(/\/+$/, '')
}

function normalizeApiBaseUrl(value) {
  const raw = String(value || '').trim()

  if (!raw) {
    return null
  }

  if (!/^https?:\/\//i.test(raw)) {
    return null
  }

  return raw.replace(/\/+$/, '')
}

async function loadLandingPayload() {
  for (const candidate of apiCandidates) {
    try {
      const response = await fetchWithTimeout(`${candidate}/api/catalog/landing-page?locale=id`)

      if (!response.ok) {
        continue
      }

      const payload = await response.json()

      if (payload?.data) {
        return payload.data
      }
    } catch {
      // Fallback handled below.
    }
  }

  return null
}

function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  return fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeout)
  })
}

function buildSiteData(payload) {
  if (!payload) {
    return fallbackSiteData
  }

  const products = Array.isArray(payload.catalog_items)
    ? payload.catalog_items.map((product) => ({
        slug: String(product.slug || product.id || '').trim(),
        name: String(product.name || 'Produk AHR').trim(),
        category: String(product.category_label || product.category || '').trim(),
        summary: String(product.summary || product.lead || '').trim(),
        image: fallbackSiteData.defaultImage,
        audience: String(product.audience || '').trim(),
        material: String(product.material || '').trim(),
        moq: String(product.moq || '').trim(),
        productionEstimate: String(product.production_estimate || '').trim(),
      }))
        .filter((product) => product.slug)
    : fallbackSiteData.products

  return {
    siteName: String(payload.brand?.name || fallbackSiteData.siteName).trim(),
    siteUrl,
    defaultImage: fallbackSiteData.defaultImage,
    whatsappNumber: String(payload.brand?.whatsapp_number || fallbackSiteData.whatsappNumber).trim(),
    brandDescription: truncateText(
      String(payload.hero?.subheadline || fallbackSiteData.brandDescription).trim(),
      200,
    ),
    companyProfileDescription: truncateText(
      String(payload.company_profile?.about || fallbackSiteData.companyProfileDescription).trim(),
      200,
    ),
    linktreeDescription: fallbackSiteData.linktreeDescription,
    faqItems: Array.isArray(payload.faqs) && payload.faqs.length > 0
      ? payload.faqs
          .map((faq) => ({
            question: String(faq.question || '').trim(),
            answer: String(faq.answer || '').trim(),
          }))
          .filter((faq) => faq.question && faq.answer)
          .slice(0, 6)
      : fallbackSiteData.faqItems,
    products: products.length > 0 ? products : fallbackSiteData.products,
  }
}

function injectMetadata(template, page) {
  const canonicalUrl = `${siteUrl}${page.routePath === '/' ? '' : page.routePath}`
  const fullTitle = `${page.title} | ${fallbackSiteData.siteName}`
  const locale = 'id_ID'
  const robots = page.routePath === '/cart' ? 'noindex, nofollow' : 'index, follow'
  const jsonLdMarkup = Array.isArray(page.jsonLd)
    ? page.jsonLd
        .filter(Boolean)
        .map((item) => `\n    <script type="application/ld+json">${escapeScriptContent(JSON.stringify(item))}</script>`)
        .join('')
    : page.jsonLd
      ? `\n    <script type="application/ld+json">${escapeScriptContent(JSON.stringify(page.jsonLd))}</script>`
      : ''

  let html = template
    .replace(/<html lang="[^"]*">/i, '<html lang="id">')
    .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/i, `<meta name="description" content="${escapeAttribute(page.description)}" />`)
    .replace(/<meta\s+name="robots"[\s\S]*?\/>/i, `<meta name="robots" content="${robots}" />`)
    .replace(/<link\s+rel="canonical"[\s\S]*?\/>/i, `<link rel="canonical" href="${canonicalUrl}" />`)
    .replace(/<meta\s+property="og:locale"[\s\S]*?\/>/i, `<meta property="og:locale" content="${locale}" />`)
    .replace(/<meta\s+property="og:type"[\s\S]*?\/>/i, `<meta property="og:type" content="${page.type}" />`)
    .replace(/<meta\s+property="og:title"[\s\S]*?\/>/i, `<meta property="og:title" content="${escapeAttribute(fullTitle)}" />`)
    .replace(/<meta\s+property="og:description"[\s\S]*?\/>/i, `<meta property="og:description" content="${escapeAttribute(page.description)}" />`)
    .replace(/<meta\s+property="og:url"[\s\S]*?\/>/i, `<meta property="og:url" content="${canonicalUrl}" />`)
    .replace(/<meta\s+property="og:image"[\s\S]*?\/>/i, `<meta property="og:image" content="${page.image}" />`)
    .replace(/<meta\s+property="og:image:alt"[\s\S]*?\/>/i, `<meta property="og:image:alt" content="${escapeAttribute(page.imageAlt)}" />`)
    .replace(/<meta\s+name="twitter:title"[\s\S]*?\/>/i, `<meta name="twitter:title" content="${escapeAttribute(fullTitle)}" />`)
    .replace(/<meta\s+name="twitter:description"[\s\S]*?\/>/i, `<meta name="twitter:description" content="${escapeAttribute(page.description)}" />`)
    .replace(/<meta\s+name="twitter:image"[\s\S]*?\/>/i, `<meta name="twitter:image" content="${page.image}" />`)

  if (jsonLdMarkup) {
    html = html.replace('</head>', `${jsonLdMarkup}\n  </head>`)
  }

  if (page.bodyContent) {
    html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${page.bodyContent}`)
  }

  return html
}

function buildSitemap(pages) {
  const entries = pages
    .filter((page) => page.routePath !== '/cart')
    .map((page) => {
      const location = `${siteUrl}${page.routePath === '/' ? '' : page.routePath}`
      const changefreq = page.routePath.startsWith('/produk/') ? 'weekly' : page.routePath === '/' ? 'daily' : 'weekly'
      const priority = page.routePath === '/' ? '1.0' : page.routePath.startsWith('/produk/') ? '0.8' : '0.7'

      return [
        '  <url>',
        `    <loc>${escapeXml(location)}</loc>`,
        `    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}

function resolveAbsoluteUrl(value) {
  const raw = String(value || '').trim()

  if (!raw) {
    return `${siteUrl}${fallbackSiteData.defaultImage}`
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw
  }

  return `${siteUrl}${raw.startsWith('/') ? raw : `/${raw}`}`
}

function truncateText(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`
}

function ensureDirectory(directoryPath) {
  return mkdir(directoryPath, { recursive: true })
}

function buildHomepageBodyContent(siteData) {
  return [
    '<section data-prerendered-seo hidden aria-hidden="true">',
    `  <h1>${escapeHtml(siteData.siteName)} - Jersey Custom Sublimasi dan Apparel Printing</h1>`,
    `  <p>${escapeHtml(siteData.brandDescription)}</p>`,
    '  <h2>Kategori dan Produk Utama</h2>',
    '  <ul>',
    ...siteData.products.slice(0, 6).map(
      (product) =>
        `    <li><a href="/produk/${escapeAttribute(product.slug)}">${escapeHtml(product.name)}</a>${product.category ? ` - ${escapeHtml(product.category)}` : ''}</li>`,
    ),
    '  </ul>',
    '  <h2>Pertanyaan Umum</h2>',
    '  <ul>',
    ...siteData.faqItems.slice(0, 4).map(
      (faq) => `    <li><strong>${escapeHtml(faq.question)}</strong> ${escapeHtml(faq.answer)}</li>`,
    ),
    '  </ul>',
    '</section>',
  ].join('\n')
}

function buildListingBodyContent(siteData) {
  return [
    '<section data-prerendered-seo hidden aria-hidden="true">',
    '  <h1>Katalog Produk AHR</h1>',
    '  <p>Jelajahi katalog jersey custom, apparel sublimasi, dan seragam printing AHR untuk tim, event, sekolah, komunitas, dan perusahaan.</p>',
    '  <ul>',
    ...siteData.products.map(
      (product) =>
        `    <li><a href="/produk/${escapeAttribute(product.slug)}">${escapeHtml(product.name)}</a>${product.category ? ` - ${escapeHtml(product.category)}` : ''}</li>`,
    ),
    '  </ul>',
    '</section>',
  ].join('\n')
}

function buildProductBodyContent(product, siteData) {
  const detailItems = [
    product.category ? `Kategori: ${product.category}` : '',
    product.audience ? `Audience: ${product.audience}` : '',
    product.material ? `Material: ${product.material}` : '',
    product.moq ? `MOQ: ${product.moq}` : '',
    product.productionEstimate ? `Estimasi produksi: ${product.productionEstimate}` : '',
  ].filter(Boolean)

  return [
    '<article data-prerendered-seo hidden aria-hidden="true">',
    `  <h1>${escapeHtml(product.name)}</h1>`,
    `  <p>${escapeHtml(product.summary || siteData.brandDescription)}</p>`,
    detailItems.length > 0 ? '  <ul>' : '',
    ...detailItems.map((item) => `    <li>${escapeHtml(item)}</li>`),
    detailItems.length > 0 ? '  </ul>' : '',
    '  <p><a href="/all-products">Lihat semua produk</a></p>',
    '</article>',
  ]
    .filter(Boolean)
    .join('\n')
}

function buildSimplePageBodyContent(title, intro, paragraphs = []) {
  return [
    '<section data-prerendered-seo hidden aria-hidden="true">',
    `  <h1>${escapeHtml(title)}</h1>`,
    `  <p>${escapeHtml(intro)}</p>`,
    ...paragraphs.map((paragraph) => `  <p>${escapeHtml(paragraph)}</p>`),
    '</section>',
  ].join('\n')
}

function buildFaqSchema(faqItems = []) {
  if (!Array.isArray(faqItems) || faqItems.length === 0) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

function buildBreadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

function formatTelephoneForSchema(value) {
  const digits = String(value || '').replace(/[^\d]/g, '')

  if (!digits) {
    return undefined
  }

  return digits.startsWith('62') ? `+${digits}` : `+${digits}`
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('"', '&quot;')
}

function escapeXml(value) {
  return escapeAttribute(value).replaceAll("'", '&apos;')
}

function escapeScriptContent(value) {
  return String(value).replaceAll('</script>', '<\\/script>')
}

main().catch((error) => {
  console.error('[prerender] Failed to generate static SEO pages.')
  console.error(error)
  process.exitCode = 1
})
