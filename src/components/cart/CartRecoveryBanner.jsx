import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, X } from 'lucide-react'
import { useCart } from '../../lib/cart.jsx'
import {
  dismissCartRecoveryBanner,
  shouldShowCartRecoveryBanner,
} from '../../lib/cartRecovery'
import { trackEvent } from '../../lib/analytics'
import { useLanguage } from '../../lib/i18n.jsx'

export default function CartRecoveryBanner() {
  const { items, itemCount } = useCart()
  const { pathname } = useLocation()
  const { language } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const nextVisible = shouldShowCartRecoveryBanner(items, pathname)
    setVisible(nextVisible)

    if (nextVisible) {
      trackEvent('cart_recovery_banner_shown', {
        cart_item_count: itemCount,
        source_page: pathname,
      })
    }
  }, [itemCount, items, pathname])

  if (!visible) {
    return null
  }

  const handleDismiss = () => {
    dismissCartRecoveryBanner(items)
    setVisible(false)
    trackEvent('cart_recovery_banner_dismissed', {
      cart_item_count: itemCount,
      source_page: pathname,
    })
  }

  return (
    <aside className="cart-recovery-banner" role="status" aria-live="polite">
      <div className="cart-recovery-banner-inner">
        <ShoppingBag size={18} aria-hidden="true" />
        <div className="cart-recovery-banner-copy">
          <strong>
            {language === 'en'
              ? `${itemCount} item${itemCount === 1 ? '' : 's'} still in your cart`
              : `${itemCount} item masih di keranjang`}
          </strong>
          <span>
            {language === 'en'
              ? 'Continue checkout before your sizes run out.'
              : 'Lanjutkan checkout sebelum ukuran habis.'}
          </span>
        </div>
        <Link
          className="cart-recovery-banner-cta"
          to="/cart/checkout"
          onClick={() => {
            trackEvent('cart_recovery_banner_click', {
              cart_item_count: itemCount,
              source_page: pathname,
            })
          }}
        >
          {language === 'en' ? 'Checkout' : 'Checkout'}
        </Link>
        <button className="cart-recovery-banner-dismiss" type="button" onClick={handleDismiss} aria-label="Tutup">
          <X size={16} />
        </button>
      </div>
    </aside>
  )
}
