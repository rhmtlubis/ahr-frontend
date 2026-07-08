export default function CssBrandMark({ className = '', variant = 'logo' }) {
  if (variant === 'logo') {
    return (
      <span className={['css-brand-logo-shell', className].filter(Boolean).join(' ')}>
        <img
          className="css-brand-logo-image"
          src="/css-brand-logo.gif"
          alt="CS Studio"
          width="500"
          height="500"
          loading="eager"
          decoding="async"
        />
      </span>
    )
  }

  return (
    <span className={['css-brand-wordmark', className].filter(Boolean).join(' ')}>
      <span className="css-brand-wordmark-primary">CS</span>
      <span className="css-brand-wordmark-secondary">Studio.</span>
    </span>
  )
}
