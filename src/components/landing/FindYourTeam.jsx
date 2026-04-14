const teams = [
  { id: 1, name: 'Argentina', color: '#75AADB' },
  { id: 2, name: 'Germany', color: '#000000' },
  { id: 3, name: 'Uruguay', color: '#55B5E5' },
  { id: 4, name: 'Mexico', color: '#006847' },
  { id: 5, name: 'Spain', color: '#C8102E' },
  { id: 6, name: 'Italy', color: '#0066CC' }
]

export default function FindYourTeam() {
  return (
    <section className="find-team-section">
      <div className="section-container">
        <h2 className="section-title-large">FIND YOUR TEAM</h2>
        
        <div className="team-grid">
          {teams.map((team) => (
            <article key={team.id} className="team-card">
              <div className="team-jersey" style={{ background: team.color }}>
                {/* Jersey placeholder */}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
