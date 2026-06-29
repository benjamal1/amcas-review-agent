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

// Shemmassian's 6 prompt categories — seeded by default; the rest of the catalog stays addable.
export const CORE_ARCHETYPES = ['diversity', 'adversity', 'why-us', 'gap-year', 'leadership', 'additional']

// Default brainstorm questions per category, pulled from the Shemmassian secondary-essay videos.
// Freewrite against each — 10–15 min, no self-editing.
export const GUIDING_QUESTIONS: Record<string, string[]> = {
  diversity: [
    'List your identities — ethnic, cultural, religious, geographic, hobby-based. Where does your sense of identity come from?',
    'How do you engage with the communities tied to those identities? What is rewarding or challenging? Give specific examples.',
    'List quirks, unexpected traits, or characteristics that make you you. How do others perceive them?',
    'Describe times you worked or communicated with someone whose worldview differed significantly. What approaches did you use, and what did you learn?',
  ],
  adversity: [
    'List 3+ times you failed to complete a task or reach a goal.',
    'List 3+ times you fell short of your own expectations.',
    "List 3+ times you fell short of someone else's expectations.",
    'List 3+ times you had to actively resolve a conflict or significant issue.',
    'For each: what emotions did you feel? who did you go to for support? what actions did you take? what skills or insights did you gain, and how will they apply in med school and as a physician?',
  ],
  'why-us': [
    'Why am I applying to medical school?',
    'List 3+ courses or academic tracks you want to pursue at this school.',
    'List 3+ faculty research projects that interest you.',
    'List 3+ clinical or community-service programs you want to join.',
    'How does each connect to your prior experiences and future goals — and what makes it unique vs. other schools?',
    'Name 3 ways you could give back to the school community through those opportunities.',
  ],
  'gap-year': [
    'Why did I take a gap year (or years), and how did I grow during that time?',
    "What did I accomplish or learn that I couldn't have while in school?",
    'How does that time strengthen my readiness for medical school and medicine?',
  ],
  leadership: [
    'What is my leadership style, and where have I demonstrated it (formal and informal)?',
    'For each experience: what were your responsibilities and your plan?',
    'What obstacles arose, and how did you overcome them?',
    'What was the outcome, and what did you learn?',
    'How does it apply to medicine?',
  ],
  additional: [
    "What significant experiences, skills, or interests haven't I written about yet?",
    'Which 2–3 meaningful activities deserve more depth than the work/activities section allowed?',
    'Are there academic or extracurricular gaps to explain — only if the impact was significant (illness, hardship, loss)?',
    'Do non-medical experiences (growing up abroad, sports, arts, cultural work) connect explicitly to skills that make me a better physician?',
    'Does anything I wrote for other schools apply here but hasn’t been shared yet?',
  ],
}

export const archetypeLabel = (k?: string) =>
  ARCHETYPE_CATALOG.find(a => a.archetype === k)?.label ?? k ?? '—'

export const newBankEssay = (archetype: string, label: string, pre_writable: boolean): BankEssay => ({
  archetype, label, pre_writable,
  doc_path: `documents/secondaries/_bank/${archetype}.md`,
  status: 'not-started',
  guiding_questions: GUIDING_QUESTIONS[archetype] ?? [],
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
