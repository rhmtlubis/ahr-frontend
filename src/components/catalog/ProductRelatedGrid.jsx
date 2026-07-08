import { Link } from 'react-router-dom'
import ProductFeaturedBadge from './ProductFeaturedBadge'
import ProductPrice from './ProductPrice'
import { useLanguage } from '../../lib/i18n.jsx'

export default function ProductRelatedGrid({ products = [] }) {
  const { t } = useLanguage()
  const visibleProducts = products.slice(0, 4)

  if (visibleProducts.length === 0) {
    return null
  }

  return (
    <section className="product-related-section" aria-label={t('productDetail.relatedTitle')}>
      <div className="product-related-header">
        <span>{t('productDetail.relatedEyebrow')}</span>
        <h2>{t('productDetail.relatedTitle')}</h2>
      </div>

      <div className="product-related-grid">
        {visibleProducts.map((product) => (
          <article className={`product-card all-products-card tone-${product.tone || 'neutral'}`} key={product.slug}>
            <Link className="product-card-link" to={`/produk/${product.slug}`} state={{ product }}>
              <div className="product-media">
                {product.isFeatured ? <ProductFeaturedBadge /> : null}
                {product.image ? (
                  <img
                    className="product-image product-image-primary"
                    src={product.image}
                    alt={product.name}
                    width="800"
                    height="1000"
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: product.imagePosition || 'center center' }}
                  />
                ) : null}
                {product.gallery?.[1] ? (
                  <img
                    className="product-image product-image-hover"
                    src={product.gallery[1]}
                    alt={`${product.name} alternate`}
                    width="800"
                    height="1000"
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: product.imagePosition || 'center center' }}
                  />
                ) : null}
              </div>

              <div className="product-body">
                {product.category ? <p className="product-card-meta">{product.category}</p> : null}
                <h3 className="product-card-name">{product.name}</h3>
                <ProductPrice product={product} />
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
