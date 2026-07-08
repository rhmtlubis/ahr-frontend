import { MessageSquareQuote, PackageCheck, Star } from 'lucide-react'
import { mergeStoreSocialProof } from '../../lib/socialProof'
import { useLanguage } from '../../lib/i18n.jsx'

export default function ProductSocialProof({ cmsTestimonials = [], heroStats = [], organicReviews = [] }) {
  const { language } = useLanguage()
  const content = mergeStoreSocialProof(language, {
    testimonials: cmsTestimonials,
    heroStats,
    organicReviews,
  })

  return (
    <section className="product-social-proof" aria-label={content.title}>
      <div className="product-social-proof-head">
        <p className="product-social-proof-eyebrow">{content.eyebrow}</p>
        <h2>{content.title}</h2>
      </div>

      <ul className="product-social-proof-stats">
        {content.stats.map((stat) => (
          <li key={stat.id}>
            <PackageCheck size={18} aria-hidden="true" />
            <div>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="product-social-proof-reviews">
        {content.reviews.map((review) => (
          <article className="product-social-proof-card" key={review.id}>
            <div className="product-social-proof-card-top">
              <MessageSquareQuote size={16} aria-hidden="true" />
              <div className="product-social-proof-stars" aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} size={14} fill="currentColor" />
                ))}
              </div>
            </div>
            <blockquote>{review.quote}</blockquote>
            <footer>
              <strong>{review.name}</strong>
              <span>
                {review.location} · {review.context}
              </span>
            </footer>
          </article>
        ))}
      </div>

      <p className="product-social-proof-note">{content.proofNote}</p>
    </section>
  )
}
