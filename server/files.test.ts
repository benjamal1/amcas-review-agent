import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import Fastify from 'fastify'
import { registerFileRoutes } from './files.js'

let tmpDir: string
let app: ReturnType<typeof Fastify>

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'amcas-test-'))
  app = Fastify()
  await registerFileRoutes(app, tmpDir)
  await app.ready()
})

afterEach(async () => {
  await app.close()
  await fs.rm(tmpDir, { recursive: true })
})

describe('GET /api/files', () => {
  it('lists .md files', async () => {
    await fs.writeFile(path.join(tmpDir, 'test.md'), '# hi')
    await fs.writeFile(path.join(tmpDir, 'ignore.txt'), 'nope')
    const res = await app.inject({ method: 'GET', url: '/api/files' })
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toContain('test.md')
    expect(JSON.parse(res.body)).not.toContain('ignore.txt')
  })
})

describe('GET /api/file', () => {
  it('returns content and frontmatter', async () => {
    await fs.writeFile(path.join(tmpDir, 'note.md'), '---\ntitle: Test\n---\n# body')
    const res = await app.inject({ method: 'GET', url: '/api/file?path=note.md' })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.frontmatter.title).toBe('Test')
    expect(body.content).toContain('# body')
  })

  it('rejects .. traversal with 400', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/file?path=../etc/passwd' })
    expect(res.statusCode).toBe(400)
  })

  it('rejects absolute path with 400', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/file?path=/etc/passwd' })
    expect(res.statusCode).toBe(400)
  })
})

describe('PUT /api/file (round-trip)', () => {
  it('preserves frontmatter on write', async () => {
    const filePath = path.join(tmpDir, 'score.md')
    await fs.writeFile(filePath, '---\ncomposite: 87\n---\noriginal body')

    // Read
    const getRes = await app.inject({ method: 'GET', url: '/api/file?path=score.md' })
    const { content, frontmatter } = JSON.parse(getRes.body)

    // Write with modified content but same frontmatter
    await app.inject({
      method: 'PUT',
      url: '/api/file?path=score.md',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ content: content + '\nnew line', frontmatter }),
    })

    // Re-read and verify frontmatter preserved
    const reRead = await app.inject({ method: 'GET', url: '/api/file?path=score.md' })
    const result = JSON.parse(reRead.body)
    expect(result.frontmatter.composite).toBe(87)
    expect(result.content).toContain('new line')
  })
})
