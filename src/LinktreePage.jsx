import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ExternalLink,
  MessageCircle,
  PhoneCall,
} from 'lucide-react'
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import './LinktreePage.css'
import useDocumentTitle from './lib/useDocumentTitle'

const marketingContacts = [
  {
    label: 'Marketing 1',
    phoneDisplay: '0877-1186-8290',
    phoneRaw: '6287711868290',
    note: 'Order, desain, dan konsultasi sublimasi Agent 1.',
  },
  {
    label: 'Marketing 2',
    phoneDisplay: '0812-9852-5901',
    phoneRaw: '6281298525901',
    note: 'Order, desain, dan konsultasi sublimasi Agent 2.',
  },
]

const socialLinks = [
  {
    label: 'Instagram AHR',
    href: 'https://www.instagram.com/ahr.printingsublimasi?igsh=NHZ6dXpqb2Fwbmhl',
    accent: 'instagram',
    description: 'Update produk',
    icon: FaInstagram,
  },
  {
    label: 'TikTok AHR',
    href: 'https://www.tiktok.com/@ahrprintingsublimation?_r=1&_t=ZS-95uNcbuXVe4',
    accent: 'tiktok',
    description: 'Video produksi',
    icon: FaTiktok,
  },
  {
    label: 'Facebook AHR',
    href: 'https://web.facebook.com/profile.php?id=61581033434195',
    accent: 'facebook',
    description: 'Info promosi',
    icon: FaFacebookF,
  },
]

function buildWhatsAppUrl(phoneRaw) {
  const text = encodeURIComponent('Halo AHR, saya ingin tanya info produk dan pemesanan.')
  return `https://wa.me/${phoneRaw}?text=${text}`
}

export default function LinktreePage() {
  useDocumentTitle(
    'Kontak Marketing Jersey Custom & Sublimasi',
    'Hubungi tim marketing AHR untuk order jersey custom, konsultasi desain sublimasi, dan informasi pemesanan apparel printing.',
  )

  return (
    <main className="linktree-shell">
      <div className="linktree-background" aria-hidden="true">
        <span className="linktree-orb linktree-orb-one" />
        <span className="linktree-orb linktree-orb-two" />
        <span className="linktree-grid" />
      </div>

      <section className="linktree-card">
        <Link className="linktree-back-link" to="/">
          <ArrowLeft size={16} />
          <span>Kembali ke website</span>
        </Link>

        <div className="linktree-brand">
          <div className="linktree-logo-ring">
            <img className="linktree-logo" src="/ahr-brand-logo.webp" alt="AHR logo" />
          </div>
          <span className="linktree-eyebrow">AHR Printing Sublimasi</span>
          <h1>Kontak AHR</h1>
          <p>
            Pilih marketing atau sosial media yang ingin kamu buka.
          </p>
          <div className="linktree-badges">
            <span>
              <BadgeCheck size={15} />
              Respon cepat
            </span>
            <span>
              <BadgeCheck size={15} />
              Siap bantu order
            </span>
          </div>
        </div>

        <div className="linktree-section">
          <div className="linktree-section-heading">
            <h2>Info Marketing</h2>
            <p>Pilih nomor yang ingin dihubungi.</p>
          </div>

          <div className="linktree-list">
            {marketingContacts.map((contact) => (
              <article className="linktree-item contact-item" key={contact.phoneRaw}>
                <div className="linktree-item-copy">
                  <span className="linktree-item-label">{contact.label}</span>
                  <strong>{contact.phoneDisplay}</strong>
                  <p>{contact.note}</p>
                </div>
                <div className="linktree-item-actions">
                  <a href={`tel:${contact.phoneRaw}`}>Telepon</a>
                  <a href={buildWhatsAppUrl(contact.phoneRaw)} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="linktree-section">
          <div className="linktree-section-heading">
            <h2>Sosial Media</h2>
            <p>Channel resmi AHR.</p>
          </div>

          <div className="linktree-list">
            {socialLinks.map((item) => {
              const Icon = item.icon

              return (
                <a
                  className={`linktree-item social-item accent-${item.accent}`}
                  href={item.href}
                  key={item.label}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="linktree-social-icon">
                    <Icon size={20} />
                  </div>
                  <div className="linktree-item-copy">
                    <span className="linktree-item-label">{item.label}</span>
                  </div>
                  <ArrowRight size={18} />
                </a>
              )
            })}
          </div>
        </div>

        <div className="linktree-quick-actions">
          <Link className="quick-action primary" to="/all-products">
            <ExternalLink size={18} />
            <span>Lihat katalog produk</span>
          </Link>
          <Link className="quick-action" to="/profil">
            <PhoneCall size={18} />
            <span>Profil perusahaan</span>
          </Link>
          <Link className="quick-action" to="/">
            <MessageCircle size={18} />
            <span>Landing page utama</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
