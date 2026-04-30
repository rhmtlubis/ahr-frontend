import { ChevronRight, Menu, ShoppingBag, ShoppingCart, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../lib/i18n.jsx'

function normalizeLinks(links = [], defaultHref = '/#products') {
  return links.map((link) =>
    typeof link === 'string'
      ? { label: link, href: defaultHref }
      : { label: link.label, href: link.href || defaultHref },
  )
}

export default function SiteHeader({
  brandHref = '/',
  navGroups = [],
  ticker,
  utilityLinks = [],
  utilityMessage,
  utilityAction,
  cartItemCount = 0,
  primaryActionLabel = 'Konsultasi',
  onPrimaryAction,
  onNavInteraction,
  onUtilityInteraction,
}) {
  const { language, setLanguage, t } = useLanguage()
  const [activeNav, setActiveNav] = useState(navGroups[0]?.id || '')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [desktopLanguageMenuOpen, setDesktopLanguageMenuOpen] = useState(false)
  const [mobileLanguageMenuOpen, setMobileLanguageMenuOpen] = useState(false)
  const [pendingDesktopLanguage, setPendingDesktopLanguage] = useState(language)
  const [pendingMobileLanguage, setPendingMobileLanguage] = useState(language)
  const desktopLanguageMenuRef = useRef(null)
  const mobileLanguageMenuRef = useRef(null)

  const activeGroup = navGroups.find((group) => group.id === activeNav) ?? navGroups[0]

  const handleNavSelect = (groupId, surface = 'header-nav') => {
    setActiveNav(groupId)
    onNavInteraction?.(groupId, surface)
  }

  const handleMobileMenuClose = (source = 'sidebar') => {
    setMobileMenuOpen(false)
    setMobileLanguageMenuOpen(false)
    onNavInteraction?.('mobile-menu-close', source)
  }

  const languageOptions = [
    { value: 'id', label: t('language.options.id'), shortLabel: 'IND', flag: '🇮🇩' },
    { value: 'en', label: t('language.options.en'), shortLabel: 'ENG', flag: '🇬🇧' },
  ]
  const activeLanguageOption =
    languageOptions.find((option) => option.value === language) ?? languageOptions[0]

  useEffect(() => {
    setPendingDesktopLanguage(language)
    setPendingMobileLanguage(language)
  }, [language])

  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedDesktop = desktopLanguageMenuRef.current?.contains(event.target)
      const clickedMobile = mobileLanguageMenuRef.current?.contains(event.target)

      if (!clickedDesktop && !clickedMobile) {
        setDesktopLanguageMenuOpen(false)
        setMobileLanguageMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setDesktopLanguageMenuOpen(false)
        setMobileLanguageMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleLanguageSave = (value) => {
    setLanguage(value)
    setDesktopLanguageMenuOpen(false)
    setMobileLanguageMenuOpen(false)
  }

  return (
    <header className="site-header product-page-header">
      <div
        className="header-menu-shell"
        onMouseLeave={() => {
          setMenuOpen(false)
        }}
      >
        <div className="utility-links-row">
          <div className="utility-bar">
            <span className="utility-message">{utilityMessage}</span>
            {utilityAction ? (
              <a
                href={utilityAction.href}
                onClick={() => onUtilityInteraction?.(utilityAction.label, 'utility-bar')}
              >
                {utilityAction.label}
              </a>
            ) : null}
          </div>
          <div className="utility-actions-group">
            <div className="language-switcher" ref={desktopLanguageMenuRef}>
              <button
                className={desktopLanguageMenuOpen ? 'language-switcher-trigger open' : 'language-switcher-trigger'}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={desktopLanguageMenuOpen}
                aria-label={t('language.switchLabel')}
                onClick={() => {
                  setDesktopLanguageMenuOpen((current) => !current)
                  setMobileLanguageMenuOpen(false)
                  setPendingDesktopLanguage(language)
                }}
              >
                <span className="language-switcher-flag-chip" aria-hidden="true">
                  {activeLanguageOption.flag}
                </span>
              </button>

              <div
                className={desktopLanguageMenuOpen ? 'language-switcher-menu open' : 'language-switcher-menu'}
                role="dialog"
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
                          pendingDesktopLanguage === option.value
                            ? 'language-switcher-radio active'
                            : 'language-switcher-radio'
                        }
                      >
                        <input
                          type="radio"
                          name="desktop-language"
                          value={option.value}
                          checked={pendingDesktopLanguage === option.value}
                          onChange={() => setPendingDesktopLanguage(option.value)}
                        />
                        <span className="language-switcher-radio-mark" aria-hidden="true" />
                        <span className="language-switcher-radio-copy">
                          <span>{option.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <button
                    className="language-switcher-save"
                    type="button"
                    onClick={() => handleLanguageSave(pendingDesktopLanguage)}
                  >
                    <span>{language === 'id' ? 'Simpan' : 'Save'}</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
            <div className="utility-links">
              {utilityLinks.map((item) => (
              <a
                href={item.href}
                key={item.label}
                onClick={() => onUtilityInteraction?.(item.label, 'utility-links')}
              >
                {item.label}
              </a>
              ))}
            </div>
          </div>
        </div>

        <div
          className={mobileMenuOpen ? 'mobile-drawer-backdrop visible' : 'mobile-drawer-backdrop'}
          onClick={() => handleMobileMenuClose('backdrop')}
        />
        <aside className={mobileMenuOpen ? 'mobile-sidebar open' : 'mobile-sidebar'} aria-label="Mobile navigation">
          <div className="mobile-sidebar-header">
            <img className="mobile-sidebar-logo" src="/ahr-brand-logo.webp" alt="AHR logo" width="295" height="295" />
            <div className="mobile-language-switcher" ref={mobileLanguageMenuRef}>
              <button
                className={mobileLanguageMenuOpen ? 'language-switcher-trigger open' : 'language-switcher-trigger'}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={mobileLanguageMenuOpen}
                aria-label={t('language.switchLabel')}
                onClick={() => {
                  setMobileLanguageMenuOpen((current) => !current)
                  setDesktopLanguageMenuOpen(false)
                  setPendingMobileLanguage(language)
                }}
              >
                <span className="language-switcher-flag-chip" aria-hidden="true">
                  {activeLanguageOption.flag}
                </span>
              </button>

              <div
                className={mobileLanguageMenuOpen ? 'language-switcher-menu open' : 'language-switcher-menu'}
                role="dialog"
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
                          pendingMobileLanguage === option.value
                            ? 'language-switcher-radio active'
                            : 'language-switcher-radio'
                        }
                      >
                        <input
                          type="radio"
                          name="mobile-language"
                          value={option.value}
                          checked={pendingMobileLanguage === option.value}
                          onChange={() => setPendingMobileLanguage(option.value)}
                        />
                        <span className="language-switcher-radio-mark" aria-hidden="true" />
                        <span className="language-switcher-radio-copy">
                          <span>{option.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <button
                    className="language-switcher-save"
                    type="button"
                    onClick={() => handleLanguageSave(pendingMobileLanguage)}
                  >
                    <span>{language === 'id' ? 'Simpan' : 'Save'}</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
            <button
              className="mobile-sidebar-close"
              type="button"
              aria-label={language === 'id' ? 'Tutup menu' : 'Close menu'}
              onClick={() => handleMobileMenuClose('close-button')}
            >
              <X size={20} />
            </button>
          </div>

          <div className="mobile-sidebar-body">
            <nav className="mobile-sidebar-nav">
              {navGroups.map((item) => (
                <button
                  className={activeNav === item.id ? 'mobile-sidebar-tab active' : 'mobile-sidebar-tab'}
                  key={item.id}
                  type="button"
                  onClick={() => handleNavSelect(item.id, 'mobile-sidebar')}
                >
                  <span>{item.label}</span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </nav>

            {activeGroup ? (
              <div className="mobile-sidebar-panel">
                <div className="mobile-sidebar-columns">
                  {activeGroup.columns.map((column) => (
                    <div key={column.title}>
                      <h3>{column.title}</h3>
                      <ul>
                        {normalizeLinks(column.links).map((link) => (
                          <li key={link.label}>
                            <a
                              href={link.href}
                              onClick={() => {
                                onNavInteraction?.(link.label, 'mobile-sidebar-link')
                                handleMobileMenuClose('sidebar-link')
                              }}
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mobile-sidebar-feature">
                  <strong>{activeGroup.feature.title}</strong>
                  <p>{activeGroup.feature.body}</p>
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <div className="main-header">
          <Link className="brand" to={brandHref} aria-label="AHR Home">
            <img className="brand-mark" src="/ahr-brand-logo.webp" alt="AHR logo" width="295" height="295" />
          </Link>

          <button
            className="mobile-menu-button"
            type="button"
            aria-label="Toggle menu"
            onClick={() => {
              setMobileMenuOpen((current) => !current)
              setMobileLanguageMenuOpen(false)
              onNavInteraction?.('mobile-menu-toggle', 'header')
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className={mobileMenuOpen ? 'main-nav open' : 'main-nav'}>
            {navGroups.map((item) => (
              <button
                className={activeNav === item.id ? 'nav-tab active' : 'nav-tab'}
                key={item.id}
                type="button"
                onMouseEnter={() => {
                  handleNavSelect(item.id, 'header-nav-hover')
                  setMenuOpen(true)
                }}
                onFocus={() => {
                  handleNavSelect(item.id, 'header-nav-focus')
                  setMenuOpen(true)
                }}
                onClick={() => {
                  handleNavSelect(item.id, 'header-nav-click')
                  setMenuOpen((current) => !current)
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="header-actions">
            <Link className="header-cart-button" to="/cart" aria-label={t('cart.openCart')}>
              <ShoppingCart size={18} />
              {cartItemCount > 0 ? (
                <span className="header-cart-count">{cartItemCount > 99 ? '99+' : cartItemCount}</span>
              ) : null}
            </Link>
            <button className="header-cta" type="button" aria-label={primaryActionLabel} onClick={onPrimaryAction}>
              <ShoppingBag size={18} />
              <span>{primaryActionLabel}</span>
            </button>
          </div>
        </div>

        <div className="ticker-bar">
          <span>{ticker}</span>
        </div>

        {activeGroup ? (
          <section
            className={menuOpen || mobileMenuOpen ? 'mega-menu visible' : 'mega-menu'}
            aria-label="Category menu"
            onMouseEnter={() => setMenuOpen(true)}
          >
            <div className="mega-menu-columns">
              {activeGroup.columns.map((column) => (
                <div key={column.title}>
                  <h3>{column.title}</h3>
                  <ul>
                    {normalizeLinks(column.links).map((link) => (
                      <li key={link.label}>
                        <a href={link.href}>{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <aside className="mega-menu-feature">
              <div className="feature-thumb" />
              <div className="feature-card-body">
                <strong>{activeGroup.feature.title}</strong>
                <p>{activeGroup.feature.body}</p>
              </div>
            </aside>
          </section>
        ) : null}
      </div>
    </header>
  )
}
