import { Star } from 'lucide-react'
import { useLanguage } from '../../lib/i18n.jsx'

function ProductFeaturedBadge({ className = '' }) {
  const { t } = useLanguage()
  const label = t('catalog.featuredBadge')

  return (
    <span className={className ? `product-featured-badge ${className}` : 'product-featured-badge'} aria-label={label}>
      <Star size={12} fill="currentColor" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}

export default ProductFeaturedBadge
