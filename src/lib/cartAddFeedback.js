export function resolveCartAddSourceRect(event) {
  if (!event?.currentTarget) {
    return null
  }

  const card = event.currentTarget.closest?.('.product-card, .product-detail-hero, .product-detail-panel')

  const image = card?.querySelector?.(
    '.product-image-primary, .product-detail-thumb img, .product-image',
  )

  if (image?.getBoundingClientRect) {
    return image.getBoundingClientRect()
  }

  const buttonRect = event.currentTarget.getBoundingClientRect?.()

  return buttonRect || null
}

export function buildCartAddFeedback(event) {
  const sourceRect = resolveCartAddSourceRect(event)

  if (!sourceRect) {
    return null
  }

  return { sourceRect }
}

export function pulseHeaderCartButton() {
  const cartButton = document.querySelector('[data-cart-target="header-cart"]')

  if (!cartButton) {
    return
  }

  cartButton.classList.remove('header-cart-button--pulse')
  void cartButton.offsetWidth
  cartButton.classList.add('header-cart-button--pulse')
}
