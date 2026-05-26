import { useState } from 'react'
import { Tag, X } from 'lucide-react'
import { validateCatalogVoucher } from '../../lib/api'
import { formatCurrencyAmount } from '../../lib/price'

function formatVoucherSuccessMessage(preview, language) {
  const parts = []

  if (preview.order_discount_amount_minor > 0) {
    parts.push(
      language === 'en'
        ? `product −${formatCurrencyAmount(preview.order_discount_amount_minor, preview.currency, language)}`
        : `produk −${formatCurrencyAmount(preview.order_discount_amount_minor, preview.currency, language)}`,
    )
  }

  if (preview.shipping_discount_amount_minor > 0) {
    parts.push(
      language === 'en'
        ? `shipping −${formatCurrencyAmount(preview.shipping_discount_amount_minor, preview.currency, language)}`
        : `ongkir −${formatCurrencyAmount(preview.shipping_discount_amount_minor, preview.currency, language)}`,
    )
  }

  if (parts.length === 0 && preview.discount_amount_minor > 0) {
    parts.push(`−${formatCurrencyAmount(preview.discount_amount_minor, preview.currency, language)}`)
  }

  const detail = parts.length > 0 ? parts.join(', ') : preview.benefit_type_label || ''

  return language === 'en' ? `Voucher applied: ${detail}` : `Voucher aktif: ${detail}`
}

export default function VoucherCodeField({
  language,
  items,
  locale,
  currency,
  fulfillment = 'delivery',
  shippingFeeAmountMinor = 0,
  appliedVoucher,
  onApplied,
  onClear,
  disabled = false,
}) {
  const [code, setCode] = useState(appliedVoucher?.code || '')
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const handleApply = async () => {
    const trimmed = code.trim()

    if (!trimmed) {
      setStatus({
        state: 'error',
        message: language === 'en' ? 'Enter a voucher code first.' : 'Masukkan kode voucher terlebih dahulu.',
      })
      return
    }

    setStatus({
      state: 'loading',
      message: language === 'en' ? 'Checking voucher...' : 'Memeriksa voucher...',
    })

    try {
      const preview = await validateCatalogVoucher({
        voucherCode: trimmed,
        items,
        locale,
        currency,
        fulfillment,
        shippingFeeAmountMinor,
      })

      onApplied(preview)
      setCode(preview.code)
      setStatus({
        state: 'success',
        message: formatVoucherSuccessMessage(preview, language),
      })
    } catch (error) {
      onClear()
      setStatus({ state: 'error', message: error.message })
    }
  }

  const handleRemove = () => {
    setCode('')
    onClear()
    setStatus({ state: 'idle', message: '' })
  }

  const needsShippingFirst =
    fulfillment !== 'delivery'
      ? language === 'en'
        ? 'Shipping vouchers require courier delivery.'
        : 'Voucher ongkir hanya untuk pesanan kirim kurir.'
      : ''

  return (
    <div className="cart-voucher-field">
      <label className="cart-voucher-label" htmlFor="cart-voucher-code">
        <Tag size={16} aria-hidden="true" />
        <span>{language === 'en' ? 'Voucher code' : 'Kode voucher'}</span>
      </label>
      {needsShippingFirst ? <p className="cart-voucher-hint">{needsShippingFirst}</p> : null}
      <div className="cart-voucher-row">
        <input
          id="cart-voucher-code"
          type="text"
          className="cart-voucher-input"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder={language === 'en' ? 'e.g. AHR-SALES-10' : 'Contoh: AHR-SALES-10'}
          disabled={disabled || status.state === 'loading' || Boolean(appliedVoucher)}
          autoComplete="off"
        />
        {appliedVoucher ? (
          <button type="button" className="cart-voucher-remove" onClick={handleRemove} disabled={disabled}>
            <X size={16} />
            <span>{language === 'en' ? 'Remove' : 'Hapus'}</span>
          </button>
        ) : (
          <button
            type="button"
            className="cart-voucher-apply"
            onClick={handleApply}
            disabled={disabled || status.state === 'loading'}
          >
            {status.state === 'loading'
              ? language === 'en'
                ? 'Checking...'
                : 'Cek...'
              : language === 'en'
                ? 'Apply'
                : 'Pakai'}
          </button>
        )}
      </div>
      {appliedVoucher?.title ? (
        <p className="cart-voucher-applied-title">
          {language === 'en' ? 'Active voucher' : 'Voucher aktif'}: <strong>{appliedVoucher.title}</strong>
          {appliedVoucher.benefit_type_label ? (
            <>
              {' '}
              <span className="cart-voucher-applied-type">({appliedVoucher.benefit_type_label})</span>
            </>
          ) : null}
        </p>
      ) : null}
      {fulfillment === 'delivery' &&
      !appliedVoucher &&
      (status.state !== 'loading') &&
      shippingFeeAmountMinor <= 0 ? (
        <p className="cart-voucher-hint">
          {language === 'en'
            ? 'Select a shipping service first if you plan to use a shipping voucher.'
            : 'Pilih kurir dulu jika akan memakai voucher ongkir / gratis ongkir.'}
        </p>
      ) : null}
      {status.message ? <p className={`cart-status ${status.state}`}>{status.message}</p> : null}
    </div>
  )
}
