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

async function listMarkdown(dir: string): Promise<string[]> {
  const base = path.resolve(dir)
  const entries = await fs.readdir(base, { recursive: true })
  return (entries as string[])
    .filter(e => e.endsWith('.md'))
    .sort()
    .map(e => path.join(base, e))
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
  // ?dir= scopes the listing to a subtree (default 'documents'). Sandboxed.
  // ?meta=1 returns [{ path, name }] where name = frontmatter experience_name/title.
  app.get<{ Querystring: { dir?: string; meta?: string } }>('/api/files', async (req, reply) => {
    const sub = req.query.dir ?? 'documents'
    const safe = sandboxPath(contentDir, sub)
    if (!safe) return reply.code(400).send({ error: 'invalid dir' })
    try {
      const files = await listMarkdown(safe)
      const paths = files.map(f => sub + '/' + path.relative(safe, f))
      if (req.query.meta !== '1') return reply.send(paths)
      const withMeta = await Promise.all(files.map(async (full, i) => {
        try {
          const fm = (await readFileParsed(full)).frontmatter
          const name = (fm.experience_name || fm.title || '') as string
          return { path: paths[i], name }
        } catch { return { path: paths[i], name: '' } }
      }))
      return reply.send(withMeta)
    } catch {
      return reply.send([])
    }
  })

  // GET /api/data — read data.json
  app.get('/api/data', async (_req, reply) => {
    const dataPath = path.join(contentDir, 'data.json')
    try {
      const raw = await fs.readFile(dataPath, 'utf-8')
      return reply.send(JSON.parse(raw))
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') return reply.code(404).send({ error: 'data.json not found' })
      return reply.code(500).send({ error: 'failed to read data.json' })
    }
  })

  // PUT /api/data — write data.json atomically
  app.put('/api/data', async (req, reply) => {
    const dataPath = path.join(contentDir, 'data.json')
    const tmpPath = path.join(contentDir, '.data.json.tmp')
    try {
      const body = req.body as unknown
      await fs.writeFile(tmpPath, JSON.stringify(body, null, 2), 'utf-8')
      await fs.rename(tmpPath, dataPath)
      return reply.send({ ok: true })
    } catch {
      return reply.code(500).send({ error: 'failed to write data.json' })
    }
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
    try {
      await writeFilePreserving(safe, req.body.content, req.body.frontmatter)
    } catch {
      return reply.code(500).send({ error: 'write failed' })
    }
    return { ok: true }
  })
}
