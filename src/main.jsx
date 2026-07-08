/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './index.css'
import './brands/css.css'
import { CartProvider } from './lib/cart.jsx'
import { CustomerProvider } from './lib/customer.jsx'
import { LanguageProvider } from './lib/i18n.jsx'
import { initializeAnalytics, sanitizeAnalyticsPath, trackPageView, updateConsent } from './lib/analytics'
import { syncCssMetaPixelTracking } from './lib/metaPixel'
import { getBackendUrl } from './lib/api'
import { captureMarketingAttribution } from './lib/attribution'
import { getConsentPreferences } from './lib/consent'
import { isB2cOnlyStore, isCssStore } from './lib/storeConfig'
import RouteScrollManager from './components/routing/RouteScrollManager.jsx'
import B2bMainSiteRedirect from './components/routing/B2bMainSiteRedirect.jsx'
import CartRecoveryBanner from './components/cart/CartRecoveryBanner.jsx'

if (isCssStore()) {
  document.documentElement.dataset.brandSkin = 'css'

  const fontLink = document.createElement('link')
  fontLink.rel = 'stylesheet'
  fontLink.href =
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&display=swap'
  document.head.appendChild(fontLink)

  const faviconLink = document.querySelector("link[rel='icon']")
  if (faviconLink) {
    faviconLink.type = 'image/x-icon'
    faviconLink.href = '/css-favicon.ico'
  }
}

const App = lazy(() => import('./App.jsx'))
const CssHomePage = lazy(() => import('./CssHomePage.jsx'))
const AllProductsPage = lazy(() => import('./AllProductsPage.jsx'))
const CategoryPage = lazy(() => import('./CategoryPage.jsx'))
const CartPage = lazy(() => import('./CartPage.jsx'))
const CompanyProfilePage = lazy(() => import('./CompanyProfilePage.jsx'))
const CustomerAccountPage = lazy(() => import('./CustomerAccountPage.jsx'))
const CustomerOrderDetailPage = lazy(() => import('./CustomerOrderDetailPage.jsx'))
const B2BLandingPage = lazy(() => import('./B2BLandingPage.jsx'))
const ArticlesPage = lazy(() => import('./ArticlesPage.jsx'))
const ArticleDetailPage = lazy(() => import('./ArticleDetailPage.jsx'))
const LinktreePage = lazy(() => import('./LinktreePage.jsx'))
const CssLinktreePage = lazy(() => import('./CssLinktreePage.jsx'))
const OrianaChannelPage = lazy(() => import('./OrianaChannelPage.jsx'))
const ProductDetailPage = lazy(() => import('./ProductDetailPage.jsx'))
const PaymentResultPage = lazy(() => import('./PaymentResultPage.jsx'))
const TermsAndConditionsPage = lazy(() => import('./TermsAndConditionsPage.jsx'))
const InternationalShippingPage = lazy(() => import('./InternationalShippingPage.jsx'))

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

    if (initializeAnalytics()) {
      updateConsent(consentPreferences)
      trackPageView(sanitizeAnalyticsPath(location.pathname, location.search))
    }

    if (isCssStore()) {
      syncCssMetaPixelTracking(consentPreferences)
    }
  }, [location.pathname, location.search])

  return null
}

createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <CustomerProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CartProvider>
          <RouteScrollManager />
          <AnalyticsRouteTracker />
          <CartRecoveryBanner />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/admin/*" element={<LegacyAdminRedirect />} />
              <Route path="/all-products" element={<AllProductsPage />} />
              <Route path="/kategori/:categoryId" element={<CategoryPage />} />
              <Route path="/cart/*" element={<CartPage />} />
              <Route path="/akun" element={<CustomerAccountPage />} />
              <Route path="/akun/pesanan/:orderNumber" element={<CustomerOrderDetailPage />} />
              <Route path="/artikel" element={<ArticlesPage />} />
              <Route path="/artikel/:articleSlug" element={<ArticleDetailPage />} />
              {isB2cOnlyStore() ? (
                <>
                  <Route path="/b2b" element={<B2bMainSiteRedirect targetPath="/b2b" />} />
                  <Route path="/kontak-kerja-sama" element={<B2bMainSiteRedirect />} />
                </>
              ) : (
                <>
                  <Route path="/b2b" element={<B2BLandingPage />} />
                  <Route path="/kontak-kerja-sama" element={<B2BLandingPage />} />
                </>
              )}
              <Route path="/linktree" element={isCssStore() ? <CssLinktreePage /> : <LinktreePage />} />
              <Route path="/oriana-channel" element={<OrianaChannelPage />} />
              <Route path="/profil" element={<CompanyProfilePage />} />
              <Route path="/syarat-ketentuan" element={<TermsAndConditionsPage />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
              <Route path="/pengiriman-internasional" element={<InternationalShippingPage />} />
              <Route path="/international-shipping" element={<InternationalShippingPage />} />
              <Route path="/produk/:productSlug" element={<ProductDetailPage />} />
              <Route path="/payment/success" element={<PaymentResultPage status="success" />} />
              <Route path="/payment/pending" element={<PaymentResultPage status="pending" />} />
              <Route path="/payment/unfinish" element={<PaymentResultPage status="pending" />} />
              <Route path="/payment/error" element={<PaymentResultPage status="error" />} />
              {isB2cOnlyStore() && isCssStore() ? (
                <Route path="/" element={<CssHomePage />} />
              ) : isB2cOnlyStore() ? (
                <Route path="/" element={<Navigate to="/all-products" replace />} />
              ) : null}
              <Route path="*" element={<App />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </BrowserRouter>
    </CustomerProvider>
  </LanguageProvider>,
)
