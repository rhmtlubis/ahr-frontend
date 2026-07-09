import { ChevronRight } from 'lucide-react'
import { useEffect } from 'react'
import { useLanguage } from '../../lib/i18n.jsx'

const LANGUAGE_OPTIONS = [
  { value: 'id', labelKey: 'language.options.id', shortLabel: 'ID', flag: '🇮🇩' },
  { value: 'en', labelKey: 'language.options.en', shortLabel: 'EN', flag: '🇬🇧' },
]

export default function LanguageSwitcher({
  className = 'language-switcher',
  isOpen,
  setIsOpen,
  pendingLanguage,
  setPendingLanguage,
  onSave,
  menuRef,
  inputName = 'site-language',
}) {
  const { language, t } = useLanguage()
  const languageOptions = LANGUAGE_OPTIONS.map((option) => ({
    ...option,
    label: t(option.labelKey),
  }))
  const activeLanguageOption =
    languageOptions.find((option) => option.value === language) ?? languageOptions[0]

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const isMobileLayout = window.matchMedia('(max-width: 720px)').matches
    if (!isMobileLayout) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  return (
    <div className={className} ref={menuRef}>
      <button
        className={isOpen ? 'language-switcher-trigger open' : 'language-switcher-trigger'}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={t('language.switchLabel')}
        title={t('language.switchLabel')}
        onClick={() => {
          setIsOpen((current) => !current)
          setPendingLanguage(language)
        }}
      >
        <span className="language-switcher-flag-chip" aria-hidden="true">
          {activeLanguageOption.flag}
        </span>
        <span className="language-switcher-code">{activeLanguageOption.shortLabel}</span>
      </button>

      {isOpen ? (
        <button
          className="language-switcher-backdrop"
          type="button"
          aria-label={language === 'id' ? 'Tutup pilihan bahasa' : 'Close language menu'}
          tabIndex={-1}
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <div
        className={isOpen ? 'language-switcher-menu open' : 'language-switcher-menu'}
        role="dialog"
        aria-modal={isOpen ? 'true' : undefined}
        aria-label={t('language.switchLabel')}
      >
        <div className="language-switcher-panel">
          <p className="language-switcher-title">
            {language === 'id' ? 'Pilih bahasa kamu' : 'Choose your language'}
          </p>
          <div className="language-switcher-options" role="radiogroup" aria-label={t('language.switchLabel')}>
            {languageOptions.map((option) => (
              <label
                key={option.value}
                className={
                  pendingLanguage === option.value ? 'language-switcher-radio active' : 'language-switcher-radio'
                }
              >
                <input
                  type="radio"
                  name={inputName}
                  value={option.value}
                  checked={pendingLanguage === option.value}
                  onChange={() => setPendingLanguage(option.value)}
                />
                <span className="language-switcher-radio-mark" aria-hidden="true" />
                <span className="language-switcher-radio-copy">
                  <span>{option.flag}</span>
                  <span>{option.label}</span>
                </span>
              </label>
            ))}
          </div>
          <button className="language-switcher-save" type="button" onClick={() => onSave(pendingLanguage)}>
            <span>{language === 'id' ? 'Simpan' : 'Save'}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
