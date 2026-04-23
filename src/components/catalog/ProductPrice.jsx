import { useLanguage } from '../../lib/i18n.jsx'
import { getProductPriceDisplay } from '../../lib/price'

function ProductPrice({ product, variant = 'card' }) {
  const { language } = useLanguage()
  const { currentPrice, originalPrice, promoLabel, hasPromo } = getProductPriceDisplay(product, language)
  const wrapperClassName =
    variant === 'detail' ? 'product-detail-price-stack' : 'product-price-stack'
  const currentPriceClassName =
    variant === 'detail' ? 'product-detail-price-current' : 'product-price-current'
  const originalPriceClassName =
    variant === 'detail' ? 'product-detail-price-original' : 'product-price-original'
  const badgeClassName =
    variant === 'detail' ? 'product-detail-price-discount' : 'product-price-discount'

  if (!currentPrice) {
    return null
  }

  return (
    <div className={wrapperClassName}>
      <span className={currentPriceClassName}>{currentPrice}</span>
      {hasPromo ? (
        <div className="product-price-meta">
          {originalPrice ? <span className={originalPriceClassName}>{originalPrice}</span> : null}
          {promoLabel ? <span className={badgeClassName}>{promoLabel}</span> : null}
        </div>
      ) : null}
    </div>
  )
}

export default ProductPrice
