export function scrollToCatalogListingTop(element, behavior = 'smooth') {
  if (typeof window === 'undefined') {
    return
  }

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  if (element?.scrollIntoView) {
    element.scrollIntoView({ behavior, block: 'start' })
    return
  }

  window.scrollTo({ top: 0, left: 0, behavior })
}

export function scrollToCatalogListingTopAfterPaint(element) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToCatalogListingTop(element)
    })
  })
}
