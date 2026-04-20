import { MapPin, Phone, Store } from 'lucide-react'

export default function SiteFooter({
  footerGroups,
  companyProfile,
  contactProfile,
  defaultMapLabel,
  onWhatsAppClick,
  footerMessage,
  bottomText = '© 2026 AHR Printing. Dibangun untuk kebutuhan retail dan teamwear.',
}) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img className="footer-logo" src="/ahr-brand-logo.webp" alt="AHR logo" />
          <p>
            CV AHR Printing bergerak di bidang apparel dan percetakan kustom, dengan fokus pada
            sublimasi jersey serta kebutuhan teamwear yang rapi dan mudah diikuti prosesnya.
          </p>
          <div className="footer-social">
            <a href={companyProfile.address.mapUrl} aria-label={defaultMapLabel} target="_blank" rel="noreferrer">
              <MapPin size={18} />
            </a>
            <a href="/profil" aria-label="Profil AHR">
              <Store size={18} />
            </a>
            <a href="#final-cta" aria-label="WhatsApp AHR">
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
          <span>Kontak</span>
          <h3>{contactProfile.lockup}</h3>
          <p>{contactProfile.tagline}</p>
          <button className="cta-button cta-button-dark" type="button" onClick={() => onWhatsAppClick(footerMessage)}>
            Hubungi via WhatsApp
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{bottomText}</span>
        <div className="footer-bottom-links">
          <a href="/profil">Tentang Kami</a>
          <a href="/profil">Visi & Misi</a>
          <a href="#hero">Kembali ke atas</a>
        </div>
      </div>
    </footer>
  )
}
