import { Check, Clock3, LoaderCircle, Truck } from 'lucide-react'
import { formatCurrencyAmount } from '../../lib/price'

function getShippingOptionTitle(option) {
  return [option.courier_name, option.courier_service_name].filter(Boolean).join(' · ')
}

function getCourierCode(option) {
  return String(option.company || option.courier_code || option.courier_name || '—')
    .trim()
    .toUpperCase()
    .slice(0, 6)
}

export default function ShippingOptionPicker({
  options,
  selectedKey,
  onSelect,
  loading = false,
  disabled = false,
  language = 'id',
  currency = 'IDR',
}) {
  const labels = {
    title: language === 'en' ? 'Courier service' : 'Layanan pengiriman',
    loading: language === 'en' ? 'Loading shipping options...' : 'Memuat opsi pengiriman...',
    empty: language === 'en' ? 'Select destination to see couriers' : 'Lengkapi alamat untuk melihat kurir',
    hint: language === 'en' ? 'Choose the service that fits your schedule' : 'Pilih layanan yang sesuai jadwal Anda',
  }

  if (loading) {
    return (
      <div className="cart-shipping-picker" aria-busy="true">
        <div className="cart-shipping-picker-head">
          <Truck size={18} aria-hidden="true" />
          <div>
            <strong>{labels.title}</strong>
            <span>{labels.loading}</span>
          </div>
          <LoaderCircle className="cart-shipping-picker-spinner" size={20} aria-hidden="true" />
        </div>
        <div className="cart-shipping-picker-list">
          {[0, 1, 2].map((index) => (
            <div key={index} className="cart-shipping-option cart-shipping-option-skeleton" aria-hidden="true">
              <span className="cart-shipping-option-badge skeleton" />
              <span className="cart-shipping-option-line skeleton" />
              <span className="cart-shipping-option-line short skeleton" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!options.length) {
    return (
      <div className="cart-shipping-picker cart-shipping-picker-empty">
        <div className="cart-shipping-picker-head">
          <Truck size={18} aria-hidden="true" />
          <div>
            <strong>{labels.title}</strong>
            <span>{labels.empty}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <fieldset className="cart-shipping-picker" disabled={disabled} lang={language === 'en' ? 'en' : 'id'}>
      <legend className="cart-shipping-picker-legend">{labels.title}</legend>
      <p className="cart-shipping-picker-hint">{labels.hint}</p>
      <div className="cart-shipping-picker-list" role="radiogroup" aria-label={labels.title}>
        {options.map((option) => {
          const isSelected = option.key === selectedKey
          const priceLabel = formatCurrencyAmount(option.price, option.currency || currency, language)

          return (
            <label
              key={option.key}
              className={`cart-shipping-option${isSelected ? ' active' : ''}`}
            >
              <input
                type="radio"
                name="shipping-option"
                value={option.key}
                checked={isSelected}
                onChange={() => onSelect(option.key)}
              />
              <div className="cart-shipping-option-body">
                <span className="cart-shipping-option-badge" aria-hidden="true">
                  {getCourierCode(option)}
                </span>
                <span className="cart-shipping-option-copy">
                  <strong>{getShippingOptionTitle(option)}</strong>
                  {option.description ? <span>{option.description}</span> : null}
                  <span className="cart-shipping-option-duration">
                    <Clock3 size={14} aria-hidden="true" />
                    {option.duration}
                  </span>
                </span>
                <span className="cart-shipping-option-check" aria-hidden="true">
                  {isSelected ? <Check size={18} strokeWidth={2.5} /> : null}
                </span>
              </div>
              <span className="cart-shipping-option-price">{priceLabel}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
