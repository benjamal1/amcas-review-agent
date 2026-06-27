import Fastify from 'fastify'
import staticPlugin from '@fastify/static'
import websocketPlugin from '@fastify/websocket'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync, cpSync } from 'node:fs'
import { registerFileRoutes } from './files.js'
import { registerRubricRoutes } from './rubrics.js'
import { registerSchoolRoutes } from './schools.js'
import { registerPtyRoute } from './pty.js'
import { registerWatchRoute } from './watch.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const CONTENT_DIR = path.resolve(process.env.CONTENT_DIR ?? './content')
// resolved against cwd (= repo root in both `npm run dev:server` and `npm start`)
const RUBRICS_DIR = path.resolve(process.env.RUBRICS_DIR ?? 'Agent/rubrics')
const PORT = Number(process.env.PORT ?? 3001)
const HOST = '127.0.0.1'

// First-run: seed content/ from content.example/ if absent
const contentExample = new URL('../../content.example', import.meta.url).pathname
if (!existsSync(CONTENT_DIR) && existsSync(contentExample)) {
  cpSync(contentExample, CONTENT_DIR, { recursive: true })
  console.log(`[server] First run — copied content.example → ${CONTENT_DIR}`)
}

console.log(`[server] CONTENT_DIR → ${CONTENT_DIR}`)

const app = Fastify({ logger: false })
await app.register(websocketPlugin)

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
registerRubricRoutes(app, RUBRICS_DIR)
registerSchoolRoutes(app, CONTENT_DIR)

registerPtyRoute(app, CONTENT_DIR)
registerWatchRoute(app, CONTENT_DIR)

await app.listen({ port: PORT, host: HOST })
console.log(`[server] listening on http://${HOST}:${PORT}`)
