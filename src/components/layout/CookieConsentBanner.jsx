import { useState } from 'react'
import { useLanguage } from '../../lib/i18n.jsx'

export default function CookieConsentBanner({
  onAcceptAll,
  onAcceptAnalyticsOnly,
  onAcceptPersonalizationOnly,
  onRejectAll,
}) {
  const { t } = useLanguage()
  const [showPreferences, setShowPreferences] = useState(false)

  return (
    <div className="cookie-consent-overlay">
      <div
        className="cookie-consent-banner"
        role="dialog"
        aria-modal="true"
        aria-live="polite"
        aria-label={t('cookie.ariaLabel')}
      >
        <div className="cookie-consent-copy">
          <span className="cookie-consent-eyebrow">{t('cookie.eyebrow')}</span>
          <strong>{t('cookie.title')}</strong>
          <p>{t('cookie.body')}</p>
        </div>

        <div className="cookie-consent-actions cookie-consent-actions-primary">
          <button className="cookie-consent-button cookie-consent-button-primary" type="button" onClick={onAcceptAll}>
            {t('cookie.acceptAll')}
          </button>
          <button className="cookie-consent-button cookie-consent-button-dark" type="button" onClick={onRejectAll}>
            {t('cookie.rejectAll')}
          </button>
        </div>

        <div className="cookie-consent-footer">
          <button
            className="cookie-consent-link"
            type="button"
            onClick={() => setShowPreferences((current) => !current)}
          >
            {showPreferences ? t('cookie.hidePreferences') : t('cookie.showPreferences')}
          </button>
        </div>

        {showPreferences ? (
          <div className="cookie-consent-preferences">
            <button
              className="cookie-consent-button cookie-consent-button-secondary"
              type="button"
              onClick={onAcceptAnalyticsOnly}
            >
              {t('cookie.analyticsOnly')}
            </button>
            <button
              className="cookie-consent-button cookie-consent-button-secondary"
              type="button"
              onClick={onAcceptPersonalizationOnly}
            >
              {t('cookie.personalizationOnly')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
