import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useCart } from '../../lib/cart.jsx'
import { pulseHeaderCartButton } from '../../lib/cartAddFeedback'
import { useLanguage } from '../../lib/i18n.jsx'

const TOAST_VISIBLE_MS = 3600
const FLY_DURATION_MS = 680

function CartFlyAnimation({ feedback, onComplete }) {
  const [isActive, setIsActive] = useState(false)
  const image = feedback?.item?.product?.image
  const sourceRect = feedback?.sourceRect

  useEffect(() => {
    if (!image || !sourceRect) {
      onComplete()
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pulseHeaderCartButton()
      onComplete()
      return
    }

    pulseHeaderCartButton()

    const frame = window.requestAnimationFrame(() => {
      setIsActive(true)
    })

    const timer = window.setTimeout(onComplete, FLY_DURATION_MS)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [feedback, image, onComplete, sourceRect])

  if (!image || !sourceRect) {
    return null
  }

  const cartButton = document.querySelector('[data-cart-target="header-cart"]')
  const cartRect = cartButton?.getBoundingClientRect()
  const startX = sourceRect.left + sourceRect.width / 2
  const startY = sourceRect.top + sourceRect.height / 2
  const endX = cartRect ? cartRect.left + cartRect.width / 2 : startX
  const endY = cartRect ? cartRect.top + cartRect.height / 2 : startY - 80
  const startSize = Math.min(Math.max(sourceRect.width * 0.34, 52), 72)
  const endSize = 18

  const style = isActive
    ? {
        left: `${endX}px`,
        top: `${endY}px`,
        width: `${endSize}px`,
        height: `${endSize}px`,
        opacity: 0.15,
      }
    : {
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${startSize}px`,
        height: `${startSize}px`,
        opacity: 1,
      }

  return (
    <div className="cart-fly-layer" aria-hidden="true">
      <div className="cart-fly-item" style={style}>
        <img src={image} alt="" />
      </div>
    </div>
  )
}

export default function CartAddFeedback() {
  const { addFeedback, dismissAddFeedback } = useCart()
  const { t } = useLanguage()
  const [toastVisible, setToastVisible] = useState(false)
  const [flyFeedback, setFlyFeedback] = useState(null)

  useEffect(() => {
    if (!addFeedback) {
      setToastVisible(false)
      setFlyFeedback(null)
      return
    }

    setToastVisible(true)
    setFlyFeedback(addFeedback)

    const toastTimer = window.setTimeout(() => {
      setToastVisible(false)
      dismissAddFeedback()
    }, TOAST_VISIBLE_MS)

    return () => {
      window.clearTimeout(toastTimer)
    }
  }, [addFeedback, dismissAddFeedback])

  if (!addFeedback) {
    return null
  }

  const { item } = addFeedback
  const product = item?.product

  return (
    <>
      {flyFeedback ? (
        <CartFlyAnimation
          feedback={flyFeedback}
          onComplete={() => setFlyFeedback(null)}
        />
      ) : null}

      <div
        className={toastVisible ? 'cart-add-toast cart-add-toast--visible' : 'cart-add-toast'}
        role="status"
        aria-live="polite"
      >
        <div className="cart-add-toast-icon" aria-hidden="true">
          <Check size={16} />
        </div>
        {product?.image ? (
          <img className="cart-add-toast-image" src={product.image} alt="" />
        ) : null}
        <div className="cart-add-toast-copy">
          <strong>{t('cart.addedToastTitle')}</strong>
          <span>
            {t('cart.addedToastMeta', {
              quantity: item.quantity,
              name: product?.name || 'Produk',
              size: item.size,
            })}
          </span>
        </div>
        <Link className="cart-add-toast-link" to="/cart" onClick={dismissAddFeedback}>
          {t('cart.viewCart')}
        </Link>
      </div>
    </>
  )
}
