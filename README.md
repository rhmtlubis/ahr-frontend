# AHR Frontend

Frontend ini adalah landing page React + Vite untuk funnel B2B jersey AHR. Aplikasi ini berfungsi sebagai layer presentasi dan konversi yang mengonsumsi API Laravel di folder [backend](/opt/homebrew/var/www/ahr/backend).

## Peran Frontend

- merender landing page B2B
- mengambil konten dinamis dari endpoint backend
- menangkap UTM parameter dari URL
- mengirim form lead ke backend
- membuka WhatsApp dengan konteks CTA dan attribution
- mengirim event analytics ke GA4 bila measurement ID diisi

## Integrasi Backend

Secara default frontend akan memanggil route berikut:

- `GET /api/b2b/landing-page`
- `POST /api/b2b/leads`

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
