import { ChevronRight, Menu, ShoppingBag, ShoppingCart, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCustomer } from '../../lib/customer.jsx'
import { useLanguage } from '../../lib/i18n.jsx'
import { getStoreBrandName, getRetailHeaderNav, isCssStore } from '../../lib/storeConfig'
import CssBrandMark from '../css/CssBrandMark.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'

function normalizeLinks(links = [], defaultHref = '/#products') {
  return links.map((link) =>
    typeof link === 'string'
      ? { label: link, href: defaultHref }
      : { label: link.label, href: link.href || defaultHref },
  )
}

function getCustomerInitials(customer) {
  const name = String(customer?.name || customer?.email || '').trim()

  if (!name) {
    return '?'
  }

  const parts = name.split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase()
}

function getCustomerDisplayName(customer) {
  const name = String(customer?.name || '').trim()

  if (name) {
    return name.split(/\s+/)[0]
  }

  const email = String(customer?.email || '').trim()

  if (email.includes('@')) {
    return email.split('@')[0]
  }

  return email
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
  const { customer, isLoading: customerLoading } = useCustomer()
  const retailNav = getRetailHeaderNav(language)
  const isSignedIn = Boolean(customer)
  const customerInitials = isSignedIn ? getCustomerInitials(customer) : ''
  const customerDisplayName = isSignedIn ? getCustomerDisplayName(customer) : ''
  const accountAriaLabel = isSignedIn
    ? t('common.signedInAs', { name: customer.name || customer.email })
    : t('common.customerAccount')
  const [activeNav, setActiveNav] = useState(navGroups[0]?.id || '')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [desktopLanguageMenuOpen, setDesktopLanguageMenuOpen] = useState(false)
  const [pendingLanguage, setPendingLanguage] = useState(language)
  const headerLanguageMenuRef = useRef(null)

  const activeGroup = navGroups.find((group) => group.id === activeNav) ?? navGroups[0]

  const handleNavSelect = (groupId, surface = 'header-nav') => {
    setActiveNav(groupId)
    onNavInteraction?.(groupId, surface)
  }

  const handleMobileMenuClose = (source = 'sidebar') => {
    setMobileMenuOpen(false)
    setDesktopLanguageMenuOpen(false)
    onNavInteraction?.('mobile-menu-close', source)
  }

  useEffect(() => {
    setPendingLanguage(language)
  }, [language])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!headerLanguageMenuRef.current?.contains(event.target)) {
        setDesktopLanguageMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setDesktopLanguageMenuOpen(false)
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
            {isCssStore() ? (
              <CssBrandMark className="css-brand-mark--sidebar" variant="logo" />
            ) : (
              <img className="mobile-sidebar-logo" src="/ahr-brand-logo.webp" alt="AHR logo" width="295" height="295" />
            )}
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
            <Link
              className={isSignedIn ? 'mobile-sidebar-account mobile-sidebar-account--signed-in' : 'mobile-sidebar-account'}
              to="/akun"
              onClick={() => handleMobileMenuClose('account')}
            >
              {isSignedIn ? (
                <span className="header-account-avatar" aria-hidden="true">
                  {customerInitials}
                </span>
              ) : (
                <span className="mobile-sidebar-account-icon" aria-hidden="true">
                  <UserRound size={18} />
                </span>
              )}
              <span className="mobile-sidebar-account-copy">
                {isSignedIn ? (
                  <>
                    <strong>{customerDisplayName}</strong>
                    <span>{t('common.viewAccount')}</span>
                  </>
                ) : (
                  <>
                    <strong>{t('common.customerAccount')}</strong>
                    <span>{t('common.signInAccount')}</span>
                  </>
                )}
              </span>
              <ChevronRight size={16} aria-hidden="true" />
            </Link>

            <nav className="mobile-sidebar-nav">
              {retailNav
                ? retailNav.map((item) => (
                    <Link
                      className="mobile-sidebar-tab css-retail-nav-link"
                      key={item.href}
                      to={item.href}
                      onClick={() => handleMobileMenuClose('sidebar-link')}
                    >
                      <span>{item.label}</span>
                      <ChevronRight size={16} />
                    </Link>
                  ))
                : navGroups.map((item) => (
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

            {!retailNav && activeGroup ? (
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

                {!isCssStore() ? (
                  <div className="mobile-sidebar-feature">
                    <strong>{activeGroup.feature.title}</strong>
                    <p>{activeGroup.feature.body}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </aside>

        <div className="main-header">
          <Link className="brand" to={brandHref} aria-label={`${getStoreBrandName()} Home`}>
            {isCssStore() ? (
              <CssBrandMark className="css-brand-mark--header" variant="logo" />
            ) : (
              <img className="brand-mark" src="/ahr-brand-logo.webp" alt="AHR logo" width="295" height="295" />
            )}
          </Link>

          <button
            className="mobile-menu-button"
            type="button"
            aria-label="Toggle menu"
            onClick={() => {
              setMobileMenuOpen((current) => !current)
              setDesktopLanguageMenuOpen(false)
              onNavInteraction?.('mobile-menu-toggle', 'header')
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className={mobileMenuOpen ? 'main-nav open' : 'main-nav'}>
            {retailNav
              ? retailNav.map((item) => (
                  <Link
                    className="nav-tab css-retail-nav-link"
                    key={item.href}
                    to={item.href}
                    onClick={() => onNavInteraction?.(item.label, 'header-nav-link')}
                  >
                    {item.label}
                  </Link>
                ))
              : navGroups.map((item) => (
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
            <LanguageSwitcher
              className="language-switcher header-language-switcher"
              isOpen={desktopLanguageMenuOpen}
              setIsOpen={setDesktopLanguageMenuOpen}
              pendingLanguage={pendingLanguage}
              setPendingLanguage={setPendingLanguage}
              onSave={handleLanguageSave}
              menuRef={headerLanguageMenuRef}
              inputName="header-language"
            />
            <Link
              className={
                isSignedIn
                  ? 'header-account-button header-account-button--signed-in'
                  : 'header-account-button'
              }
              to="/akun"
              aria-label={accountAriaLabel}
              title={accountAriaLabel}
              data-signed-in={isSignedIn ? 'true' : 'false'}
              data-loading={customerLoading ? 'true' : 'false'}
            >
              {isSignedIn ? (
                <>
                  <span className="header-account-avatar" aria-hidden="true">
                    {customerInitials}
                  </span>
                  <span className="header-account-name">{customerDisplayName}</span>
                  <span className="header-account-signed-in-dot" aria-hidden="true" />
                </>
              ) : (
                <UserRound size={18} aria-hidden="true" />
              )}
            </Link>
            <Link
              className="header-cart-button"
              to="/cart"
              data-cart-target="header-cart"
              aria-label={t('cart.openCart')}
            >
              <ShoppingCart size={18} />
              {cartItemCount > 0 ? (
                <span className="header-cart-count">{cartItemCount > 99 ? '99+' : cartItemCount}</span>
              ) : null}
            </Link>
            {primaryActionLabel && onPrimaryAction ? (
              <button className="header-cta" type="button" aria-label={primaryActionLabel} onClick={onPrimaryAction}>
                <ShoppingBag size={18} />
                <span>{primaryActionLabel}</span>
              </button>
            ) : null}
          </div>
        </div>

        {ticker ? (
          <div className="ticker-bar">
            <span>{ticker}</span>
          </div>
        ) : null}

        {!retailNav && activeGroup ? (
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

            {!isCssStore() ? (
              <aside className="mega-menu-feature">
                <div className="feature-thumb" />
                <div className="feature-card-body">
                  <strong>{activeGroup.feature.title}</strong>
                  <p>{activeGroup.feature.body}</p>
                </div>
              </aside>
            ) : null}
          </section>
        ) : null}
      </div>
    </header>
  )
}
