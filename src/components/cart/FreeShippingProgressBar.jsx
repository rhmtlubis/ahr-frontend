import { useLanguage } from '../../lib/i18n.jsx'
import { formatIdrMinorForDisplay } from '../../lib/price'
import { getFreeShippingProgress } from '../../lib/storePromo'

export default function FreeShippingProgressBar({
  storePromo,
  cartTotals,
  promoCartTotals = null,
  fulfillment = 'delivery',
  exchangeRate = null,
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

  const thresholdLabel = formatIdrMinorForDisplay(progress.threshold, language, exchangeRate, storePromo)
  const remainingLabel = formatIdrMinorForDisplay(progress.remaining, language, exchangeRate, storePromo)

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
              ? `Add ${remainingLabel} more for free shipping`
              : `Tambah ${remainingLabel} lagi untuk gratis ongkir`}
          </strong>
        )}
        <span>
          {language === 'en'
            ? `Indonesia delivery only · target ${thresholdLabel}`
            : `Hanya pengiriman Indonesia · target ${thresholdLabel}`}
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
