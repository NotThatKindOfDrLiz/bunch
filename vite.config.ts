import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/bunch/',
  plugins: [react()],
  server: {
    host: true, // Listen on all network interfaces (allows phone access)
    port: 5173,
  },
  build: {
    rollupOptions: {
      // Ensure service worker is copied to dist
      input: {
        main: './index.html',
      },
    },
  },
  publicDir: 'public',
})
