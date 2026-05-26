import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isCatalogListingPath } from '../../lib/catalogRoutes.js'
import { scrollToCatalogListingTopAfterPaint } from '../../lib/scrollToCatalogListing.js'

export default function RouteScrollManager() {
  const location = useLocation()

  useEffect(() => {
    if (typeof window === 'undefined' || !('scrollRestoration' in window.history)) {
      return undefined
    }

    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    return () => {
      window.history.scrollRestoration = previous
    }
  }, [])

  useEffect(() => {
    if (location.hash) {
      return
    }

    if (isCatalogListingPath(location.pathname)) {
      scrollToCatalogListingTopAfterPaint(null, { behavior: 'auto' })
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.search, location.key, location.hash])

  return null
}
