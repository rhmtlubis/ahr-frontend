export function animateCatalogListingReveal(gsap, rootElement) {
  if (!gsap || !rootElement) {
    return
  }

  const heroTargets = rootElement.querySelectorAll('[data-products-hero]')
  const cardTargets = rootElement.querySelectorAll('[data-products-card]')

  if (heroTargets.length > 0) {
    gsap.fromTo(
      heroTargets,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out' },
    )
  }

  if (cardTargets.length > 0) {
    gsap.fromTo(
      cardTargets,
      { y: 28, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.06,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.14,
      },
    )
  }
}
