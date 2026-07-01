// Unified data-access layer used by every server caller. Branches on IS_STATIC so the same app
// runs two ways:
//   Server mode : hits the Fastify API (/api/data, /api/file, /api/files, /api/rubric[s]).
//   Static mode : no server — fetches raw files copied into the build (${BASE}data.json,
//                 ${BASE}<doc path>) + prebuilt manifests (files-manifest.json, rubrics-manifest.json).
// The static build is READ-ONLY: write helpers (saveDoc, putData) no-op in static mode.

import { IS_STATIC, BASE } from './env'

export type FileMeta = { path: string; name: string }

// Parse YAML-like frontmatter from raw markdown (static mode; server does this itself).
// Handles simple key: value lines; skips nested structures and arrays.
function parseFrontmatter(text: string): { content: string; frontmatter: Record<string, unknown> } {
  if (!text.startsWith('---')) return { content: text, frontmatter: {} }
  const end = text.indexOf('\n---', 3)
  if (end === -1) return { content: text, frontmatter: {} }
  const yamlStr = text.slice(4, end)
  const content = text.slice(end + 4).replace(/^\n/, '')
  const frontmatter: Record<string, unknown> = {}
  for (const line of yamlStr.split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const k = line.slice(0, idx).trim()
    let v: string | number | boolean = line.slice(idx + 1).trim()
    v = v.replace(/^["']|["']$/g, '')
    if (v === 'true') { frontmatter[k] = true; continue }
    if (v === 'false') { frontmatter[k] = false; continue }
    if (v !== '' && !isNaN(Number(v))) { frontmatter[k] = Number(v); continue }
    frontmatter[k] = v
  }
  return { content, frontmatter }
}

async function rawText(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}${path}`)
    return res.ok ? await res.text() : null
  } catch { return null }
}

// ── Documents ──
export async function fetchDoc(path: string): Promise<string> {
  if (IS_STATIC) { const t = await rawText(path); return t === null ? '' : parseFrontmatter(t).content }
  try {
    const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`)
    if (!res.ok) return ''
    const { content } = await res.json()
    return content ?? ''
  } catch { return '' }
}

export async function fetchDocFull(path: string): Promise<{ content: string; frontmatter: Record<string, unknown> }> {
  if (IS_STATIC) { const t = await rawText(path); return t === null ? { content: '', frontmatter: {} } : parseFrontmatter(t) }
  try {
    const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`)
    if (!res.ok) return { content: '', frontmatter: {} }
    const { content, frontmatter } = await res.json()
    return { content: content ?? '', frontmatter: frontmatter ?? {} }
  } catch { return { content: '', frontmatter: {} } }
}

// Persist a doc. No-op in static mode (read-only export). Returns whether it was written.
export async function saveDoc(path: string, content: string, frontmatter: Record<string, unknown>): Promise<boolean> {
  if (IS_STATIC) return false
  const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`, {
    method: 'PUT', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content, frontmatter }),
  })
  if (!res.ok) throw new Error('save failed')
  return true
}

// ── data.json ──
export async function fetchData<T = unknown>(): Promise<T> {
  const url = IS_STATIC ? `${BASE}data.json` : '/api/data'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`load failed (${res.status})`)
  return res.json() as Promise<T>
}

// Persist data.json. No-op in static mode. Returns {ok, error?}.
export async function putData(next: unknown): Promise<{ ok: boolean; error?: string }> {
  if (IS_STATIC) return { ok: true } // read-only export: keep optimistic local state, don't persist
  const res = await fetch('/api/data', {
    method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(next),
  })
  if (res.ok) return { ok: true }
  const j = await res.json().catch(() => ({}))
  return { ok: false, error: (j as { error?: string }).error ?? `write failed (${res.status})` }
}

// ── File listings ──
export async function fetchFiles(dir = 'documents', meta = false): Promise<FileMeta[] | string[]> {
  if (IS_STATIC) {
    const res = await fetch(`${BASE}files-manifest.json`)
    const all: FileMeta[] = res.ok ? await res.json() : []
    const inDir = all.filter(f => f.path === dir || f.path.startsWith(dir + '/'))
    return meta ? inDir : inDir.map(f => f.path)
  }
  const res = await fetch(`/api/files?dir=${encodeURIComponent(dir)}${meta ? '&meta=1' : ''}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Rubrics ──
export async function fetchRubrics(): Promise<string[]> {
  if (IS_STATIC) { const res = await fetch(`${BASE}rubrics-manifest.json`); return res.ok ? res.json() : [] }
  const res = await fetch('/api/rubrics')
  return res.ok ? res.json() : []
}

export async function fetchRubric(name: string): Promise<string> {
  if (IS_STATIC) { const t = await rawText(`rubrics/${name}`); return t ?? '' }
  const res = await fetch(`/api/rubric?name=${encodeURIComponent(name)}`)
  return res.ok ? (await res.json()).content ?? '' : ''
}
