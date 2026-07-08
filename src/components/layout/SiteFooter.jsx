import { MapPin, Phone, Store } from 'lucide-react'
import { FaInstagram } from 'react-icons/fa6'
import { useLanguage } from '../../lib/i18n.jsx'
import { getRetailFooterContent, getStoreBrandName, isCssStore } from '../../lib/storeConfig'
import CssBrandMark from '../css/CssBrandMark.jsx'

export default function SiteFooter({
  footerGroups,
  companyProfile,
  contactProfile,
  defaultMapLabel,
  onWhatsAppClick,
  footerMessage,
  bottomText = '© 2026 AHR Printing. Dibangun untuk kebutuhan retail dan teamwear.',
}) {
  const { language, t } = useLanguage()
  const retailFooter = getRetailFooterContent(language)
  const resolvedFooterGroups = retailFooter?.footerGroups ?? footerGroups
  const resolvedContactProfile = retailFooter?.contactProfile ?? contactProfile
  const resolvedFooterMessage = retailFooter?.footerMessage ?? footerMessage
  const companyDescription =
    retailFooter?.companyDescription ||
    companyProfile?.about ||
    t('site.defaultCompanyDescription')
  const resolvedBottomText = retailFooter?.bottomText ?? bottomText
  const showContactCard = !retailFooter?.hideContact
  const showSocial = !retailFooter?.hideSocial
  const socialLinks = retailFooter?.socialLinks ?? []

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          {isCssStore() ? (
            <CssBrandMark className="css-brand-mark--footer" variant="logo" />
          ) : (
            <img className="footer-logo" src="/ahr-brand-logo.webp" alt="AHR logo" width="295" height="295" />
          )}
          <p>{companyDescription}</p>
          {showSocial ? (
            <div className="footer-social">
              {isCssStore() && socialLinks.length > 0 ? (
                socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noreferrer' : undefined}
                  >
                    {String(link.label).toLowerCase().includes('instagram') ? <FaInstagram size={18} /> : <Phone size={18} />}
                  </a>
                ))
              ) : (
                <>
                  <a href={companyProfile.address.mapUrl} aria-label={defaultMapLabel} target="_blank" rel="noreferrer">
                    <MapPin size={18} />
                  </a>
                  <a href="/profil" aria-label={t('common.profileLabel')}>
                    <Store size={18} />
                  </a>
                  <a href="#final-cta" aria-label={t('common.whatsappLabel')}>
                    <Phone size={18} />
                  </a>
                </>
              )}
            </div>
          ) : null}
          {isCssStore() && resolvedContactProfile?.whatsapp_display ? (
            <p className="css-footer-contact-line">
              WhatsApp:{' '}
              <a href={`https://wa.me/${resolvedContactProfile.whatsapp_number}`} target="_blank" rel="noreferrer">
                {resolvedContactProfile.whatsapp_display}
              </a>
            </p>
          ) : null}
        </div>

        <div className="footer-links-grid">
          {resolvedFooterGroups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noreferrer' : undefined}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {showContactCard ? (
          <div className="footer-contact-card">
            <span>{t('common.contact')}</span>
            <h3>{resolvedContactProfile.lockup}</h3>
            <p>{resolvedContactProfile.tagline}</p>
            <button className="cta-button cta-button-dark" type="button" onClick={() => onWhatsAppClick(resolvedFooterMessage)}>
              {t('common.chatWhatsApp')}
            </button>
          </div>
        ) : null}
      </div>

      <div className="footer-bottom">
        <span>{resolvedBottomText}</span>
        <div className="footer-bottom-links">
          {!isCssStore() ? <a href="/profil">{t('common.aboutUs')}</a> : null}
          <a href="/artikel">Blog</a>
          <a href="#hero">{t('common.backToTop')}</a>
        </div>
      </div>
    </footer>
  )
}
