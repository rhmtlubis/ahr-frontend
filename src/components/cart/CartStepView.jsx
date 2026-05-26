import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, ShieldCheck, ShoppingBag, CreditCard } from 'lucide-react'
import CheckoutPriceBreakdown from '../checkout/CheckoutPriceBreakdown'
import renderCartItemRow from './renderCartItemRow'

export default function CartStepView({
  language,
  t,
  items,
  itemCount,
  cartTotals,
  checkoutTotals,
  clearCart,
  onCheckout,
  itemHandlers,
}) {
  return (
    <div className="cart-drawer-page">
      <header className="cart-drawer-header">
        <div className="all-products-breadcrumb">
          <Link to="/all-products">
            <ArrowLeft size={16} />
            <span>{t('cart.backToProducts')}</span>
          </Link>
        </div>
        <h1>{t('cart.cartDrawerTitle')}</h1>
        <p>{t('cart.body')}</p>
      </header>

      <div className="cart-drawer-body">
        <div className="cart-drawer-scroll-zone cart-drawer-scroll-zone-items">
          <div className="cart-drawer-zone-head">
            <h2>{t('cart.itemsTitle')}</h2>
            <button className="cart-clear-button" type="button" onClick={clearCart}>
              {t('cart.clearCart')}
            </button>
          </div>
          <div className="cart-item-list cart-item-list-compact">
            {items.map((item) => (
              <Fragment key={item.id}>
                {renderCartItemRow({
                  item,
                  language,
                  t,
                  compact: true,
                  ...itemHandlers,
                })}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="cart-drawer-scroll-zone cart-drawer-scroll-zone-secondary">
          <ul className="cart-drawer-trust">
            <li>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{language === 'en' ? 'Secure payment' : 'Pembayaran aman'}</span>
            </li>
            <li>
              <CreditCard size={16} aria-hidden="true" />
              <span>{language === 'en' ? 'Midtrans gateway' : 'Gateway Midtrans'}</span>
            </li>
          </ul>
          <div className="cart-drawer-continue">
            <span>{language === 'en' ? 'Keep shopping' : 'Lanjut belanja'}</span>
            <Link to="/all-products">
              {t('cart.continueShopping')}
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <footer className="cart-drawer-footer">
        <CheckoutPriceBreakdown
          language={language}
          itemCount={itemCount}
          cartTotals={cartTotals}
          checkoutTotals={checkoutTotals}
          fulfillment="delivery"
          hasShippingSelection={false}
          compact
        />
        <button className="cart-drawer-checkout-btn" type="button" onClick={onCheckout}>
          <span>{language === 'en' ? 'Checkout' : 'Checkout'}</span>
          <ChevronRight size={18} />
        </button>
      </footer>
    </div>
  )
}

export function CartEmptyView({ language, t }) {
  return (
    <section className="content-block section-soft">
      <div className="cart-empty-state">
        <ShoppingBag size={28} />
        <h2>{t('cart.emptyTitle')}</h2>
        <p>{t('cart.emptyBody')}</p>
        <Link className="cta-button cta-button-dark" to="/all-products">
          {t('cart.continueShopping')}
        </Link>
      </div>
    </section>
  )
}
