export default function HeroSplit() {
  return (
    <section className="hero-split-section">
      <div className="hero-split-grid">
        {/* Left Panel */}
        <article className="hero-split-panel hero-split-large">
          <div className="hero-split-content">
            <span className="hero-split-label">CLIMACOOL</span>
            <p className="hero-split-tagline">The future now.</p>
            <div className="hero-split-actions">
              <button className="button button-light">Shop now</button>
              <button className="button button-outline-light">Discover more</button>
            </div>
          </div>
        </article>

        {/* Center Panel */}
        <article className="hero-split-panel hero-split-medium">
          <div className="hero-split-content">
            {/* Empty for image focus */}
          </div>
        </article>

        {/* Right Panel */}
        <article className="hero-split-panel hero-split-small">
          <div className="hero-split-content">
            {/* Product focus */}
          </div>
        </article>
      </div>
    </section>
  )
}
