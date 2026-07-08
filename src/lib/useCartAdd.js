import { useCallback } from 'react'
import { buildCartAddFeedback } from './cartAddFeedback'
import { useCart } from './cart.jsx'

export function useCartAdd() {
  const { addCartItem } = useCart()

  return useCallback((product, options = {}, event) => {
    const feedback = event ? buildCartAddFeedback(event) : null

    return addCartItem(product, {
      ...options,
      ...(feedback ? { feedback } : {}),
    })
  }, [addCartItem])
}
