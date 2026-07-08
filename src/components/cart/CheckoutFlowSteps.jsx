import { Check } from 'lucide-react'

const STEPS = [
  { id: 'cart', labelId: 'Keranjang', labelEn: 'Cart' },
  { id: 'checkout', labelId: 'Checkout', labelEn: 'Checkout' },
  { id: 'payment', labelId: 'Pembayaran', labelEn: 'Payment' },
]

export default function CheckoutFlowSteps({ language, currentStep = 'cart' }) {
  const currentIndex = STEPS.findIndex((step) => step.id === currentStep)

  return (
    <nav className="checkout-flow-steps" aria-label={language === 'en' ? 'Checkout progress' : 'Langkah belanja'}>
      <ol className="checkout-flow-steps-list">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex
          const isActive = index === currentIndex
          const label = language === 'en' ? step.labelEn : step.labelId

          return (
            <li
              key={step.id}
              className={`checkout-flow-step${isActive ? ' is-active' : ''}${isComplete ? ' is-complete' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="checkout-flow-step-marker" aria-hidden="true">
                {isComplete ? <Check size={14} strokeWidth={3} /> : index + 1}
              </span>
              <span className="checkout-flow-step-label">{label}</span>
              {index < STEPS.length - 1 ? <span className="checkout-flow-step-line" aria-hidden="true" /> : null}
            </li>
          )
        })}
      </ol>
      <p className="checkout-flow-steps-hint">
        {currentStep === 'cart'
          ? language === 'en'
            ? 'Review items and sizes before continuing.'
            : 'Cek produk & ukuran dulu, lalu lanjut checkout.'
          : currentStep === 'checkout'
            ? language === 'en'
              ? 'Fill in address and shipping, then place your order.'
              : 'Isi alamat & pengiriman, lalu buat pesanan.'
            : language === 'en'
              ? 'Complete payment to confirm your order.'
              : 'Selesaikan pembayaran untuk konfirmasi pesanan.'}
      </p>
    </nav>
  )
}
