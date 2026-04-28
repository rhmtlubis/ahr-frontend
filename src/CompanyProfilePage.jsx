import { useEffect, useState } from 'react'
import { ArrowRight, MapPin, MessageCircleMore } from 'lucide-react'
import './App.css'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { getApiUrl } from './lib/api'
import { useCart } from './lib/cart.jsx'
import { companyProfilePlaceholderImage } from './lib/cmsContent.js'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'

function buildWhatsAppUrl(phoneNumber, message) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
}

function CompanyProfilePage() {
  const { language, t } = useLanguage()
  const { itemCount } = useCart()
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )

  useEffect(() => {
    fetch(getApiUrl(`/api/catalog/landing-page?locale=${language}`), {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
            throw new Error('Failed to load company profile')
        }

        return response.json()
      })
      .then((payload) => {
        if (payload?.data) {
          setPageContent(getLandingChromeContent(payload.data, { hashPrefix: '/', locale: language }))
        }
      })
      .catch(() => {
        setPageContent(getLandingChromeContent({}, { hashPrefix: '/', locale: language }))
      })
  }, [language])

  const {
    brand,
    companyProfile,
    decorativeMedia,
    footerBottomText,
    footerGroups,
    navGroups,
    sectionContent,
    ticker,
    utilityLinks,
    utilityMessage,
  } =
    pageContent
  const companyProfilePrimaryVisual =
    decorativeMedia.company_profile_primary?.url || companyProfilePlaceholderImage
  const companyProfileSecondaryVisual =
    decorativeMedia.company_profile_secondary?.url || companyProfilePlaceholderImage

  return (
    <div className="app-shell profile-page-shell">
      <SiteHeader
        brandHref="/"
        navGroups={navGroups}
        ticker={ticker}
        utilityAction={{ href: '/#contact', label: t('profile.utilityAction') }}
        utilityLinks={utilityLinks}
        utilityMessage={utilityMessage}
        cartItemCount={itemCount}
        onPrimaryAction={() => {
          window.location.href = '/'
        }}
        primaryActionLabel={t('common.back')}
      />

      <main>
        <section className="content-block section-soft profile-page-intro">
          <div className="section-heading">
            <span>{t('profile.introEyebrow')}</span>
            <h1>{sectionContent.company_profile_intro_title}</h1>
            <p>{sectionContent.company_profile_intro_body}</p>
          </div>
        </section>

        <section className="content-block section-plain company-story" id="about">
          <div className="about-hero-grid">
            <div className="section-heading about-heading">
              <span>{t('profile.aboutEyebrow')}</span>
              <h2>{sectionContent.company_profile_about_heading}</h2>
              <p>{companyProfile.about}</p>
            </div>

            <div className="about-visual-stack">
              <div
                className="about-visual about-visual-primary"
                style={{ backgroundImage: `url(${companyProfilePrimaryVisual})` }}
              />
              <div className="about-visual-column">
                <div
                  className="about-visual about-visual-secondary"
                  style={{ backgroundImage: `url(${companyProfileSecondaryVisual})` }}
                />
                <article className="about-highlight-card">
                  <strong>{t('profile.highlightTitle')}</strong>
                  <p>{t('profile.highlightBody')}</p>
                  <div className="about-highlight-meta">
                    {t('profile.highlightMeta').map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div className="story-grid">
            <article className="story-card story-card-primary">
              <span>{t('profile.historyLabel')}</span>
              <p>{companyProfile.history}</p>
            </article>
            <article className="story-card story-card-secondary">
              <span>{t('profile.commitmentLabel')}</span>
              <p>{companyProfile.commitment}</p>
            </article>
          </div>

          <div className="reason-grid">
            {companyProfile.reasons.map((reason) => (
              <article className="reason-card" key={reason.title}>
                <h3>{reason.title}</h3>
                <p>{reason.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-block section-plain vision-layout" id="vision-mission">
          <div className="section-heading">
            <span>{t('profile.visionEyebrow')}</span>
            <h2>{sectionContent.company_profile_vision_heading}</h2>
          </div>

          <div className="vision-grid">
            <article className="vision-card">
              <span>{t('profile.visionLabel')}</span>
              <p>{companyProfile.vision}</p>
            </article>
            <article className="vision-card">
              <span>{t('profile.missionLabel')}</span>
              <ul className="mission-list">
                {companyProfile.missions.map((mission) => (
                  <li key={mission}>{mission}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="content-block section-soft contact-layout" id="contact">
          <div className="section-heading heading-inline">
            <div>
              <span>{t('profile.contactEyebrow')}</span>
              <h2>{sectionContent.company_profile_contact_heading}</h2>
            </div>
            <a href={companyProfile.address.mapUrl} target="_blank" rel="noreferrer">
              {t('common.openMaps')}
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="contact-grid">
            <article className="contact-card">
              <MapPin size={20} />
              <div>
                <h3>{companyProfile.address.label}</h3>
                <p>{companyProfile.address.line}</p>
              </div>
            </article>
            <article className="contact-card">
              <MessageCircleMore size={20} />
              <div>
                <h3>{t('profile.discussionTitle')}</h3>
                <p>{t('profile.discussionBody')}</p>
              </div>
            </article>
          </div>

          <div className="contact-actions">
            <a
              className="cta-button cta-button-dark"
              href={companyProfile.address.mapUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t('common.mapLabel')}
            >
              {t('common.openLocationInMaps')}
            </a>
            <a
              className="cta-button cta-button-light"
              href={buildWhatsAppUrl(brand.whatsapp_number, t('profile.whatsappMessage'))}
              target="_blank"
              rel="noreferrer"
            >
              {t('common.chatWhatsApp')}
            </a>
          </div>
        </section>
      </main>

      <SiteFooter
        companyProfile={companyProfile}
        contactProfile={brand}
        defaultMapLabel={t('common.mapLabel')}
        footerGroups={footerGroups}
        footerMessage={t('profile.whatsappMessage')}
        bottomText={footerBottomText}
        onWhatsAppClick={(message) => {
          window.open(buildWhatsAppUrl(brand.whatsapp_number, message), '_blank', 'noopener,noreferrer')
        }}
      />
    </div>
  )
}

export default CompanyProfilePage
