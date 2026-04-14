const categories = [
  {
    title: 'FOOTWEAR',
    links: ['Running Shoes', 'Football Boots', 'Basketball Shoes', 'Gym Shoes']
  },
  {
    title: 'BOTTOMS',
    links: ['Running Shorts', 'Football Shorts', 'Basketball Shorts', 'Gym Shorts']
  },
  {
    title: 'TOPS',
    links: ['Running Singlet', 'Football Jerseys', 'Basketball Jerseys', 'Gym Shirt']
  },
  {
    title: 'ACCESSORIES',
    links: ['Running Socks', 'Goalkeeper Gloves', 'Caps & Hats', 'Sports Bras']
  }
]

export default function CategoryLinks() {
  return (
    <section className="category-links-section">
      <div className="section-container">
        <div className="category-columns">
          {categories.map((category) => (
            <div key={category.title} className="category-column">
              <h3>{category.title}</h3>
              <ul>
                {category.links.map((link) => (
                  <li key={link}>
                    <a href="#katalog">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
