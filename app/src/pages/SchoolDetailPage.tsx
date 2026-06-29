import { useState } from 'react'
import { NavLink, Outlet, useParams } from 'react-router-dom'
import { useData } from '../hooks/useData'
import { useFiles } from '../hooks/useFiles'
import { Editor } from '../components/editor/Editor'
import { FileTree } from '../components/editor/FileTree'
import { ScorecardSummary } from '../components/dashboard/ScorecardSummary'
import { injectPhrase } from '../components/terminal/Terminal'
import { AgentButton } from '../components/terminal/AgentButton'
import { schoolSlug, findSchoolBySlug, ARCHETYPE_CATALOG } from '../lib/secondaries'
import type { AppData, ComponentStatus, SchoolEntry, SchoolSecondary, SecondaryEssay } from '../lib/types'

const STATUSES: ComponentStatus[] = ['not-started', 'drafting', 'under-review', 'final-edits', 'ready', 'submitted']

// Shared: mutate one school's `secondary` block by slug.
function useSchool() {
  const { school: slug = '' } = useParams()
  const { data, loading, mutate } = useData()
  const school = data ? findSchoolBySlug(data.schools ?? [], slug) : undefined
  const editSecondary = (fn: (s: SchoolSecondary) => SchoolSecondary) =>
    mutate((d: AppData) => ({
      ...d,
      schools: (d.schools ?? []).map(s =>
        schoolSlug(s.name) === slug ? { ...s, secondary: fn(s.secondary ?? { essays: [] }) } : s),
    }))
  return { slug, data, loading, school, mutate, editSecondary }
}

// ── Layout: header + tab nav + outlet ──
export function SchoolDetailPage() {
  const { slug, loading, school } = useSchool()
  if (loading) return <div className="dashboard__loading">Loading…</div>
  if (!school) return <div className="page page--single"><div className="placeholder"><h2 className="placeholder__title">School not found</h2><p className="placeholder__body">No school matches “{slug}”. Add it on the Application Tracker.</p></div></div>
  return (
    <div className="page page--single sec-school">
      <div className="sec-school__head">
        <h2 className="tracker__h">{school.name}</h2>
        <nav className="sec-school__tabs">
          <NavLink end to={`/secondaries/${slug}/research`} className={({ isActive }) => `sec-school__tab${isActive ? ' sec-school__tab--active' : ''}`}>Research</NavLink>
          <NavLink end to={`/secondaries/${slug}/editor`} className={({ isActive }) => `sec-school__tab${isActive ? ' sec-school__tab--active' : ''}`}>Editor</NavLink>
          <NavLink end to={`/secondaries/${slug}/grading`} className={({ isActive }) => `sec-school__tab${isActive ? ' sec-school__tab--active' : ''}`}>Grading</NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  )
}

const RESOURCES = [
  { label: 'ProspectiveDoctor prompt database', url: 'https://www.prospectivedoctor.com/medical-school-secondary-essay-prompts-database/' },
  { label: 'Shemmassian prompt list', url: 'https://www.shemmassianconsulting.com/blog/medical-school-secondary-essay-prompts' },
  { label: 'Med School Insiders database', url: 'https://medschoolinsiders.com/medical-school-secondary-prompts-database/' },
  { label: 'MedicalSchoolHQ essay library', url: 'https://medicalschoolhq.net/medical-school-secondary-application-essay-library/' },
]

