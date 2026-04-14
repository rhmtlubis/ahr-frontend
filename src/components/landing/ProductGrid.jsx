import { Heart } from 'lucide-react'

const products = [
  {
    id: 1,
    name: 'Y-3 SUPERSTAR Shoes',
    category: 'Y-3',
    price: 'Rp.4,200,000.00'
  },
  {
    id: 2,
    name: 'Y-3 Brushed Terry Zip Hoodie',
    category: 'Y-3',
    price: 'Rp.4,700,000.00'
  },
  {
    id: 3,
    name: 'Y-3 REGLI LEATHER Shoes',
    category: 'Y-3',
    price: 'Rp.5,600,000.00'
  },
  {
    id: 4,
    name: 'Y-3 SUPERSTAR Shoes',
    category: 'Y-3',
    price: 'Rp.4,200,000.00'
  },
  {
    id: 5,
    name: 'Y-3 UTILITY BLOCK',
    category: 'Y-3',
    price: 'Rp.5,900,000.00'
  }
]

export default function ProductGrid({ title = "WHAT'S HOT", showFilters = true }) {
  return (
    <section className="product-filter-section">
      <div className="section-container">
        <h2 className="section-title-large">{title}</h2>
        
        {showFilters && (
          <div className="filter-tabs">
            <button className="filter-tab">Y-3 X MOTORSPORT ⚡</button>
            <button className="filter-tab outline">Top Seller ⭐</button>
            <button className="filter-tab outline">New Arrivals ✨</button>
          </div>
        )}

        <div className="product-scroll-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card-compact">
              <div className="product-image-compact">
                <button className="product-wishlist" aria-label="Add to wishlist">
                  <Heart size={18} />
                </button>
              </div>
              <div className="product-info-compact">
                <p className="product-price-compact">{product.price}</p>
                <h3 className="product-name-compact">{product.name}</h3>
                <p className="product-category-compact">{product.category}</p>
              </div>
            </article>
          ))}
        </div>

        <div style={{ textAlign: 'right', marginTop: '24px' }}>
          <a href="#katalog" className="section-link">View all</a>
        </div>
      </div>
    </section>
  )
}
