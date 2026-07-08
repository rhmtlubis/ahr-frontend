import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function MarketplacePageTopbar({ backTo, backLabel, title }) {
  return (
    <div className="marketplace-page-topbar">
      <Link className="marketplace-page-topbar-back" to={backTo}>
        <ChevronLeft size={22} aria-hidden="true" />
        <span>{backLabel}</span>
      </Link>
      <h1 className="marketplace-page-topbar-title">{title}</h1>
      <span className="marketplace-page-topbar-spacer" aria-hidden="true" />
    </div>
  )
}
