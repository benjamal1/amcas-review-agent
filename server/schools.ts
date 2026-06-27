import type { FastifyInstance } from 'fastify'
import fs from 'node:fs/promises'
import path from 'node:path'

// ---- MSAR lookup (case-by-case, one school at a time) ----

// Keys that are OCR artifacts, not school names.
const ARTIFACT_RE = /(The record|We will|Pass\/Fail|Required)/i
const isArtifact = (key: string) => key.startsWith('|') || ARTIFACT_RE.test(key)

const significant = (s: string) =>
  s.toLowerCase().split(/[^a-z0-9]+/i).filter(w => w.length > 2)

/** Exact (case-insensitive) match first, then partial: all significant query words appear in the key. */
export function lookupSchool(
  lookup: Record<string, unknown>,
  name: string,
): { key: string; record: unknown } | null {
  const keys = Object.keys(lookup).filter(k => !isArtifact(k))
  const q = name.trim().toLowerCase()
  if (!q) return null
  const exact = keys.find(k => k.toLowerCase() === q)
  if (exact) return { key: exact, record: lookup[exact] }
  const words = significant(name)
  if (!words.length) return null
  const partial = keys.find(k => {
    const lk = k.toLowerCase()
    return words.every(w => lk.includes(w))
  })
  return partial ? { key: partial, record: lookup[partial] } : null
}

// ---- Requirements check (coursework vs a school's required courses) ----

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Biology: ['biology', 'living systems', 'cell biology', 'genetics', 'microbiology', 'molecular biology', 'physiology', 'anatomy', 'neuroscience', 'immunology', 'biotechnology', 'biochem'],
  Chemistry: ['chemistry', 'equilibrium', 'organic chemistry', 'biochemistry', 'chem'],
  Physics: ['physics', 'dynamics', 'fluid mechanics', 'thermodynamics', 'circuits'],
  Mathematics: ['calculus', 'multivariable', 'statistics', 'linear algebra', 'probability', 'quantitative', 'math'],
  English: ['english', 'writing', 'composition', 'rhetoric', 'literature'],
  'Psychology-Sociology': ['psychology', 'sociology', 'anthropology', 'behavioral', 'language and mind'],
}

const FOREIGN_LANG = ['french', 'spanish', 'portuguese', 'german', 'mandarin', 'chinese', 'latin', 'italian', 'japanese']

function courseMatchesCategory(courseTitle: string, category: string): boolean {
  const t = courseTitle.toLowerCase()
  const kws = CATEGORY_KEYWORDS[category]
  if (!kws) return false
  if (category === 'English' && FOREIGN_LANG.some(f => t.includes(f))) return false
  return kws.some(kw => t.includes(kw))
}

export type Requirement = { name: string; status?: string; category?: string }
export type Course = { name: string; subject?: string }

/** Returns covered/missing for Required courses only. */
export function checkRequirements(
  requirements: Requirement[],
  coursework: Course[],
): { covered: { name: string; matched: string[] }[]; missing: string[] } {
  const covered: { name: string; matched: string[] }[] = []
  const missing: string[] = []
  for (const req of requirements) {
    if ((req.status ?? '').toLowerCase() !== 'required') continue
    const category = req.category ?? req.name
    const matched = coursework
      .filter(c => courseMatchesCategory(c.name, category) || courseMatchesCategory(c.name, req.name))
      .map(c => c.name)
    if (matched.length) covered.push({ name: req.name, matched })
    else missing.push(req.name)
  }
  return { covered, missing }
}

// ---- Routes ----

export function registerSchoolRoutes(app: FastifyInstance, contentDir: string, msarLookupPath?: string) {
  const lookupPath = msarLookupPath ?? process.env.MSAR_LOOKUP ?? path.join(contentDir, 'msar-lookup.json')

  app.post<{ Querystring: { name?: string } }>('/api/schools/lookup', async (req, reply) => {
    const name = req.query.name?.trim()
    if (!name) return reply.code(400).send({ error: 'name required' })
    let lookup: Record<string, unknown>
    try {
      lookup = JSON.parse(await fs.readFile(lookupPath, 'utf-8'))
    } catch {
      return reply.code(404).send({ error: 'msar-lookup.json not found', found: false })
    }
    const hit = lookupSchool(lookup, name)
    if (!hit) return reply.send({ found: false })
    return reply.send({ found: true, key: hit.key, record: hit.record })
  })

  app.post<{ Body: { requirements?: Requirement[]; coursework?: Course[] } }>('/api/schools/requirements', async (req, reply) => {
    const { requirements = [], coursework = [] } = req.body ?? {}
    return reply.send(checkRequirements(requirements, coursework))
  })
}
