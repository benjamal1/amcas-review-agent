import { useState } from 'react'
import type { CourseEntry, SchoolEntry, Mutate } from '../../lib/types'
import { lookupSchool, entryFromLookup } from '../../lib/schoolsClient'
import { SchoolDetail } from './SchoolDetail'

const TIERS = ['reach', 'target', 'safety'] as const
const TC: Record<string, string> = { reach: 'var(--color-danger)', target: 'var(--color-warn)', safety: 'var(--color-pos)' }

export function SchoolListPanel({ schools, coursework, mutate }: {
  schools: SchoolEntry[]; coursework?: CourseEntry[]; mutate: Mutate
}) {
  const [open, setOpen] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [tier, setTier] = useState('target')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const pipeCount = (kw: string) => schools.filter(s => s.pipeline?.toLowerCase().includes(kw) ||
    (kw === 'submitted' && s.primary_submitted) || (kw === 'secondary' && s.secondary_submitted) ||
    (kw === 'interview' && s.interview_invited)).length

  async function add() {
    const q = name.trim(); if (!q) return
    setBusy(true); setNote(null)
    try {
      const res = await lookupSchool(q)
      const entry = entryFromLookup(q, res.record, tier)
      mutate(d => ({ ...d, schools: [...(d.schools ?? []), entry] }))
      setNote(res.found ? `Added ${entry.name} (MSAR matched).` : `Added ${q} — not in MSAR, fields blank.`)
      setName('')
    } catch (e) { setNote(String(e)) } finally { setBusy(false) }
  }

  const byTier = (t: string) => schools.filter(s => (s.tier?.toLowerCase() ?? 'unknown') === t)
  const unknown = schools.filter(s => !s.tier || !TIERS.includes(s.tier.toLowerCase() as typeof TIERS[number]))

  return (
    <div className="school-panel">
      <div className="tile__label">SCHOOL LIST ({schools.length})</div>

      <div className="school-add">
        <input value={name} placeholder="Add school by name…" aria-label="School name"
          onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add() }} />
        <select value={tier} aria-label="Tier" onChange={e => setTier(e.target.value)}>
          {[...TIERS, 'unknown'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={add} disabled={busy}>{busy ? '…' : 'Add'}</button>
      </div>
      {note && <div className="school-add__note">{note}</div>}

      <div className="school-pipeline">
        {[['Primaries Submitted', 'submitted'], ['Secondaries', 'secondary'], ['Interviews', 'interview']].map(([l, kw]) => (
          <div key={kw} className="pipeline-row"><span>{l}</span><span className="mono">{pipeCount(kw)}</span></div>
        ))}
      </div>

      <div className="school-tiers">
        {[...TIERS, 'unknown'].map(t => {
          const list = t === 'unknown' ? unknown : byTier(t)
          if (!list.length) return null
          return (
            <div key={t} className="school-tier">
              <div className="school-tier__header" style={{ color: TC[t] ?? 'var(--color-muted)' }}>{t.toUpperCase()} ({list.length})</div>
              <ul>{list.map(s => {
                const idx = schools.indexOf(s)
                return (
                  <li key={s.name} className="school-tier__item">
                    <button className="school-tier__name" onClick={() => setOpen(open === idx ? null : idx)}>
                      {s.name}{s.casper_required && <span className="school-tag">CASPer</span>}{s.preview_required && <span className="school-tag">PREview</span>}
                    </button>
                    {open === idx && <SchoolDetail index={idx} schools={schools} coursework={coursework ?? []} mutate={mutate} />}
                  </li>
                )
              })}</ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
