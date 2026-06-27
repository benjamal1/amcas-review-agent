import type { AppData, BankEssay, ComponentStatus, DomainScore, Scorecard, SchoolEntry } from './types'

// kebab-case a school name → folder slug / route param. Stable + collision-safe enough (names unique).
export const schoolSlug = (name: string) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export const findSchoolBySlug = (schools: SchoolEntry[], slug: string) =>
  schools.find(s => schoolSlug(s.name) === slug)

// Full archetype catalog — the seed bank plus addable extras advisors flag as common.
export const ARCHETYPE_CATALOG: { archetype: string; label: string; pre_writable: boolean }[] = [
  { archetype: 'adversity',   label: 'Adversity / Challenge / Failure', pre_writable: true },
  { archetype: 'leadership',  label: 'Leadership',                       pre_writable: true },
  { archetype: 'diversity',   label: 'Diversity / Contribution',         pre_writable: true },
  { archetype: 'service',     label: 'Community Service',                pre_writable: true },
  { archetype: 'research',    label: 'Research',                         pre_writable: true },
  { archetype: 'additional',  label: 'Additional Info / Anything else',  pre_writable: true },
  { archetype: 'why-us',      label: 'Why Us',                           pre_writable: false },
  // addable extras
  { archetype: 'gap-year',    label: 'Gap Year / What have you been doing', pre_writable: true },
  { archetype: 'accomplishment', label: 'Greatest Accomplishment',       pre_writable: true },
  { archetype: 'teamwork',    label: 'Teamwork / Conflict',              pre_writable: true },
  { archetype: 'why-medicine',label: 'Meaningful Clinical / Why Medicine',pre_writable: true },
  { archetype: 'career-goals',label: 'Career Goals / Specialty',         pre_writable: true },
  { archetype: 'underserved', label: 'Underserved / Rural',              pre_writable: true },
  { archetype: 'ethics',      label: 'Ethical Dilemma',                  pre_writable: true },
  { archetype: 'anti-racism', label: 'Anti-racism / Advocacy',           pre_writable: true },
]

export const newBankEssay = (archetype: string, label: string, pre_writable: boolean): BankEssay => ({
  archetype, label, pre_writable,
  doc_path: `documents/secondaries/_bank/${archetype}.md`,
  status: 'not-started',
})

// ── Essay-status rollups (progress dashboards) ──
const DONE: ComponentStatus[] = ['ready', 'submitted']
export const isDone = (s: ComponentStatus) => DONE.includes(s)

export function schoolEssayProgress(s: SchoolEntry): { done: number; total: number } {
  const essays = s.secondary?.essays ?? []
  return { done: essays.filter(e => isDone(e.status)).length, total: essays.length }
}

// ── Secondaries grading overview = average of per-school regrade scorecards ──
// Only schools that have been regraded count. Returns null when none.
export function averageSecondaryScorecard(schools: SchoolEntry[]): Scorecard | null {
  const cards = schools.map(s => s.secondary?.scorecard).filter((c): c is Scorecard => !!c)
  if (cards.length === 0) return null
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

  const composites = cards.map(c => c.composite).filter((n): n is number => typeof n === 'number')
  const domainKeys = Array.from(new Set(cards.flatMap(c => Object.keys(c.domains ?? {}))))
  const domains: Record<string, DomainScore> = {}
  for (const k of domainKeys) {
    const avgs = cards.map(c => c.domains?.[k]?.avg).filter((n): n is number => typeof n === 'number')
    if (avgs.length) domains[k] = { avg: Number(mean(avgs).toFixed(2)), trend: '→' }
  }
  return {
    composite: composites.length ? Math.round(mean(composites)) : undefined,
    domains: Object.keys(domains).length ? domains : undefined,
  }
}

export const regradedCount = (schools: SchoolEntry[]) =>
  schools.filter(s => s.secondary?.scorecard).length

// Convenience: pull schools off AppData safely.
export const schoolsOf = (data: AppData | null) => data?.schools ?? []
