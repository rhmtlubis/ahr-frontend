import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildGa4ItemFromProduct, trackEcommerceEvent } from './analytics'
import { getApiUrl, getCatalogProductUrl } from './api'
import { useCart } from './cart.jsx'
import {
  isProductAvailableForDeepLink,
  parseCartDeepLinkParams,
  pickDeepLinkSize,
  stripCartDeepLinkParams,
} from './cartDeepLink'
import { normalizeProductDetail } from './cmsContent'
import { useLanguage } from './i18n.jsx'

/**
 * Handles Google Merchant Center checkout deep-links:
 *   /cart?item_id={slug}
 * Fetches the product, adds it to the cart (no login required), then strips the query params.
 */
export function useCartMerchantDeepLink() {
  const { language } = useLanguage()
  const { addCartItem } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const processedKeyRef = useRef('')
  const inflightKeyRef = useRef('')
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  useEffect(() => {
    const { itemId, size: requestedSize, quantity, hasDeepLink } = parseCartDeepLinkParams(location.search)

    if (!hasDeepLink) {
      return undefined
    }

    const processKey = `${itemId}|${requestedSize || ''}|${quantity}|${location.pathname}`

    if (processedKeyRef.current === processKey || inflightKeyRef.current === processKey) {
      return undefined
    }

    inflightKeyRef.current = processKey
    const controller = new AbortController()

    setStatus({
      state: 'loading',
      message: language === 'en' ? 'Adding product to cart…' : 'Menambahkan produk ke keranjang…',
    })

    const clearDeepLinkFromUrl = () => {
      const nextSearch = stripCartDeepLinkParams(location.search)

      navigate(
        {
          pathname: location.pathname,
          search: nextSearch,
        },
        { replace: true },
      )
    }

    fetch(getApiUrl(getCatalogProductUrl(itemId, language)), {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(language === 'en' ? 'Product not found' : 'Produk tidak ditemukan')
        }

        return response.json()
      })
      .then((payload) => {
        const product = normalizeProductDetail(payload?.data)

        if (!product?.slug) {
          throw new Error(language === 'en' ? 'Product not found' : 'Produk tidak ditemukan')
        }

        if (!isProductAvailableForDeepLink(product)) {
          throw new Error(
            language === 'en' ? 'This product is currently out of stock' : 'Produk ini sedang habis stok',
          )
        }

        const size = pickDeepLinkSize(product, requestedSize)
        const addedItem = addCartItem(product, {
          size,
          quantity,
          feedback: {},
        })

        if (!addedItem) {
          throw new Error(language === 'en' ? 'Could not add product to cart' : 'Gagal menambahkan produk ke keranjang')
        }

        const ga4Item = buildGa4ItemFromProduct(product, quantity)

        if (ga4Item) {
          trackEcommerceEvent('add_to_cart', {
            currency: product?.pricing?.currency || 'IDR',
            value: ga4Item.price,
            items: [ga4Item],
            source_page: '/cart',
            source: 'merchant_deep_link',
          })
        }

        processedKeyRef.current = processKey
        setStatus({
          state: 'ready',
          message:
            language === 'en'
              ? `${product.name} was added to your cart.`
              : `${product.name} ditambahkan ke keranjang.`,
        })

        clearDeepLinkFromUrl()
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return
        }

        processedKeyRef.current = processKey
        setStatus({
          state: 'error',
          message:
            error?.message ||
            (language === 'en' ? 'Could not add product from this link' : 'Tidak bisa menambahkan produk dari tautan ini'),
        })

        clearDeepLinkFromUrl()
      })
      .finally(() => {
        if (inflightKeyRef.current === processKey) {
          inflightKeyRef.current = ''
        }
      })

    return () => {
      controller.abort()
    }
  }, [addCartItem, language, location.pathname, location.search, navigate])

  return status
}
