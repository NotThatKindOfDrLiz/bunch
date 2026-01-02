import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './index.css'
import { MerchantApp } from './screens/MerchantApp'
import { CustomerApp } from './screens/CustomerApp'
import { Toaster } from 'react-hot-toast'
import { InstallPrompt } from './components/InstallPrompt'

declare global {
  interface Window {
    bunchVersion?: string
  }
}

window.bunchVersion = '0.1.0'

// Handle GitHub Pages 404 redirect
// When 404.html redirects here with ?/path, extract and navigate
if (window.location.search.includes('?/')) {
  const search = window.location.search
  const pathMatch = search.match(/\?\/+(.+?)(?:&|$)/)
  if (pathMatch) {
    const path = pathMatch[1].replace(/~and~/g, '&')
    const newPath = path.startsWith('/') ? path : '/' + path
    const baseUrl = import.meta.env.BASE_URL.endsWith('/') 
      ? import.meta.env.BASE_URL.slice(0, -1) 
      : import.meta.env.BASE_URL
    window.history.replaceState({}, '', `${baseUrl}${newPath}`)
  }
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const baseUrl = import.meta.env.BASE_URL.endsWith('/') 
      ? import.meta.env.BASE_URL.slice(0, -1) 
      : import.meta.env.BASE_URL
    navigator.serviceWorker
      .register(`${baseUrl}/sw.js`)
      .then((registration) => {
        console.log('[Service Worker] Registered:', registration.scope)
        
        // Check for updates periodically
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000) // Check every hour
      })
      .catch((error) => {
        console.warn('[Service Worker] Registration failed:', error)
      })
  })
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
    <InstallPrompt />
  </React.StrictMode>,
)
