import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

export default function CheckoutTermsAgreement({
  checked,
  onChange,
  language,
  termsVersion,
  disabled = false,
  error = '',
}) {
  const termsPath = '/syarat-ketentuan'

  return (
    <div className={`cart-terms-agreement ${error ? 'cart-terms-agreement-error' : ''}`}>
      <label className="cart-terms-agreement-label">
        <input
          type="checkbox"
          className="cart-terms-agreement-checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          required
        />
        <span className="cart-terms-agreement-copy">
          {language === 'en' ? (
            <>
              I have read and agree to the{' '}
              <Link to={termsPath} target="_blank" rel="noopener noreferrer">
                Terms & Conditions
              </Link>{' '}
              and confirm that my order details are correct before payment.
            </>
          ) : (
            <>
              Saya telah membaca dan menyetujui{' '}
              <Link to={termsPath} target="_blank" rel="noopener noreferrer">
                Syarat & Ketentuan
              </Link>{' '}
              serta memastikan data pesanan sudah benar sebelum pembayaran.
            </>
          )}
        </span>
      </label>
      <p className="cart-terms-agreement-hint">
        <FileText size={14} aria-hidden="true" />
        <span>
          {language === 'en'
            ? 'Payment cannot proceed without your agreement.'
            : 'Pembayaran tidak dapat dilanjutkan tanpa persetujuan Anda.'}
          {termsVersion ? (
            <>
              {' '}
              <span className="cart-terms-agreement-version">
                ({language === 'en' ? 'Version' : 'Versi'} {termsVersion})
              </span>
            </>
          ) : null}
        </span>
      </p>
      {error ? <p className="cart-status error">{error}</p> : null}
    </div>
  )
}
