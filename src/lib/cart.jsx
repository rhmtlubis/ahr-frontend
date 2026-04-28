/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CART_STORAGE_KEY = 'ahr-cart-v1'
const DEFAULT_PRODUCT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

function normalizeQuantity(value) {
  const parsedQuantity = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
    return 1
  }

  return Math.min(parsedQuantity, 999)
}

function getCartItemId(productSlug, size) {
  return `${productSlug || 'product'}-${size || 'M'}`
}

function normalizeProductSnapshot(product = {}) {
  const slug = product.slug || product.id

  if (!slug) {
    return null
  }

  return {
    id: product.id || slug,
    slug,
    name: product.name || 'Produk AHR',
    category: product.category || '',
    audience: product.audience || '',
    image: product.image || product.gallery?.[0] || '',
    imagePosition: product.imagePosition || 'center center',
    price: product.price || '',
    originalPrice: product.originalPrice || null,
    bestPrice: product.bestPrice || null,
    promoBadge: product.promoBadge || null,
    hasPromo: Boolean(product.hasPromo),
    pricing: product.pricing || null,
    detail: product.detail || '',
    color: product.color || '',
    availability: product.availability || '',
    sizeStock: product.sizeStock || product.size_stock || null,
  }
}

function normalizeCartItem(item) {
  const product = normalizeProductSnapshot(item?.product || item)

  if (!product) {
    return null
  }

  const size = item?.size || 'M'

  return {
    id: item?.id || getCartItemId(product.slug, size),
    product,
    size,
    quantity: normalizeQuantity(item?.quantity),
    addedAt: item?.addedAt || new Date().toISOString(),
  }
}

function createCartItem(product, options = {}) {
  const productSnapshot = normalizeProductSnapshot(product)

  if (!productSnapshot) {
    return null
  }

  const size = options.size || 'M'

  return {
    id: getCartItemId(productSnapshot.slug, size),
    product: productSnapshot,
    size,
    quantity: normalizeQuantity(options.quantity),
    addedAt: new Date().toISOString(),
  }
}

function readStoredCart() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY)
    const parsedCart = storedCart ? JSON.parse(storedCart) : []

    return Array.isArray(parsedCart) ? parsedCart.map(normalizeCartItem).filter(Boolean) : []
  } catch {
    return []
  }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStoredCart())

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Cart still works in memory if browser storage is blocked.
    }
  }, [items])

  const addCartItem = useCallback((product, options = {}) => {
    const nextItem = createCartItem(product, options)

    if (!nextItem) {
      return null
    }

    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex((item) => item.id === nextItem.id)

      if (existingItemIndex === -1) {
        return [nextItem, ...currentItems]
      }

      return currentItems.map((item, index) =>
        index === existingItemIndex
          ? {
              ...item,
              product: nextItem.product,
              quantity: normalizeQuantity(item.quantity + nextItem.quantity),
              addedAt: nextItem.addedAt,
            }
          : item,
      )
    })

    return nextItem
  }, [])

  const updateCartItemQuantity = useCallback((itemId, quantity) => {
    const nextQuantity = Number.parseInt(quantity, 10)

    setItems((currentItems) => {
      if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
        return currentItems.filter((item) => item.id !== itemId)
      }

      return currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity: normalizeQuantity(nextQuantity) } : item,
      )
    })
  }, [])

  const updateCartItemSize = useCallback((itemId, size) => {
    const nextSize = String(size || 'M').trim() || 'M'

    setItems((currentItems) => {
      const currentItem = currentItems.find((item) => item.id === itemId)

      if (!currentItem) {
        return currentItems
      }

      const nextItemId = getCartItemId(currentItem.product.slug, nextSize)

      if (nextItemId === itemId) {
        return currentItems
      }

      const targetItem = currentItems.find((item) => item.id === nextItemId)

      if (!targetItem) {
        return currentItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                id: nextItemId,
                size: nextSize,
              }
            : item,
        )
      }

      return currentItems
        .filter((item) => item.id !== itemId)
        .map((item) =>
          item.id === nextItemId
            ? {
                ...item,
                quantity: normalizeQuantity(item.quantity + currentItem.quantity),
              }
            : item,
        )
    })
  }, [])

  const distributeCartItemSizes = useCallback((itemId, sizes) => {
    setItems((currentItems) => {
      const currentItem = currentItems.find((item) => item.id === itemId)

      if (!currentItem) {
        return currentItems
      }

      const normalizedSizes = Array.isArray(sizes)
        ? sizes
            .map((size) => String(size || currentItem.size || 'M').trim() || currentItem.size || 'M')
            .filter(Boolean)
        : []

      if (normalizedSizes.length === 0) {
        return currentItems
      }

      const sizeCounts = normalizedSizes.reduce((counts, size) => {
        counts[size] = (counts[size] || 0) + 1

        return counts
      }, {})
      const remainingItems = currentItems.filter((item) => item.id !== itemId)
      const nextItems = remainingItems.map((item) => {
        const extraQuantity = item.product.slug === currentItem.product.slug ? sizeCounts[item.size] || 0 : 0

        if (extraQuantity < 1) {
          return item
        }

        delete sizeCounts[item.size]

        return {
          ...item,
          product: currentItem.product,
          quantity: normalizeQuantity(item.quantity + extraQuantity),
          addedAt: new Date().toISOString(),
        }
      })

      Object.entries(sizeCounts).forEach(([size, quantity]) => {
        nextItems.unshift({
          ...currentItem,
          id: getCartItemId(currentItem.product.slug, size),
          size,
          quantity: normalizeQuantity(quantity),
          addedAt: new Date().toISOString(),
        })
      })

      return nextItems
    })
  }, [])

  const removeCartItem = useCallback((itemId) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== itemId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      uniqueItemCount: items.length,
      addCartItem,
      updateCartItemQuantity,
      updateCartItemSize,
      distributeCartItemSizes,
      removeCartItem,
      clearCart,
    }),
    [addCartItem, clearCart, distributeCartItemSizes, items, removeCartItem, updateCartItemQuantity, updateCartItemSize],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }

  return context
}

export function getProductSizeOptions(product) {
  if (Array.isArray(product?.sizeOptions) && product.sizeOptions.length > 0) {
    return [...new Set(product.sizeOptions.map((size) => String(size).trim()).filter(Boolean))]
  }

  if (product?.sizeStock && typeof product.sizeStock === 'object') {
    const stockSizes = Object.keys(product.sizeStock).filter(Boolean)

    if (stockSizes.length > 0) {
      return stockSizes
    }
  }

  return DEFAULT_PRODUCT_SIZES
}
