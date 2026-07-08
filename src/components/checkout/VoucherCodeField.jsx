import { useCallback, useEffect, useState } from 'react'
import { ChevronRight, Tag, X } from 'lucide-react'
import { listCatalogVouchers, validateCatalogVoucher } from '../../lib/api'
import { formatCurrencyAmount } from '../../lib/price'

function formatVoucherSuccessMessage(preview, language) {
  const parts = []

  if (preview.order_discount_amount_minor > 0) {
    parts.push(
      language === 'en'
        ? `product -${formatCurrencyAmount(preview.order_discount_amount_minor, preview.currency, language)}`
        : `produk -${formatCurrencyAmount(preview.order_discount_amount_minor, preview.currency, language)}`,
    )
  }

  if (preview.shipping_discount_amount_minor > 0) {
    parts.push(
      language === 'en'
        ? `shipping -${formatCurrencyAmount(preview.shipping_discount_amount_minor, preview.currency, language)}`
        : `ongkir -${formatCurrencyAmount(preview.shipping_discount_amount_minor, preview.currency, language)}`,
    )
  }

  if (parts.length === 0 && preview.discount_amount_minor > 0) {
    parts.push(`-${formatCurrencyAmount(preview.discount_amount_minor, preview.currency, language)}`)
  }

  const detail = parts.length > 0 ? parts.join(', ') : preview.benefit_type_label || ''

  return language === 'en' ? `Voucher applied: ${detail}` : `Voucher aktif: ${detail}`
}

