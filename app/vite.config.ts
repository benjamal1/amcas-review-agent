import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  const isStatic = process.env.VITE_STATIC === '1'
  return {
    plugins: [react()],
    root: 'app',
    // Static builds use a RELATIVE base so the export is portable — works from any host path
    // (Netlify drop, GitHub Pages project subpath, `npx serve`) without rebuilding. Safe because
    // the app uses HashRouter (document path never changes). Override with VITE_BASE if needed.
    // Dev/server builds stay at / (no prefix).
    base: isStatic ? (process.env.VITE_BASE || './') : '/',
    build: {
      outDir: isStatic ? '../dist-static' : '../dist/public',
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
  }
})
