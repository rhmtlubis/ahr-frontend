import { useState } from 'react'

export default function CookieConsentBanner({
  onAcceptAll,
  onAcceptAnalyticsOnly,
  onAcceptPersonalizationOnly,
  onRejectAll,
}) {
  const [showPreferences, setShowPreferences] = useState(false)

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-banner" role="dialog" aria-modal="true" aria-live="polite" aria-label="Izin cookies">
        <div className="cookie-consent-copy">
          <span className="cookie-consent-eyebrow">Pengaturan cookies</span>
          <strong>Pilih izin pelacakan untuk pengalaman AHR yang lebih rapi</strong>
          <p>
            Kami memakai cookies dan penyimpanan browser untuk dua hal: membaca performa funnel lewat analytics dan
            menampilkan rekomendasi produk yang lebih relevan di beranda.
          </p>
        </div>

        <div className="cookie-consent-actions cookie-consent-actions-primary">
          <button className="cookie-consent-button cookie-consent-button-primary" type="button" onClick={onAcceptAll}>
            Setujui Semua
          </button>
          <button className="cookie-consent-button cookie-consent-button-dark" type="button" onClick={onRejectAll}>
            Tolak Semua
          </button>
        </div>

        <div className="cookie-consent-footer">
          <button
            className="cookie-consent-link"
            type="button"
            onClick={() => setShowPreferences((current) => !current)}
          >
            {showPreferences ? 'Sembunyikan pengaturan detail' : 'Atur pilihan analytics dan personalization'}
          </button>
        </div>

        {showPreferences ? (
          <div className="cookie-consent-preferences">
            <button
              className="cookie-consent-button cookie-consent-button-secondary"
              type="button"
              onClick={onAcceptAnalyticsOnly}
            >
              Analytics Saja
            </button>
            <button
              className="cookie-consent-button cookie-consent-button-secondary"
              type="button"
              onClick={onAcceptPersonalizationOnly}
            >
              Personalization Saja
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
