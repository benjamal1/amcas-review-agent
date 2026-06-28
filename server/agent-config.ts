import type { FastifyInstance } from 'fastify'
import fs from 'node:fs/promises'
import path from 'node:path'

// Read/write access to the agent's own instructions: the router CLAUDE.md and the subagent
// files in .claude/agents/. Strict allowlist — these are the ONLY paths this route can touch,
// so no traversal is possible. Lives in the repo, not CONTENT_DIR.
const AGENT_ID = /^agents\/[a-z0-9-]+\.md$/

function resolveId(root: string, id: string): string | null {
  if (id === 'CLAUDE.md') return path.join(root, 'CLAUDE.md')
  if (AGENT_ID.test(id)) return path.join(root, '.claude', id) // .claude/agents/<name>.md
  return null
}

export function registerAgentConfigRoutes(app: FastifyInstance, repoRoot: string) {
  const root = path.resolve(repoRoot)

  app.get('/api/agent-config', async (_req, reply) => {
    const items: { id: string; name: string; group: string }[] = [
      { id: 'CLAUDE.md', name: 'CLAUDE.md (router)', group: 'Router' },
    ]
    try {
      const agents = await fs.readdir(path.join(root, '.claude', 'agents'))
      for (const f of agents.filter(e => e.endsWith('.md')).sort()) {
        items.push({ id: `agents/${f}`, name: f.replace(/\.md$/, ''), group: 'Subagents' })
      }
    } catch { /* no agents dir */ }
    return reply.send(items)
  })

  app.get<{ Querystring: { id?: string } }>('/api/agent-config/file', async (req, reply) => {
    const file = resolveId(root, req.query.id ?? '')
    if (!file) return reply.code(400).send({ error: 'invalid id' })
    try {
      return reply.send({ content: await fs.readFile(file, 'utf8') })
    } catch {
      return reply.code(404).send({ error: 'not found' })
    }
  })

  app.put<{ Querystring: { id?: string }; Body: { content?: string } }>('/api/agent-config/file', async (req, reply) => {
    const file = resolveId(root, req.query.id ?? '')
    if (!file) return reply.code(400).send({ error: 'invalid id' })
    const content = req.body?.content
    if (typeof content !== 'string') return reply.code(400).send({ error: 'content must be a string' })
    try {
      const tmp = `${file}.tmp`
      await fs.writeFile(tmp, content, 'utf8')
      await fs.rename(tmp, file)
      return reply.send({ ok: true })
    } catch {
      return reply.code(500).send({ error: 'write failed' })
    }
  })
}
