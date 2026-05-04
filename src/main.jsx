/* eslint-disable react-refresh/only-export-components */
import { Suspense, StrictMode, lazy, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import './index.css'
import { CartProvider } from './lib/cart.jsx'
import { LanguageProvider } from './lib/i18n.jsx'
import { initializeAnalytics, trackPageView } from './lib/analytics'
import { getBackendUrl } from './lib/api'
import { captureMarketingAttribution } from './lib/attribution'
import { hasAnalyticsConsent } from './lib/consent'

const App = lazy(() => import('./App.jsx'))
const AllProductsPage = lazy(() => import('./AllProductsPage.jsx'))
const CartPage = lazy(() => import('./CartPage.jsx'))
const CompanyProfilePage = lazy(() => import('./CompanyProfilePage.jsx'))
const LinktreePage = lazy(() => import('./LinktreePage.jsx'))
const ProductDetailPage = lazy(() => import('./ProductDetailPage.jsx'))

function LegacyAdminRedirect() {
  useEffect(() => {
    window.location.replace(getBackendUrl('/cms'))
  }, [])

  return null
}

function RouteFallback() {
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
        <p style={{ margin: 0 }}>Loading...</p>
      </div>
    </main>
  )
}

function AnalyticsRouteTracker() {
  const location = useLocation()

  useEffect(() => {
    captureMarketingAttribution()

    if (!hasAnalyticsConsent()) {
      return
    }

    if (initializeAnalytics()) {
      trackPageView(`${location.pathname}${location.search}`)
    }
  }, [location.pathname, location.search])

  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <CartProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AnalyticsRouteTracker />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/admin/*" element={<LegacyAdminRedirect />} />
              <Route path="/all-products" element={<AllProductsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/linktree" element={<LinktreePage />} />
              <Route path="/profil" element={<CompanyProfilePage />} />
              <Route path="/produk/:productSlug" element={<ProductDetailPage />} />
              <Route path="*" element={<App />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </LanguageProvider>
  </StrictMode>,
)
