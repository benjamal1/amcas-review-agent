import type { FastifyInstance } from 'fastify'
import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

// ponytail: single trust boundary — all path ops go through this
function sandboxPath(contentDir: string, userPath: string): string | null {
  if (!userPath) return null
  // Reject obvious traversal attempts before resolving
  if (userPath.includes('..')) return null
  const resolved = path.resolve(contentDir, userPath)
  // Reject anything that escapes contentDir after resolution
  if (!resolved.startsWith(path.resolve(contentDir) + path.sep) &&
      resolved !== path.resolve(contentDir)) {
    return null
  }
  return resolved
}

async function listMarkdown(contentDir: string): Promise<string[]> {
  const base = path.resolve(contentDir)
  const entries = await fs.readdir(base, { recursive: true })
  return (entries as string[])
    .filter(e => e.endsWith('.md'))
    .sort()
}

async function readFileParsed(fullPath: string): Promise<{ content: string; frontmatter: Record<string, unknown> }> {
  const raw = await fs.readFile(fullPath, 'utf8')
  const parsed = matter(raw)
  return { content: parsed.content, frontmatter: parsed.data }
}

async function writeFilePreserving(fullPath: string, newContent: string, frontmatter: Record<string, unknown>): Promise<void> {
  const output = matter.stringify(newContent, frontmatter)
  await fs.writeFile(fullPath, output, 'utf8')
}

export async function registerFileRoutes(app: FastifyInstance, contentDir: string) {
  app.get('/api/files', async () => {
    return listMarkdown(contentDir)
  })

  app.get<{ Querystring: { path?: string } }>('/api/file', async (req, reply) => {
    const safe = sandboxPath(contentDir, req.query.path ?? '')
    if (!safe) return reply.code(400).send({ error: 'invalid path' })
    try {
      return await readFileParsed(safe)
    } catch {
      return reply.code(404).send({ error: 'not found' })
    }
  })

  app.put<{ Querystring: { path?: string }; Body: { content: string; frontmatter: Record<string, unknown> } }>('/api/file', {
    schema: { body: { type: 'object', required: ['content', 'frontmatter'] } },
  }, async (req, reply) => {
    const safe = sandboxPath(contentDir, req.query.path ?? '')
    if (!safe) return reply.code(400).send({ error: 'invalid path' })
    await writeFilePreserving(safe, req.body.content, req.body.frontmatter)
    return { ok: true }
  })
}
