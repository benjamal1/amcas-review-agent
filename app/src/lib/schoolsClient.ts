import type { CourseEntry, SchoolEntry } from './types'
import { IS_STATIC } from './env'

export type LookupResult = { found: boolean; key?: string; record?: Record<string, unknown> }
export type Requirement = { name: string; status?: string; category?: string }
export type RequirementsResult = { covered: { name: string; matched: string[] }[]; missing: string[] }

export async function lookupSchool(name: string): Promise<LookupResult> {
  if (IS_STATIC) throw new Error('School lookup is unavailable in the static export (read-only).')
  const r = await fetch(`/api/schools/lookup?name=${encodeURIComponent(name)}`, { method: 'POST' })
  if (!r.ok && r.status !== 404) throw new Error(`lookup failed (${r.status})`)
  return r.json()
}

export async function checkRequirements(requirements: Requirement[], coursework: CourseEntry[]): Promise<RequirementsResult> {
  if (IS_STATIC) throw new Error('Requirements check is unavailable in the static export (read-only).')
  const r = await fetch('/api/schools/requirements', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ requirements, coursework }),
  })
  if (!r.ok) throw new Error(`requirements check failed (${r.status})`)
  return r.json()
}

// Build a new schools[] entry from an MSAR lookup record (flat key/value), falling back to blanks.
export function entryFromLookup(name: string, rec: Record<string, unknown> | undefined, tier: string): SchoolEntry {
  const r = rec ?? {}
  return {
    name: (r.school_name as string) || name,
    tier,
    pipeline: 'researching',
    casper_required: !!r.casper_required,
    preview_required: !!r.preview_required,
    secondary_submitted: false,
    interview: false,
    notes: '',
    ...r,
    school_name: (r.school_name as string) || name,
  }
}
