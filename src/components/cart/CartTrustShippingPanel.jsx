import { LoaderCircle, MapPin, ShieldCheck, Truck } from 'lucide-react'
import { getCartShippingNote, getCartTrustItems } from '../../lib/cartTrustContent'
import { useLanguage } from '../../lib/i18n.jsx'

export default function CartTrustShippingPanel({ shippingEstimate, shippingEstimateLoading = false, compact = false }) {
  const { language } = useLanguage()
  const items = getCartTrustItems(language)
  const shippingNote = getCartShippingNote(language)

  const estimateTitle =
    language === 'en' ? 'Estimated shipping (Jabodetabek sample)' : 'Estimasi ongkir (contoh Jabodetabek)'

  let estimateValue = language === 'en' ? 'Calculated at checkout' : 'Dihitung di checkout'

  if (shippingEstimateLoading) {
    estimateValue = language === 'en' ? 'Calculating...' : 'Menghitung...'
  } else if (shippingEstimate?.state === 'ready' && shippingEstimate.priceLabel) {
    estimateValue = language === 'en' ? `From ${shippingEstimate.priceLabel}` : `Mulai ${shippingEstimate.priceLabel}`
  }

  return (
    <section className={compact ? 'cart-trust-shipping-panel cart-trust-shipping-panel--compact' : 'cart-trust-shipping-panel'}>
      <div className="cart-trust-shipping-panel-trust">
        <p className="cart-trust-shipping-panel-kicker">
          {language === 'en' ? 'Why shop with us' : 'Alasan belanja di sini'}
        </p>
        <ul className="cart-trust-shipping-panel-list">
          {items.map((item) => (
            <li key={item.id}>
              <ShieldCheck size={15} aria-hidden="true" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="cart-trust-shipping-panel-shipping">
        <div className="cart-trust-shipping-panel-shipping-head">
          <Truck size={16} aria-hidden="true" />
          <strong>{estimateTitle}</strong>
          {shippingEstimateLoading ? <LoaderCircle className="cart-shipping-picker-spinner" size={16} /> : null}
        </div>
        <p className="cart-trust-shipping-panel-shipping-value">{estimateValue}</p>
        {shippingEstimate?.destinationLabel ? (
          <p className="cart-trust-shipping-panel-shipping-meta">
            <MapPin size={14} aria-hidden="true" />
            <span>{shippingEstimate.destinationLabel}</span>
          </p>
        ) : null}
        {shippingEstimate?.courierName && shippingEstimate?.duration ? (
          <p className="cart-trust-shipping-panel-shipping-meta">
            <span>
              {shippingEstimate.courierName}
              {shippingEstimate.duration ? ` · ${shippingEstimate.duration}` : ''}
            </span>
          </p>
        ) : null}
        <p className="cart-trust-shipping-panel-note">{shippingNote}</p>
      </div>
    </section>
  )
}
