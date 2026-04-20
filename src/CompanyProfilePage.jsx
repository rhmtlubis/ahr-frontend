import { ArrowRight, MapPin, MessageCircleMore } from 'lucide-react'
import './App.css'
import { companyProfileContent } from './content/companyProfile'
import { sharedFooterGroups, sharedNavGroups } from './content/siteChrome'
import industrialSewingWorkshop from './assets/product-cards/industrial-sewing-workshop.jpg'
import footballJerseysBerlin from './assets/product-cards/football-jerseys-berlin.webp'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'

const whatsappNumber = '6281234567890'
const defaultMapLabel = 'Buka lokasi AHR Printing di Google Maps'

function buildWhatsAppUrl(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

function CompanyProfilePage() {
  return (
    <div className="app-shell profile-page-shell">
      <SiteHeader
        brandHref="/"
        navGroups={sharedNavGroups.map((item) => ({
          ...item,
          columns: item.columns.map((column) => ({
            ...column,
            links: column.links.map((link) => ({
              ...link,
              href: link.href.startsWith('#') ? `/${link.href}` : link.href,
            })),
          })),
        }))}
        ticker="AHR Unified Homepage. Bulk order consultation and retail collection in one flow."
        utilityAction={{ href: '/#contact', label: 'Hubungi tim' }}
        utilityLinks={[
          { label: 'Kategori', href: '/#categories' },
          { label: 'Produk', href: '/#products' },
          { label: 'FAQ', href: '/#faq' },
          { label: 'Alamat', href: '/#contact' },
        ]}
        utilityMessage="Informasi perusahaan AHR tetap terhubung dengan flow produk dan konsultasi."
        onPrimaryAction={() => {
          window.location.href = '/'
        }}
        primaryActionLabel="Kembali"
      />

      <main>
        <section className="content-block section-soft profile-page-intro">
          <div className="section-heading">
            <span>Profil Perusahaan</span>
            <h1>Informasi perusahaan AHR kami pisahkan ke halaman ini agar halaman depan tetap ringkas.</h1>
            <p>
              Di sini pengunjung bisa membaca profil, visi, misi, dan lokasi perusahaan tanpa
              mengganggu fokus halaman utama yang sekarang lebih diarahkan ke produk dan konsultasi.
            </p>
          </div>
        </section>

        <section className="content-block section-plain company-story" id="about">
          <div className="about-hero-grid">
            <div className="section-heading about-heading">
              <span>Tentang Kami</span>
              <h2>AHR PRINTING fokus pada jersey custom dengan proses yang rapi dan pelayanan yang responsif.</h2>
              <p>{companyProfileContent.about}</p>
            </div>

            <div className="about-visual-stack">
              <div
                className="about-visual about-visual-primary"
                style={{ backgroundImage: `url(${industrialSewingWorkshop})` }}
              />
              <div className="about-visual-column">
                <div
                  className="about-visual about-visual-secondary"
                  style={{ backgroundImage: `url(${footballJerseysBerlin})` }}
                />
                <article className="about-highlight-card">
                  <strong>Katapang, Kabupaten Bandung</strong>
                  <p>
                    Workshop kami menjadi titik kerja untuk desain, printing, finishing, dan
                    koordinasi order agar hasil tetap rapi, tajam, dan tahan lama.
                  </p>
                  <div className="about-highlight-meta">
                    <span>Sejak 2020</span>
                    <span>Fokus pada jersey custom</span>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div className="story-grid">
            <article className="story-card story-card-primary">
              <span>Sejak 2020</span>
              <p>{companyProfileContent.history}</p>
            </article>
            <article className="story-card story-card-secondary">
              <span>Cara Kami Bekerja</span>
              <p>{companyProfileContent.commitment}</p>
            </article>
          </div>

          <div className="reason-grid">
            {companyProfileContent.reasons.map((reason) => (
              <article className="reason-card" key={reason.title}>
                <h3>{reason.title}</h3>
                <p>{reason.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-block section-plain vision-layout" id="vision-mission">
          <div className="section-heading">
            <span>Visi & Misi</span>
            <h2>Visi dan misi tetap tersedia, tetapi sekarang ada di halaman khusus agar lebih nyaman dibaca.</h2>
          </div>

          <div className="vision-grid">
            <article className="vision-card">
              <span>Visi AHR Printing</span>
              <p>{companyProfileContent.vision}</p>
            </article>
            <article className="vision-card">
              <span>Misi AHR Printing</span>
              <ul className="mission-list">
                {companyProfileContent.missions.map((mission) => (
                  <li key={mission}>{mission}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="content-block section-soft contact-layout" id="contact">
          <div className="section-heading heading-inline">
            <div>
              <span>Alamat & Kontak</span>
              <h2>Kunjungi workshop kami atau lanjutkan diskusi lewat WhatsApp.</h2>
            </div>
            <a href={companyProfileContent.address.mapUrl} target="_blank" rel="noreferrer">
              Buka Maps
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="contact-grid">
            <article className="contact-card">
              <MapPin size={20} />
              <div>
                <h3>{companyProfileContent.address.label}</h3>
                <p>{companyProfileContent.address.line}</p>
              </div>
            </article>
            <article className="contact-card">
              <MessageCircleMore size={20} />
              <div>
                <h3>Diskusi Kebutuhan</h3>
                <p>Tim AHR siap membantu kebutuhan custom jersey untuk tim maupun order personal.</p>
              </div>
            </article>
          </div>

          <div className="contact-actions">
            <a
              className="cta-button cta-button-dark"
              href={companyProfileContent.address.mapUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={defaultMapLabel}
            >
              Buka Lokasi di Google Maps
            </a>
            <a
              className="cta-button cta-button-light"
              href={buildWhatsAppUrl('Halo AHR, saya ingin konsultasi kebutuhan custom jersey.')}
              target="_blank"
              rel="noreferrer"
            >
              Chat WhatsApp
            </a>
          </div>
        </section>
      </main>

      <SiteFooter
        companyProfile={companyProfileContent}
        contactProfile={{
          lockup: 'CV AHR Printing',
          tagline: 'Apparel dan percetakan kustom dengan spesialisasi sublimasi jersey.',
        }}
        defaultMapLabel={defaultMapLabel}
        footerGroups={sharedFooterGroups.map((group) => ({
          ...group,
          links: group.links.map((link) => ({
            ...link,
            href: link.href.startsWith('#') ? `/${link.href}` : link.href,
          })),
        }))}
        footerMessage="Halo AHR, saya ingin konsultasi kebutuhan custom jersey."
        onWhatsAppClick={(message) => {
          window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer')
        }}
      />
    </div>
  )
}

export default CompanyProfilePage
