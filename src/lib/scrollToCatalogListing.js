export function scrollToCatalogListingTop(element, behavior = 'smooth') {
  if (typeof window === 'undefined') {
    return
  }

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  const target = element ?? document.getElementById('catalog-results')

  if (target?.scrollIntoView) {
    target.scrollIntoView({ behavior, block: 'start' })
    return
  }

  window.scrollTo({ top: 0, left: 0, behavior })
}

export function scrollToCatalogListingTopAfterPaint(element, options = {}) {
  const { behavior = 'smooth', maxAttempts = 16 } = options
  let attempts = 0

  const run = () => {
    attempts += 1
    const target = element ?? document.getElementById('catalog-results')

    if (target) {
      scrollToCatalogListingTop(target, behavior)
      return
    }

    if (attempts < maxAttempts) {
      requestAnimationFrame(run)
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior })
  }

  requestAnimationFrame(run)
}
