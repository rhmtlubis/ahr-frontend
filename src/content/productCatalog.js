import industrialSewingWorkshop from '../assets/product-cards/industrial-sewing-workshop.jpg'
import footballJerseysBerlin from '../assets/product-cards/football-jerseys-berlin.webp'
import usSoccerJersey from '../assets/product-cards/us-soccer-jersey.jpg'
import oregonJerseyExchange from '../assets/product-cards/oregon-jersey-exchange.webp'

export const productVisuals = [
  footballJerseysBerlin,
  usSoccerJersey,
  industrialSewingWorkshop,
  oregonJerseyExchange,
]

const defaultShowcaseCategoriesByLocale = {
  id: [
    { label: 'Futsal', image: footballJerseysBerlin, position: 'center center' },
    { label: 'E-Sport', image: usSoccerJersey, position: 'center 26%' },
    { label: 'Trail', image: industrialSewingWorkshop, position: 'center center' },
    { label: 'Baseball', image: oregonJerseyExchange, position: 'center 30%' },
    { label: 'Sepak bola', image: footballJerseysBerlin, position: 'center center' },
    { label: 'Badminton', image: usSoccerJersey, position: 'center 26%' },
    { label: 'Sepeda', image: industrialSewingWorkshop, position: 'center center' },
    { label: 'Fitness', image: oregonJerseyExchange, position: 'center 30%' },
    { label: 'Basket', image: footballJerseysBerlin, position: 'center center' },
    { label: 'Mancing', image: usSoccerJersey, position: 'center 26%' },
    { label: 'Running', image: industrialSewingWorkshop, position: 'center center' },
    { label: 'Casual', image: oregonJerseyExchange, position: 'center 30%' },
  ],
  en: [
    { label: 'Futsal', image: footballJerseysBerlin, position: 'center center' },
    { label: 'E-Sport', image: usSoccerJersey, position: 'center 26%' },
    { label: 'Trail', image: industrialSewingWorkshop, position: 'center center' },
    { label: 'Baseball', image: oregonJerseyExchange, position: 'center 30%' },
    { label: 'Football', image: footballJerseysBerlin, position: 'center center' },
    { label: 'Badminton', image: usSoccerJersey, position: 'center 26%' },
    { label: 'Cycling', image: industrialSewingWorkshop, position: 'center center' },
    { label: 'Fitness', image: oregonJerseyExchange, position: 'center 30%' },
    { label: 'Basketball', image: footballJerseysBerlin, position: 'center center' },
    { label: 'Fishing', image: usSoccerJersey, position: 'center 26%' },
    { label: 'Running', image: industrialSewingWorkshop, position: 'center center' },
    { label: 'Casual', image: oregonJerseyExchange, position: 'center 30%' },
  ],
}

export function getDefaultShowcaseCategories(locale = 'id') {
  return defaultShowcaseCategoriesByLocale[locale] || defaultShowcaseCategoriesByLocale.id
}

export const defaultShowcaseCategories = defaultShowcaseCategoriesByLocale.id

export const productTones = ['navy', 'sand', 'orange', 'black']

export function slugifyCategoryLabel(label = '') {
  return label.toLowerCase().trim().replace(/\s+/g, '-')
}

function resolveCategoryLabel(categoryKey = '', fallbackIndex = 0, locale = 'id') {
  const showcaseCategories = getDefaultShowcaseCategories(locale)
  const matchedCategory = showcaseCategories.find(
    (category) => slugifyCategoryLabel(category.label) === categoryKey,
  )

  return matchedCategory?.label || showcaseCategories[fallbackIndex % showcaseCategories.length]?.label || categoryKey
}

