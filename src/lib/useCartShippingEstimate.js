import { useEffect, useState } from 'react'
import { fetchCartShippingEstimate } from './cartShippingEstimate'

export default function useCartShippingEstimate(items, language = 'id') {
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

    fetchCartShippingEstimate(items, language)
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
  }, [items, language])

  return { estimate, loading }
}
