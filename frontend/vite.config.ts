import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Listen on all network addresses (0.0.0.0) so mobile and tunnels can connect
    port: 5173,
    strictPort: false,
    allowedHosts: true, // Allow tunnel hostnames like trycloudflare.com and loca.lt
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
})