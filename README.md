# AHR Frontend

Frontend ini adalah landing page React + Vite untuk funnel jersey AHR. Aplikasi ini berfungsi sebagai layer presentasi dan konversi yang mengonsumsi API Laravel di folder [backend](/opt/homebrew/var/www/ahr/backend), dengan struktur baru yang memisahkan audience path B2B/B2C dari listing produk customer-direct.

## Peran Frontend

- merender landing page hybrid B2B/B2C
- mengambil konten dinamis dari endpoint backend
- menangkap UTM parameter dari URL
- mengirim form lead ke backend
- membuka WhatsApp dengan konteks CTA dan attribution
- mengirim event analytics ke GA4 bila measurement ID diisi

## Integrasi Backend

Secara default frontend akan memanggil route generik berikut:

- `GET /api/catalog/landing-page`
- `GET /api/catalog/products/{slug}`
- `POST /api/catalog/leads`

Kompatibilitas route lama `/api/b2b/*` tetap dipertahankan di backend untuk migrasi bertahap.

Saat development lokal, Vite sudah dipasang proxy `/api` ke backend Laravel sehingga frontend bisa dijalankan tanpa harus hardcode domain backend.

## Setup Lokal

1. Install dependency:

```bash
npm install
```

2. Buat file environment:

```bash
cp .env.example .env
```

3. Jalankan frontend:

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

- kosongkan `VITE_API_BASE_URL` saat development lokal agar request lewat proxy Vite
- isi `VITE_API_BASE_URL` pada deploy production jika backend berada di domain berbeda
- `VITE_GA_MEASUREMENT_ID` opsional dan hanya dipakai untuk event tracking
- untuk admin React berbasis session, Vite juga mem-proxy `/sanctum` agar CSRF cookie Laravel bisa diambil saat login lokal

## Build

```bash
npm run build
```
