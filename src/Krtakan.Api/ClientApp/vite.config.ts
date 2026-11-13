
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'hits-nirvana-medications-discussed.trycloudflare.com'
    ],
    proxy: {
      '/api': 'https://localhost:5076'
    }
  }
})