function buildListPayload({ items, locale, currency, fulfillment, shippingFeeAmountMinor }) {
  return {
    items,
    locale,
    currency,
    fulfillment,
    shippingFeeAmountMinor,
  }
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
  const [sheetOpen, setSheetOpen] = useState(false)
  const [manualCode, setManualCode] = useState(appliedVoucher?.code || '')
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [voucherList, setVoucherList] = useState([])
  const [listState, setListState] = useState('idle')
  const [selectedCode, setSelectedCode] = useState(appliedVoucher?.code || '')

  useEffect(() => {
    if (appliedVoucher?.code) {
      setManualCode(appliedVoucher.code)
      setSelectedCode(appliedVoucher.code)
    }
  }, [appliedVoucher?.code])

  useEffect(() => {
    if (!sheetOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [sheetOpen])

  const applyPreview = (preview) => {
    onApplied(preview)
    setManualCode(preview.code)
    setSelectedCode(preview.code)
    setStatus({
      state: 'success',
      message: formatVoucherSuccessMessage(preview, language),
    })
    setSheetOpen(false)
  }

  const applyCode = async (code) => {
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

      applyPreview(preview)
    } catch (error) {
      onClear()
      setStatus({ state: 'error', message: error.message })
    }
  }

  const handleRemove = () => {
    setManualCode('')
    setSelectedCode('')
    onClear()
    setStatus({ state: 'idle', message: '' })
  }

  const loadVoucherList = useCallback(async () => {
    setListState('loading')

    try {
      const entries = await listCatalogVouchers(
        buildListPayload({ items, locale, currency, fulfillment, shippingFeeAmountMinor }),
      )
      setVoucherList(entries)
      setListState('ready')
    } catch (error) {
      setVoucherList([])
      setListState('error')
      setStatus({ state: 'error', message: error.message })
    }
  }, [currency, fulfillment, items, locale, shippingFeeAmountMinor])

  const openSheet = () => {
    if (disabled) {
      return
    }

    setSheetOpen(true)
  }

  useEffect(() => {
    if (!sheetOpen) {
      return
    }

    loadVoucherList()
  }, [loadVoucherList, sheetOpen])

  const closeSheet = () => {
    setSheetOpen(false)
  }

  const availableVouchers = voucherList.filter((entry) => entry.available)
  const unavailableVouchers = voucherList.filter((entry) => !entry.available)

  const triggerLabel = appliedVoucher
    ? appliedVoucher.title || appliedVoucher.code
    : language === 'en'
      ? 'Voucher'
      : 'Voucher'

  const needsShippingFirst =
    fulfillment !== 'delivery'
      ? language === 'en'
        ? 'Shipping vouchers require courier delivery.'
        : 'Voucher ongkir hanya untuk pesanan kirim kurir.'
      : ''

  return (
    <div className="cart-voucher-field">
      <button
        type="button"
        className="cart-voucher-trigger"
        onClick={openSheet}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={sheetOpen}
      >
        <span className="cart-voucher-trigger-leading">
          <Tag size={14} aria-hidden="true" />
          <span className="cart-voucher-trigger-label">{triggerLabel}</span>
        </span>
        <span className="cart-voucher-trigger-value">
          {appliedVoucher ? (
            <span className="cart-voucher-trigger-applied">
              {language === 'en' ? 'Applied' : 'Terpakai'}
            </span>
          ) : (
            <span className="cart-voucher-trigger-placeholder">
              {language === 'en' ? 'Select or enter code' : 'Pilih atau masukkan kode'}
            </span>
          )}
          <ChevronRight size={16} aria-hidden="true" />
        </span>
      </button>

      {appliedVoucher ? (
        <button type="button" className="cart-voucher-clear-link" onClick={handleRemove} disabled={disabled}>
          {language === 'en' ? 'Remove voucher' : 'Hapus voucher'}
        </button>
      ) : null}

      {needsShippingFirst ? <p className="cart-voucher-hint">{needsShippingFirst}</p> : null}
      {fulfillment === 'delivery' &&
      !appliedVoucher &&
      status.state !== 'loading' &&
      shippingFeeAmountMinor <= 0 ? (
        <p className="cart-voucher-hint">
          {language === 'en'
            ? 'Select a shipping service first if you plan to use a shipping voucher.'
            : 'Pilih kurir dulu jika akan memakai voucher ongkir / gratis ongkir.'}
        </p>
      ) : null}
      {status.message && !sheetOpen ? <p className={`cart-status ${status.state}`}>{status.message}</p> : null}

      {sheetOpen ? (
        <div className="voucher-sheet-root" role="presentation">
          <button type="button" className="voucher-sheet-backdrop" onClick={closeSheet} aria-label="Tutup" />
          <div className="voucher-sheet" role="dialog" aria-modal="true" aria-labelledby="voucher-sheet-title">
            <header className="voucher-sheet-header">
              <h2 id="voucher-sheet-title">{language === 'en' ? 'Voucher' : 'Voucher'}</h2>
              <button type="button" className="voucher-sheet-close" onClick={closeSheet} aria-label="Tutup">
                <X size={18} />
              </button>
            </header>

            <div className="voucher-sheet-body">
              <div className="voucher-sheet-manual">
                <input
                  type="text"
                  className="cart-voucher-input"
                  value={manualCode}
                  onChange={(event) => setManualCode(event.target.value.toUpperCase())}
                  placeholder={language === 'en' ? 'Voucher code' : 'Kode voucher'}
                  disabled={disabled || status.state === 'loading'}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="cart-voucher-apply voucher-sheet-manual-apply"
                  onClick={() => applyCode(manualCode)}
                  disabled={disabled || status.state === 'loading' || !manualCode.trim()}
                >
                  {status.state === 'loading'
                    ? language === 'en'
                      ? 'Checking...'
                      : 'Cek...'
                    : language === 'en'
                      ? 'Apply'
                      : 'Pakai'}
                </button>
              </div>

              {listState === 'loading' ? (
                <p className="voucher-sheet-status">
                  {language === 'en' ? 'Loading vouchers...' : 'Memuat voucher...'}
                </p>
              ) : null}

              {listState === 'ready' && voucherList.length === 0 ? (
                <p className="voucher-sheet-status">
                  {language === 'en'
                    ? 'No public vouchers right now. Enter a code if you have one.'
                    : 'Belum ada voucher publik. Masukkan kode jika Anda punya.'}
                </p>
              ) : null}

              {availableVouchers.length > 0 ? (
                <section className="voucher-sheet-section">
                  <h3>{language === 'en' ? 'Available' : 'Tersedia'}</h3>
                  <ul className="voucher-sheet-list">
                    {availableVouchers.map((entry) => (
                      <li key={entry.code}>
                        <label className="voucher-sheet-card voucher-sheet-card-available">
                          <input
                            type="radio"
                            name="voucher-selection"
                            value={entry.code}
                            checked={selectedCode === entry.code}
                            onChange={() => setSelectedCode(entry.code)}
                          />
                          <span className="voucher-sheet-card-code">{entry.code}</span>
                          <span className="voucher-sheet-card-copy">
                            <strong>{entry.benefit_summary}</strong>
                            <span>{entry.min_order_label}</span>
                            {entry.benefit_type_label ? (
                              <span className="voucher-sheet-card-meta">{entry.benefit_type_label}</span>
                            ) : null}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {unavailableVouchers.length > 0 ? (
                <section className="voucher-sheet-section">
                  <h3>{language === 'en' ? 'Not available' : 'Tidak tersedia'}</h3>
                  <ul className="voucher-sheet-list">
                    {unavailableVouchers.map((entry) => (
                      <li key={entry.code}>
                        <div className="voucher-sheet-card voucher-sheet-card-unavailable">
                          <span className="voucher-sheet-card-code">{entry.code}</span>
                          <span className="voucher-sheet-card-copy">
                            <strong>{entry.benefit_summary}</strong>
                            <span>{entry.min_order_label}</span>
                          </span>
                        </div>
                        {entry.unavailable_reason ? (
                          <p className="voucher-sheet-card-reason">{entry.unavailable_reason}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {status.message && sheetOpen ? (
                <p className={`cart-status ${status.state}`}>{status.message}</p>
              ) : null}
            </div>

            <footer className="voucher-sheet-footer">
              <button
                type="button"
                className="voucher-sheet-confirm"
                onClick={() => {
                  if (selectedCode) {
                    applyCode(selectedCode)
                  }
                }}
                disabled={disabled || status.state === 'loading' || !selectedCode}
              >
                {language === 'en' ? 'Apply' : 'Pakai'}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  )
}
