/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LANGUAGE_STORAGE_KEY = 'ahr-language'
const DEFAULT_LANGUAGE = 'id'
const SUPPORTED_LANGUAGES = ['id', 'en']

const translations = {
  id: {
    language: {
      label: 'Bahasa',
      shortLabel: 'ID',
      options: {
        id: 'Indonesia',
        en: 'English',
      },
      switchLabel: 'Pilih bahasa',
    },
    common: {
      consult: 'Konsultasi',
      contactTeam: 'Hubungi tim',
      back: 'Kembali',
      backToHome: 'Kembali ke beranda',
      allCollections: 'Semua Koleksi',
      openMaps: 'Buka Maps',
      openLocationInMaps: 'Buka Lokasi di Google Maps',
      chatWhatsApp: 'Chat WhatsApp',
      chatWhatsAppNow: 'Chat WhatsApp Sekarang',
      contact: 'Kontak',
      aboutUs: 'Tentang Kami',
      visionMission: 'Visi & Misi',
      backToTop: 'Kembali ke atas',
      askProduct: 'Tanya Produk',
      previous: 'Sebelumnya',
      next: 'Berikutnya',
      loadingProductDetail: 'Memuat detail produk...',
      productNotFound: 'Produk tidak ditemukan.',
      backToCatalog: 'Kembali ke katalog',
      home: 'Beranda',
      products: 'Produk',
      size: 'Ukuran',
      color: 'Warna',
      sizeGuide: 'Panduan ukuran',
      orderViaWhatsApp: 'Pesan via WhatsApp',
      save: 'Simpan',
      detail: 'Detail',
      specification: 'Spesifikasi',
      care: 'Perawatan',
      showLess: 'Tampilkan lebih sedikit',
      showMore: 'Tampilkan lebih banyak',
      activeCategory: 'Kategori aktif',
      productsAvailable: '{{count}} produk tersedia.',
      showingProducts: 'Menampilkan {{showing}} produk di halaman {{page}} dari {{total}}.',
      pageStatus: 'Halaman {{page}} dari {{total}}',
      mapLabel: 'Buka lokasi AHR Printing di Google Maps',
      profileLabel: 'Profil AHR',
      whatsappLabel: 'WhatsApp AHR',
      submitInquiry: 'Submit Inquiry',
      submitting: 'Mengirim...',
    },
    cart: {
      openCart: 'Buka cart',
      addToCart: 'Tambah ke Cart',
      addShort: 'Tambah',
      viewCart: 'Lihat Cart',
      addedNotice: '{{quantity}} pcs {{name}} ukuran {{size}} sudah masuk cart.',
      eyebrow: 'Checkout Cart',
      title: 'Cart order AHR',
      body:
        'Kumpulkan produk dulu, isi data checkout, lalu lanjutkan konfirmasi order lewat WhatsApp.',
      backToProducts: 'Kembali ke produk',
      continueShopping: 'Lanjut belanja',
      emptyTitle: 'Cart masih kosong',
      emptyBody: 'Pilih produk dari katalog, lalu tambahkan ke cart sebelum checkout via WhatsApp.',
      itemsEyebrow: 'Item terpilih',
      itemsTitle: 'Produk di cart',
      clearCart: 'Kosongkan cart',
      itemMeta: 'Ukuran {{size}}',
      mixedSizeTrigger: 'Atur size campuran',
      mixedSizeTitle: 'Pilih size per pcs',
      mixedSizePiece: 'Pcs {{number}}',
      mixedSizeApply: 'Terapkan size campuran',
      quantity: 'Jumlah',
      decreaseQuantity: 'Kurangi jumlah',
      increaseQuantity: 'Tambah jumlah',
      removeItem: 'Hapus',
      summaryEyebrow: 'Ringkasan',
      summaryTitle: 'Checkout WhatsApp',
      totalItems: 'Total item',
      itemsCount: '{{count}} pcs',
      subtotal: 'Subtotal estimasi',
      originalTotal: 'Total harga asli',
      promoTotal: 'Total promo',
      nettTotal: 'Nett estimasi',
      subtotalManual: 'Dikonfirmasi via WhatsApp',
      customerName: 'Nama pemesan',
      customerWhatsapp: 'Nomor WhatsApp',
      fulfillment: 'Metode penerimaan',
      delivery: 'Kirim ke alamat',
      pickup: 'Ambil di workshop',
      province: 'Provinsi',
      city: 'Kabupaten / Kota',
      district: 'Kecamatan',
      selectProvince: 'Pilih provinsi',
      selectCity: 'Pilih kabupaten / kota',
      selectDistrict: 'Pilih kecamatan',
      address: 'Alamat pengiriman',
      addressDetail: 'Detail alamat',
      loadingLocations: 'Memuat data wilayah...',
      notes: 'Catatan order',
      checkoutWhatsApp: 'Checkout via WhatsApp',
      checkoutSaving: 'Menyimpan order...',
      checkoutSaved: 'Order {{orderNumber}} tersimpan. Kami bukakan WhatsApp untuk konfirmasi final.',
      checkoutFallback: 'Order belum tersimpan ke server. Anda tetap bisa lanjut ke WhatsApp.',
    },
    cookie: {
      ariaLabel: 'Izin cookies',
      eyebrow: 'Pengaturan cookies',
      title: 'Pilih izin pelacakan untuk pengalaman AHR yang lebih rapi',
      body:
        'Kami memakai cookies dan penyimpanan browser untuk dua hal: membaca performa funnel lewat analytics dan menampilkan rekomendasi produk yang lebih relevan di beranda.',
      acceptAll: 'Setujui Semua',
      rejectAll: 'Tolak Semua',
      showPreferences: 'Atur pilihan analytics dan personalization',
      hidePreferences: 'Sembunyikan pengaturan detail',
      analyticsOnly: 'Analytics Saja',
      personalizationOnly: 'Personalization Saja',
    },
    category: {
      pickProductCategory: 'Pilih kategori produk',
      titleAll: 'SEMUA KOLEKSI',
      titleByCategory: 'KOLEKSI {{label}}',
    },
    site: {
      defaultFooterBottomText: '© 2026 AHR Printing. Dibangun untuk kebutuhan retail dan teamwear.',
      defaultBrandTagline: 'Apparel dan percetakan kustom dengan spesialisasi sublimasi jersey.',
      defaultBrandResponseTime: 'Balas cepat di jam kerja untuk kebutuhan retail maupun bulk order',
      defaultCompanyDescription:
        'CV AHR Printing bergerak di bidang apparel dan percetakan kustom, dengan fokus pada sublimasi jersey serta kebutuhan teamwear yang rapi dan mudah diikuti prosesnya.',
    },
    homepage: {
      heroMessage:
        'Halo AHR, saya ingin konsultasi bulk order untuk custom jersey dan teamwear.',
      finalMessage: 'Halo AHR, saya ingin konsultasi kebutuhan bulk order dan procurement.',
      footerMessage: 'Halo AHR, saya ingin berdiskusi tentang kebutuhan jersey atau apparel kustom.',
      brand: {
        tagline: 'Apparel dan percetakan kustom dengan spesialisasi sublimasi jersey.',
        responseTime: 'Balas cepat di jam kerja untuk kebutuhan retail maupun bulk order',
      },
      hero: {
        title: 'Produksi jersey kustom yang rapi, terbuka, dan nyaman diikuti prosesnya.',
        body:
          'Custom jersey untuk tim, komunitas, sekolah, event, dan personal dengan alur yang jelas dari desain sampai pengiriman.',
        primaryCta: 'Diskusi kebutuhan',
        secondaryCta: 'Lihat pilihan',
        eyebrow: 'AHR Production Motion',
      },
      stats: [
        { value: '500+', label: 'team, school, dan komunitas ditangani' },
        { value: '10 pcs', label: 'MOQ custom jersey mulai' },
        { value: '7-14 hari', label: 'estimasi produksi' },
        { value: '34 kota', label: 'cakupan pengiriman aktif' },
      ],
      capabilities: [
        {
          title: 'Design-to-Delivery Workflow',
          detail:
            'Alur bulk order dijelaskan dari awal supaya tim procurement, EO, sekolah, dan klub bisa mengikuti dengan tenang.',
        },
        {
          title: 'Retail Collection Entry',
          detail:
            'Jalur retail tetap ringan dan mudah dijelajahi untuk pembelian langsung tanpa terasa bercampur dengan flow produksi.',
        },
        {
          title: 'QC dan Reorder Support',
          detail:
            'Nomor, warna, size run, dan file desain dijaga rapi supaya repeat order lebih mudah saat dibutuhkan.',
        },
        {
          title: 'Invoice & Shipment Ready',
          detail:
            'Flow administrasi, approval, dan pengiriman dijelaskan dengan lebih terbuka agar buyer bisa menyesuaikan ritme kerjanya.',
        },
      ],
      pricingPackages: [
        {
          id: 'starter',
          name: 'Starter',
          quantity: '10 pcs',
          price: 'Mulai Rp 95.000 / pcs',
          featured: false,
          features: ['1 desain utama', '2x revisi gratis', 'Cocok untuk tim baru'],
        },
        {
          id: 'tim',
          name: 'Tim',
          quantity: '25 pcs',
          price: 'Mulai Rp 88.000 / pcs',
          featured: true,
          features: ['Harga paling ideal', 'Sample fisik opsional', 'Prioritas slot produksi'],
        },
        {
          id: 'komunitas',
          name: 'Komunitas',
          quantity: '100 pcs',
          price: 'Custom volume pricing',
          featured: false,
          features: ['Tier khusus reseller/EO', 'Split ukuran & chapter', 'Pendampingan reorder'],
        },
      ],
      processSteps: [
        {
          title: 'Brief',
          detail: 'Kebutuhan, jumlah, dan target deadline dibicarakan lebih dulu supaya arahnya sama.',
        },
        {
          title: 'Approval',
          detail: 'Mockup dan revisi final dirapikan sebelum masuk line produksi.',
        },
        {
          title: 'Production',
          detail: 'Tahap cut, print, sewing, dan quality check dijalankan dengan standar yang konsisten.',
        },
        {
          title: 'Ship',
          detail:
            'Setelah selesai, pengiriman dan kebutuhan reorder berikutnya bisa disiapkan lebih mudah.',
        },
      ],
      faqs: [
        {
          question: 'Apakah layout ini meniru adidas secara persis?',
          answer:
            'Tidak. Kami mengambil pola navigasi dan komposisi visualnya, lalu menyesuaikan warna, copy, logo, dan fokus pesan agar konsisten dengan guideline brand AHR.',
        },
        {
          question: 'Apakah halaman ini tetap mendukung B2B dan B2C sekaligus?',
          answer:
            'Ya. Hero dan CTA sengaja dibuat dual-path agar shopper retail dan buyer wholesale bisa masuk ke jalur yang sesuai tanpa bingung.',
        },
        {
          question: 'Video hero bisa diganti dengan video brand AHR?',
          answer:
            'Bisa. Saya sudah set sebagai file lokal di frontend sehingga nanti tinggal ganti asset videonya tanpa ubah struktur layout.',
        },
      ],
      personalized: {
        eyebrow: 'Top Produk Untuk Anda',
        title: 'Urutan ini menyesuaikan produk yang paling sering Anda lihat.',
        body:
          'Personalisasi ini hanya berlaku di browser Anda dan bisa berubah seiring pola kunjungan.',
      },
      slider: {
        meta: '{{count}} produk. Geser ke samping untuk melihat semuanya.',
        viewAll: 'Lihat Semua Produk',
      },
      pricing: {
        requestQuote: 'Minta penawaran',
        askThisPackage: 'Tanya Paket Ini',
      },
      finalCta: {
        wholesaleConsultation: 'Wholesale Consultation',
        shopCollection: 'Shop Collection',
      },
      leadForm: {
        name: 'Nama PIC',
        phone: 'Nomor WhatsApp',
        organization: 'Nama tim atau instansi',
        organizationPlaceholder: 'Tim / instansi / brand',
        quantity: 'Estimasi jumlah pcs',
        quantityPlaceholder: 'Estimasi pcs',
        segment: 'Segmen',
      },
      contact: {
        teamTitle: 'Hubungi Tim AHR',
      },
    },
    allProducts: {
      footerMessage: 'Halo AHR, saya ingin berdiskusi tentang kebutuhan jersey atau apparel kustom.',
      heroEyebrow: 'Product Listing',
      contactAhr: 'Hubungi AHR',
      inquiryMessage:
        'Halo AHR, saya tertarik dengan {{name}}. Mohon info detail bahan, MOQ, dan estimasi produksinya.',
    },
    productDetail: {
      utilityAction: 'Hubungi tim',
      breadcrumb: 'Beranda / Produk / {{category}}',
      stockLeft: 'Sisa produk ukuran {{size}}: {{stock}} pcs',
      inquiryMessage:
        'Halo AHR, saya tertarik dengan produk berikut:\n\nProduk: {{name}}\nKategori: {{category}}\nHarga: {{price}}\nUkuran dipilih: {{size}}\nStok ukuran {{size}}: {{stock}} pcs\n\nMohon info lanjutan untuk order produk ini ya.',
      sizeGuide: {
        title: 'Panduan ukuran',
        subtitle: 'Size Chart Dewasa',
        closeLabel: 'Tutup panduan ukuran',
        body:
          'Pilih ukuran yang paling mendekati ukuran baju yang biasa dipakai. Jika ingin lebih aman untuk order tim, ukur lebar dan panjang kaos pembanding lalu cocokkan ke tabel berikut.',
        sizeAxis: 'P x L',
        howToMeasureTitle: 'How to measure',
        howToMeasureBody:
          'Ambil meteran, catat ukuran badan, lalu cocokan dengan size chart untuk memilih ukuran yang paling pas.',
        horizontalTitle: 'Pegang meteran secara horizontal untuk mengukur:',
        verticalTitle: 'Pegang meteran secara vertikal untuk mengukur:',
        imageAlt: 'Panduan cara mengukur badan',
        measurements: [
          '<strong>Dada</strong>, di bagian paling lebar.',
          '<strong>Pinggang</strong>, di bagian paling ramping.',
          '<strong>Pinggul</strong>, di bagian paling lebar dengan kaki rapat.',
          '<strong>Panjang kaki dalam</strong>, dari selangkangan ke bawah.',
          '<strong>Tinggi badan</strong>, dari kepala sampai kaki dengan posisi tegak.',
        ],
        footnoteTitle: 'Ukuran masih ragu?',
        footnoteBody:
          'Tidak masalah. Saat ini order masih dibantu via WhatsApp, jadi tim AHR bisa bantu cek ukuran paling aman sebelum produksi.',
      },
      lightbox: {
        close: 'Tutup preview gambar',
        previous: 'Gambar sebelumnya',
        next: 'Gambar berikutnya',
        zoomIn: 'Klik gambar untuk zoom detail.',
        zoomOut: 'Klik gambar untuk kembali ke ukuran normal.',
      },
      footerMessage: 'Halo AHR, saya ingin order {{name}} ukuran {{size}}.',
    },
    profile: {
      utilityAction: 'Hubungi tim',
      introEyebrow: 'Profil Perusahaan',
      aboutEyebrow: 'Tentang Kami',
      highlightTitle: 'Katapang, Kabupaten Bandung',
      highlightBody:
        'Workshop kami menjadi titik kerja untuk desain, printing, finishing, dan koordinasi order agar hasil tetap rapi, tajam, dan tahan lama.',
      highlightMeta: ['Sejak 2020', 'Fokus pada jersey custom'],
      historyLabel: 'Sejak 2020',
      commitmentLabel: 'Cara Kami Bekerja',
      visionEyebrow: 'Visi & Misi',
      visionLabel: 'Visi AHR Printing',
      missionLabel: 'Misi AHR Printing',
      contactEyebrow: 'Alamat & Kontak',
      discussionTitle: 'Diskusi Kebutuhan',
      discussionBody:
        'Tim AHR siap membantu kebutuhan custom jersey untuk tim maupun order personal.',
      whatsappMessage: 'Halo AHR, saya ingin konsultasi kebutuhan custom jersey.',
    },
  },
  en: {
    language: {
      label: 'Language',
      shortLabel: 'EN',
      options: {
        id: 'Indonesia',
        en: 'English',
      },
      switchLabel: 'Choose language',
    },
    common: {
      consult: 'Consultation',
      contactTeam: 'Contact team',
      back: 'Back',
      backToHome: 'Back to home',
      allCollections: 'All Collections',
      openMaps: 'Open Maps',
      openLocationInMaps: 'Open Location in Google Maps',
      chatWhatsApp: 'Chat on WhatsApp',
      chatWhatsAppNow: 'Chat on WhatsApp Now',
      contact: 'Contact',
      aboutUs: 'About Us',
      visionMission: 'Vision & Mission',
      backToTop: 'Back to top',
      askProduct: 'Ask About Product',
      previous: 'Previous',
      next: 'Next',
      loadingProductDetail: 'Loading product details...',
      productNotFound: 'Product not found.',
      backToCatalog: 'Back to catalog',
      home: 'Home',
      products: 'Products',
      size: 'Size',
      color: 'Color',
      sizeGuide: 'Size guide',
      orderViaWhatsApp: 'Order via WhatsApp',
      save: 'Save',
      detail: 'Details',
      specification: 'Specifications',
      care: 'Care',
      showLess: 'Show less',
      showMore: 'Show more',
      activeCategory: 'Active category',
      productsAvailable: '{{count}} products available.',
      showingProducts: 'Showing {{showing}} products on page {{page}} of {{total}}.',
      pageStatus: 'Page {{page}} of {{total}}',
      mapLabel: 'Open AHR Printing location in Google Maps',
      profileLabel: 'AHR Profile',
      whatsappLabel: 'AHR WhatsApp',
      submitInquiry: 'Submit Inquiry',
      submitting: 'Sending...',
    },
    cart: {
      openCart: 'Open cart',
      addToCart: 'Add to Cart',
      addShort: 'Add',
      viewCart: 'View Cart',
      addedNotice: '{{quantity}} pcs of {{name}} size {{size}} has been added to cart.',
      eyebrow: 'Cart Checkout',
      title: 'AHR order cart',
      body:
        'Collect products first, fill in checkout details, then continue order confirmation through WhatsApp.',
      backToProducts: 'Back to products',
      continueShopping: 'Continue shopping',
      emptyTitle: 'Your cart is empty',
      emptyBody: 'Choose products from the catalog, then add them to cart before checking out through WhatsApp.',
      itemsEyebrow: 'Selected items',
      itemsTitle: 'Products in cart',
      clearCart: 'Clear cart',
      itemMeta: 'Size {{size}}',
      mixedSizeTrigger: 'Set mixed sizes',
      mixedSizeTitle: 'Choose size per piece',
      mixedSizePiece: 'Piece {{number}}',
      mixedSizeApply: 'Apply mixed sizes',
      quantity: 'Quantity',
      decreaseQuantity: 'Decrease quantity',
      increaseQuantity: 'Increase quantity',
      removeItem: 'Remove',
      summaryEyebrow: 'Summary',
      summaryTitle: 'WhatsApp Checkout',
      totalItems: 'Total items',
      itemsCount: '{{count}} pcs',
      subtotal: 'Estimated subtotal',
      originalTotal: 'Original total',
      promoTotal: 'Promo total',
      nettTotal: 'Estimated nett',
      subtotalManual: 'Confirmed via WhatsApp',
      customerName: 'Customer name',
      customerWhatsapp: 'WhatsApp number',
      fulfillment: 'Fulfillment method',
      delivery: 'Deliver to address',
      pickup: 'Pickup at workshop',
      province: 'Province',
      city: 'City / Regency',
      district: 'District',
      selectProvince: 'Select province',
      selectCity: 'Select city / regency',
      selectDistrict: 'Select district',
      address: 'Delivery address',
      addressDetail: 'Street address',
      loadingLocations: 'Loading location data...',
      notes: 'Order notes',
      checkoutWhatsApp: 'Checkout via WhatsApp',
      checkoutSaving: 'Saving order...',
      checkoutSaved: 'Order {{orderNumber}} has been saved. We opened WhatsApp for final confirmation.',
      checkoutFallback: 'The order could not be saved to the server. You can still continue through WhatsApp.',
    },
    cookie: {
      ariaLabel: 'Cookie permissions',
      eyebrow: 'Cookie settings',
      title: 'Choose tracking permissions for a cleaner AHR experience',
      body:
        'We use cookies and browser storage for two things: reading funnel performance through analytics and showing more relevant product recommendations on the homepage.',
      acceptAll: 'Accept All',
      rejectAll: 'Reject All',
      showPreferences: 'Choose analytics and personalization options',
      hidePreferences: 'Hide detailed settings',
      analyticsOnly: 'Analytics Only',
      personalizationOnly: 'Personalization Only',
    },
    category: {
      pickProductCategory: 'Choose product category',
      titleAll: 'ALL COLLECTIONS',
      titleByCategory: '{{label}} COLLECTION',
    },
    site: {
      defaultFooterBottomText: '© 2026 AHR Printing. Built for retail and teamwear needs.',
      defaultBrandTagline: 'Custom apparel and printing with a focus on sublimation jerseys.',
      defaultBrandResponseTime: 'Fast replies during business hours for retail and bulk orders',
      defaultCompanyDescription:
        'CV AHR Printing produces custom apparel and printing, focused on sublimation jerseys and teamwear with a process that stays tidy and easy to follow.',
    },
    homepage: {
      heroMessage: 'Hello AHR, I would like to discuss a bulk order for custom jerseys and teamwear.',
      finalMessage: 'Hello AHR, I would like to discuss bulk order and procurement needs.',
      footerMessage: 'Hello AHR, I would like to discuss jersey or custom apparel needs.',
      brand: {
        tagline: 'Custom apparel and printing with a focus on sublimation jerseys.',
        responseTime: 'Fast replies during business hours for retail and bulk orders',
      },
      hero: {
        title: 'Custom jersey production that feels neat, transparent, and easy to follow.',
        body:
          'Custom jerseys for teams, communities, schools, events, and personal orders with a clear flow from design to delivery.',
        primaryCta: 'Discuss your needs',
        secondaryCta: 'View options',
        eyebrow: 'AHR Production Motion',
      },
      stats: [
        { value: '500+', label: 'teams, schools, and communities served' },
        { value: '10 pcs', label: 'minimum custom jersey order' },
        { value: '7-14 days', label: 'production estimate' },
        { value: '34 cities', label: 'active delivery coverage' },
      ],
      capabilities: [
        {
          title: 'Design-to-Delivery Workflow',
          detail:
            'The bulk-order flow is explained upfront so procurement teams, event organizers, schools, and clubs can follow it with confidence.',
        },
        {
          title: 'Retail Collection Entry',
          detail:
            'The retail path stays light and easy to explore for direct purchases without getting mixed into the production flow.',
        },
        {
          title: 'QC and Reorder Support',
          detail:
            'Numbers, colors, size runs, and design files are kept organized so repeat orders are easier when needed.',
        },
        {
          title: 'Invoice and Shipment Ready',
          detail:
            'Administration, approval, and delivery are presented more transparently so buyers can match the pace to their workflow.',
        },
      ],
      pricingPackages: [
        {
          id: 'starter',
          name: 'Starter',
          quantity: '10 pcs',
          price: 'Starting from IDR 95,000 / pcs',
          featured: false,
          features: ['1 main design', '2 free revisions', 'Good for new teams'],
        },
        {
          id: 'team',
          name: 'Team',
          quantity: '25 pcs',
          price: 'Starting from IDR 88,000 / pcs',
          featured: true,
          features: ['Best-value pricing', 'Optional physical sample', 'Priority production slot'],
        },
        {
          id: 'community',
          name: 'Community',
          quantity: '100 pcs',
          price: 'Custom volume pricing',
          featured: false,
          features: ['Special reseller/EO tier', 'Split sizes and chapters', 'Reorder assistance'],
        },
      ],
      processSteps: [
        {
          title: 'Brief',
          detail: 'We align on needs, quantity, and target deadline first so everyone starts with the same direction.',
        },
        {
          title: 'Approval',
          detail: 'Mockups and final revisions are finalized before entering the production line.',
        },
        {
          title: 'Production',
          detail: 'Cutting, printing, sewing, and quality checks are handled with consistent standards.',
        },
        {
          title: 'Ship',
          detail: 'Once finished, shipping and the next reorder plan can be arranged more easily.',
        },
      ],
      faqs: [
        {
          question: 'Does this layout copy adidas exactly?',
          answer:
            'No. We adopted the navigation pattern and visual composition, then adjusted the colors, copy, logo, and messaging to stay aligned with AHR’s brand direction.',
        },
        {
          question: 'Does this page still support both B2B and B2C?',
          answer:
            'Yes. The hero and CTAs are intentionally built as dual paths so retail shoppers and wholesale buyers can enter the right flow without confusion.',
        },
        {
          question: 'Can the hero video be replaced with an AHR brand video?',
          answer:
            'Yes. It is already set as a local frontend asset, so later we only need to replace the video file without changing the layout structure.',
        },
      ],
      personalized: {
        eyebrow: 'Top Picks for You',
        title: 'This order adapts to the products you view most often.',
        body:
          'This personalization only applies in your browser and can change as your browsing pattern changes.',
      },
      slider: {
        meta: '{{count}} products. Slide sideways to see them all.',
        viewAll: 'View All Products',
      },
      pricing: {
        requestQuote: 'Request a quote',
        askThisPackage: 'Ask About This Package',
      },
      finalCta: {
        wholesaleConsultation: 'Wholesale Consultation',
        shopCollection: 'Shop Collection',
      },
      leadForm: {
        name: 'PIC name',
        phone: 'WhatsApp number',
        organization: 'Team or organization name',
        organizationPlaceholder: 'Team / organization / brand',
        quantity: 'Estimated quantity',
        quantityPlaceholder: 'Estimated pcs',
        segment: 'Segment',
      },
      contact: {
        teamTitle: 'Contact the AHR Team',
      },
    },
    allProducts: {
      footerMessage: 'Hello AHR, I would like to discuss jersey or custom apparel needs.',
      heroEyebrow: 'Product Listing',
      contactAhr: 'Contact AHR',
      inquiryMessage:
        'Hello AHR, I am interested in {{name}}. Please share details about the material, MOQ, and estimated production time.',
    },
    productDetail: {
      utilityAction: 'Contact team',
      breadcrumb: 'Home / Products / {{category}}',
      stockLeft: 'Remaining stock for size {{size}}: {{stock}} pcs',
      inquiryMessage:
        'Hello AHR, I am interested in the following product:\n\nProduct: {{name}}\nCategory: {{category}}\nPrice: {{price}}\nSelected size: {{size}}\nStock for size {{size}}: {{stock}} pcs\n\nPlease share more information to proceed with this order.',
      sizeGuide: {
        title: 'Size guide',
        subtitle: 'Adult Size Chart',
        closeLabel: 'Close size guide',
        body:
          'Choose the size that is closest to a shirt you usually wear. For safer team orders, measure the width and length of a comparison shirt, then match it to the chart below.',
        sizeAxis: 'L x W',
        howToMeasureTitle: 'How to measure',
        howToMeasureBody:
          'Take a measuring tape, note your body measurements, then compare them with the size chart to choose the best fit.',
        horizontalTitle: 'Hold the tape measure horizontally to measure:',
        verticalTitle: 'Hold the tape measure vertically to measure:',
        imageAlt: 'Body measurement guide',
        measurements: [
          '<strong>Chest</strong>, at the fullest part.',
          '<strong>Waist</strong>, at the narrowest part.',
          '<strong>Hips</strong>, at the fullest part with feet together.',
          '<strong>Inside leg</strong>, from the crotch downward.',
          '<strong>Height</strong>, from head to toe while standing straight.',
        ],
        footnoteTitle: 'Still unsure about sizing?',
        footnoteBody:
          'No problem. Orders are currently assisted through WhatsApp, so the AHR team can help confirm the safest size before production.',
      },
      lightbox: {
        close: 'Close image preview',
        previous: 'Previous image',
        next: 'Next image',
        zoomIn: 'Click image to zoom in.',
        zoomOut: 'Click image to return to normal size.',
      },
      footerMessage: 'Hello AHR, I would like to order {{name}} in size {{size}}.',
    },
    profile: {
      utilityAction: 'Contact team',
      introEyebrow: 'Company Profile',
      aboutEyebrow: 'About Us',
      highlightTitle: 'Katapang, Bandung Regency',
      highlightBody:
        'Our workshop is the working hub for design, printing, finishing, and order coordination so results stay neat, sharp, and durable.',
      highlightMeta: ['Since 2020', 'Focused on custom jerseys'],
      historyLabel: 'Since 2020',
      commitmentLabel: 'How We Work',
      visionEyebrow: 'Vision & Mission',
      visionLabel: 'AHR Printing Vision',
      missionLabel: 'AHR Printing Mission',
      contactEyebrow: 'Address & Contact',
      discussionTitle: 'Discuss Your Needs',
      discussionBody:
        'The AHR team is ready to help with custom jersey needs for teams as well as personal orders.',
      whatsappMessage: 'Hello AHR, I would like to discuss custom jersey needs.',
    },
  },
}

function interpolate(template, values = {}) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template,
  )
}

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (path, values) => interpolate(path, values),
})

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)

    return SUPPORTED_LANGUAGES.includes(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE
  })

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    t(path, values) {
      const segments = path.split('.')
      let message = translations[language]

      for (const segment of segments) {
        message = message?.[segment]
      }

      if (typeof message === 'string') {
        return interpolate(message, values)
      }

      return message
    },
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES }
