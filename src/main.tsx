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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/merchant" replace />} />
        <Route path="/merchant" element={<MerchantApp />} />
        <Route path="/customer" element={<CustomerApp />} />
      </Routes>
    </BrowserRouter>
    <Toaster toastOptions={{
      position: 'top-center',
      style: {
        background: '#1D1C1C',
        color: '#FFF5EB',
        borderRadius: '16px',
      },
    }} />
  </React.StrictMode>,
)
