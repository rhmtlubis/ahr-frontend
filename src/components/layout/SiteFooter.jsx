import { MapPin, Phone, Store } from 'lucide-react'
import { useLanguage } from '../../lib/i18n.jsx'

export default function SiteFooter({
  footerGroups,
  companyProfile,
  contactProfile,
  defaultMapLabel,
  onWhatsAppClick,
  footerMessage,
  bottomText = '© 2026 AHR Printing. Dibangun untuk kebutuhan retail dan teamwear.',
}) {
  const { t } = useLanguage()
  const companyDescription =
    companyProfile?.about ||
    t('site.defaultCompanyDescription')

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img className="footer-logo" src="/ahr-brand-logo.webp" alt="AHR logo" width="295" height="295" />
          <p>{companyDescription}</p>
          <div className="footer-social">
            <a href={companyProfile.address.mapUrl} aria-label={defaultMapLabel} target="_blank" rel="noreferrer">
              <MapPin size={18} />
            </a>
            <a href="/profil" aria-label={t('common.profileLabel')}>
              <Store size={18} />
            </a>
            <a href="#final-cta" aria-label={t('common.whatsappLabel')}>
              <Phone size={18} />
            </a>
          </div>
        </div>

        <div className="footer-links-grid">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-contact-card">
          <span>{t('common.contact')}</span>
          <h3>{contactProfile.lockup}</h3>
          <p>{contactProfile.tagline}</p>
          <button className="cta-button cta-button-dark" type="button" onClick={() => onWhatsAppClick(footerMessage)}>
            {t('common.chatWhatsApp')}
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{bottomText}</span>
        <div className="footer-bottom-links">
          <a href="/profil">{t('common.aboutUs')}</a>
          <a href="/profil">{t('common.visionMission')}</a>
          <a href="#hero">{t('common.backToTop')}</a>
        </div>
      </div>
    </footer>
  )
}
