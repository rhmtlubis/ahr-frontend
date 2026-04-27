/* eslint-disable react-refresh/only-export-components */
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AllProductsPage from './AllProductsPage.jsx'
import CartPage from './CartPage.jsx'
import CompanyProfilePage from './CompanyProfilePage.jsx'
import ProductDetailPage from './ProductDetailPage.jsx'
import { CartProvider } from './lib/cart.jsx'
import { LanguageProvider } from './lib/i18n.jsx'
import { initializeAnalytics } from './lib/analytics'
import { getBackendUrl } from './lib/api'
import { hasAnalyticsConsent } from './lib/consent'

if (hasAnalyticsConsent()) {
  initializeAnalytics()
}

function LegacyAdminRedirect() {
  useEffect(() => {
    window.location.replace(getBackendUrl('/cms'))
  }, [])

  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <CartProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/admin/*" element={<LegacyAdminRedirect />} />
            <Route path="/all-products" element={<AllProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profil" element={<CompanyProfilePage />} />
            <Route path="/produk/:productSlug" element={<ProductDetailPage />} />
            <Route path="*" element={<App />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </LanguageProvider>
  </StrictMode>,
)
