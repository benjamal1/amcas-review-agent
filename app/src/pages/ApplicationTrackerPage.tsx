import { useState } from 'react'
import { useData } from '../hooks/useData'
import type { AppData, SchoolEntry, SchoolStatus, Mutate } from '../lib/types'

const STATUSES: SchoolStatus[] = [
  'pre-secondary', 'secondary-received', 'secondary-submitted',
  'interview-invited', 'interviewed', 'waitlisted', 'accepted', 'rejected', 'withdrawn',
]
const STATUS_LABEL: Record<SchoolStatus, string> = {
  'pre-secondary': 'Pre-secondary', 'secondary-received': 'Secondary received',
  'secondary-submitted': 'Secondary submitted', 'interview-invited': 'II invited',
  'interviewed': 'Interviewed', 'waitlisted': 'Waitlisted', 'accepted': 'Accepted',
  'rejected': 'Rejected', 'withdrawn': 'Withdrawn',
}
const today = () => new Date().toISOString().slice(0, 10)

function setSchool(mutate: Mutate, i: number, patch: Partial<SchoolEntry>) {
  mutate(d => {
    const schools = d.schools.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    return { ...d, schools }
  })
}

export function ApplicationTrackerPage() {
  const { data, loading, mutate } = useData()
  const [newName, setNewName] = useState('')
  if (loading) return <div className="dashboard__loading">Loading…</div>
  if (!data) return <div className="dashboard__empty">No data.</div>
  const cl = data.application_checklist ?? {}
  const setCl = (patch: Partial<AppData['application_checklist']>) =>
    mutate(d => ({ ...d, application_checklist: { ...d.application_checklist, ...patch } }))

  function addSchool() {
    const name = newName.trim()
    if (!name) return
    mutate(d => ({ ...d, schools: [...d.schools, { name, status: 'pre-secondary' }] }))
    setNewName('')
  }

  return (
    <div className="page page--single tracker">
      {/* ── Primary application checklist ── */}
      <section className="tracker__checklist">
        <h2 className="tracker__h">Primary Application</h2>
        <div className="tracker__cl-grid">
          <label>AMCAS submitted
            <input type="date" value={cl.amcas_submitted_date ?? ''} onChange={e => setCl({ amcas_submitted_date: e.target.value })} />
          </label>
          <label>LORs / committee
            <input type="number" min={0} max={12} value={cl.lor_count ?? ''} placeholder="#" onChange={e => setCl({ lor_count: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </label>
          <label className="tracker__check"><input type="checkbox" checked={!!cl.transcripts_sent} onChange={e => setCl({ transcripts_sent: e.target.checked })} /> Transcripts sent</label>
          <label className="tracker__check"><input type="checkbox" checked={!!cl.mcat_released} onChange={e => setCl({ mcat_released: e.target.checked })} /> MCAT released</label>
          <label className="tracker__check"><input type="checkbox" checked={!!cl.committee_letter} onChange={e => setCl({ committee_letter: e.target.checked })} /> Committee letter</label>
          <label className="tracker__check"><input type="checkbox" checked={!!cl.casper_done} onChange={e => setCl({ casper_done: e.target.checked })} /> CASPer done</label>
          <label className="tracker__check"><input type="checkbox" checked={!!cl.preview_done} onChange={e => setCl({ preview_done: e.target.checked })} /> PREview done</label>
        </div>
      </section>

      {/* ── Per-school grid ── */}
      <section className="tracker__schools">
        <div className="tracker__schools-head">
          <h2 className="tracker__h">Schools ({data.schools.length})</h2>
          <div className="tracker__add">
            <input value={newName} placeholder="Add a school…" onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSchool()} />
            <button onClick={addSchool}>+ Add</button>
          </div>
        </div>
        <div className="tracker__scroll">
          <table className="tracker__table">
            <thead>
              <tr>
                <th>School</th><th>Tier</th><th>Status</th><th>Sec. deadline</th><th>Target</th>
                <th>Sec. received</th><th>Sec. submitted</th><th>CASPer</th><th>PREview</th><th>Interview</th><th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.schools.length === 0 && (
                <tr><td colSpan={11} className="tracker__empty">No schools yet — add one above.</td></tr>
              )}
              {data.schools.map((s, i) => {
                const overdue = s.secondary_deadline && s.secondary_deadline < today()
                  && s.status !== 'secondary-submitted' && !['interview-invited','interviewed','waitlisted','accepted','rejected','withdrawn'].includes(s.status ?? '')
                return (
                  <tr key={i}>
                    <td className="tracker__name">{s.name}</td>
                    <td><input className="tracker__sm" value={s.tier ?? ''} onChange={e => setSchool(mutate, i, { tier: e.target.value })} /></td>
                    <td>
                      <select value={s.status ?? 'pre-secondary'} onChange={e => setSchool(mutate, i, { status: e.target.value as SchoolStatus })} data-status={s.status}>
                        {STATUSES.map(st => <option key={st} value={st}>{STATUS_LABEL[st]}</option>)}
                      </select>
                    </td>
                    <td className={overdue ? 'tracker__overdue' : ''}>
                      <input type="date" value={s.secondary_deadline ?? ''} onChange={e => setSchool(mutate, i, { secondary_deadline: e.target.value })} />{overdue ? ' ⚠' : ''}
                    </td>
                    <td><input type="date" value={s.target_submit_date ?? ''} onChange={e => setSchool(mutate, i, { target_submit_date: e.target.value })} /></td>
                    <td><input type="date" value={s.secondary_received_date ?? ''} onChange={e => setSchool(mutate, i, { secondary_received_date: e.target.value })} /></td>
                    <td><input type="date" value={s.secondary_submitted_date ?? ''} onChange={e => setSchool(mutate, i, { secondary_submitted_date: e.target.value })} /></td>
                    <td className="tracker__c"><input type="checkbox" checked={!!s.casper_required} onChange={e => setSchool(mutate, i, { casper_required: e.target.checked })} /></td>
                    <td className="tracker__c"><input type="checkbox" checked={!!s.preview_required} onChange={e => setSchool(mutate, i, { preview_required: e.target.checked })} /></td>
                    <td><input type="date" value={s.interview_date ?? ''} onChange={e => setSchool(mutate, i, { interview_date: e.target.value })} /></td>
                    <td><input className="tracker__notes" value={s.notes ?? ''} onChange={e => setSchool(mutate, i, { notes: e.target.value })} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
