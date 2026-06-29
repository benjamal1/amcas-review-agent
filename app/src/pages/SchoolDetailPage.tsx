import { useState, useEffect } from 'react'
import { NavLink, Outlet, useParams } from 'react-router-dom'
import { marked } from 'marked'
import { useData } from '../hooks/useData'
import { useEditSave } from '../hooks/useEditSave'
import { Editor } from '../components/editor/Editor'
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
const mapsLabel = (key?: string) => ARCHETYPE_CATALOG.find(a => a.archetype === key)?.label ?? key ?? '—'

export function SchoolResearchTab() {
  const { slug, school, editSecondary } = useSchool()
  if (!school) return null
  const sec = school.secondary ?? { essays: [] as SecondaryEssay[] }
  const notesPath = sec.research_notes_path ?? `documents/secondaries/${slug}/_research.md`
  const admitSlug = school.admit_slug as string | undefined

  return (
    <div className="sec-school__body sec-research">
      <section className="sec-research__prompts">
        <div className="tracker__schools-head">
          <h3 className="tracker__h">Prompts</h3>
          <div className="sec-research__actions">
            <AgentButton phrase={`research fit for ${school.name}`} label="✦ Research fit" />
            <AgentButton phrase={`map secondary prompts for ${school.name}`} label="✦ Map prompts" />
          </div>
        </div>
        <PromptsTable essays={sec.essays} onSave={essays => editSecondary(s => ({ ...s, essays }))} />
        <p className="tracker__hint">Prior-year prompts strongly predict this year's — pull from the links below.</p>
        <ResearchLinks admitSlug={admitSlug} links={sec.links ?? []} onSave={ls => editSecondary(s => ({ ...s, links: ls }))} />
      </section>
      <section className="sec-research__notes">
        <h3 className="tracker__h">Why-us notes</h3>
        <div className="editor-view__doc"><Editor filePath={notesPath} /></div>
      </section>
    </div>
  )
}

