import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import ProductPrice from '../catalog/ProductPrice'
import { getProductSizeOptions } from '../../lib/cart.jsx'

function CartItemQuantityControls({ item, t, updateCartItemQuantity }) {
  return (
    <div className="cart-quantity-control" aria-label={t('cart.quantity')}>
      <button
        type="button"
        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
        aria-label={t('cart.decreaseQuantity')}
      >
        <Minus size={15} />
      </button>
      <span>{item.quantity}</span>
      <button
        type="button"
        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
        aria-label={t('cart.increaseQuantity')}
      >
        <Plus size={15} />
      </button>
    </div>
  )
}

function CartItemRemoveButton({ item, t, removeCartItem, compact }) {
  return (
    <button
      className={`cart-remove-button ${compact ? 'cart-remove-button--icon' : ''}`}
      type="button"
      onClick={() => removeCartItem(item.id)}
      aria-label={t('cart.removeItem')}
    >
      <Trash2 size={16} />
      {!compact ? <span>{t('cart.removeItem')}</span> : null}
    </button>
  )
}

function CartItemSizeSelect({ item, t, updateCartItemSize, compact }) {
  return (
    <div className={`cart-item-size-row ${compact ? 'cart-item-size-row-compact' : ''}`}>
      <label htmlFor={`cart-size-${item.id}`}>{t('common.size')}</label>
      <select
        id={`cart-size-${item.id}`}
        value={item.size}
        onChange={(event) => updateCartItemSize(item.id, event.target.value)}
      >
        {Array.from(new Set([...getProductSizeOptions(item.product), item.size])).map((size) => (
          <option key={`${item.id}-${size}`} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function renderCartItemRow({
  item,
  language,
  t,
  mixedSizeDrafts,
  getMixedSizeDraft,
  toggleMixedSizeEditor,
  updateMixedSizeDraft,
  applyMixedSizes,
  updateCartItemSize,
  updateCartItemQuantity,
  removeCartItem,
  compact = false,
}) {
  return (
    <article className={`cart-item-card ${compact ? 'cart-item-card-compact' : ''}`}>
      <Link className="cart-item-media" to={`/produk/${item.product.slug}`} state={{ product: item.product }}>
        <img
          src={item.product.image}
          alt={item.product.name}
          width="800"
          height="1000"
          loading="lazy"
          decoding="async"
          style={{ objectPosition: item.product.imagePosition || 'center center' }}
        />
      </Link>

      <div className="cart-item-copy">
        <span>{item.product.category || t('common.products')}</span>
        <h3>{item.product.name}</h3>
        <ProductPrice product={item.product} />

        {compact ? (
          <div className="cart-item-compact-footer">
            <CartItemSizeSelect item={item} t={t} updateCartItemSize={updateCartItemSize} compact />
            <div className="cart-item-compact-controls">
              <CartItemQuantityControls item={item} t={t} updateCartItemQuantity={updateCartItemQuantity} />
              <CartItemRemoveButton item={item} t={t} removeCartItem={removeCartItem} compact />
            </div>
          </div>
        ) : (
          <>
            <CartItemSizeSelect item={item} t={t} updateCartItemSize={updateCartItemSize} />
            {item.quantity > 1 ? (
              <div className="cart-item-mixed-size">
                <button className="cart-item-mixed-size-trigger" type="button" onClick={() => toggleMixedSizeEditor(item)}>
                  {t('cart.mixedSizeTrigger')}
                </button>
                {mixedSizeDrafts[item.id] ? (
                  <div className="cart-item-mixed-size-editor">
                    <strong>{t('cart.mixedSizeTitle')}</strong>
                    <div className="cart-item-mixed-size-grid">
                      {getMixedSizeDraft(item).map((selectedSize, index) => (
                        <label className="cart-item-mixed-size-field" key={`${item.id}-piece-${index + 1}`}>
                          <span>{t('cart.mixedSizePiece', { number: index + 1 })}</span>
                          <select
                            value={selectedSize}
                            onChange={(event) =>
                              updateMixedSizeDraft(item.id, index, event.target.value, item.quantity, item.size)
                            }
                          >
                            {Array.from(new Set([...getProductSizeOptions(item.product), item.size])).map((size) => (
                              <option key={`${item.id}-piece-${index + 1}-${size}`} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                    <button className="cart-item-mixed-size-apply" type="button" onClick={() => applyMixedSizes(item)}>
                      {t('cart.mixedSizeApply')}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>

      {!compact ? (
        <div className="cart-item-actions">
          <CartItemQuantityControls item={item} t={t} updateCartItemQuantity={updateCartItemQuantity} />
          <CartItemRemoveButton item={item} t={t} removeCartItem={removeCartItem} />
        </div>
      ) : null}
    </article>
  )
}
