import { Link } from 'react-router-dom'

export default function ArticleCategoryStrip({
  categories = [],
  activeCategoryId = 'all',
  onSelect,
  allLabel,
  getCategoryHref,
  showCounts = true,
}) {
  if (categories.length === 0) {
    return null
  }

  return (
    <div className="css-article-category-strip" role="tablist" aria-label={allLabel}>
      {getCategoryHref ? (
        <Link
          className={activeCategoryId === 'all' ? 'css-article-category-chip is-active' : 'css-article-category-chip'}
          to={getCategoryHref('all')}
          role="tab"
          aria-selected={activeCategoryId === 'all'}
        >
          {allLabel}
        </Link>
      ) : (
        <button
          className={activeCategoryId === 'all' ? 'css-article-category-chip is-active' : 'css-article-category-chip'}
          type="button"
          role="tab"
          aria-selected={activeCategoryId === 'all'}
          onClick={() => onSelect?.('all')}
        >
          {allLabel}
        </button>
      )}

      {categories.map((category) => {
        const label = showCounts ? `${category.label} (${category.count})` : category.label

        if (getCategoryHref) {
          return (
            <Link
              key={category.id}
              className={
                activeCategoryId === category.id ? 'css-article-category-chip is-active' : 'css-article-category-chip'
              }
              to={getCategoryHref(category.id)}
              role="tab"
              aria-selected={activeCategoryId === category.id}
            >
              {label}
            </Link>
          )
        }

        return (
          <button
            key={category.id}
            className={
              activeCategoryId === category.id ? 'css-article-category-chip is-active' : 'css-article-category-chip'
            }
            type="button"
            role="tab"
            aria-selected={activeCategoryId === category.id}
            onClick={() => onSelect?.(category.id)}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