// Prompts: clean read-only table; "Edit" to revise rows + Save/Cancel.
function PromptsTable({ essays, onSave }: { essays: SecondaryEssay[]; onSave: (e: SecondaryEssay[]) => void }) {
  const { editing, draft, setDraft, start, cancel, save } = useEditSave(essays, onSave)
  const setE = (i: number, p: Partial<SecondaryEssay>) => setDraft(draft.map((e, idx) => idx === i ? { ...e, ...p } : e))

  if (!editing) {
    return (
      <>
        <div className="sec-research__bar">
          <button onClick={start}>✎ Edit prompts</button>
        </div>
        <table className="tracker__table tracker__table--prompts">
          <thead><tr><th>Prompt</th><th>Chars</th><th>Type</th><th>Maps to</th><th>Status</th></tr></thead>
          <tbody>
            {essays.length === 0 && <tr><td colSpan={5} className="tracker__empty">No prompts yet — Edit to add.</td></tr>}
            {essays.map((e, i) => (
              <tr key={i} onClick={start} title="Click to edit">
                <td>{e.prompt || <span className="tracker__empty">—</span>}</td>
                <td>{e.char_limit ?? '—'}</td>
                <td><span className={`prompt-type prompt-type--${e.confirmed ? 'confirmed' : 'anticipated'}`}>{e.confirmed ? 'Confirmed' : 'Anticipated'}</span></td>
                <td>{mapsLabel(e.maps_to)}</td>
                <td><span className="tracker__pill" data-status={e.status}>{e.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )
  }

  return (
    <>
      <div className="sec-research__bar">
        <button onClick={() => setDraft([...draft, { prompt: '', status: 'not-started' }])}>+ Prompt</button>
        <button onClick={cancel}>Cancel</button>
        <button className="prewrite__save" onClick={save}>Save</button>
      </div>
      <table className="tracker__table tracker__table--prompts">
        <thead><tr><th>Prompt</th><th>Chars</th><th>Type</th><th>Maps to</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {draft.map((e, i) => (
            <tr key={i}>
              <td><textarea className="sec-research__prompt" rows={2} value={e.prompt} placeholder="Prompt text…" onChange={ev => setE(i, { prompt: ev.target.value })} /></td>
              <td><input className="tracker__xs" type="number" value={e.char_limit ?? ''} onChange={ev => setE(i, { char_limit: ev.target.value === '' ? undefined : Number(ev.target.value) })} /></td>
              <td>
                <select className="tracker__sm" value={e.confirmed ? 'confirmed' : 'anticipated'} onChange={ev => setE(i, { confirmed: ev.target.value === 'confirmed' })}>
                  <option value="anticipated">Anticipated</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </td>
              <td>
                <select className="tracker__sm" value={e.maps_to ?? ''} onChange={ev => setE(i, { maps_to: ev.target.value })}>
                  <option value="">—</option>
                  {ARCHETYPE_CATALOG.map(a => <option key={a.archetype} value={a.archetype}>{a.label}</option>)}
                </select>
              </td>
              <td>
                <select data-status={e.status} value={e.status} onChange={ev => setE(i, { status: ev.target.value as ComponentStatus })}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td><button className="sec-research__del" onClick={() => setDraft(draft.filter((_, idx) => idx !== i))} title="Remove">✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

// Reference links: static prompt-DBs always shown; user links managed behind "Edit".
function ResearchLinks({ admitSlug, links, onSave }: { admitSlug?: string; links: { label: string; url: string }[]; onSave: (l: { label: string; url: string }[]) => void }) {
  const { editing, draft, setDraft, start, cancel, save } = useEditSave(links, onSave)
  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const addLink = () => {
    const url = linkUrl.trim()
    if (!url) return
    setDraft([...draft, { label: linkLabel.trim() || url, url }])
    setLinkLabel(''); setLinkUrl('')
  }

  return (
    <>
      <ul className="sec-research__links">
        {admitSlug && <li><a href={`https://med.admit.org/secondary-essays/${admitSlug}`} target="_blank" rel="noreferrer">admit.org — secondary prompts ↗</a></li>}
        {admitSlug && <li><a href={`https://med.admit.org/school-rankings/${admitSlug}`} target="_blank" rel="noreferrer">admit.org — school page ↗</a></li>}
        {RESOURCES.map(r => <li key={r.url}><a href={r.url} target="_blank" rel="noreferrer">{r.label} ↗</a></li>)}
        {!editing && links.map((l, i) => (
          <li key={`c${i}`}><a href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a></li>
        ))}
        {editing && draft.map((l, i) => (
          <li key={`c${i}`}>
            <a href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
            <button className="sec-research__del" onClick={() => setDraft(draft.filter((_, idx) => idx !== i))} title="Remove link">✕</button>
          </li>
        ))}
      </ul>
      {!editing && <div className="sec-research__bar"><button onClick={start}>✎ Edit links</button></div>}
      {editing && (
        <>
          <div className="sec-research__addlink">
            <input value={linkLabel} placeholder="Label (optional)" onChange={e => setLinkLabel(e.target.value)} />
            <input value={linkUrl} placeholder="https://…" onChange={e => setLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLink()} />
            <button onClick={addLink}>+ Link</button>
          </div>
          <div className="sec-research__bar">
            <button onClick={cancel}>Cancel</button>
            <button className="prewrite__save" onClick={save}>Save</button>
          </div>
        </>
      )}
    </>
  )
}

const truncate = (s: string, n = 46) => (s.length > n ? s.slice(0, n).trimEnd() + '…' : s)

// ── Editor tab: one essay doc per prompt; prompt + relevant prewriting shown above the editor ──
export function SchoolEditorTab() {
  const { slug, school, editSecondary } = useSchool()
  const [sel, setSel] = useState<number | null>(null)
  if (!school) return null
  const essays = school.secondary?.essays ?? []
  const active = sel !== null ? essays[sel] : undefined
  const docPath = active ? (active.doc_path ?? `documents/secondaries/${slug}/${sel! + 1}.md`) : null

  // On first open, persist a stable doc_path on the prompt so the essay sticks to it.
  const openEssay = (i: number) => {
    if (!essays[i].doc_path) {
      editSecondary(s => ({ ...s, essays: s.essays.map((e, idx) => idx === i ? { ...e, doc_path: `documents/secondaries/${slug}/${idx + 1}.md` } : e) }))
    }
    setSel(i)
  }

  return (
    <div className="sec-school__body page--editor-view">
      <aside className="editor-view__tree">
        {essays.length === 0
          ? <p className="tracker__hint">No prompts yet — add them on the Research tab.</p>
          : <ul className="sec-bank__items">
              {essays.map((e, i) => (
                <li key={i} className={`sec-bank__item${sel === i ? ' sec-bank__item--active' : ''}`}>
                  <button className="sec-bank__name" onClick={() => openEssay(i)}>
                    {e.prompt ? truncate(e.prompt) : `Prompt ${i + 1}`}
                    {e.char_limit ? <span className="sec-bank__tag">{e.char_limit}ch</span> : null}
                  </button>
                </li>
              ))}
            </ul>}
      </aside>
      <main className="editor-view__main">
        {active ? (
          <>
            <PromptHeader essay={active} />
            <div className="editor-view__doc"><Editor filePath={docPath} /></div>
          </>
        ) : <p className="tracker__hint">Select a prompt to write.</p>}
      </main>
    </div>
  )
}

// Prompt text + meta above the editor, with the mapped category's prewriting available inline.
function PromptHeader({ essay }: { essay: SecondaryEssay }) {
  const [showPrewrite, setShowPrewrite] = useState(false)
  const bankPath = essay.maps_to ? `documents/secondaries/_bank/${essay.maps_to}.md` : null
  return (
    <div className="sec-editor__prompt">
      <div className="sec-editor__prompt-row">
        <p className="sec-editor__prompt-text">{essay.prompt || <span className="tracker__hint">No prompt text — add it on the Research tab.</span>}</p>
        <div className="sec-editor__prompt-meta">
          <span className={`prompt-type prompt-type--${essay.confirmed ? 'confirmed' : 'anticipated'}`}>{essay.confirmed ? 'Confirmed' : 'Anticipated'}</span>
          {essay.char_limit ? <span className="sec-editor__chars">{essay.char_limit} chars</span> : null}
        </div>
      </div>
      {bankPath && (
        <div className="sec-editor__prewrite">
          <button className="sec-editor__prewrite-toggle" onClick={() => setShowPrewrite(v => !v)}>
            {showPrewrite ? '▾' : '▸'} Relevant prewriting — {mapsLabel(essay.maps_to)}
          </button>
          {showPrewrite && <ReadonlyDoc path={bankPath} />}
        </div>
      )}
    </div>
  )
}

// Read-only render of a markdown doc (the mapped prewriting freewrite).
function ReadonlyDoc({ path }: { path: string }) {
  const [content, setContent] = useState<string | null>(null)
  useEffect(() => {
    let dead = false
    fetch(`/api/file?path=${encodeURIComponent(path)}`)
      .then(r => (r.ok ? r.json() : { content: '' }))
      .then(d => { if (!dead) setContent(d.content ?? '') })
      .catch(() => { if (!dead) setContent('') })
    return () => { dead = true }
  }, [path])
  if (content === null) return <p className="tracker__hint">Loading…</p>
  if (!content.trim()) return <p className="tracker__hint">No prewriting drafted for this category yet — start it under Prewriting.</p>
  return <div className="sec-editor__prewrite-body markdown-body" dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }} />
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
