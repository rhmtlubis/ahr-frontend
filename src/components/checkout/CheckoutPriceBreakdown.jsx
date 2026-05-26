import { formatCurrencyAmount } from '../../lib/price'

/**
 * Urutan rincian harga seperti marketplace: subtotal → promo → nett → ongkir → voucher → total.
 */
export default function CheckoutPriceBreakdown({
  language,
  itemCount = 0,
  cartTotals,
  checkoutTotals,
  fulfillment = 'delivery',
  hasShippingSelection = false,
  compact = false,
}) {
  const currency = checkoutTotals?.currency || cartTotals?.currency || (language === 'en' ? 'USD' : 'IDR')
  const rows = []

  rows.push({
    key: 'subtotal-count',
    label:
      language === 'en'
        ? `Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`
        : `Subtotal (${itemCount} barang)`,
    value: cartTotals?.originalLabel || '—',
    tone: 'default',
  })

  if (cartTotals?.discountAmount > 0) {
    rows.push({
      key: 'promo',
      label: language === 'en' ? 'Product discount' : 'Diskon produk',
      value: cartTotals.discountDisplayLabel,
      tone: 'discount',
    })
  }

  rows.push({
    key: 'nett',
    label: language === 'en' ? 'Products total' : 'Total produk',
    value: cartTotals?.netLabel || '—',
    tone: 'emphasis',
  })

  if (checkoutTotals?.orderVoucherDiscountLabel) {
    rows.push({
      key: 'voucher-product',
      label: language === 'en' ? 'Voucher (products)' : 'Potongan voucher produk',
      value: checkoutTotals.orderVoucherDiscountLabel,
      tone: 'discount',
    })
  }

  if (fulfillment === 'delivery') {
    rows.push({
      key: 'shipping',
      label: language === 'en' ? 'Shipping' : 'Pengiriman',
      value: hasShippingSelection
        ? checkoutTotals.shippingLabel
        : language === 'en'
          ? 'Select on checkout'
          : 'Pilih di checkout',
      tone: 'default',
    })
  }

  if (checkoutTotals?.shippingVoucherDiscountLabel) {
    rows.push({
      key: 'voucher-shipping',
      label: language === 'en' ? 'Shipping discount' : 'Diskon pengiriman',
      value: checkoutTotals.shippingVoucherDiscountLabel,
      tone: 'discount',
    })
  }

  const totalLabel = checkoutTotals?.grandTotalLabel || cartTotals?.netLabel || '—'

  return (
    <div className={`checkout-price-breakdown ${compact ? 'checkout-price-breakdown-compact' : ''}`}>
      <ul className="checkout-price-breakdown-list">
        {rows.map((row) => (
          <li key={row.key} className={`checkout-price-breakdown-row checkout-price-breakdown-row-${row.tone}`}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </li>
        ))}
      </ul>
      <div className="checkout-price-breakdown-total">
        <span>{language === 'en' ? 'Total payment' : 'Total pembayaran'}</span>
        <strong>{totalLabel}</strong>
      </div>
    </div>
  )
}

export function formatLinePrice(item, language) {
  const pricing = item.product?.pricing || {}
  const currency =
    (pricing.is_estimated ? pricing.source_currency : pricing.currency) ||
    pricing.source_currency ||
    (language === 'en' ? 'USD' : 'IDR')

  if (Number.isFinite(pricing.final_amount_minor)) {
    return formatCurrencyAmount(pricing.final_amount_minor * item.quantity, currency, language)
  }

  const { currentPrice } = item.product?.price ? { currentPrice: item.product.price } : { currentPrice: item.product?.bestPrice }
  return currentPrice || '—'
}
