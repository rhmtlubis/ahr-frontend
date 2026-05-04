# AHR Frontend

Frontend ini adalah SPA React + Vite untuk website publik AHR.

Tanggung jawab utamanya:

- menampilkan homepage hybrid
- merender katalog dan detail produk
- mengelola cart di browser
- menjalankan checkout WhatsApp
- mengirim event analytics jika consent diberikan

## Stack

- `React 19`
- `Vite`
- `React Router`
- `GSAP`
- `Axios`
- `Lucide React`

## Route Aplikasi

- `/` homepage
- `/all-products` listing produk
- `/produk/:productSlug` detail produk
- `/cart` cart dan checkout
- `/profil` company profile
- `/linktree` halaman kontak singkat
- `/admin/*` redirect ke backend `/cms`

## Data dan Integrasi Backend

Frontend memakai endpoint berikut:

```http
GET /api/catalog/landing-page
GET /api/catalog/products/{productSlug}
POST /api/catalog/pricing/quote
POST /api/catalog/leads
POST /api/catalog/orders
GET /api/catalog/locations/provinces
GET /api/catalog/locations/cities
GET /api/catalog/locations/districts
```

Catatan:

- konten dan detail produk meminta `?locale=id|en`
- quote dan order dapat mengirim `currency`
- backend lama `/api/b2b/*` masih tersedia sebagai compatibility layer

## Struktur Halaman

### Homepage `/`

File utama: `src/App.jsx`

Perilaku:

- memanggil landing page API
- fallback ke konten lokal bila API gagal
- menampilkan section hero, category showcase, product slider, process, pricing, FAQ, contact
- lead form submit ke backend
- CTA WhatsApp menyisipkan konteks dan UTM ke pesan
- personalization section aktif jika consent personalization diberikan

### Listing `/all-products`

File utama: `src/AllProductsPage.jsx`

Perilaku:

- mengambil `catalog_categories` dan `catalog_items` dari payload landing page
- filter kategori menggunakan query string `?category=...`
- pagination menggunakan query string `?page=...`
- add-to-cart langsung dari listing
- inquiry tombol produk memvalidasi quote lebih dulu sebelum membuka WhatsApp

### Detail produk `/produk/:productSlug`

File utama: `src/ProductDetailPage.jsx`

Perilaku:

- mengambil detail produk dari API
- menggunakan `location.state.product` sebagai initial state bila ada
- mendukung gallery grid, show more, lightbox, dan zoom
- mendukung size selector, quantity stepper, mixed size untuk qty > 1
- add-to-cart langsung ke browser cart
- inquiry WhatsApp memanggil quote API lebih dulu

### Cart `/cart`

File utama: `src/CartPage.jsx`

Perilaku:

- membaca cart dari context browser
- mengubah size, quantity, dan mixed-size per item
- menghitung estimasi total dari snapshot harga item
- memuat provinsi, kota, kecamatan dari backend
- menyimpan draft order ke backend
- tetap membuka WhatsApp walaupun save order gagal
- membersihkan cart setelah submit checkout

### Company profile `/profil`

File utama: `src/CompanyProfilePage.jsx`

Perilaku:

- menampilkan company profile berdasarkan chrome content / landing content
- dipakai untuk informasi sejarah, visi misi, dan alamat

### Linktree `/linktree`

File utama: `src/LinktreePage.jsx`

Perilaku:

- halaman kontak ringkas untuk jalur traffic alternatif

## State dan Browser Storage

### Bahasa

File: `src/lib/i18n.jsx`

- locale disimpan di `localStorage` key `ahr-language`
- language default `id`
- supported locale: `id`, `en`

### Cart

File: `src/lib/cart.jsx`

- cart disimpan di `localStorage` key `ahr-cart-v1`
- item key dibentuk dari `productSlug + size`
- duplicate item dengan slug dan size sama akan digabung
- quantity dibatasi `1..999`

### Personalization

File: `src/lib/personalization.js`

- view produk disimpan di `localStorage` key `ahr_product_views`
- hanya aktif bila user memberi consent personalization
- homepage dapat mengurutkan produk berdasarkan histori view browser

## Consent dan Analytics

### Consent

File: `src/lib/consent.js`, `src/components/layout/CookieConsentBanner.jsx`

Tipe consent yang dipisah:

- `analytics`
- `personalization`

### Analytics

File: `src/lib/analytics.js`

Perilaku:

- GA4 diinisialisasi hanya jika `VITE_GA_MEASUREMENT_ID` tersedia
- page view dikirim manual setelah route berubah
- event kustom dikirim untuk CTA, scroll depth, FAQ, cart, checkout, filter, pagination, dan product open

## API Helper

File: `src/lib/api.js`

Fungsi utama:

- `getApiUrl`
- `getBackendUrl`
- `fetchCatalogPriceQuote`
- `saveCatalogOrder`
- `fetchCatalogProvinces`
- `fetchCatalogCities`
- `fetchCatalogDistricts`

## Routing dan Performance

File: `src/main.jsx`

Karakteristik:

- route utama di-lazy load
- `BrowserRouter` memakai future flags React Router v7
- ada route tracker untuk analytics
- `/admin/*` langsung redirect ke backend `/cms`

## Setup Lokal

```bash
npm install
copy .env.example .env
npm run dev
```

Default URL lokal:

- `http://localhost:5173`

## Environment

```env
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
VITE_GA_MEASUREMENT_ID=
```

Catatan:

- kosongkan `VITE_API_BASE_URL` saat local dev agar lewat proxy
- isi `VITE_API_BASE_URL` di production bila domain frontend dan backend berbeda
- `VITE_GA_MEASUREMENT_ID` opsional

## Build

```bash
npm run build
```

Output build ada di `dist/`.

Saat build production, frontend sekarang juga menjalankan prerender statis untuk:

- `/`
- `/all-products`
- `/profil`
- `/linktree`
- `/produk/:productSlug`

Tujuannya:

- preview WhatsApp lebih stabil
- crawler search/AI bisa membaca meta halaman tanpa menunggu React hydrate
- sitemap produk ikut tergenerate saat build

## Quality Score dan SEO Readiness

Untuk mendukung relevansi landing page pada kampanye iklan dan kesiapan indexing, frontend saat ini sudah meng-cover:

- metadata `title` dan `meta description` yang dirender dinamis per halaman dan per produk
- `JSON-LD`, `Open Graph`, `Twitter Card`, dan `canonical` untuk membantu mesin pencari serta preview sosial memahami konteks konten
- prerender statis untuk homepage, listing, company profile, linktree, dan detail produk agar bot tidak perlu menunggu SPA hydrate
- deep linking melalui URL spesifik seperti `/all-products?category=football` untuk mengarahkan traffic ads ke kategori yang paling relevan

Untuk image production:

```bash
docker build -t deploy-frontend .
```

## Verifikasi Manual

Minimal cek:

- homepage locale `id` dan `en`
- filter dan pagination `/all-products`
- detail produk, gallery, size guide, dan mixed size
- add-to-cart dari listing dan detail
- checkout delivery dan pickup
- redirect `/admin/*`
- consent analytics dan personalization

Referensi sistem keseluruhan ada di [README root](../README.md).
