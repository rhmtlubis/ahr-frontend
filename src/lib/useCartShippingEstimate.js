import { useEffect, useState } from 'react'
import { fetchCartShippingEstimate } from './cartShippingEstimate'

export default function useCartShippingEstimate(items, language = 'id', exchangeRate = null, storePromo = null) {
  const [estimate, setEstimate] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!Array.isArray(items) || items.length === 0) {
      setEstimate(null)
      setLoading(false)
      return undefined
    }

    let cancelled = false
    setLoading(true)

    fetchCartShippingEstimate(items, language, exchangeRate, storePromo)
      .then((result) => {
        if (!cancelled) {
          setEstimate(result)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [items, language, exchangeRate?.value, exchangeRate?.rate_minor, storePromo?.foreign_display_price_markup_percent])

  return { estimate, loading }
}
