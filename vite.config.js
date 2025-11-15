import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy configuration for API requests
      // Only used if VITE_API_BASE_URL is empty in .env.local
      // Current setup: Direct requests to dev server (no proxy needed)
      '/api': {
        target: 'http://185.197.194.111:8080',
        changeOrigin: true,
        secure: false, // Allow http (not https)
      }
    }
  }
})
