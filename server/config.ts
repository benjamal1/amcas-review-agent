import type { FastifyInstance } from 'fastify'
import fs from 'node:fs'
import path from 'node:path'

// Local override for CONTENT_DIR, settable from the Settings page without editing shell env.
// CONTENT_DIR env var (if set) always wins over this — the override is for the common case of
// "I ran npm run dev with no env var and now want to point at a different folder."
const CONFIG_FILE = (repoRoot: string) => path.join(repoRoot, '.local-config.json')

export function resolveContentDir(repoRoot: string): string {
  if (process.env.CONTENT_DIR) return path.resolve(process.env.CONTENT_DIR)
  try {
    const raw = fs.readFileSync(CONFIG_FILE(repoRoot), 'utf8')
    const cfg = JSON.parse(raw) as { contentDir?: string }
    if (cfg.contentDir) return path.resolve(cfg.contentDir)
  } catch { /* no override file yet — use default */ }
  return path.resolve(repoRoot, 'content')
}

export function registerConfigRoutes(app: FastifyInstance, repoRoot: string, currentContentDir: string) {
  app.get('/api/config', async () => ({
    contentDir: currentContentDir,
    envOverride: !!process.env.CONTENT_DIR,
  }))

  app.post<{ Body: { contentDir?: string } }>('/api/config', async (req, reply) => {
    if (process.env.CONTENT_DIR) {
      return reply.code(400).send({ error: 'CONTENT_DIR is set via environment variable — edit that instead' })
    }
    const dir = req.body?.contentDir?.trim()
    if (!dir) return reply.code(400).send({ error: 'contentDir is required' })
    const resolved = path.resolve(dir)
    try {
      fs.mkdirSync(resolved, { recursive: true })
    } catch {
      return reply.code(400).send({ error: `Could not create/access ${resolved}` })
    }
    fs.writeFileSync(CONFIG_FILE(repoRoot), JSON.stringify({ contentDir: resolved }, null, 2))
    return { ok: true, contentDir: resolved, restartRequired: true }
  })
}
