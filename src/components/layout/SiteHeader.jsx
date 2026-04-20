import { ChevronRight, Menu, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

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
  primaryActionLabel = 'Konsultasi',
  onPrimaryAction,
  onNavInteraction,
  onUtilityInteraction,
}) {
  const [activeNav, setActiveNav] = useState(navGroups[0]?.id || '')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const activeGroup = navGroups.find((group) => group.id === activeNav) ?? navGroups[0]

  const handleNavSelect = (groupId, surface = 'header-nav') => {
    setActiveNav(groupId)
    onNavInteraction?.(groupId, surface)
  }

  const handleMobileMenuClose = (source = 'sidebar') => {
    setMobileMenuOpen(false)
    onNavInteraction?.('mobile-menu-close', source)
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

        <div
          className={mobileMenuOpen ? 'mobile-drawer-backdrop visible' : 'mobile-drawer-backdrop'}
          onClick={() => handleMobileMenuClose('backdrop')}
        />
        <aside className={mobileMenuOpen ? 'mobile-sidebar open' : 'mobile-sidebar'} aria-label="Mobile navigation">
          <div className="mobile-sidebar-header">
            <img className="mobile-sidebar-logo" src="/ahr-brand-logo.webp" alt="AHR logo" />
            <button
              className="mobile-sidebar-close"
              type="button"
              aria-label="Tutup menu"
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
            <img className="brand-mark" src="/ahr-brand-logo.webp" alt="AHR logo" />
          </Link>

          <button
            className="mobile-menu-button"
            type="button"
            aria-label="Toggle menu"
            onClick={() => {
              setMobileMenuOpen((current) => !current)
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
