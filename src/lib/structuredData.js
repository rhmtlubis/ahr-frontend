function normalizePrice(value, currency = 'IDR') {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'number') {
    return currency === 'USD' ? (value / 100).toFixed(2) : String(value)
  }

  const trimmedValue = String(value).trim()

  if (!/\d/.test(trimmedValue)) {
    return null
  }

  if (currency === 'USD') {
    const decimalText = trimmedValue
      .replace(/[^\d.,-]/g, '')
      .replace(/,(?=\d{3}(\D|$))/g, '')
      .replace(',', '.')
    const amount = Number(decimalText)

    return Number.isFinite(amount) ? amount.toFixed(2) : null
  }

  const integerText = trimmedValue.replace(/[^\d-]/g, '')
  const amount = Number(integerText)

  return Number.isFinite(amount) ? String(amount) : null
}

export function buildOrganizationStructuredData(options = {}) {
  const {
    siteUrl = 'https://ahrcorporation.id',
    logoUrl = '/ahr-brand-logo.webp',
    organizationName = 'AHR Corporation',
    sameAs = [],
    description = 'AHR Corporation melayani jersey custom sublimasi, seragam printing, apparel olahraga, dan kebutuhan konveksi custom untuk tim, komunitas, sekolah, dan perusahaan.',
  } = options
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, '')
  const normalizedLogoUrl = /^https?:\/\//i.test(logoUrl)
    ? logoUrl
    : `${normalizedSiteUrl}${logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`}`

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: organizationName,
      alternateName: 'AHR',
      url: normalizedSiteUrl,
      logo: normalizedLogoUrl,
      description,
      sameAs,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: organizationName,
      alternateName: 'AHR',
      url: normalizedSiteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${normalizedSiteUrl}/all-products`,
      },
    },
  ]
}

export function buildProductStructuredData(product, options = {}) {
  if (!product) {
    return []
  }

  const {
    siteUrl = 'https://ahrcorporation.id',
    locale = 'id',
  } = options
  const canonicalUrl = `${siteUrl.replace(/\/+$/, '')}/produk/${product.slug}`
  const imageUrls = (Array.isArray(product.gallery) ? product.gallery : [product.image])
    .filter(Boolean)
    .map((image) => (/^https?:\/\//i.test(image) ? image : `${siteUrl.replace(/\/+$/, '')}${image.startsWith('/') ? image : `/${image}`}`))
  const pricing = product.pricing || {}
  const resolvedCurrency = String(pricing.currency || (locale === 'en' ? 'USD' : 'IDR')).toUpperCase()
  const resolvedPrice =
    normalizePrice(pricing.final_amount_minor, resolvedCurrency) ||
    normalizePrice(pricing.formatted_final, resolvedCurrency) ||
    normalizePrice(product.bestPrice, resolvedCurrency) ||
    normalizePrice(product.price, resolvedCurrency)

  const offer = resolvedPrice
    ? {
        '@type': 'Offer',
        price: resolvedPrice,
        priceCurrency: resolvedCurrency,
        availability: 'https://schema.org/InStock',
        url: canonicalUrl,
        itemCondition: 'https://schema.org/NewCondition',
      }
    : null

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Produk',
          item: `${siteUrl.replace(/\/+$/, '')}/all-products`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: product.name,
          item: canonicalUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      category: product.category || undefined,
      image: imageUrls,
      description: Array.isArray(product.description) ? product.description.join(' ') : undefined,
      brand: {
        '@type': 'Brand',
        name: 'AHR Corporation',
      },
      sku: product.slug,
      url: canonicalUrl,
      color: product.color || undefined,
      material: product.material || undefined,
      size: Object.keys(product.sizeStock || {}).length > 0 ? Object.keys(product.sizeStock) : undefined,
      offers: offer || undefined,
    },
  ]
}

export function buildArticleStructuredData(article, options = {}) {
  if (!article) {
    return []
  }

  const { siteUrl = 'https://ahrcorporation.id' } = options
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, '')
  const canonicalUrl = `${normalizedSiteUrl}/artikel/${article.slug}`
  const rawImage = String(article.coverImage || '/og-preview.png').trim()
  const imageUrl = /^https?:\/\//i.test(rawImage)
    ? rawImage
    : `${normalizedSiteUrl}${rawImage.startsWith('/') ? rawImage : `/${rawImage}`}`

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: normalizedSiteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Artikel',
          item: `${normalizedSiteUrl}/artikel`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: article.title,
          item: canonicalUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description || article.excerpt,
      image: [imageUrl],
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      author: {
        '@type': 'Organization',
        name: article.author || 'AHR Corporation',
      },
      publisher: {
        '@type': 'Organization',
        name: 'AHR Corporation',
        logo: {
          '@type': 'ImageObject',
          url: `${normalizedSiteUrl}/ahr-brand-logo.webp`,
        },
      },
      mainEntityOfPage: canonicalUrl,
      articleSection: article.category,
      keywords: article.keywords,
    },
    Array.isArray(article.faqs) && article.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: article.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null,
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Artikel AHR',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          url: canonicalUrl,
          name: article.title,
        },
      ],
    },
  ].filter(Boolean)
}

export function buildArticleListingStructuredData(articleList = [], options = {}) {
  const { siteUrl = 'https://ahrcorporation.id' } = options
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, '')

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: normalizedSiteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Artikel',
          item: `${normalizedSiteUrl}/artikel`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Artikel AHR',
      description:
        'Kumpulan artikel seputar jersey custom, sublimasi, desain, bahan, dan tips pemesanan untuk tim, komunitas, sekolah, dan perusahaan.',
      url: `${normalizedSiteUrl}/artikel`,
      blogPost: articleList.map((article) => ({
        '@type': 'BlogPosting',
        headline: article.title,
        url: `${normalizedSiteUrl}/artikel/${article.slug}`,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt || article.publishedAt,
      })),
    },
  ]
}

export function buildCategoryListingStructuredData(category, products = [], options = {}) {
  if (!category) {
    return []
  }

  const { siteUrl = 'https://ahrcorporation.id' } = options
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, '')
  const categoryUrl = `${normalizedSiteUrl}/kategori/${category.id}`

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: normalizedSiteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Produk',
          item: `${normalizedSiteUrl}/all-products`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: category.label,
          item: categoryUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: category.label,
      url: categoryUrl,
      description: category.description,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: products.slice(0, 24).map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${normalizedSiteUrl}/produk/${product.slug}`,
          name: product.name,
        })),
      },
    },
  ]
}
