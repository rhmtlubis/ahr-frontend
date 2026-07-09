import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ShoppingBag } from 'lucide-react'
import CartTrustShippingPanel from './CartTrustShippingPanel'
import FreeShippingProgressBar from './FreeShippingProgressBar'
import CheckoutFlowSteps from './CheckoutFlowSteps'
import MarketplacePageTopbar from './MarketplacePageTopbar'
import CartMarketplaceFooter from './CartMarketplaceFooter'
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
  shippingEstimate,
  shippingEstimateLoading,
  storePromo,
  promoCartTotals = null,
}) {
  const totalLabel = checkoutTotals?.grandTotalLabel || cartTotals?.netLabel || '—'

  return (
    <div className="cart-drawer-page">
      <header className="cart-drawer-header">
        <MarketplacePageTopbar
          backTo="/all-products"
          backLabel={t('cart.backToProducts')}
          title={t('cart.cartDrawerTitle')}
        />
        <CheckoutFlowSteps language={language} currentStep="cart" />
      </header>

      <div className="cart-drawer-body">
        <div className="cart-drawer-scroll-zone cart-drawer-scroll-zone-items">
          <div className="cart-drawer-zone-head">
            <div>
              <h2>{t('cart.itemsTitle')}</h2>
              <p className="cart-drawer-zone-hint">{t('cart.itemsSectionHint')}</p>
            </div>
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

        <div className="cart-drawer-scroll-zone cart-drawer-scroll-zone-promo">
          <CartTrustShippingPanel
            compact
            shippingEstimate={shippingEstimate}
            shippingEstimateLoading={shippingEstimateLoading}
          />
          <FreeShippingProgressBar
            storePromo={storePromo}
            cartTotals={cartTotals}
            promoCartTotals={promoCartTotals}
            exchangeRate={itemHandlers.exchangeRate}
          />
        </div>

        <div className="cart-drawer-scroll-zone cart-drawer-scroll-zone-secondary">
          <div className="cart-drawer-secondary-bar">
            <Link className="cart-drawer-continue-link" to="/all-products">
              {t('cart.continueShopping')}
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      <CartMarketplaceFooter
        language={language}
        totalLabel={totalLabel}
        itemCount={itemCount}
        buttonLabel={t('cart.checkoutCta')}
        onClick={onCheckout}
      />
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
