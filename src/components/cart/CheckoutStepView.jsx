import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, CreditCard } from 'lucide-react'
import CheckoutPriceBreakdown from '../checkout/CheckoutPriceBreakdown'
import CheckoutTermsAgreement from '../checkout/CheckoutTermsAgreement'
import VoucherCodeField from '../checkout/VoucherCodeField'
import ProductPrice from '../catalog/ProductPrice'
import renderCartItemRow from './renderCartItemRow'

export default function CheckoutStepView({
  language,
  t,
  items,
  itemCount,
  cartTotals,
  checkoutTotals,
  checkoutForm,
  checkoutItems,
  customerSession,
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
}) {
  const [showAllItems, setShowAllItems] = useState(false)
  const previewItems = showAllItems ? items : items.slice(0, 2)

  return (
    <form className="checkout-confirm-page" onSubmit={handleCheckoutSubmit}>
      <header className="checkout-confirm-topbar">
        <Link className="checkout-confirm-back" to="/cart">
          <ArrowLeft size={18} />
          <span>{language === 'en' ? 'Back to cart' : 'Kembali ke keranjang'}</span>
        </Link>
        <h1>{t('cart.checkoutConfirmTitle')}</h1>
      </header>

      <div className="checkout-confirm-layout">
        <div className="checkout-confirm-main">{renderCheckoutForm()}</div>

        <aside className="checkout-confirm-sidebar">
          <section className="checkout-confirm-card">
            <div className="checkout-confirm-card-head">
              <h2>{language === 'en' ? 'Order summary' : 'Ringkasan pesanan'}</h2>
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
                    <ProductPrice product={item.product} />
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

          {customerSession ? (
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
                locale={language}
                currency={cartTotals?.currency || (language === 'en' ? 'USD' : 'IDR')}
                fulfillment={checkoutForm.fulfillment}
                shippingFeeAmountMinor={
                  checkoutForm.fulfillment === 'delivery' && selectedShippingOption
                    ? selectedShippingOption.price
                    : 0
                }
                items={itemHandlers.buildVoucherValidateItems(checkoutItems, language)}
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
          />

          {customerSession ? (
              <>
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
                  className="cart-drawer-checkout-btn checkout-confirm-submit"
                  type="submit"
                  disabled={checkoutStatus.state === 'loading' || !termsAccepted}
                >
                  <CreditCard size={18} />
                  <span>
                    {checkoutStatus.state === 'loading' ? t('common.submitting') : t('cart.checkoutPlaceOrder')}
                  </span>
                </button>
                <p className="checkout-confirm-legal">
                  {language === 'en'
                    ? 'By placing an order you agree to the Terms & Conditions.'
                    : 'Dengan memesan, Anda setuju dengan Syarat & Ketentuan.'}
                </p>
              </>
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
    </form>
  )
}
