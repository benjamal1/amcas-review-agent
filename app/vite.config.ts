import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'app',
  build: {
    outDir: '../dist/public',
    emptyOutDir: true,
  },
  server: {
    host: true,
    proxy: {
      '/api': 'http://127.0.0.1:3001',
      '/pty':   { target: 'ws://127.0.0.1:3001', ws: true },
      '/watch': { target: 'ws://127.0.0.1:3001', ws: true },
    },
  },
})
