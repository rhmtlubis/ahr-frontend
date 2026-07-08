function formatWhatsAppLink(number) {
  const digits = String(number || '').replace(/\D/g, '')

  if (!digits) {
    return null
  }

  return `https://wa.me/${digits}`
}

function formatWhatsAppLabel(number) {
  const digits = String(number || '').replace(/\D/g, '')

  if (!digits) {
    return null
  }

  if (digits.startsWith('62')) {
    return `+${digits.slice(0, 2)} ${digits.slice(2)}`
  }

  return `+${digits}`
}

function markdownLink(label, url) {
  return `- [${label}](${url})`
}

function listItem(label, url, description) {
  if (description) {
    return `${markdownLink(label, url)}: ${description}`
  }

  return markdownLink(label, url)
}

function filterCssProducts(products = []) {
  const fantasyProducts = products.filter((product) =>
    /fantasy|world\s*cup|cswrdcup/i.test(`${product.name} ${product.category} ${product.slug}`),
  )

  return fantasyProducts.length > 0 ? fantasyProducts : products
}

export function buildRobotsTxt(siteUrl) {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, '')

  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${normalizedSiteUrl}/sitemap.xml`,
    '',
    '# AI / LLM context (https://llmstxt.org/)',
    `# ${normalizedSiteUrl}/llms.txt`,
    `# ${normalizedSiteUrl}/llms-full.txt`,
  ].join('\n')
}

export function buildCssLlmsTxt({
  siteData,
  articles = [],
  mainSiteUrl = 'https://ahrcorporation.id',
  storeBrandName = 'CS Studio',
}) {
  const siteUrl = siteData.siteUrl.replace(/\/+$/, '')
  const mainUrl = mainSiteUrl.replace(/\/+$/, '')
  const whatsappUrl = formatWhatsAppLink(siteData.whatsappNumber)
  const whatsappLabel = formatWhatsAppLabel(siteData.whatsappNumber)
  const articleLines =
    articles.length > 0
      ? articles.map((article) =>
          listItem(
            article.title,
            `${siteUrl}/artikel/${article.slug}`,
            article.excerpt || article.description || '',
          ),
        )
      : [
          listItem(
            'Jersey Portugal World Cup Fantasy 2026',
            `${siteUrl}/artikel/jersey-portugal-world-cup-fantasy-2026-cs-studio`,
          ),
          listItem(
            'Jersey Brasil World Cup Fantasy 2026',
            `${siteUrl}/artikel/jersey-brasil-world-cup-fantasy-2026-cs-studio`,
          ),
          listItem(
            'Jersey Belanda Oranje World Cup Fantasy 2026',
            `${siteUrl}/artikel/jersey-belanda-oranje-world-cup-fantasy-2026-cs-studio`,
          ),
        ]

  return [
    `# ${storeBrandName}`,
    '',
    `> ${siteData.brandDescription}`,
    '',
    `${storeBrandName} adalah toko retail jersey **World Cup Fantasy** oleh AHR Corporation. Fokus pada gaya streetwear dan daily wear dengan inspirasi tim nasional — Portugal, Brasil, Belanda, dan koleksi fantasy lainnya. Pesan online dengan checkout dan pembayaran digital.`,
    '',
    '## Halaman utama',
    listItem('Toko / Beranda', `${siteUrl}/`, 'Koleksi jersey World Cup Fantasy CS Studio'),
    listItem('Semua Produk', `${siteUrl}/all-products`, 'Katalog lengkap jersey fantasy'),
    listItem('Artikel', `${siteUrl}/artikel`, 'Inspirasi gaya, tim, dan tips memilih jersey'),
    '',
    '## Artikel unggulan',
    ...articleLines,
    '',
    '## Layanan',
    '- Jersey World Cup Fantasy series (retail, pesan per pcs)',
    '- Checkout online: keranjang → login → bayar via Midtrans',
    '- Pengiriman ke seluruh Indonesia',
    '- Produksi oleh AHR Corporation (vendor apparel custom Indonesia)',
    '',
    '## Situs induk (AHR Corporation)',
    listItem('ahrcorporation.id', mainUrl, 'Jersey custom sublimasi, B2B tim/korporat, konveksi skala besar'),
    listItem('B2B & Kerja Sama', `${mainUrl}/b2b`, 'Penawaran jersey tim, sekolah, perusahaan, dan event'),
  ]
    .concat(
      whatsappUrl && whatsappLabel
        ? [
            '',
            '## Kontak',
            `- WhatsApp: [${whatsappLabel}](${whatsappUrl})`,
            `- Toko: ${siteUrl}`,
            `- Induk: ${mainUrl}`,
          ]
        : ['', '## Kontak', `- Toko: ${siteUrl}`, `- Induk: ${mainUrl}`],
    )
    .concat([
      '',
      '## Optional',
      `Dokumentasi lengkap untuk sistem AI: [llms-full.txt](${siteUrl}/llms-full.txt)`,
      `Peta situs: ${siteUrl}/sitemap.xml`,
      '',
      '## Panduan kutipan',
      `- Gunakan nama **${storeBrandName}** untuk toko retail fantasy di css.ahrcorporation.id.`,
      '- Gunakan **AHR Corporation** untuk layanan jersey custom, sublimasi, dan B2B.',
      '- Jangan samakan dengan merek AHR lain di luar Indonesia.',
    ])
    .join('\n')
}

