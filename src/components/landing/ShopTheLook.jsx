const lookItems = [
  {
    id: 1,
    image: '/assets/look-1.jpg',
    items: 3,
    title: 'Casual Street Style'
  },
  {
    id: 2,
    image: '/assets/look-2.jpg',
    items: 6,
    title: 'Athletic Performance'
  },
  {
    id: 3,
    image: '/assets/look-3.jpg',
    items: 2,
    title: 'Team Spirit'
  },
  {
    id: 4,
    image: '/assets/look-4.jpg',
    items: 4,
    title: 'Urban Active'
  },
  {
    id: 5,
    image: '/assets/look-5.jpg',
    items: 4,
    title: 'Classic Sport'
  }
]

export default function ShopTheLook() {
  return (
    <section className="shop-the-look-section">
      <div className="section-container">
        <h2 className="section-title-large">SHOP THE LOOK</h2>
        
        <div className="look-grid">
          {lookItems.map((item) => (
            <article key={item.id} className="look-card">
              <div className="look-image">
                <div className="look-placeholder" />
              </div>
              <div className="look-info">
                <span className="look-count">{item.items} items</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
