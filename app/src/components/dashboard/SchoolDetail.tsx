import { useState } from 'react'
import type { CourseEntry, SchoolEntry, Mutate } from '../../lib/types'
import { checkRequirements, type Requirement, type RequirementsResult } from '../../lib/schoolsClient'

const TIERS = ['reach', 'target', 'safety', 'unknown']
const TOGGLES: { key: keyof SchoolEntry; label: string }[] = [
  { key: 'primary_submitted', label: 'Primary submitted' },
  { key: 'secondary_requested', label: 'Secondary requested' },
  { key: 'secondary_submitted', label: 'Secondary submitted' },
  { key: 'interview_invited', label: 'Interview invited' },
  { key: 'casper_required', label: 'CASPer required' },
  { key: 'casper_completed', label: 'CASPer done' },
  { key: 'preview_required', label: 'PREview required' },
  { key: 'preview_completed', label: 'PREview done' },
]

// Inline editor for one school entry: tier, pipeline toggles, letters/decision/notes, requirements check.
export function SchoolDetail({ index, schools, coursework, mutate }: {
  index: number; schools: SchoolEntry[]; coursework: CourseEntry[]; mutate: Mutate
}) {
  const s = schools[index]
  const [req, setReq] = useState<RequirementsResult | null>(null)
  const [reqError, setReqError] = useState<string | null>(null)

  const patch = (p: Partial<SchoolEntry>) =>
    mutate(d => ({ ...d, schools: (d.schools ?? []).map((x, j) => (j === index ? { ...x, ...p } : x)) }))

  async function runRequirements() {
    setReqError(null)
    try {
      const requirements = (s.course_requirements as Requirement[] | undefined) ?? []
      const result = await checkRequirements(requirements, coursework)
      setReq(result)
      patch({ courses_verified: true, courses_missing: result.missing })
    } catch (e) { setReqError(String(e)) }
  }

  return (
    <div className="school-detail">
      <div className="school-detail__row">
        <label>Tier
          <select value={s.tier ?? 'unknown'} onChange={e => patch({ tier: e.target.value })}>
            {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label>Letters sent
          <input type="number" min={0} value={(s.letters_sent as number) ?? 0}
            onChange={e => patch({ letters_sent: Number(e.target.value) })} />
        </label>
        <label>Decision
          <input value={(s.decision as string) ?? ''} placeholder="—"
            onChange={e => patch({ decision: e.target.value })} />
        </label>
      </div>
      <div className="school-detail__toggles">
        {TOGGLES.map(t => (
          <label key={String(t.key)}>
            <input type="checkbox" checked={!!s[t.key]} onChange={e => patch({ [t.key]: e.target.checked })} /> {t.label}
          </label>
        ))}
      </div>
      <label className="school-detail__notes">Notes
        <textarea value={s.notes ?? ''} onChange={e => patch({ notes: e.target.value })} />
      </label>
      <div className="school-detail__req">
        <button onClick={runRequirements}>Check requirements</button>
        {reqError && <span className="school-detail__err">{reqError}</span>}
        {req && (
          <div className="school-detail__req-result">
            <div>✅ Covered: {req.covered.map(c => c.name).join(', ') || '—'}</div>
            <div>{req.missing.length ? `⚠️ Missing: ${req.missing.join(', ')}` : 'All required courses covered'}</div>
          </div>
        )}
      </div>
    </div>
  )
}
