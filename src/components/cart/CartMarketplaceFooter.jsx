import { ChevronRight } from 'lucide-react'

export default function CartMarketplaceFooter({
  language,
  totalLabel,
  itemCount = 0,
  buttonLabel,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  icon: Icon = ChevronRight,
}) {
  const countSuffix =
    itemCount > 0
      ? language === 'en'
        ? ` (${itemCount})`
        : ` (${itemCount})`
      : ''

  return (
    <footer className="cart-marketplace-footer">
      <div className="cart-marketplace-footer-inner">
        <div className="cart-marketplace-footer-total">
          <span>{language === 'en' ? 'Total' : 'Total'}</span>
          <strong>{totalLabel}</strong>
          {itemCount > 0 ? (
            <small>
              {language === 'en'
                ? `${itemCount} item${itemCount === 1 ? '' : 's'}`
                : `${itemCount} produk`}
            </small>
          ) : null}
        </div>
        <button
          className="cart-marketplace-footer-cta"
          type={type}
          onClick={onClick}
          disabled={disabled || loading}
        >
          <span>
            {buttonLabel}
            {countSuffix}
          </span>
          <Icon size={18} aria-hidden="true" />
        </button>
      </div>
    </footer>
  )
}
