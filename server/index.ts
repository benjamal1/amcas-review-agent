import Fastify from 'fastify'
import staticPlugin from '@fastify/static'
import websocketPlugin from '@fastify/websocket'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerFileRoutes } from './files.js'
import { registerRubricRoutes } from './rubrics.js'
import { registerAgentConfigRoutes } from './agent-config.js'
import { registerSchoolRoutes } from './schools.js'
import { registerPtyRoute } from './pty.js'
import { registerWatchRoute } from './watch.js'
import { registerConfigRoutes, resolveContentDir } from './config.js'
import { registerResetRoute } from './reset.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// resolved against cwd (= repo root in both `npm run dev:server` and `npm start`)
const REPO_ROOT = process.cwd()
const CONTENT_DIR = resolveContentDir(REPO_ROOT)
const RUBRICS_DIR = path.resolve(process.env.RUBRICS_DIR ?? 'Agent/rubrics')
const PORT = Number(process.env.PORT ?? 3001)
const HOST = '127.0.0.1'

// content/ ships with the repo (demo data pre-filled) — no first-run seed needed.
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
registerAgentConfigRoutes(app, process.cwd())
registerSchoolRoutes(app, CONTENT_DIR)
registerConfigRoutes(app, REPO_ROOT, CONTENT_DIR)
registerResetRoute(app, CONTENT_DIR)

registerPtyRoute(app, CONTENT_DIR)
registerWatchRoute(app, CONTENT_DIR)

await app.listen({ port: PORT, host: HOST })
console.log(`[server] listening on http://${HOST}:${PORT}`)