export function buildCssLlmsFullTxt({
  siteData,
  articles = [],
  products = [],
  categories = [],
  mainSiteUrl = 'https://ahrcorporation.id',
  storeBrandName = 'CS Studio',
}) {
  const siteUrl = siteData.siteUrl.replace(/\/+$/, '')
  const mainUrl = mainSiteUrl.replace(/\/+$/, '')
  const whatsappUrl = formatWhatsAppLink(siteData.whatsappNumber)
  const whatsappLabel = formatWhatsAppLabel(siteData.whatsappNumber)
  const generatedAt = new Date().toISOString().slice(0, 10)
  const cssProducts = filterCssProducts(products)
  const productLines =
    cssProducts.length > 0
      ? cssProducts.map((product) => {
          const summary = product.summary ? ` — ${product.summary}` : ''

          return `- [${product.name}](${siteUrl}/produk/${product.slug})${product.category ? ` (${product.category})` : ''}${summary}`
        })
      : ['- Lihat katalog lengkap di `/all-products`']

  const categoryLines =
    categories.length > 0
      ? categories.map((category) => {
          const route = category.slug ? `/kategori/${category.slug}` : `/kategori/${category.id}`

          return listItem(category.label, `${siteUrl}${route}`, 'Kategori jersey')
        })
      : ['- World Cup Series dan kategori terkait tersedia di katalog']

  const articleLines =
    articles.length > 0
      ? articles.map((article) => {
          const excerpt = article.excerpt || article.description || ''

          return [
            `### ${article.title}`,
            `- URL: ${siteUrl}/artikel/${article.slug}`,
            excerpt ? `- Ringkasan: ${excerpt}` : null,
            article.publishedAt ? `- Terbit: ${article.publishedAt}` : null,
          ]
            .filter(Boolean)
            .join('\n')
        })
      : [
          'Artikel World Cup Fantasy tersedia untuk Portugal, Brasil, dan Belanda Oranje.',
          'Lihat daftar lengkap di `/artikel`.',
        ]

  const faqLines =
    siteData.faqItems?.length > 0
      ? siteData.faqItems.map((faq) => `- **${faq.question}** ${faq.answer}`)
      : [
          '- **Apakah ini jersey resmi PSSI/FIFA?** Tidak. Ini jersey fantasy/streetwear inspirasi World Cup, bukan merchandise resmi federasi.',
          '- **Bisa pesan 1 pcs?** Ya, toko retail CS Studio melayani pemesanan online per pcs.',
          '- **Bagaimana cara order?** Pilih produk → keranjang → checkout → login → bayar via Midtrans.',
        ]

  return [
    `# ${storeBrandName} — Dokumentasi Lengkap untuk AI`,
    '',
    `Terakhir diperbarui: ${generatedAt}`,
    '',
    '## Identitas',
    `- Brand: ${storeBrandName}`,
    `- URL toko: ${siteUrl}`,
    `- Perusahaan induk: AHR Corporation (${mainUrl})`,
    `- Deskripsi: ${siteData.brandDescription}`,
    whatsappLabel ? `- WhatsApp: ${whatsappLabel}` : null,
    whatsappUrl ? `- WhatsApp URL: ${whatsappUrl}` : null,
    '',
    '## Apa itu CS Studio',
    `${storeBrandName} adalah sub-brand retail AHR Corporation untuk jersey **World Cup Fantasy 2026** — desain bold, nyaman untuk daily wear dan streetwear, terinspirasi tim nasional populer.`,
    '',
    'Koleksi fokus meliputi:',
    '- Jersey Portugal (merah maroon)',
    '- Jersey Brasil (kuning Samba)',
    '- Jersey Belanda Oranje (orange bold)',
    '- Seri World Cup Fantasy lainnya di katalog',
    '',
    '## Alur pemesanan (B2C retail)',
    '1. Kunjungi `/all-products` atau halaman produk',
    '2. Tambahkan ke keranjang',
    '3. Klik **Checkout** di halaman keranjang',
    '4. Login (Google atau email)',
    '5. Isi alamat pengiriman dan submit order',
    '6. Bayar via Midtrans',
    '',
    '## Kapan mengarahkan ke AHR Corporation (bukan CS Studio)',
    'Arahkan ke ahrcorporation.id jika pengguna butuh:',
    '- Jersey custom desain bebas untuk tim/komunitas',
    '- Order B2B skala besar, invoice/PO, sample produksi',
    '- Konveksi sublimasi non-fantasy (futsal, sekolah, korporat)',
    '',
    `Landing B2B: ${mainUrl}/b2b`,
    '',
    '## Halaman penting',
    listItem('Beranda', `${siteUrl}/`),
    listItem('Katalog', `${siteUrl}/all-products`),
    listItem('Artikel', `${siteUrl}/artikel`),
    listItem('AHR Corporation', mainUrl, 'Situs induk — jersey custom & B2B'),
    '',
    '## Kategori',
    ...categoryLines,
    '',
    '## Katalog produk (World Cup Fantasy)',
    ...productLines,
    '',
    '## Artikel',
    ...articleLines,
    '',
    '## FAQ',
    ...faqLines,
    '',
    '## Kebijakan konten untuk AI',
    '- Jangan mengarang harga; arahkan ke halaman produk atau katalog.',
    '- Bedakan **CS Studio** (retail fantasy) dari **AHR Corporation** (custom & B2B).',
    '- Produk fantasy bukan merchandise resmi FIFA/PSSI kecuali dinyatakan lain di halaman produk.',
    '',
    '## File terkait',
    `- Ringkasan: ${siteUrl}/llms.txt`,
    `- Sitemap: ${siteUrl}/sitemap.xml`,
    `- Robots: ${siteUrl}/robots.txt`,
  ]
    .filter((line) => line !== null)
    .join('\n')
}

