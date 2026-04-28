# AHR Frontend

Frontend ini adalah SPA React + Vite untuk website commerce AHR. Aplikasi menangani landing page hybrid, katalog produk, detail produk, cart, checkout WhatsApp, dan halaman kontak ringan seperti `linktree`.

Referensi backend ada di [backend/README.md](../backend/README.md).

## Peran Frontend

- merender homepage hybrid B2C/B2B
- mengambil konten dinamis dari backend Laravel
- menampilkan katalog produk multi-bahasa `id/en`
- menangani detail produk dan validasi quote harga
- menyimpan cart di browser
- menyimpan draft checkout ke backend lalu mengarahkan user ke WhatsApp
- mengirim analytics event bila consent dan measurement ID tersedia

## Route Aplikasi

- `/` homepage utama
- `/all-products` listing produk
- `/produk/:productSlug` detail produk
- `/cart` cart dan checkout
- `/profil` company profile
- `/linktree` halaman kontak cepat
- `/admin/*` redirect legacy ke backend `/cms`

## Integrasi Backend

Frontend saat ini memakai endpoint:

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

- request konten dan detail produk mengirim `?locale=id|en`
- route `/api/b2b/*` masih didukung backend sebagai compatibility layer
- checkout cart menyimpan order draft ke backend sebelum membuka WhatsApp

## Fitur Utama

- switch bahasa `Indonesia / English`
- fallback content lokal bila API gagal
- cookie consent terpisah untuk `analytics` dan `personalization`
- personalized product suggestion berbasis browser consent
- cart persistence di browser
- mixed-size editor untuk quantity > 1
- checkout delivery dengan dropdown provinsi, kota, dan kecamatan
- CTA, scroll, FAQ, cart, dan checkout event tracking
- lazy-loaded routes untuk halaman utama

## Setup Lokal

1. Install dependency:

```bash
npm install
```

2. Buat environment:

```bash
copy .env.example .env
```

3. Jalankan development server:

```bash
npm run dev
```

Frontend lokal default tersedia di `http://localhost:5173`.

## Environment Variables

```env
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
VITE_GA_MEASUREMENT_ID=
```

Catatan:

- kosongkan `VITE_API_BASE_URL` saat local dev agar request lewat proxy Vite
- isi `VITE_API_BASE_URL` di production bila backend beda domain
- `VITE_API_PROXY_TARGET` dipakai oleh proxy `/api` dan `/sanctum`
- `VITE_GA_MEASUREMENT_ID` opsional dan hanya aktif setelah consent analytics diberikan

## Build

```bash
npm run build
```

Output production akan dibuat ke folder `dist/`.

## Arsitektur Singkat

- `src/App.jsx`: homepage hybrid, CTA, lead form, content API
- `src/AllProductsPage.jsx`: listing katalog
- `src/ProductDetailPage.jsx`: detail produk + quote validation
- `src/CartPage.jsx`: cart, mixed size, checkout form, order draft save
- `src/LinktreePage.jsx`: quick contact page
- `src/lib/api.js`: helper API publik, quote, order, dan location fetcher
- `src/lib/cmsContent.js`: normalizer payload CMS/backend ke shape frontend

## Verifikasi

Sebelum publish production, jalankan minimal:

```bash
npm run build
```

Disarankan juga cek manual:

- homepage locale `id` dan `en`
- listing dan detail produk
- add to cart, ubah quantity, dan mixed size
- checkout pickup dan delivery
- halaman `/linktree`