// ── Research tab: why-us notes doc + prompts table + resource links ──
export function SchoolResearchTab() {
  const { slug, school, editSecondary } = useSchool()
  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  if (!school) return null
  const sec = school.secondary ?? { essays: [] as SecondaryEssay[] }
  const notesPath = sec.research_notes_path ?? `documents/secondaries/${slug}/_research.md`
  const admitSlug = school.admit_slug as string | undefined
  const links = sec.links ?? []
  const addLink = () => {
    const url = linkUrl.trim()
    if (!url) return
    editSecondary(s => ({ ...s, links: [...(s.links ?? []), { label: linkLabel.trim() || url, url }] }))
    setLinkLabel(''); setLinkUrl('')
  }
  const removeLink = (i: number) => editSecondary(s => ({ ...s, links: (s.links ?? []).filter((_, idx) => idx !== i) }))

  const setEssay = (i: number, patch: Partial<SecondaryEssay>) =>
    editSecondary(s => ({ ...s, essays: s.essays.map((e, idx) => idx === i ? { ...e, ...patch } : e) }))
  const addEssay = () => editSecondary(s => ({ ...s, essays: [...s.essays, { prompt: '', status: 'not-started' }] }))
  const removeEssay = (i: number) => editSecondary(s => ({ ...s, essays: s.essays.filter((_, idx) => idx !== i) }))

  return (
    <div className="sec-school__body sec-research">
      <section className="sec-research__prompts">
        <div className="tracker__schools-head">
          <h3 className="tracker__h">Prompts</h3>
          <div className="sec-research__actions">
            <AgentButton phrase={`research fit for ${school.name}`} label="✦ Research fit" />
            <AgentButton phrase={`map secondary prompts for ${school.name}`} label="✦ Map prompts" />
            <button onClick={addEssay}>+ Prompt</button>
          </div>
        </div>
        <table className="tracker__table">
          <thead><tr><th>Prompt</th><th>Chars</th><th>Maps to</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {sec.essays.length === 0 && <tr><td colSpan={5} className="tracker__empty">No prompts yet.</td></tr>}
            {sec.essays.map((e, i) => (
              <tr key={i}>
                <td><input className="sec-research__prompt" value={e.prompt} placeholder="Prompt text…" onChange={ev => setEssay(i, { prompt: ev.target.value })} /></td>
                <td><input className="tracker__xs" type="number" value={e.char_limit ?? ''} onChange={ev => setEssay(i, { char_limit: ev.target.value === '' ? undefined : Number(ev.target.value) })} /></td>
                <td>
                  <select className="tracker__sm" value={e.maps_to ?? ''} onChange={ev => setEssay(i, { maps_to: ev.target.value })}>
                    <option value="">—</option>
                    {ARCHETYPE_CATALOG.map(a => <option key={a.archetype} value={a.archetype}>{a.label}</option>)}
                  </select>
                </td>
                <td>
                  <select data-status={e.status} value={e.status} onChange={ev => setEssay(i, { status: ev.target.value as ComponentStatus })}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td><button className="sec-research__del" onClick={() => removeEssay(i)} title="Remove">✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="tracker__hint">Prior-year prompts strongly predict this year's — pull from the links below.</p>
        <ul className="sec-research__links">
          {admitSlug && <li><a href={`https://med.admit.org/secondary-essays/${admitSlug}`} target="_blank" rel="noreferrer">admit.org — secondary prompts ↗</a></li>}
          {admitSlug && <li><a href={`https://med.admit.org/school-rankings/${admitSlug}`} target="_blank" rel="noreferrer">admit.org — school page ↗</a></li>}
          {RESOURCES.map(r => <li key={r.url}><a href={r.url} target="_blank" rel="noreferrer">{r.label} ↗</a></li>)}
          {links.map((l, i) => (
            <li key={`c${i}`}>
              <a href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
              <button className="sec-research__del" onClick={() => removeLink(i)} title="Remove link">✕</button>
            </li>
          ))}
        </ul>
        <div className="sec-research__addlink">
          <input value={linkLabel} placeholder="Label (optional)" onChange={e => setLinkLabel(e.target.value)} />
          <input value={linkUrl} placeholder="https://…" onChange={e => setLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLink()} />
          <button onClick={addLink}>+ Link</button>
        </div>
      </section>
      <section className="sec-research__notes">
        <h3 className="tracker__h">Why-us notes</h3>
        <div className="editor-view__doc"><Editor filePath={notesPath} /></div>
      </section>
    </div>
  )
}

// ── Editor tab: this school's secondary essay files ──
export function SchoolEditorTab() {
  const { slug } = useSchool()
  const { files } = useFiles()
  const [created, setCreated] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const prefix = `documents/secondaries/${slug}/`
  const mine = Array.from(new Set([...files.filter(f => f.startsWith(prefix) && !f.endsWith('_research.md')), ...created]))

  async function newEssay() {
    const n = mine.length + 1
    const path = `${prefix}${n}.md`
    await fetch(`/api/file?path=${encodeURIComponent(path)}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: '', frontmatter: {} }),
    })
    setCreated(c => [...c, path]); setSelected(path)
  }

  return (
    <div className="sec-school__body page--editor-view">
      <aside className="editor-view__tree">
        <button className="sec-bank__add" onClick={newEssay}>+ New essay</button>
        <FileTree files={mine} selected={selected} onSelect={setSelected} />
        {mine.length === 0 && <p className="tracker__hint">No essays yet — “New essay” to start.</p>}
      </aside>
      <main className="editor-view__main"><div className="editor-view__doc"><Editor filePath={selected} /></div></main>
    </div>
  )
}

// ── Grading tab: per-school regrade scorecard + run-regrade action ──
export function SchoolGradingTab() {
  const { school } = useSchool()
  if (!school) return null
  const sc = school.secondary?.scorecard ?? null

  const regrade = (s: SchoolEntry) => injectPhrase(`regrade secondaries for ${s.name}`)

  return (
    <div className="sec-school__body">
      <div className="tracker__schools-head">
        <h3 className="tracker__h">Regrade — primary baseline + {school.name}'s secondaries</h3>
        <button onClick={() => regrade(school)}>⟳ Run regrade in terminal</button>
      </div>
      {school.secondary?.last_regraded && <p className="tracker__hint">Last regraded {school.secondary.last_regraded}</p>}
      <ScorecardSummary sc={sc} empty="Not regraded yet. Run the regrade to recompute this school's composite with its secondaries as added evidence." />
    </div>
  )
}
