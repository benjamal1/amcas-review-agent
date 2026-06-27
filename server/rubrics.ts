import type { FastifyInstance } from 'fastify'
import fs from 'node:fs/promises'
import path from 'node:path'

// Read-only access to the scoring rubrics that ship with the app (Agent/rubrics/).
// Separate from the content sandbox: rubrics live in the repo, not CONTENT_DIR.
export function registerRubricRoutes(app: FastifyInstance, rubricsDir: string) {
  const base = path.resolve(rubricsDir)

  app.get('/api/rubrics', async (_req, reply) => {
    try {
      const entries = await fs.readdir(base)
      return reply.send(entries.filter(e => e.endsWith('.md')).sort())
    } catch {
      return reply.send([])
    }
  })

  app.get<{ Querystring: { name?: string } }>('/api/rubric', async (req, reply) => {
    const name = req.query.name ?? ''
    // flat dir only — reject any path separators or traversal
    if (!name || name.includes('/') || name.includes('\\') || name.includes('..')) {
      return reply.code(400).send({ error: 'invalid name' })
    }
    try {
      const content = await fs.readFile(path.join(base, name), 'utf8')
      return reply.send({ content })
    } catch {
      return reply.code(404).send({ error: 'not found' })
    }
  })
}