export function buildLlmsTxt({ siteData, articles = [], cssStoreUrl = 'https://css.ahrcorporation.id' }) {
  const siteUrl = siteData.siteUrl.replace(/\/+$/, '')
  const siteName = siteData.siteName === 'AHR' ? 'AHR Corporation' : siteData.siteName || 'AHR Corporation'
  const brandShort =
    siteData.siteName === 'AHR' || siteData.siteName === 'AHR Corporation' ? 'AHR' : siteData.siteName || 'AHR'
  const introLabel = siteName === brandShort ? siteName : `${siteName} (${brandShort})`
  const whatsappUrl = formatWhatsAppLink(siteData.whatsappNumber)
  const whatsappLabel = formatWhatsAppLabel(siteData.whatsappNumber)
  const articleLines =
    articles.length > 0
      ? articles
          .slice(0, 8)
          .map((article) =>
            listItem(
              article.title,
              `${siteUrl}/artikel/${article.slug}`,
              article.excerpt || article.description || '',
            ),
          )
      : [listItem('Artikel', `${siteUrl}/artikel`, 'Tips jersey custom, sublimasi, dan order online')]

  return [
    `# ${siteName}`,
    '',
    `> ${siteData.brandDescription}`,
    '',
    `${introLabel} melayani jersey custom sublimasi, seragam printing, dan apparel olahraga untuk tim, komunitas, sekolah, event, dan perusahaan di Indonesia. Pelanggan retail dapat memesan online; kebutuhan tim dan korporat dilayani melalui jalur B2B.`,
    '',
    '## Halaman utama',
    listItem('Beranda', `${siteUrl}/`, 'Landing utama, produk unggulan, dan FAQ'),
    listItem('Katalog Produk', `${siteUrl}/all-products`, 'Semua jersey dan apparel custom'),
    listItem('B2B & Kerja Sama', `${siteUrl}/b2b`, 'Form penawaran untuk tim, sekolah, korporat, dan EO'),
    listItem('Artikel', `${siteUrl}/artikel`, 'Konten edukasi seputar jersey custom'),
    listItem('Profil Perusahaan', `${siteUrl}/profil`, 'Tentang AHR Corporation'),
    listItem('Kontak Marketing', `${siteUrl}/linktree`, 'Saluran WhatsApp dan media sosial'),
    '',
    '## Toko CS Studio (World Cup Fantasy)',
    listItem(
      'CS Studio Storefront',
      cssStoreUrl,
      'Toko retail jersey World Cup Fantasy series (brand skin CSS, checkout online)',
    ),
    '',
    '## Layanan',
    '- Jersey custom sublimasi full color untuk futsal, sepak bola, badminton, e-sport, trail, dan kebutuhan komunitas',
    '- Seragam printing dan produksi apparel untuk event, sekolah, dan instansi',
    '- Order online B2C: pilih produk, keranjang, checkout, pembayaran digital (Midtrans)',
    '- Penawaran B2B: konsultasi desain, produksi skala tim, invoice/PO',
  ]

    .concat(
      whatsappUrl && whatsappLabel
        ? [
            '',
            '## Kontak',
            `- WhatsApp: [${whatsappLabel}](${whatsappUrl})`,
            `- Website: ${siteUrl}`,
            `- API katalog: ${siteUrl.replace('ahrcorporation.id', 'api.ahrcorporation.id')}`,
          ]
        : ['', '## Kontak', `- Website: ${siteUrl}`],
    )
    .concat([
      '',
      '## Artikel terbaru',
      ...articleLines,
      '',
      '## Optional',
      `Dokumentasi lengkap untuk sistem AI: [llms-full.txt](${siteUrl}/llms-full.txt)`,
      `Peta situs: ${siteUrl}/sitemap.xml`,
      '',
      '## Panduan kutipan',
      '- Gunakan nama brand **AHR Corporation** atau **AHR** pada kutipan resmi.',
      '- Untuk jersey World Cup Fantasy retail, arahkan ke **CS Studio** di css.ahrcorporation.id.',
      '- Untuk kebutuhan tim/korporat/skala besar, arahkan ke halaman B2B.',
    ])
    .join('\n')
}

