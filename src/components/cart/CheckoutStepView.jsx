import { Fragment, useState } from 'react'
import { ChevronRight, CreditCard } from 'lucide-react'
import CheckoutPriceBreakdown from '../checkout/CheckoutPriceBreakdown'
import CartTrustShippingPanel from './CartTrustShippingPanel'
import FreeShippingProgressBar from './FreeShippingProgressBar'
import CheckoutFlowSteps from './CheckoutFlowSteps'
import MarketplacePageTopbar from './MarketplacePageTopbar'
import CartMarketplaceFooter from './CartMarketplaceFooter'
import CheckoutTermsAgreement from '../checkout/CheckoutTermsAgreement'
import VoucherCodeField from '../checkout/VoucherCodeField'
import ProductPrice from '../catalog/ProductPrice'
import { getPaymentCurrency } from '../../lib/currency.js'
import renderCartItemRow from './renderCartItemRow'

export default function CheckoutStepView({
  language,
  t,
  items,
  itemCount,
  cartTotals,
  checkoutTotals,
  checkoutChargeTotals,
  exchangeRateNote,
  checkoutForm,
  checkoutItems,
  customerSession,
  canPlaceOrder = false,
  appliedVoucher,
  setAppliedVoucher,
  selectedShippingOption,
  termsAccepted,
  setTermsAccepted,
  termsError,
  setTermsError,
  checkoutStatus,
  setCheckoutStatus,
  handleCheckoutSubmit,
  renderCheckoutForm,
  itemHandlers,
  shippingEstimate,
  shippingEstimateLoading,
  storePromo,
  promoCartTotals = null,
  fulfillment = 'delivery',
  payWithPayPal = false,
  checkoutSubmitLabel = '',
}) {
  const [showAllItems, setShowAllItems] = useState(false)
  const previewItems = showAllItems ? items : items.slice(0, 2)
  const shippingEstimateLabel =
    shippingEstimate?.state === 'ready' && shippingEstimate.priceLabel
      ? language === 'en'
        ? `From ${shippingEstimate.priceLabel}`
        : `Mulai ${shippingEstimate.priceLabel}`
      : null
  const totalLabel = checkoutTotals?.grandTotalLabel || cartTotals?.netLabel || '—'
  const showPaymentCurrencyNote = Boolean(
    exchangeRateNote || (language === 'en' && checkoutTotals?.currency === 'USD'),
  )
  const isSubmitting = checkoutStatus.state === 'loading'
  const submitLabel = checkoutSubmitLabel
    || (isSubmitting ? t('common.submitting') : t('cart.checkoutPlaceOrder'))

  return (
    <form className="checkout-confirm-page checkout-confirm-page--marketplace" onSubmit={handleCheckoutSubmit}>
      <header className="checkout-confirm-topbar">
        <MarketplacePageTopbar
          backTo="/cart"
          backLabel={t('cart.backToCart')}
          title={t('cart.checkoutConfirmTitle')}
        />
        <CheckoutFlowSteps language={language} currentStep="checkout" />
      </header>

      <div className="checkout-confirm-layout">
        <div className="checkout-confirm-main">{renderCheckoutForm()}</div>

        <aside className="checkout-confirm-sidebar">
          <CartTrustShippingPanel
            compact
            shippingEstimate={shippingEstimate}
            shippingEstimateLoading={shippingEstimateLoading}
          />
          <FreeShippingProgressBar
            storePromo={storePromo}
            cartTotals={cartTotals}
            promoCartTotals={promoCartTotals}
            fulfillment={fulfillment}
            exchangeRate={itemHandlers.exchangeRate}
          />
          <section className="checkout-confirm-card">
            <div className="checkout-confirm-card-head">
              <h2>{t('cart.orderSummary')}</h2>
              <span>{t('cart.itemsCount', { count: itemCount })}</span>
            </div>
            <ul className="checkout-confirm-item-list">
              {previewItems.map((item) => (
                <li key={item.id} className="checkout-confirm-item">
                  <img src={item.product.image} alt="" loading="lazy" />
                  <div>
                    <strong>{item.product.name}</strong>
                    <span>
                      {t('common.size')} {item.size} · {t('cart.quantity')}: {item.quantity}
                    </span>
                    <ProductPrice
                      product={item.product}
                      exchangeRate={itemHandlers.exchangeRate}
                      storePromo={storePromo}
                    />
                  </div>
                </li>
              ))}
            </ul>
            {items.length > 2 ? (
              <button
                type="button"
                className="checkout-confirm-more"
                onClick={() => setShowAllItems((value) => !value)}
              >
                {showAllItems
                  ? language === 'en'
                    ? 'Show less'
                    : 'Sembunyikan'
                  : language === 'en'
                    ? `See ${items.length - 2} more`
                    : `Lihat ${items.length - 2} lainnya`}
                <ChevronRight size={14} className={showAllItems ? 'rotated' : ''} />
              </button>
            ) : null}
          </section>

          {canPlaceOrder ? (
            <>
              <div className="cart-form-field">
                <label htmlFor="cart-notes-sidebar">{t('cart.notes')}</label>
                <textarea
                  id="cart-notes-sidebar"
                  rows="2"
                  value={checkoutForm.notes}
                  onChange={(event) => itemHandlers.updateCheckoutForm('notes', event.target.value)}
                  placeholder={
                    language === 'en' ? 'Leave a delivery note (optional)' : 'Catatan pengiriman (opsional)'
                  }
                />
              </div>

              <VoucherCodeField
                language={language}
                locale={language === 'en' ? 'en' : 'id'}
                currency={getPaymentCurrency()}
                fulfillment={checkoutForm.fulfillment}
                shippingFeeAmountMinor={
                  checkoutForm.fulfillment === 'delivery' && selectedShippingOption
                    ? selectedShippingOption.price
                    : 0
                }
                items={itemHandlers.buildVoucherValidateItems(checkoutItems)}
                appliedVoucher={appliedVoucher}
                onApplied={setAppliedVoucher}
                onClear={() => setAppliedVoucher(null)}
                disabled={checkoutStatus.state === 'loading'}
              />
            </>
          ) : null}

          <CheckoutPriceBreakdown
            language={language}
            itemCount={itemCount}
            cartTotals={cartTotals}
            checkoutTotals={checkoutTotals}
            fulfillment={checkoutForm.fulfillment}
            hasShippingSelection={Boolean(selectedShippingOption)}
            shippingEstimateLabel={selectedShippingOption ? null : shippingEstimateLabel}
          />

          {showPaymentCurrencyNote ? (
            <p className="checkout-confirm-payment-note checkout-confirm-payment-note--sidebar">
              {exchangeRateNote || t('cart.internationalPaymentNote')}
            </p>
          ) : null}

          {canPlaceOrder ? (
            <div className="checkout-confirm-checkout-bar checkout-confirm-checkout-bar--desktop">
              <CheckoutTermsAgreement
                checked={termsAccepted}
                onChange={(value) => {
                  setTermsAccepted(value)
                  if (value) {
                    setTermsError('')
                    setCheckoutStatus((current) =>
                      current.state === 'error' ? { state: 'idle', message: '' } : current,
                    )
                  }
                }}
                language={language}
                disabled={checkoutStatus.state === 'loading'}
                error={termsError}
              />
              <button
                className={`cart-drawer-checkout-btn checkout-confirm-submit${payWithPayPal ? ' checkout-confirm-submit--paypal' : ''}`}
                type="submit"
                disabled={checkoutStatus.state === 'loading' || !termsAccepted}
              >
                {!payWithPayPal ? <CreditCard size={18} /> : null}
                <span>{submitLabel}</span>
              </button>
              <p className="checkout-confirm-payment-window">
                {language === 'en'
                  ? 'Complete payment within 24 hours after placing your order.'
                  : 'Selesaikan pembayaran dalam 24 jam setelah order dibuat.'}
              </p>
              <p className="checkout-confirm-legal">
                {language === 'en'
                  ? 'By placing an order you agree to the Terms & Conditions.'
                  : 'Dengan memesan, Anda setuju dengan Syarat & Ketentuan.'}
              </p>
            </div>
          ) : null}
          {checkoutStatus.message ? (
            <p className={`cart-status ${checkoutStatus.state}`}>{checkoutStatus.message}</p>
          ) : null}
        </aside>
      </div>

      {showAllItems && items.length > 2 ? (
        <div className="checkout-confirm-full-items">
          <h2>{t('cart.itemsTitle')}</h2>
          <div className="cart-item-list">
            {items.map((item) => (
              <Fragment key={item.id}>
                {renderCartItemRow({
                  item,
                  language,
                  t,
                  compact: false,
                  ...itemHandlers,
                })}
              </Fragment>
            ))}
          </div>
        </div>
      ) : null}

      {canPlaceOrder ? (
        <div className="checkout-confirm-mobile-actions">
          <div className="checkout-confirm-mobile-actions-inner">
            {showPaymentCurrencyNote ? (
              <p className="checkout-confirm-payment-note checkout-confirm-payment-note--mobile">
                {exchangeRateNote || t('cart.internationalPaymentNote')}
              </p>
            ) : null}
            <CheckoutTermsAgreement
              checked={termsAccepted}
              onChange={(value) => {
                setTermsAccepted(value)
                if (value) {
                  setTermsError('')
                  setCheckoutStatus((current) =>
                    current.state === 'error' ? { state: 'idle', message: '' } : current,
                  )
                }
              }}
              language={language}
              disabled={isSubmitting}
              error={termsError}
            />
            <CartMarketplaceFooter
              language={language}
              totalLabel={totalLabel}
              itemCount={itemCount}
              buttonLabel={submitLabel}
              type="submit"
              disabled={!termsAccepted}
              loading={isSubmitting}
              icon={payWithPayPal ? null : CreditCard}
              buttonClassName={payWithPayPal ? 'checkout-confirm-submit--paypal' : ''}
            />
          </div>
        </div>
      ) : null}
    </form>
  )
}
