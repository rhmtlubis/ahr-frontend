import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ShieldCheck } from 'lucide-react'
import CssTrustBar from './CssTrustBar.jsx'
import {
  getCssProductFantasyDisclaimer,
  getCssProductFaqItems,
  shouldShowCssFantasyDisclaimer,
} from '../../lib/cssProductContent'
import { useLanguage } from '../../lib/i18n.jsx'

function FaqItem({ item, open, onToggle }) {
  return (
    <div className={open ? 'css-product-faq-item open' : 'css-product-faq-item'}>
      <button className="css-product-faq-trigger" type="button" onClick={onToggle} aria-expanded={open}>
        <span>{item.question}</span>
        <ChevronDown size={18} />
      </button>
      {open ? <p className="css-product-faq-answer">{item.answer}</p> : null}
    </div>
  )
}

export default function CssProductTrustPanel({ product, showTrustBar = false }) {
  const { language } = useLanguage()
  const faqItems = useMemo(
    () => getCssProductFaqItems(product, language),
    [product?.slug, product?.categoryId, product?.category_slug, product?.category, language],
  )
  const showFantasyDisclaimer = shouldShowCssFantasyDisclaimer(product)
  const [openFaqId, setOpenFaqId] = useState(() => faqItems[0]?.id || '')

  useEffect(() => {
    setOpenFaqId(faqItems[0]?.id || '')
  }, [product?.slug, language, faqItems])

  return (
    <section className="css-product-trust-panel" aria-label={language === 'en' ? 'Product FAQ' : 'FAQ produk'}>
      {showTrustBar ? <CssTrustBar compact /> : null}

      {showFantasyDisclaimer ? (
        <div className="css-product-fantasy-disclaimer">
          <ShieldCheck size={18} aria-hidden="true" />
          <div>
            <strong>{language === 'en' ? 'Fantasy design notice' : 'Catatan desain fantasy'}</strong>
            <p>{getCssProductFantasyDisclaimer(language)}</p>
          </div>
        </div>
      ) : null}

      <div className="css-product-faq">
        <h2>{language === 'en' ? 'Product FAQ' : 'FAQ produk'}</h2>
        <div className="css-product-faq-list">
          {faqItems.map((item) => (
            <FaqItem
              key={item.id}
              item={item}
              open={openFaqId === item.id}
              onToggle={() => setOpenFaqId((current) => (current === item.id ? '' : item.id))}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
