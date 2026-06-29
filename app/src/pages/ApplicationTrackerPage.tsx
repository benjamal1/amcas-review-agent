import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../hooks/useData'
import { schoolSlug, schoolEssayProgress } from '../lib/secondaries'
import type { SchoolEntry, SchoolStatus, ComponentStatus, PrimaryComponent, StatusEvent } from '../lib/types'

const SUBMITTED_STAGES = ['secondary-submitted', 'interview-invited', 'interviewed', 'waitlisted', 'accepted', 'rejected', 'withdrawn']
// Derive a school's secondary sub-step for the at-a-glance board:
// Not received → Received → Drafting → Submitted.
function secStage(s: SchoolEntry): { label: string; key: string } {
  if (SUBMITTED_STAGES.includes(s.status ?? '')) return { label: 'Submitted', key: 'submitted' }
  const { total } = schoolEssayProgress(s)
  if (total > 0) return { label: 'Drafting', key: 'drafting' }            // prompts entered, work underway
  if (s.secondary_received_date || s.status === 'secondary-received') return { label: 'Received', key: 'under-review' }
  return { label: 'Not received', key: 'not-started' }
}

// ── Primary application components ──
const COMPONENTS: { key: string; label: string }[] = [
  { key: 'personal_statement', label: 'Personal Statement' },
  { key: 'activities', label: 'Work & Activities' },
  { key: 'most_meaningful', label: 'Most Meaningful (3)' },
  { key: 'impactful_experience', label: 'Impactful Experience' },
  { key: 'letters_eval', label: 'Letters of Evaluation' },
  { key: 'transcripts', label: 'Transcripts' },
  { key: 'coursework_list', label: 'Coursework List' },
  { key: 'mcat', label: 'MCAT' },
  { key: 'biographic', label: 'Biographic Form' },
]
const C_STATUS: { v: ComponentStatus; label: string }[] = [
  { v: 'not-started', label: 'Not started' }, { v: 'drafting', label: 'Drafting' },
  { v: 'under-review', label: 'Under review' }, { v: 'final-edits', label: 'Final edits' },
  { v: 'ready', label: 'Ready to submit' }, { v: 'submitted', label: 'Submitted' },
  { v: 'not-applicable', label: 'N/A' },
]
const DONE: ComponentStatus[] = ['ready', 'submitted']

const SCHOOL_STATUS: SchoolStatus[] = [
  'pre-secondary', 'secondary-received', 'secondary-submitted',
  'interview-invited', 'interviewed', 'waitlisted', 'accepted', 'rejected', 'withdrawn',
]
const S_LABEL: Record<SchoolStatus, string> = {
  'pre-secondary': 'Pre-secondary', 'secondary-received': 'Secondary received',
  'secondary-submitted': 'Secondary submitted', 'interview-invited': 'II invited',
  'interviewed': 'Interviewed', 'waitlisted': 'Waitlisted', 'accepted': 'Accepted',
  'rejected': 'Rejected', 'withdrawn': 'Withdrawn',
}
const today = () => new Date().toISOString().slice(0, 10)
const plusDays = (iso: string, n: number) => { const d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }
const lastChanged = (h?: StatusEvent[]) => (h && h.length ? h[h.length - 1].date : '—')

// Macro secondaries pipeline (per-school work is tracked separately, in the nested Schools list).
const SEC_STAGES: { key: string; label: string }[] = [
  { key: 'brainstorming', label: 'Brainstorming' },
  { key: 'prewriting', label: 'Pre-writing (essay bank)' },
  { key: 'casper_preview', label: 'CASPer / PREview' },
  { key: 'interviews', label: 'Interviews' },
]
const stageDone = (s: ComponentStatus) => s === 'ready' || s === 'submitted' || s === 'not-applicable'

type Draft = { pc: Record<string, PrimaryComponent>; schools: SchoolEntry[]; sec: Record<string, ComponentStatus> }

