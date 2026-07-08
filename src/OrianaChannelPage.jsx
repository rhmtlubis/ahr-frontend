import { useEffect } from 'react'
import { ArrowRight, Store } from 'lucide-react'
import { FaInstagram, FaWhatsapp } from 'react-icons/fa6'
import './OrianaChannelPage.css'
import { initializeMetaPixel, trackMetaPixelEvent } from './lib/metaPixel'
import { isCssStore } from './lib/storeConfig'
import useDocumentTitle from './lib/useDocumentTitle'

const ORIANA_META_PIXEL_ID =
  import.meta.env.VITE_META_PIXEL_ORIANA_ID || '27046894451626338'

const channelLinks = [
  {
    label: 'Shopee',
    description: 'Belanja jersey & apparel Oriana',
    href: 'https://shopee.co.id/universal-link/orianajersey?deep_and_web=1&smtt=9&utm_campaign=s1420732173_ss_id_igbp_instagramorganic&utm_medium=seller&utm_source=instagram',
    accent: 'shopee',
    icon: Store,
  },
  {
    label: 'WhatsApp',
    description: '+62 898-9226-578',
    href: 'https://wa.me/628989226578?text=Halo%20Oriana%2C%20saya%20ingin%20tanya%20info%20produk.',
    accent: 'whatsapp',
    icon: FaWhatsapp,
  },
  {
    label: 'Instagram',
    description: '@orianaapparel.id',
    href: 'https://www.instagram.com/orianaapparel.id?igsh=MXY5dzBwbHEya3ZraQ==',
    accent: 'instagram',
    icon: FaInstagram,
  },
]

export default function OrianaChannelPage() {
  useDocumentTitle(
    'Oriana Apparel — Official Channel',
    'Temukan Oriana Apparel di Shopee, WhatsApp, dan Instagram. Jersey original & apparel olahraga.',
    {
      canonicalPath: '/oriana-channel',
      image: '/oriana-apparel-logo.png',
      imageAlt: 'Logo Oriana Apparel',
      keywords: 'Oriana Apparel, Oriana jersey, jersey original, Shopee Oriana, kontak Oriana',
      locale: 'id',
      type: 'website',
    },
  )

  useEffect(() => {
    if (isCssStore()) {
      return
    }

    initializeMetaPixel(ORIANA_META_PIXEL_ID)
  }, [])

  const handleChannelClick = (label) => {
    trackMetaPixelEvent('Lead', {
      content_name: label,
      content_category: 'oriana_channel_link',
    })
  }

  return (
    <main className="oriana-channel-shell">
      <div className="oriana-channel-background" aria-hidden="true">
        <span className="oriana-channel-orb oriana-channel-orb-one" />
        <span className="oriana-channel-orb oriana-channel-orb-two" />
        <span className="oriana-channel-stripe" />
      </div>

      <section className="oriana-channel-card">
        <div className="oriana-channel-brand">
          <div className="oriana-channel-logo-wrap">
            <img
              className="oriana-channel-logo"
              src="/oriana-apparel-logo.png"
              alt="Oriana Apparel"
              width="320"
              height="320"
            />
          </div>
          <p className="oriana-channel-tagline">Original Jersey &amp; Apparel</p>
        </div>

        <nav className="oriana-channel-links" aria-label="Oriana official links">
          {channelLinks.map((item) => {
            const Icon = item.icon

            return (
              <a
                className={`oriana-channel-link accent-${item.accent}`}
                href={item.href}
                key={item.label}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleChannelClick(item.label)}
              >
                <span className="oriana-channel-link-icon">
                  <Icon size={20} />
                </span>
                <span className="oriana-channel-link-copy">
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </span>
                <ArrowRight size={18} className="oriana-channel-link-arrow" />
              </a>
            )
          })}
        </nav>

        <footer className="oriana-channel-footer">
          <p>All Right Reserved &copy;{new Date().getFullYear()}. Oriana Apparel</p>
        </footer>
      </section>
    </main>
  )
}
