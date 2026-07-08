import { ShieldCheck } from 'lucide-react'
import { useLanguage } from '../../lib/i18n.jsx'
import { getCssCartShippingNote, getCssTrustItems } from '../../lib/cssStoreConfig'

export default function CssTrustBar({ showShippingNote = false, compact = false }) {
  const { language } = useLanguage()
  const items = getCssTrustItems(language)

  return (
    <div className={compact ? 'css-trust-bar css-trust-bar--compact' : 'css-trust-bar'}>
      <ul className="css-trust-bar-list">
        {items.map((item) => (
          <li key={item.id}>
            <ShieldCheck size={15} aria-hidden="true" />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      {showShippingNote ? <p className="css-trust-bar-note">{getCssCartShippingNote(language)}</p> : null}
    </div>
  )
}
