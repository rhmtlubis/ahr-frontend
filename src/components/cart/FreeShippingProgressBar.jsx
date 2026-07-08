import { useLanguage } from '../../lib/i18n.jsx'
import { formatCurrencyAmount } from '../../lib/price'
import { getFreeShippingProgress } from '../../lib/storePromo'

export default function FreeShippingProgressBar({
  storePromo,
  cartTotals,
  promoCartTotals = null,
  fulfillment = 'delivery',
}) {
  const { language } = useLanguage()
  const progress = getFreeShippingProgress({
    storePromo,
    cartTotals: promoCartTotals || cartTotals,
    fulfillment,
  })

  if (!progress) {
    return null
  }

  const thresholdLabel = formatCurrencyAmount(progress.threshold, 'IDR', language)

  return (
    <section className="free-shipping-progress" aria-live="polite">
      <div className="free-shipping-progress-copy">
        {progress.qualified ? (
          <strong>
            {language === 'en'
              ? `Free shipping unlocked for orders from ${thresholdLabel}`
              : `Gratis ongkir aktif untuk subtotal dari ${thresholdLabel}`}
          </strong>
        ) : (
          <strong>
            {language === 'en'
              ? `Add ${formatCurrencyAmount(progress.remaining, 'IDR', language)} more for free shipping`
              : `Tambah ${formatCurrencyAmount(progress.remaining, 'IDR', language)} lagi untuk gratis ongkir`}
          </strong>
        )}
        <span>
          {language === 'en'
            ? `Delivery orders · target ${thresholdLabel}`
            : `Pengiriman · target ${thresholdLabel}`}
        </span>
      </div>

      <div
        className={progress.qualified ? 'free-shipping-progress-track is-complete' : 'free-shipping-progress-track'}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.progress}
      >
        <span style={{ width: `${progress.progress}%` }} />
      </div>
    </section>
  )
}
