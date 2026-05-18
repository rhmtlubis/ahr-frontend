/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import './index.css'
import { CartProvider } from './lib/cart.jsx'
import { CustomerProvider } from './lib/customer.jsx'
import { LanguageProvider } from './lib/i18n.jsx'
import { initializeAnalytics, trackPageView, updateConsent } from './lib/analytics'
import { getBackendUrl } from './lib/api'
import { captureMarketingAttribution } from './lib/attribution'
import { getConsentPreferences } from './lib/consent'

const App = lazy(() => import('./App.jsx'))
const AllProductsPage = lazy(() => import('./AllProductsPage.jsx'))
const CategoryPage = lazy(() => import('./CategoryPage.jsx'))
const CartPage = lazy(() => import('./CartPage.jsx'))
const CompanyProfilePage = lazy(() => import('./CompanyProfilePage.jsx'))
const CustomerAccountPage = lazy(() => import('./CustomerAccountPage.jsx'))
const B2BLandingPage = lazy(() => import('./B2BLandingPage.jsx'))
const ArticlesPage = lazy(() => import('./ArticlesPage.jsx'))
const ArticleDetailPage = lazy(() => import('./ArticleDetailPage.jsx'))
const LinktreePage = lazy(() => import('./LinktreePage.jsx'))
const ProductDetailPage = lazy(() => import('./ProductDetailPage.jsx'))
const PaymentResultPage = lazy(() => import('./PaymentResultPage.jsx'))

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

    const consentPreferences = getConsentPreferences()
    updateConsent(consentPreferences)

    if (initializeAnalytics()) {
      trackPageView(`${location.pathname}${location.search}`)
    }
  }, [location.pathname, location.search])

  return null
}

createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <CustomerProvider>
      <CartProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AnalyticsRouteTracker />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/admin/*" element={<LegacyAdminRedirect />} />
              <Route path="/all-products" element={<AllProductsPage />} />
              <Route path="/kategori/:categoryId" element={<CategoryPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/akun" element={<CustomerAccountPage />} />
              <Route path="/artikel" element={<ArticlesPage />} />
              <Route path="/artikel/:articleSlug" element={<ArticleDetailPage />} />
              <Route path="/b2b" element={<B2BLandingPage />} />
              <Route path="/kontak-kerja-sama" element={<B2BLandingPage />} />
              <Route path="/linktree" element={<LinktreePage />} />
              <Route path="/profil" element={<CompanyProfilePage />} />
              <Route path="/produk/:productSlug" element={<ProductDetailPage />} />
              <Route path="/payment/success" element={<PaymentResultPage status="success" />} />
              <Route path="/payment/pending" element={<PaymentResultPage status="pending" />} />
              <Route path="/payment/unfinish" element={<PaymentResultPage status="pending" />} />
              <Route path="/payment/error" element={<PaymentResultPage status="error" />} />
              <Route path="*" element={<App />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </CustomerProvider>
  </LanguageProvider>,
)
