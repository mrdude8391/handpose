import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// vite.config.js
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // Enables HTTPS
  ],
  server: {
    host: true
  }
})
