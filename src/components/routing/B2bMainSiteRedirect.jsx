import { useEffect } from 'react'
import { getMainSiteUrl } from '../../lib/storeConfig'

export default function B2bMainSiteRedirect({ targetPath = '/kontak-kerja-sama' }) {
  useEffect(() => {
    window.location.replace(`${getMainSiteUrl()}${targetPath}`)
  }, [targetPath])

  return (
    <main className="app-shell">
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '48px 24px',
          color: 'var(--text-700, #314158)',
        }}
      >
        <p style={{ margin: 0 }}>Mengalihkan ke halaman kerja sama AHR...</p>
      </div>
    </main>
  )
}
