import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminApp from './admin/AdminApp.jsx'
import CompanyProfilePage from './CompanyProfilePage.jsx'
import ProductDetailPage from './ProductDetailPage.jsx'
import { initializeAnalytics } from './lib/analytics'

initializeAnalytics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/admin/leads/:leadId" element={<AdminApp />} />
        <Route path="/profil" element={<CompanyProfilePage />} />
        <Route path="/produk/:productSlug" element={<ProductDetailPage />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
