import { useCallback, useEffect, useRef } from 'react'
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

const welcomeStep = {
  popover: {
    title: 'Selamat Datang di AHR Corporation!',
    description: 'Kami bantu Anda menemukan yang Anda cari. Mari mulai tur singkat untuk memahami website kami.',
    side: 'over',
    align: 'center',
  },
}

const b2cSteps = [
  {
    element: '#products',
    popover: {
      title: 'Katalog Produk',
      description: 'Ini koleksi produk kami. Gunakan filter kategori di atas untuk menemukan yang Anda cari.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '.product-card',
    popover: {
      title: 'Pilih Produk',
      description: 'Klik produk untuk lihat detail, pilihan ukuran, dan harga. Anda bisa langsung order dari sana.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '.header-cart-button',
    popover: {
      title: 'Keranjang Belanja',
      description: 'Produk yang Anda pilih masuk ke sini. Klik untuk review pesanan dan checkout.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    popover: {
      title: 'Selamat Berbelanja!',
      description: 'Anda siap menjelajahi koleksi kami. Jika butuh bantuan, klik tombol WhatsApp kapan saja.',
      side: 'over',
      align: 'center',
    },
  },
]

const b2bSteps = [
  {
    element: '.header-cta',
    popover: {
      title: 'Konsultasi Langsung',
      description: 'Klik tombol ini untuk langsung chat dengan tim kami via WhatsApp. Respon cepat dalam 5-15 menit.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#pricing',
    popover: {
      title: 'Paket Harga Grosir',
      description: 'Lihat paket harga custom kami mulai dari 20 pcs. Semakin banyak, semakin hemat.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#final-cta',
    popover: {
      title: 'Form Penawaran',
      description: 'Isi form ini untuk permintaan penawaran khusus. Tim kami akan menghubungi Anda via WhatsApp.',
      side: 'top',
      align: 'center',
    },
  },
  {
    popover: {
      title: 'Tim Kami Siap Membantu!',
      description: 'Hubungi kami untuk konsultasi gratis. Kami bantu dari desain sampai pengiriman.',
      side: 'over',
      align: 'center',
    },
  },
]

export function startTour(forceChoice = true) {
  const tourDriver = driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(0, 0, 0, 0.75)',
    stagePadding: 8,
    stageRadius: 8,
    popoverClass: 'ahr-tour-popover',
    nextBtnText: 'Lanjut',
    prevBtnText: 'Kembali',
    doneBtnText: 'Selesai',
    progressText: '{{current}} dari {{total}}',
    onDestroyed: () => markTourCompleted(),
    steps: [welcomeStep],
  })

  if (forceChoice) {
    showChoiceModal(tourDriver)
  } else {
    tourDriver.drive()
  }
}

function showChoiceModal(tourDriver) {
  const overlay = document.createElement('div')
  overlay.className = 'ahr-tour-choice-overlay'
  overlay.innerHTML = `
    <div class="ahr-tour-choice-modal">
      <div class="ahr-tour-choice-header">
        <h2>Apa yang Anda cari?</h2>
        <p>Pilih tujuan Anda agar kami bisa mengarahkan ke tempat yang tepat.</p>
      </div>
      <div class="ahr-tour-choice-options">
        <button class="ahr-tour-choice-btn" data-choice="b2c">
          <span class="ahr-tour-choice-icon">🛒</span>
          <span class="ahr-tour-choice-label">Beli Satuan / Retail</span>
          <span class="ahr-tour-choice-desc">Saya ingin beli produk langsung dari katalog</span>
        </button>
        <button class="ahr-tour-choice-btn" data-choice="b2b">
          <span class="ahr-tour-choice-icon">🏢</span>
          <span class="ahr-tour-choice-label">Custom / Grosir / Korporat</span>
          <span class="ahr-tour-choice-desc">Saya butuh produk custom atau order dalam jumlah besar</span>
        </button>
      </div>
      <button class="ahr-tour-choice-skip">Lewati tur ini</button>
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
    const d = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: 'ahr-tour-popover',
      nextBtnText: 'Lanjut',
      prevBtnText: 'Kembali',
      doneBtnText: 'Selesai',
      progressText: '{{current}} dari {{total}}',
      onDestroyed: () => markTourCompleted(),
      steps: b2cSteps,
    })
    setTimeout(() => d.drive(), 350)
  })

  overlay.querySelector('[data-choice="b2b"]').addEventListener('click', () => {
    cleanup()
    const d = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: 'ahr-tour-popover',
      nextBtnText: 'Lanjut',
      prevBtnText: 'Kembali',
      doneBtnText: 'Selesai',
      progressText: '{{current}} dari {{total}}',
      onDestroyed: () => markTourCompleted(),
      steps: b2bSteps,
    })
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

const cartSteps = [
  {
    element: '.cart-item-list',
    popover: {
      title: 'Daftar Produk',
      description: 'Ini produk yang sudah Anda pilih. Anda bisa ubah jumlah, ukuran, atau hapus item di sini.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '.cart-drawer-scroll-zone-promo',
    popover: {
      title: 'Info Ongkir & Promo',
      description: 'Lihat estimasi ongkos kirim dan progress gratis ongkir di sini.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '.cart-marketplace-footer',
    popover: {
      title: 'Checkout',
      description: 'Klik tombol ini untuk lanjut ke halaman checkout dan isi data pengiriman.',
      side: 'top',
      align: 'center',
    },
  },
]

const checkoutSteps = [
  {
    element: '.checkout-flow-steps',
    popover: {
      title: 'Langkah Pemesanan',
      description: 'Anda sekarang di tahap Checkout. Setelah ini tinggal bayar dan pesanan selesai.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '.checkout-confirm-main',
    popover: {
      title: 'Isi Data Anda',
      description: 'Lengkapi nama, email, nomor WhatsApp, dan alamat pengiriman. Pastikan nomor WA aktif untuk menerima konfirmasi pesanan.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '.checkout-confirm-sidebar',
    popover: {
      title: 'Ringkasan Pesanan',
      description: 'Cek kembali produk, ongkir, dan total yang harus dibayar. Anda juga bisa masukkan kode voucher di sini.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '.checkout-confirm-submit',
    popover: {
      title: 'Bayar Sekarang',
      description: 'Setelah data lengkap dan setuju syarat ketentuan, klik tombol ini. Anda akan diarahkan ke halaman pembayaran.',
      side: 'top',
      align: 'center',
    },
  },
]

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
  const d = driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(0, 0, 0, 0.75)',
    stagePadding: 8,
    stageRadius: 8,
    popoverClass: 'ahr-tour-popover',
    nextBtnText: 'Lanjut',
    prevBtnText: 'Kembali',
    doneBtnText: 'Mengerti',
    progressText: '{{current}} dari {{total}}',
    onDestroyed: () => markCartTourCompleted(),
    steps: cartSteps,
  })
  d.drive()
}

export function startCheckoutTour() {
  const d = driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(0, 0, 0, 0.75)',
    stagePadding: 8,
    stageRadius: 8,
    popoverClass: 'ahr-tour-popover',
    nextBtnText: 'Lanjut',
    prevBtnText: 'Kembali',
    doneBtnText: 'Mengerti',
    progressText: '{{current}} dari {{total}}',
    onDestroyed: () => markCheckoutTourCompleted(),
    steps: checkoutSteps,
  })
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
