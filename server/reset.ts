import type { FastifyInstance } from 'fastify'
import fs from 'node:fs/promises'
import path from 'node:path'
import { BLANK_DATA_JSON, BLANK_FILES } from './blank-content.js'

// "Clear All Data" — wipes the content dir back to a truly empty starting point.
// Used to shed the demo applicant that ships in content/ before entering real data.
export function registerResetRoute(app: FastifyInstance, contentDir: string) {
  app.post('/api/reset', async (_req, reply) => {
    try {
      await fs.rm(contentDir, { recursive: true, force: true })
      await fs.mkdir(contentDir, { recursive: true })
      await fs.writeFile(path.join(contentDir, 'data.json'), JSON.stringify(BLANK_DATA_JSON, null, 2))
      for (const f of BLANK_FILES) {
        const full = path.join(contentDir, f.path)
        await fs.mkdir(path.dirname(full), { recursive: true })
        await fs.writeFile(full, f.content)
      }
      return { ok: true }
    } catch (e) {
      return reply.code(500).send({ error: e instanceof Error ? e.message : 'reset failed' })
    }
  })
}
