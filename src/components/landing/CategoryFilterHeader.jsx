import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../lib/i18n.jsx'

function formatCategoryTitle(activeCategoryLabel, t) {
  if (!activeCategoryLabel || activeCategoryLabel === t('common.allCollections')) {
    return t('category.titleAll')
  }

  return t('category.titleByCategory', { label: activeCategoryLabel }).toUpperCase()
}

export default function CategoryFilterHeader({
  categories = [],
  activeCategoryId = 'all',
  activeCategoryLabel = 'Semua Koleksi',
  productCount = 0,
  onCategorySelect,
  getCategoryHref,
}) {
  const { t } = useLanguage()
  const rootRef = useRef(null)

  useEffect(() => {
    if (!rootRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const context = gsap.context(() => {
      gsap.from('[data-category-card]', {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'transform',
      })
    }, rootRef)

    return () => context.revert()
  }, [categories])

  return (
    <section className="category-filter-header" ref={rootRef}>
      <div className="category-filter-heading" data-category-card>
        <div className="category-filter-title-row">
          <h2>{formatCategoryTitle(activeCategoryLabel, t)}</h2>
          <span className="category-filter-count">[{productCount}]</span>
        </div>
      </div>

      <div className="category-filter-carousel" aria-label={t('category.pickProductCategory')}>
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId
          const categoryHref = getCategoryHref?.(category)

          if (categoryHref) {
            return (
              <Link
                key={category.id}
                className={isActive ? 'category-filter-card active' : 'category-filter-card'}
                to={categoryHref}
                onClick={() => onCategorySelect?.(category.id)}
                aria-current={isActive ? 'page' : undefined}
                data-category-card
              >
                <div className="category-filter-media">
                  <img
                    className="category-filter-image"
                    src={category.image}
                    alt={category.label}
                    style={{ objectPosition: category.position || 'center center' }}
                  />
                </div>
                <div className="category-filter-label-row">
                  <span className="category-filter-label">{category.label}</span>
                  <span className="category-filter-item-count">{category.count}</span>
                </div>
              </Link>
            )
          }

          return (
            <button
              key={category.id}
              className={isActive ? 'category-filter-card active' : 'category-filter-card'}
              type="button"
              onClick={() => onCategorySelect?.(category.id)}
              aria-pressed={isActive}
              data-category-card
            >
              <div className="category-filter-media">
                <img
                  className="category-filter-image"
                  src={category.image}
                  alt={category.label}
                  style={{ objectPosition: category.position || 'center center' }}
                />
              </div>
              <div className="category-filter-label-row">
                <span className="category-filter-label">{category.label}</span>
                <span className="category-filter-item-count">{category.count}</span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
