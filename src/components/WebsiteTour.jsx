import { useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import '../styles/tour.css'

const STORAGE_KEY = 'ahr_tour_completed'
const CART_TOUR_KEY = 'ahr_cart_tour_completed'
const CHECKOUT_TOUR_KEY = 'ahr_checkout_tour_completed'
const TOUR_VERSION = '1'

function hasCompletedTour() {
  try {
    return localStorage.getItem(STORAGE_KEY) === TOUR_VERSION
  } catch {
    return false
  }
}

function markTourCompleted() {
  try {
    localStorage.setItem(STORAGE_KEY, TOUR_VERSION)
  } catch {}
}

function tip(icon, text) {
  return `<div class="tour-tip"><span class="tour-tip-icon">${icon}</span><span>${text}</span></div>`
}

const b2cSteps = [
  {
    element: '#products',
    popover: {
      title: '🛍️ Katalog Produk',
      description: `
        <p>Ini koleksi produk ready-stock kami. Gunakan <strong>filter kategori</strong> di atas untuk menyaring berdasarkan jenis produk.</p>
        ${tip('💡', 'Geser ke kanan untuk melihat lebih banyak, atau klik "Lihat Semua" untuk katalog lengkap.')}
      `,
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '.product-card',
    popover: {
      title: '👕 Detail Produk',
      description: `
        <p>Klik produk mana saja untuk melihat:</p>
        <p>• Foto detail dari berbagai sudut<br>• Pilihan ukuran S hingga 4XL<br>• Harga dan ketersediaan stok</p>
        ${tip('🏷️', 'Produk dengan label "SALE" sedang ada diskon khusus!')}
      `,
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '.header-cart-button',
    popover: {
      title: '🛒 Keranjang Belanja',
      description: `
        <p>Setelah memilih produk dan ukuran, item masuk ke sini. Angka merah menunjukkan jumlah item di keranjang.</p>
        ${tip('✨', 'Checkout mudah — isi data, pilih pengiriman, dan bayar. Pesanan langsung diproses!')}
      `,
      side: 'bottom',
      align: 'end',
    },
  },
  {
    popover: {
      title: '🎉 Selamat Berbelanja!',
      description: `
        <p>Anda siap menjelajahi koleksi kami:</p>
        <p>• Gratis ongkir untuk pembelian tertentu<br>• Pembayaran aman via Midtrans<br>• Konfirmasi otomatis via WhatsApp</p>
        ${tip('❓', 'Klik tombol <strong>?</strong> di pojok kanan bawah kapan saja untuk mengulang tur ini.')}
      `,
      side: 'over',
      align: 'center',
    },
  },
]

const b2bSteps = [
  {
    element: '.header-cta',
    popover: {
      title: '💬 Konsultasi Langsung',
      description: `
        <p>Klik tombol ini untuk <strong>langsung chat</strong> dengan tim sales kami via WhatsApp.</p>
        ${tip('⚡', 'Respon cepat 5-15 menit pada jam kerja (Senin-Sabtu, 08:00-17:00).')}
      `,
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#pricing',
    popover: {
      title: '📦 Paket Harga Grosir',
      description: `
        <p>Paket custom kami mulai dari <strong>20 pcs</strong>. Semakin banyak pesanan, semakin hemat per-unitnya.</p>
        ${tip('💰', 'Termasuk: desain, sablon/sublimasi, dan packaging. Tidak ada biaya tersembunyi.')}
      `,
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#final-cta',
    popover: {
      title: '📋 Form Penawaran Khusus',
      description: `
        <p>Isi form singkat ini untuk mendapatkan <strong>penawaran harga</strong> yang disesuaikan dengan kebutuhan Anda.</p>
        ${tip('📱', 'Tim kami akan menghubungi via WhatsApp dengan penawaran lengkap + sample desain.')}
      `,
      side: 'top',
      align: 'center',
    },
  },
  {
    popover: {
      title: '🤝 Tim Kami Siap Membantu!',
      description: `
        <p>Hubungi kami untuk:</p>
        <p>• Konsultasi desain gratis<br>• Penawaran harga custom<br>• Sample produk<br>• Estimasi produksi & pengiriman</p>
        ${tip('❓', 'Klik tombol <strong>?</strong> di pojok kanan bawah kapan saja untuk mengulang tur ini.')}
      `,
      side: 'over',
      align: 'center',
    },
  },
]

const cartSteps = [
  {
    element: '.cart-item-list',
    popover: {
      title: '📋 Daftar Pesanan Anda',
      description: `
        <p>Ini produk yang sudah Anda pilih. Di sini Anda bisa:</p>
        <p>• Ubah jumlah pesanan<br>• Ganti ukuran<br>• Hapus item yang tidak jadi</p>
        ${tip('💡', 'Pesan lebih dari 1 ukuran? Klik "Ukuran Campur" untuk mengatur distribusi ukuran.')}
      `,
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '.cart-drawer-scroll-zone-promo',
    popover: {
      title: '🚚 Estimasi Ongkir & Promo',
      description: `
        <p>Lihat estimasi ongkos kirim berdasarkan lokasi Anda dan progress menuju <strong>gratis ongkir</strong>.</p>
        ${tip('🎁', 'Tambah sedikit lagi item untuk unlock gratis ongkir! Lihat progress bar-nya.')}
      `,
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '.cart-marketplace-footer',
    popover: {
      title: '✅ Lanjut ke Checkout',
      description: `
        <p>Sudah yakin dengan pesanan? Klik tombol ini untuk lanjut ke pengisian data pengiriman dan pembayaran.</p>
        ${tip('🔒', 'Pembayaran aman & terenkripsi. Didukung oleh Midtrans (bank transfer, e-wallet, kartu kredit).')}
      `,
      side: 'top',
      align: 'center',
    },
  },
]

const checkoutSteps = [
  {
    element: '.checkout-flow-steps',
    popover: {
      title: '📍 Anda Di Sini',
      description: `
        <p>Sekarang di tahap <strong>Checkout</strong>. Tinggal 2 langkah lagi:</p>
        <p>1. Isi data pengiriman<br>2. Bayar — selesai!</p>
        ${tip('⏱️', 'Proses checkout hanya butuh 1-2 menit.')}
      `,
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '.checkout-confirm-main',
    popover: {
      title: '📝 Data Pengiriman',
      description: `
        <p>Lengkapi informasi berikut:</p>
        <p>• <strong>Nama</strong> penerima<br>• <strong>WhatsApp</strong> aktif (untuk konfirmasi & resi)<br>• <strong>Alamat</strong> lengkap pengiriman</p>
        ${tip('📱', 'Pastikan nomor WhatsApp benar — kami kirim update pesanan ke sana.')}
      `,
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '.checkout-confirm-sidebar',
    popover: {
      title: '🧾 Ringkasan & Voucher',
      description: `
        <p>Cek kembali pesanan Anda di sini:</p>
        <p>• Daftar produk & ukuran<br>• Ongkos kirim<br>• Total pembayaran</p>
        ${tip('🎟️', 'Punya kode voucher? Masukkan di kolom voucher untuk dapat diskon tambahan!')}
      `,
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '.checkout-confirm-submit',
    popover: {
      title: '💳 Bayar Sekarang',
      description: `
        <p>Setelah data lengkap dan centang persetujuan, klik tombol ini. Anda akan diarahkan ke halaman pembayaran yang aman.</p>
        ${tip('🔒', 'Tersedia: Transfer Bank, QRIS, GoPay, OVO, ShopeePay, dan Kartu Kredit.')}
      `,
      side: 'top',
      align: 'center',
    },
  },
]

function createDriverConfig(onDestroyed, steps) {
  return {
    showProgress: true,
    animate: true,
    allowHTML: true,
    overlayColor: 'rgba(0, 0, 0, 0.75)',
    stagePadding: 10,
    stageRadius: 10,
    popoverClass: 'ahr-tour-popover',
    nextBtnText: 'Lanjut →',
    prevBtnText: '← Kembali',
    doneBtnText: 'Selesai ✓',
    progressText: 'Langkah {{current}} dari {{total}}',
    onDestroyed,
    steps,
  }
}

export function startTour(forceChoice = true) {
  if (forceChoice) {
    showChoiceModal()
  }
}

function showChoiceModal() {
  const overlay = document.createElement('div')
  overlay.className = 'ahr-tour-choice-overlay'
  overlay.innerHTML = `
    <div class="ahr-tour-choice-modal">
      <div class="ahr-tour-choice-header">
        <h2>👋 Hai, selamat datang!</h2>
        <p>Bantu kami mengarahkan Anda ke tempat yang tepat. Apa tujuan Anda hari ini?</p>
      </div>
      <div class="ahr-tour-choice-options">
        <button class="ahr-tour-choice-btn" data-choice="b2c">
          <span class="ahr-tour-choice-icon">🛒</span>
          <span class="ahr-tour-choice-text">
            <span class="ahr-tour-choice-label">Beli Satuan / Retail</span>
            <span class="ahr-tour-choice-desc">Saya ingin beli produk langsung dari katalog untuk pemakaian pribadi atau tim kecil</span>
          </span>
        </button>
        <button class="ahr-tour-choice-btn" data-choice="b2b">
          <span class="ahr-tour-choice-icon">🏢</span>
          <span class="ahr-tour-choice-text">
            <span class="ahr-tour-choice-label">Custom / Grosir / Korporat</span>
            <span class="ahr-tour-choice-desc">Saya butuh produk custom dengan desain sendiri atau order dalam jumlah besar (20+ pcs)</span>
          </span>
        </button>
      </div>
      <button class="ahr-tour-choice-skip">Tidak, terima kasih — saya sudah tahu</button>
    </div>
  `

  document.body.appendChild(overlay)
  requestAnimationFrame(() => overlay.classList.add('visible'))

  function cleanup() {
    overlay.classList.remove('visible')
    setTimeout(() => overlay.remove(), 300)
  }

  overlay.querySelector('[data-choice="b2c"]').addEventListener('click', () => {
    cleanup()
    const d = driver(createDriverConfig(markTourCompleted, b2cSteps))
    setTimeout(() => d.drive(), 350)
  })

  overlay.querySelector('[data-choice="b2b"]').addEventListener('click', () => {
    cleanup()
    const d = driver(createDriverConfig(markTourCompleted, b2bSteps))
    setTimeout(() => d.drive(), 350)
  })

  overlay.querySelector('.ahr-tour-choice-skip').addEventListener('click', () => {
    cleanup()
    markTourCompleted()
  })

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      cleanup()
      markTourCompleted()
    }
  })
}

function hasCompletedCartTour() {
  try {
    return localStorage.getItem(CART_TOUR_KEY) === TOUR_VERSION
  } catch {
    return false
  }
}

function markCartTourCompleted() {
  try {
    localStorage.setItem(CART_TOUR_KEY, TOUR_VERSION)
  } catch {}
}

function hasCompletedCheckoutTour() {
  try {
    return localStorage.getItem(CHECKOUT_TOUR_KEY) === TOUR_VERSION
  } catch {
    return false
  }
}

function markCheckoutTourCompleted() {
  try {
    localStorage.setItem(CHECKOUT_TOUR_KEY, TOUR_VERSION)
  } catch {}
}

export function startCartTour() {
  const d = driver(createDriverConfig(markCartTourCompleted, cartSteps))
  d.drive()
}

export function startCheckoutTour() {
  const d = driver(createDriverConfig(markCheckoutTourCompleted, checkoutSteps))
  d.drive()
}

export function CartTour({ isCheckoutStep = false }) {
  const cartTriggered = useRef(false)
  const checkoutTriggered = useRef(false)

  useEffect(() => {
    if (!isCheckoutStep) {
      if (cartTriggered.current) return
      if (hasCompletedCartTour()) return
      cartTriggered.current = true
      const timer = setTimeout(() => startCartTour(), 1500)
      return () => clearTimeout(timer)
    } else {
      if (checkoutTriggered.current) return
      if (hasCompletedCheckoutTour()) return
      checkoutTriggered.current = true
      const timer = setTimeout(() => startCheckoutTour(), 1500)
      return () => clearTimeout(timer)
    }
  }, [isCheckoutStep])

  return null
}

export default function WebsiteTour() {
  const hasTriggered = useRef(false)

  useEffect(() => {
    if (hasTriggered.current) return
    if (hasCompletedTour()) return
    hasTriggered.current = true

    const timer = setTimeout(() => startTour(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  return null
}
