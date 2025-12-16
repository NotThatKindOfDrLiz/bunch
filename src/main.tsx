import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './index.css'
import { MerchantApp } from './screens/MerchantApp'
import { CustomerApp } from './screens/CustomerApp'
import { Toaster } from 'react-hot-toast'

declare global {
  interface Window {
    bunchVersion?: string
  }
}

window.bunchVersion = '0.1.0'

// Handle GitHub Pages 404 redirect
if (window.location.search.includes('?/')) {
  const path = window.location.search.replace('?/', '').replace(/~and~/g, '&')
  window.history.replaceState({}, '', `${import.meta.env.BASE_URL}${path}`)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/bunch">
      <Routes>
        <Route path="/" element={<Navigate to="/merchant" replace />} />
        <Route path="/merchant" element={<MerchantApp />} />
        <Route path="/customer" element={<CustomerApp />} />
      </Routes>
    </BrowserRouter>
    <Toaster toastOptions={{
      position: 'top-center',
      duration: 3000,
      style: {
        background: '#1D1C1C',
        color: '#FFF5EB',
        borderRadius: '16px',
        padding: '16px 20px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
    }} />
  </React.StrictMode>,
)
