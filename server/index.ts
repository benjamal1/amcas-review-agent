import Fastify from 'fastify'
import staticPlugin from '@fastify/static'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerFileRoutes } from './files.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const CONTENT_DIR = path.resolve(process.env.CONTENT_DIR ?? './content')
const PORT = Number(process.env.PORT ?? 3001)
const HOST = '127.0.0.1'

console.log(`[server] CONTENT_DIR → ${CONTENT_DIR}`)

const app = Fastify({ logger: false })

// Serve built UI (skip in dev — vite handles it)
if (process.env.NODE_ENV === 'production') {
  await app.register(staticPlugin, {
    root: path.join(__dirname, '../public'),
    prefix: '/',
  })
}

// Health
app.get('/api/health', async () => ({ ok: true, contentDir: CONTENT_DIR }))

// File routes (implemented in T3 — stub registered here)
await registerFileRoutes(app, CONTENT_DIR)

await app.listen({ port: PORT, host: HOST })
console.log(`[server] listening on http://${HOST}:${PORT}`)