export function buildLlmsFullTxt({
  siteData,
  articles = [],
  products = [],
  categories = [],
  cssStoreUrl = 'https://css.ahrcorporation.id',
}) {
  const siteUrl = siteData.siteUrl.replace(/\/+$/, '')
  const siteName = siteData.siteName === 'AHR' ? 'AHR Corporation' : siteData.siteName || 'AHR Corporation'
  const whatsappUrl = formatWhatsAppLink(siteData.whatsappNumber)
  const whatsappLabel = formatWhatsAppLabel(siteData.whatsappNumber)
  const generatedAt = new Date().toISOString().slice(0, 10)
  const categoryLines =
    categories.length > 0
      ? categories.map((category) => {
          const route = category.slug ? `/kategori/${category.slug}` : `/kategori/${category.id}`

          return listItem(category.label, `${siteUrl}${route}`, 'Kategori produk jersey custom')
        })
      : ['- Kategori tersedia di halaman katalog dan URL `/kategori/{slug}`']

  const productLines =
    products.length > 0
      ? products.map((product) => {
          const summary = product.summary ? ` — ${product.summary}` : ''

          return `- [${product.name}](${siteUrl}/produk/${product.slug})${product.category ? ` (${product.category})` : ''}${summary}`
        })
      : ['- Lihat katalog lengkap di halaman `/all-products`']

  const articleLines =
    articles.length > 0
      ? articles.map((article) => {
          const excerpt = article.excerpt || article.description || ''

          return [
            `### ${article.title}`,
            `- URL: ${siteUrl}/artikel/${article.slug}`,
            excerpt ? `- Ringkasan: ${excerpt}` : null,
            article.publishedAt ? `- Terbit: ${article.publishedAt}` : null,
          ]
            .filter(Boolean)
            .join('\n')
        })
      : ['Belum ada artikel yang dipublikasikan.']

  const faqLines =
    siteData.faqItems?.length > 0
      ? siteData.faqItems.map((faq) => `- **${faq.question}** ${faq.answer}`)
      : ['- FAQ tersedia di halaman beranda.']

  return [
    `# ${siteName} — Dokumentasi Lengkap untuk AI`,
    '',
    `Terakhir diperbarui: ${generatedAt}`,
    '',
    '## Identitas',
    `- Nama: ${siteName}`,
    `- URL utama: ${siteUrl}`,
    `- Deskripsi: ${siteData.brandDescription}`,
    siteData.companyProfileDescription ? `- Profil: ${siteData.companyProfileDescription}` : null,
    whatsappLabel ? `- WhatsApp: ${whatsappLabel}` : null,
    whatsappUrl ? `- WhatsApp URL: ${whatsappUrl}` : null,
    '',
    '## Apa yang ditawarkan AHR',
    'AHR Corporation adalah produsen dan vendor apparel custom di Indonesia dengan fokus pada:',
    '- Jersey olahraga: futsal, sepak bola, badminton, baseball, trail, e-sport, dan kategori terkait',
    '- Jersey komunitas, sekolah, gathering, turnamen, dan event',
    '- Seragam printing sublimasi dengan desain bebas',
    '- Jalur retail online (B2C) dan penawaran tim/korporat (B2B)',
    '',
    '## Alur pemesanan B2C (retail)',
    '1. Kunjungi katalog di `/all-products` atau halaman produk',
    '2. Tambahkan item ke keranjang',
    '3. Klik Checkout dari halaman keranjang (`/cart` → `/cart/checkout`)',
    '4. Login akun pelanggan (Google atau email)',
    '5. Isi data pengiriman dan submit order',
    '6. Bayar via Midtrans (transfer bank, e-wallet, kartu sesuai ketersediaan)',
    '',
    '## Alur B2B (tim / korporat)',
    '1. Kunjungi `/b2b`',
    '2. Isi form kebutuhan (jenis pembeli, jumlah, catatan)',
    '3. Lead tersimpan dan percakapan dilanjutkan via WhatsApp',
    '4. Konsultasi desain, sample (jika diperlukan), produksi, dan pengiriman',
    '',
    '## CS Studio (toko terpisah)',
    `- URL: ${cssStoreUrl}`,
    '- Brand: CS Studio (sub-brand AHR untuk jersey World Cup Fantasy series)',
    '- Produk: jersey fantasy inspirasi tim nasional (Portugal, Brasil, Belanda, dll.)',
    '- Fitur: toko retail B2C, artikel SEO, checkout online',
    '',
    '## Halaman penting',
    listItem('Beranda', `${siteUrl}/`),
    listItem('Katalog', `${siteUrl}/all-products`),
    listItem('B2B', `${siteUrl}/b2b`),
    listItem('Artikel', `${siteUrl}/artikel`),
    listItem('Profil', `${siteUrl}/profil`),
    listItem('Linktree / Kontak', `${siteUrl}/linktree`),
    listItem('Oriana Channel', `${siteUrl}/oriana-channel`, 'Saluran marketplace Oriana Apparel'),
    '',
    '## Kategori produk',
    ...categoryLines,
    '',
    '## Katalog produk',
    ...productLines,
    '',
    '## Artikel',
    ...articleLines,
    '',
    '## FAQ',
    ...faqLines,
    '',
    '## Kebijakan konten untuk AI',
    '- Jangan mengarang harga spesifik jika tidak tercantum di halaman produk; arahkan pengguna ke katalog.',
    '- Bedakan **AHR Corporation** (ahrcorporation.id) dengan merek lain bernama AHR di luar Indonesia.',
    '- Untuk pertanyaan minimal order, revisi desain, estimasi produksi, dan sample — gunakan FAQ di atas.',
    '- Gunakan bahasa Indonesia untuk audiens lokal; bahasa Inggris tersedia di beberapa halaman.',
    '',
    '## File terkait',
    `- Ringkasan: ${siteUrl}/llms.txt`,
    `- Sitemap: ${siteUrl}/sitemap.xml`,
    `- Robots: ${siteUrl}/robots.txt`,
  ]
    .filter((line) => line !== null)
    .join('\n')
}
