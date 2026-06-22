import type { Scorecard, Competency, ComponentScore, ActivityEntry, RecLetter, SchoolEntry, DashboardData } from './types'

async function fetchFile(p: string) {
  try { const r = await fetch(`/api/file?path=${encodeURIComponent(p)}`); if (!r.ok) return null; return r.json() as Promise<{frontmatter: Record<string,unknown>; content: string}> }
  catch { return null }
}
async function fetchFiles(): Promise<string[]> {
  try { const r = await fetch('/api/files'); if (!r.ok) return []; return r.json() } catch { return [] }
}
function parseCompetencies(fm?: Record<string, unknown>): Competency[] {
  if (!fm?.competencies) return []
  if (Array.isArray(fm.competencies)) return fm.competencies as Competency[]
  return Object.entries(fm.competencies as Record<string, unknown>).map(([name, v]) => ({ name, ...((v && typeof v === 'object' ? v : {}) as object) })) as Competency[]
}
function parsePriorities(content: string): string[] {
  return content.split('\n').filter(l => /^[-*]\s|^\d+\./.test(l.trim())).map(l => l.replace(/^[-*\d.]+\s*/, '')).filter(Boolean).slice(0, 5)
}
function parseTodos(content: string) {
  return { open: (content.match(/- \[ \]/g) ?? []).length, done: (content.match(/- \[x\]/gi) ?? []).length }
}
function parseActivityEntries(fm?: Record<string, unknown>): ActivityEntry[] {
  if (!fm) return []
  if (Array.isArray(fm.entries)) return fm.entries as ActivityEntry[]
  if (Array.isArray(fm.activities)) return fm.activities as ActivityEntry[]
  return []
}
export async function loadDashboardData(): Promise<DashboardData> {
  const files = await fetchFiles()
  const [scorecardF, compF, priF, todoF, psF, actF, ieF] = await Promise.all([
    fetchFile('Agent/scorecard.md'), fetchFile('Agent/competency-coverage.md'),
    fetchFile('Agent/improvement-priorities.md'), fetchFile('Agent/meeting-todos.md'),
    fetchFile('Personal Statement/ps-scores.md'), fetchFile('Activities/activities-scores.md'),
    fetchFile('Impactful Experience/impactful-experience-scores.md'),
  ])
  const recFiles = files.filter(f => f.startsWith('Rec Letters/') && f.endsWith('.md'))
  const schoolFiles = files.filter(f => f.startsWith('School List/Schools/') && f.endsWith('.md'))
  const [recLetters, schools] = await Promise.all([
    Promise.all(recFiles.map(async f => { const d = await fetchFile(f); return { name: f.split('/').pop()?.replace('.md', '') ?? f, ...(d?.frontmatter ?? {}) } as RecLetter })),
    Promise.all(schoolFiles.map(async f => { const d = await fetchFile(f); return { name: f.split('/').pop()?.replace('.md', '') ?? f, ...(d?.frontmatter ?? {}) } as SchoolEntry })),
  ])
  const { open: todoOpen, done: todoDone } = parseTodos(todoF?.content ?? '')
  return {
    scorecard: (scorecardF?.frontmatter ?? null) as Scorecard | null,
    competencies: parseCompetencies(compF?.frontmatter),
    priorities: parsePriorities(priF?.content ?? ''),
    todoOpen, todoDone,
    psScore: (psF?.frontmatter ?? null) as ComponentScore | null,
    activitiesScore: (actF?.frontmatter ?? null) as ComponentScore | null,
    ieScore: (ieF?.frontmatter ?? null) as ComponentScore | null,
    activityEntries: parseActivityEntries(actF?.frontmatter),
    recLetters, schools,
  }
}