function slugifyProductName(name = '') {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

const productImageMap = {
  'jersey-futsal-pro': footballJerseysBerlin,
  'paket-esport': usSoccerJersey,
  'jersey-trail': industrialSewingWorkshop,
  'jersey-baseball': oregonJerseyExchange,
  'jersey-sepak-bola': footballJerseysBerlin,
  'jersey-badminton': usSoccerJersey,
}

const categoryImagePositionMap = {
  futsal: 'center center',
  'e-sport': 'center 26%',
  trail: 'center center',
  baseball: 'center 30%',
  'sepak-bola': 'center center',
  badminton: 'center 26%',
}

function buildExtendedGallery(primaryImage) {
  const orderedImages = [primaryImage, ...productVisuals.filter((image) => image !== primaryImage)]

  return [
    ...orderedImages,
    orderedImages[1] || orderedImages[0],
    orderedImages[2] || orderedImages[0],
    orderedImages[0],
    orderedImages[3] || orderedImages[0],
  ].filter(Boolean)
}

function createProductDetail(baseProduct, index) {
  const material = baseProduct.material || 'Dry-fit premium'
  const moq = baseProduct.moq || 'MOQ mulai 10 pcs'
  const bestPrice = baseProduct.bestPrice || baseProduct.promoPrice || null
  const originalPrice = baseProduct.originalPrice || (bestPrice ? baseProduct.price : null)

  return {
    ...baseProduct,
    id: baseProduct.id || `product-${index + 1}`,
    slug: baseProduct.slug || baseProduct.id || slugifyProductName(baseProduct.name),
    categoryId: baseProduct.categoryId || slugifyCategoryLabel(baseProduct.category) || `category-${index + 1}`,
    imagePosition: baseProduct.imagePosition || 'center center',
    gallery:
      Array.isArray(baseProduct.gallery) && baseProduct.gallery.length > 0
        ? baseProduct.gallery
        : buildExtendedGallery(baseProduct.image),
    summary:
      baseProduct.summary ||
      `${baseProduct.name} dirancang untuk kebutuhan ${baseProduct.audience?.toLowerCase() || 'custom apparel'} dengan tampilan rapi dan nyaman dipakai.`,
    price: bestPrice || baseProduct.price,
    originalPrice,
    bestPrice,
    promoBadge: bestPrice ? baseProduct.promoBadge || 'Best Price' : null,
    hasPromo: Boolean(bestPrice),
    pricing: baseProduct.pricing || null,
    availability: baseProduct.availability || 'Estimasi produksi 7-14 hari kerja',
    color: baseProduct.color || 'Custom warna sesuai brief',
    detail: baseProduct.detail || `${material} • ${moq}`,
    description:
      Array.isArray(baseProduct.description) && baseProduct.description.length > 0
        ? baseProduct.description
        : [
            `${baseProduct.name} cocok untuk kebutuhan ${baseProduct.audience?.toLowerCase() || 'tim, komunitas, dan event'} yang ingin hasil visual tetap kuat tanpa bikin flow order terasa rumit.`,
            `Material ${material.toLowerCase()} dipilih agar nyaman dipakai, mudah dirawat, dan tetap enak dilihat untuk aktivitas harian maupun event intens.`,
            'Finishing produksi dijaga supaya warna, jahitan, dan penempatan desain tetap konsisten saat masuk ke produksi batch kecil maupun besar.',
          ],
    specifications:
      Array.isArray(baseProduct.specifications) && baseProduct.specifications.length > 0
        ? baseProduct.specifications
        : [
            `Material: ${material}`,
            moq,
            'Ukuran: bisa menyesuaikan size run tim atau komunitas',
            'Opsi custom: nama, nomor, logo, sponsor, dan penyesuaian warna',
          ],
    careInstructions:
      Array.isArray(baseProduct.careInstructions) && baseProduct.careInstructions.length > 0
        ? baseProduct.careInstructions
        : [
            'Cuci dengan air dingin dan pisahkan dari warna pekat pada pencucian pertama.',
            'Hindari pemutih dan suhu setrika tinggi pada area print.',
            'Jemur terbalik agar warna dan detail printing lebih awet.',
          ],
    sizeStock: baseProduct.sizeStock || {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
      XXXL: 0,
    },
  }
}

const homepageProductsByLocale = {
  id: [
    createProductDetail(
      {
        name: 'Matchday Teamwear',
        category: 'Teamwear',
        price: 'Rp 189.000',
        bestPrice: 'Rp 149.000',
        promoBadge: 'Promo Tim',
        tone: 'navy',
        audience: 'Tim & Komunitas',
        detail: 'Dry-fit premium • MOQ 10 pcs',
        image: footballJerseysBerlin,
        imagePosition: 'center center',
        summary: 'Set jersey seragam untuk klub, sekolah, dan komunitas dengan tampilan profesional.',
        description: [
          'Matchday Teamwear dibuat untuk kebutuhan tim yang ingin identitas visualnya terlihat solid sejak pertama kali masuk lapangan.',
          'Potongan, bahan, dan hasil print disiapkan agar enak dipakai saat latihan maupun pertandingan, sambil tetap mudah diatur untuk order per size.',
          'Pilihan ini cocok saat Anda butuh jersey custom yang terasa rapi, punya warna stabil, dan tetap fleksibel untuk reorder berikutnya.',
        ],
        specifications: [
          'Material: Dry-fit premium yang ringan dan cepat kering',
          'MOQ: mulai 10 pcs per desain',
          'Custom: nama, nomor, sponsor, dan revisi warna tim',
          'Cocok untuk: futsal, sepak bola, sekolah, dan komunitas',
        ],
      },
      0,
    ),
    createProductDetail(
      {
        name: 'Training Capsule Top',
        category: 'Retail Ready',
        price: 'Rp 149.000',
        bestPrice: 'Rp 119.000',
        promoBadge: 'Best Price',
        tone: 'sand',
        audience: 'Personal',
        detail: 'Micro mesh ringan • MOQ 1 pcs',
        image: usSoccerJersey,
        imagePosition: 'center 26%',
        summary: 'Atasan latihan ringan untuk order personal, nama custom, atau koleksi kasual.',
        color: 'Off white',
        availability: 'Estimasi produksi 3-7 hari kerja',
      },
      1,
    ),
    createProductDetail(
      {
        name: 'Corporate Active Kit',
        category: 'B2B Capsule',
        price: 'Rp 229.000',
        tone: 'orange',
        audience: 'Event & Brand',
        detail: 'Polyester aktif • MOQ 24 pcs',
        image: industrialSewingWorkshop,
        imagePosition: 'center center',
        summary: 'Seragam event dan apparel brand activation dengan fokus presentasi visual yang rapi.',
      },
      2,
    ),
    createProductDetail(
      {
        name: 'Personalized Fan Jersey',
        category: 'Personal Order',
        price: 'Rp 129.000',
        tone: 'black',
        audience: 'Custom Satuan',
        detail: 'Poly soft-touch • MOQ 1 pcs',
        image: oregonJerseyExchange,
        imagePosition: 'center 30%',
        summary: 'Jalur custom satuan untuk desain personal yang tetap terasa premium.',
      },
      3,
    ),
  ],
  en: [
    createProductDetail(
      {
        name: 'Matchday Teamwear',
        category: 'Teamwear',
        price: 'IDR 189,000',
        bestPrice: 'IDR 149,000',
        promoBadge: 'Team Promo',
        tone: 'navy',
        audience: 'Teams & Communities',
        detail: 'Premium dry-fit • MOQ 10 pcs',
        image: footballJerseysBerlin,
        imagePosition: 'center center',
        summary: 'A uniform jersey set for clubs, schools, and communities with a polished look.',
        description: [
          'Matchday Teamwear is built for teams that want their visual identity to feel solid from the moment they step onto the field.',
          'The cut, material, and print quality are prepared for comfort during training and matches while staying easy to organize by size.',
          'This option works well when you need custom jerseys that feel neat, keep colors stable, and stay flexible for future reorders.',
        ],
        specifications: [
          'Material: lightweight, quick-dry premium dry-fit',
          'MOQ: starting from 10 pcs per design',
          'Custom: name, number, sponsor, and team color revisions',
          'Suitable for: futsal, football, schools, and communities',
        ],
      },
      0,
    ),
    createProductDetail(
      {
        name: 'Training Capsule Top',
        category: 'Retail Ready',
        price: 'IDR 149,000',
        bestPrice: 'IDR 119,000',
        promoBadge: 'Best Price',
        tone: 'sand',
        audience: 'Personal',
        detail: 'Light micro mesh • MOQ 1 pc',
        image: usSoccerJersey,
        imagePosition: 'center 26%',
        summary: 'A lightweight training top for personal orders, custom names, or casual collection drops.',
        color: 'Off white',
        availability: 'Estimated production 3-7 working days',
      },
      1,
    ),
    createProductDetail(
      {
        name: 'Corporate Active Kit',
        category: 'B2B Capsule',
        price: 'IDR 229,000',
        tone: 'orange',
        audience: 'Events & Brands',
        detail: 'Active polyester • MOQ 24 pcs',
        image: industrialSewingWorkshop,
        imagePosition: 'center center',
        summary: 'Event uniforms and brand activation apparel with a cleaner visual presentation.',
      },
      2,
    ),
    createProductDetail(
      {
        name: 'Personalized Fan Jersey',
        category: 'Personal Order',
        price: 'IDR 129,000',
        tone: 'black',
        audience: 'Single Custom Order',
        detail: 'Soft-touch poly • MOQ 1 pc',
        image: oregonJerseyExchange,
        imagePosition: 'center 30%',
        summary: 'A single-order custom path for personal designs that still feels premium.',
      },
      3,
    ),
  ],
}

export function getHomepageProducts(locale = 'id') {
  return homepageProductsByLocale[locale] || homepageProductsByLocale.id
}

export const homepageProducts = homepageProductsByLocale.id

export function normalizeProducts(catalogItems = [], locale = 'id') {
  if (catalogItems.length > 0) {
    return catalogItems.map((item, index) =>
      createProductDetail(
        {
          id: item.id || item.slug,
          slug: item.slug || item.id,
          name: item.name,
          category: resolveCategoryLabel(item.category, index, locale),
          categoryId: item.category || slugifyCategoryLabel(item.category),
          price: item.price_hint,
          originalPrice: item.promo_price_hint ? item.price_hint : null,
          bestPrice: item.promo_price_hint,
          promoBadge: item.promo_badge,
          pricing: item.pricing,
          detail: `${item.material} • ${item.moq}`,
          tone: productTones[index % productTones.length],
          audience: item.audience || item.segment || 'Pilihan Custom',
          image:
            item.image ||
            item.featured_image?.url ||
            productImageMap[item.slug || item.id] ||
            productVisuals[index % productVisuals.length],
          imagePosition:
            categoryImagePositionMap[item.category] ||
            getHomepageProducts(locale)[index % getHomepageProducts(locale).length]?.imagePosition ||
            'center center',
          material: item.material,
          moq: item.moq,
          summary: item.summary || item.lead || item.description || item.tagline,
          availability: item.production_estimate || 'Estimasi produksi sesuai jumlah order',
          color: item.colorway || 'Custom warna sesuai brief',
          description: item.description,
          specifications: item.specifications,
          careInstructions: item.care_instructions,
          sizeStock: item.size_stock,
          gallery: item.gallery,
        },
        index,
      ),
    )
  }

  return getHomepageProducts(locale)
}

export function findProductBySlug(products = [], slug = '') {
  return products.find((product) => product.slug === slug)
}

export function normalizeProductDetail(item, locale = 'id') {
  if (!item) {
    return null
  }

  const localizedHomepageProducts = getHomepageProducts(locale)
  const fallbackIndex = localizedHomepageProducts.findIndex((product) => product.slug === (item.slug || item.id))
  const visualIndex = fallbackIndex >= 0 ? fallbackIndex : 0

  return createProductDetail(
    {
      id: item.id || item.slug,
      slug: item.slug || item.id,
      name: item.name,
      category: resolveCategoryLabel(item.category || item.category_label, visualIndex, locale),
      categoryId: item.category || slugifyCategoryLabel(item.category_label || item.category),
      price: item.price_hint,
      originalPrice: item.promo_price_hint ? item.price_hint : null,
      bestPrice: item.promo_price_hint,
      promoBadge: item.promo_badge,
      pricing: item.pricing,
      detail: item.detail || `${item.material} • ${item.moq}`,
      tone: item.tone || productTones[visualIndex % productTones.length],
      audience: item.audience || item.segment || item.category_label || 'Pilihan Custom',
      image:
        item.image ||
        item.featured_image?.url ||
        productImageMap[item.slug || item.id] ||
        productVisuals[visualIndex % productVisuals.length],
      imagePosition:
        categoryImagePositionMap[item.category] || localizedHomepageProducts[visualIndex]?.imagePosition || 'center center',
      material: item.material,
      moq: item.moq,
      summary: item.summary || item.lead,
      availability: item.production_estimate || item.availability,
      color: item.colorway || item.color,
      description: item.description,
      specifications: item.specifications,
      careInstructions: item.care_instructions,
      sizeStock: item.size_stock,
      gallery:
        Array.isArray(item.gallery) && item.gallery.length > 0
          ? item.gallery
          : (item.slug || item.id) in productImageMap
            ? buildExtendedGallery(productImageMap[item.slug || item.id])
            : undefined,
    },
    visualIndex >= 0 ? visualIndex : 0,
  )
}