export function ApplicationTrackerPage() {
  const { data, loading, mutate } = useData()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [dirty, setDirty] = useState(false)
  const [newName, setNewName] = useState('')
  const [openPrimary, setOpenPrimary] = useState(true)
  const [openSecondary, setOpenSecondary] = useState(true)
  const [openSecSchools, setOpenSecSchools] = useState(false)

  // Initialise / re-sync the local draft from persisted data.
  const initDraft = useCallback(() => {
    if (!data) return
    const pc: Record<string, PrimaryComponent> = {}
    for (const c of COMPONENTS) pc[c.key] = data.primary_components?.[c.key] ?? { status: 'not-started' }
    setDraft({ pc, schools: structuredClone(data.schools ?? []), sec: { ...(data.secondaries?.stages ?? {}) } })
    setDirty(false)
  }, [data])
  useEffect(() => { if (data && !draft) initDraft() }, [data, draft, initDraft])

  if (loading || !draft || !data) return <div className="dashboard__loading">Loading…</div>

  const edit = (fn: (d: Draft) => Draft) => { setDraft(d => (d ? fn(d) : d)); setDirty(true) }
  const setComp = (key: string, status: ComponentStatus) =>
    edit(d => ({ ...d, pc: { ...d.pc, [key]: { ...d.pc[key], status } } }))
  const setSecStage = (key: string, status: ComponentStatus) =>
    edit(d => ({ ...d, sec: { ...d.sec, [key]: status } }))
  const setSchool = (i: number, patch: Partial<SchoolEntry>) =>
    edit(d => ({ ...d, schools: d.schools.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }))
  const setReceived = (i: number, val: string) =>
    edit(d => ({
      ...d, schools: d.schools.map((s, idx) => {
        if (idx !== i) return s
        const next = { ...s, secondary_received_date: val }
        if (val && !s.secondary_deadline) next.secondary_deadline = plusDays(val, 14) // 2wk default, editable
        return next
      }),
    }))

  function addSchool() {
    const name = newName.trim()
    if (!name) return
    edit(d => ({ ...d, schools: [...d.schools, { name, status: 'pre-secondary' }] }))
    setNewName('')
  }

  // Schools render in array order; ↑/↓ reorder, Sort by rank reorders by the rank column.
  const moveSchool = (i: number, dir: -1 | 1) => edit(d => {
    const j = i + dir
    if (j < 0 || j >= d.schools.length) return d
    const arr = [...d.schools]
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    return { ...d, schools: arr }
  })
  const sortByRank = () => edit(d => ({
    ...d, schools: [...d.schools].sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity)),
  }))

  async function save() {
    const t = today()
    await mutate(d => {
      // primary components — append a status event only when the stage changed
      const basePc = d.primary_components ?? {}
      const pc: Record<string, PrimaryComponent> = {}
      for (const c of COMPONENTS) {
        const cur = draft!.pc[c.key]?.status ?? 'not-started'
        const prev = basePc[c.key]?.status ?? 'not-started'
        const hist = basePc[c.key]?.status_history ?? []
        pc[c.key] = { status: cur, status_history: cur !== prev ? [...hist, { status: cur, date: t }] : hist }
      }
      // schools — match by name to find prior status; log on change
      const prevByName = Object.fromEntries((d.schools ?? []).map(s => [s.name, s]))
      const schools = draft!.schools.map(s => {
        const prev = prevByName[s.name]
        const hist = (prev?.status_history ?? s.status_history ?? []) as StatusEvent[]
        const changed = s.status && s.status !== prev?.status
        return { ...s, status_history: changed ? [...hist, { status: s.status!, date: t }] : hist }
      })
      const secondaries = { ...(d.secondaries ?? { essay_bank: [] }), stages: draft!.sec }
      return { ...d, primary_components: pc, schools, secondaries }
    })
    // mutate resolves after the PUT settles — re-sync the draft from the final persisted
    // state (the written data on success, or the rolled-back base on failure).
    setDraft(null); setDirty(false)
  }

  // Applicant's own metrics — school avg cells go green when the applicant is at/above.
  const myGpa = data.scorecard?.hard_metrics?.gpa_cumulative
  const myMcat = data.scorecard?.hard_metrics?.mcat_total
  const atOrAbove = (mine?: number, school?: unknown) =>
    typeof mine === 'number' && typeof school === 'number' && mine >= school

  // N/A components drop out of the denominator entirely.
  const tracked = COMPONENTS.filter(c => (draft.pc[c.key]?.status ?? 'not-started') !== 'not-applicable')
  const readyCount = tracked.filter(c => DONE.includes(draft.pc[c.key]?.status ?? 'not-started')).length
  const pct = tracked.length ? Math.round((readyCount / tracked.length) * 100) : 0
  const secSubmitted = draft.schools.filter(s => secStage(s).key === 'submitted').length
  const secPct = draft.schools.length ? Math.round((secSubmitted / draft.schools.length) * 100) : 0
  const secStatus = (k: string) => draft.sec[k] ?? 'not-started'
  // Current macro stage = first incomplete step (per-school work sits between pre-writing and CASPer).
  const currentStage =
    !stageDone(secStatus('brainstorming')) ? 'Brainstorming'
    : !stageDone(secStatus('prewriting')) ? 'Pre-writing'
    : draft.schools.length > 0 && secSubmitted < draft.schools.length ? 'Per-school essays'
    : !stageDone(secStatus('casper_preview')) ? 'CASPer / PREview'
    : !stageDone(secStatus('interviews')) ? 'Interviews'
    : 'Complete'

  return (
    <div className="page page--single tracker">
      {dirty && (
        <div className="tracker__dirty">
          Unsaved changes
          <span className="tracker__dirty-actions">
            <button className="tracker__save" onClick={save}>Save</button>
            <button className="tracker__discard" onClick={initDraft}>Discard</button>
          </span>
        </div>
      )}

      {/* ── Primary component board ── */}
      <section className="tracker__primary">
        <button className="tracker__primary-head tracker__fold" onClick={() => setOpenPrimary(o => !o)} aria-expanded={openPrimary}>
          <h2 className="tracker__h"><span className="sidebar__chevron">{openPrimary ? '▾' : '▸'}</span> Primary Application</h2>
          <span className="tracker__ready">{readyCount}/{tracked.length} ready</span>
        </button>
        {openPrimary && <>
        <div className="tracker__bar"><span className="tracker__bar-fill" style={{ width: `${pct}%` }} /></div>
        <ul className="tracker__components">
          {COMPONENTS.map(c => {
            const pc = draft.pc[c.key] ?? { status: 'not-started' as ComponentStatus }
            return (
              <li key={c.key} className="tracker__comp">
                <span className="tracker__comp-name">{c.label}</span>
                <select className="tracker__pill" data-status={pc.status} value={pc.status} onChange={e => setComp(c.key, e.target.value as ComponentStatus)}>
                  {C_STATUS.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
                </select>
                <span className="tracker__comp-date">{lastChanged(pc.status_history)}</span>
              </li>
            )
          })}
        </ul>
        </>}
      </section>

      {/* ── Secondaries: macro stage tracker + nested per-school progress ── */}
      <section className="tracker__primary">
        <button className="tracker__primary-head tracker__fold" onClick={() => setOpenSecondary(o => !o)} aria-expanded={openSecondary}>
          <h2 className="tracker__h"><span className="sidebar__chevron">{openSecondary ? '▾' : '▸'}</span> Secondaries</h2>
          <span className="tracker__ready">Stage: {currentStage}</span>
        </button>
        {openSecondary && <>
          <ul className="tracker__components">
            {SEC_STAGES.map(st => (
              <li key={st.key} className="tracker__comp">
                <span className="tracker__comp-name">{st.label}</span>
                <select className="tracker__pill" data-status={secStatus(st.key)} value={secStatus(st.key)} onChange={e => setSecStage(st.key, e.target.value as ComponentStatus)}>
                  {C_STATUS.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
                </select>
                <span className="tracker__comp-date" />
              </li>
            ))}
          </ul>
          {/* nested: per-school secondary progress */}
          <div className="tracker__nested">
            <button className="tracker__fold tracker__nested-head" onClick={() => setOpenSecSchools(o => !o)} aria-expanded={openSecSchools}>
              <span className="sidebar__chevron">{openSecSchools ? '▾' : '▸'}</span> Schools ({draft.schools.length}) · {secSubmitted} submitted
            </button>
            {openSecSchools && (
              <>
                <div className="tracker__bar"><span className="tracker__bar-fill" style={{ width: `${secPct}%` }} /></div>
                <ul className="tracker__components">
                  {draft.schools.length === 0 && <li className="tracker__hint">No schools yet.</li>}
                  {draft.schools.map(s => {
                    const { done, total } = schoolEssayProgress(s)
                    const stage = secStage(s)
                    return (
                      <li key={s.name} className="tracker__comp tracker__sec-row">
                        <Link className="tracker__sec-link" to={`/secondaries/${schoolSlug(s.name)}`}>{s.name}</Link>
                        <span className="tracker__sec-essays">{done}/{total} essays</span>
                        <span className="tracker__pill" data-status={stage.key}>{stage.label}</span>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </div>
        </>}
      </section>

      {/* ── Per-school grid ── */}
      <section className="tracker__schools">
        <div className="tracker__schools-head">
          <h2 className="tracker__h">Schools ({draft.schools.length})</h2>
          <div className="tracker__add">
            <button className="tracker__rank-sort" onClick={sortByRank} title="Order by the rank column (lowest first)">⇅ Sort by rank</button>
            <input value={newName} placeholder="Add a school…" onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSchool()} />
            <button onClick={addSchool}>+ Add</button>
          </div>
        </div>
        <div className="tracker__scroll">
          <table className="tracker__table">
            <thead>
              <tr>
                <th aria-label="reorder"></th>
                <th>School</th><th>Tier</th><th>Rank</th><th>Location</th><th>Avg GPA</th><th>Avg MCAT</th><th>Status</th>
                <th>Sec. received</th><th>Sec. deadline</th><th>Target</th><th>Sec. submitted</th>
                <th>CASPer</th><th>PREview</th><th>Interview</th>
              </tr>
            </thead>
            <tbody>
              {draft.schools.length === 0 && (
                <tr><td colSpan={15} className="tracker__empty">No schools yet — add one above.</td></tr>
              )}
              {draft.schools.map((s, i) => {
                const overdue = s.secondary_deadline && s.secondary_deadline < today()
                  && !['secondary-submitted', 'interview-invited', 'interviewed', 'waitlisted', 'accepted', 'rejected', 'withdrawn'].includes(s.status ?? '')
                return (
                  <tr key={s.name}>
                    <td className="tracker__reorder">
                      <button onClick={() => moveSchool(i, -1)} disabled={i === 0} title="Move up">▲</button>
                      <button onClick={() => moveSchool(i, 1)} disabled={i === draft.schools.length - 1} title="Move down">▼</button>
                    </td>
                    <td className="tracker__name">{s.name}</td>
                    <td><input className="tracker__sm" value={s.tier ?? ''} placeholder="reach/target/safety" onChange={e => setSchool(i, { tier: e.target.value })} /></td>
                    <td><input className="tracker__xs" type="number" value={s.rank ?? ''} onChange={e => setSchool(i, { rank: e.target.value === '' ? undefined : Number(e.target.value) })} /></td>
                    <td><input className="tracker__sm" value={s.location ?? ''} onChange={e => setSchool(i, { location: e.target.value })} /></td>
                    <td><input className={`tracker__xs${atOrAbove(myGpa, s.avg_gpa) ? ' tracker__above' : ''}`} type="number" step="0.01" value={(s.avg_gpa as number | undefined) ?? ''} onChange={e => setSchool(i, { avg_gpa: e.target.value === '' ? undefined : Number(e.target.value) })} /></td>
                    <td><input className={`tracker__xs${atOrAbove(myMcat, s.avg_mcat) ? ' tracker__above' : ''}`} type="number" value={(s.avg_mcat as number | undefined) ?? ''} onChange={e => setSchool(i, { avg_mcat: e.target.value === '' ? undefined : Number(e.target.value) })} /></td>
                    <td>
                      <select value={s.status ?? 'pre-secondary'} data-status={s.status} onChange={e => setSchool(i, { status: e.target.value as SchoolStatus })}>
                        {SCHOOL_STATUS.map(st => <option key={st} value={st}>{S_LABEL[st]}</option>)}
                      </select>
                    </td>
                    <td><input type="date" value={s.secondary_received_date ?? ''} onChange={e => setReceived(i, e.target.value)} /></td>
                    <td className={overdue ? 'tracker__overdue' : ''}>
                      <input type="date" value={s.secondary_deadline ?? ''} onChange={e => setSchool(i, { secondary_deadline: e.target.value })} />{overdue ? ' ⚠' : ''}
                    </td>
                    <td><input type="date" value={s.target_submit_date ?? ''} onChange={e => setSchool(i, { target_submit_date: e.target.value })} /></td>
                    <td><input type="date" value={s.secondary_submitted_date ?? ''} onChange={e => setSchool(i, { secondary_submitted_date: e.target.value })} /></td>
                    <td className="tracker__c"><input type="checkbox" checked={!!s.casper_required} onChange={e => setSchool(i, { casper_required: e.target.checked })} /></td>
                    <td className="tracker__c"><input type="checkbox" checked={!!s.preview_required} onChange={e => setSchool(i, { preview_required: e.target.checked })} /></td>
                    <td><input type="date" value={s.interview_date ?? ''} onChange={e => setSchool(i, { interview_date: e.target.value })} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="tracker__hint">Reorder rows with ▲▼, or fill the Rank column and hit “Sort by rank”. Secondary deadline auto-fills to 2 weeks after received (editable). Order is saved with the rest.</p>
      </section>
    </div>
  )
}
