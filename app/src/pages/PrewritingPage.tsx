import { useState, useEffect, useRef } from 'react'
import { useData } from '../hooks/useData'
import { useEditSave } from '../hooks/useEditSave'
import { Editor } from '../components/editor/Editor'
import { AgentButton } from '../components/terminal/AgentButton'
import { ARCHETYPE_CATALOG, CORE_ARCHETYPES, GUIDING_QUESTIONS, newBankEssay } from '../lib/secondaries'
import { plusDays } from '../lib/format'
import type { BankEssay, ComponentStatus, Secondaries } from '../lib/types'

const STATUSES: { v: ComponentStatus; label: string }[] = [
  { v: 'not-started', label: 'Not started' }, { v: 'drafting', label: 'Drafting' },
  { v: 'under-review', label: 'Under review' }, { v: 'final-edits', label: 'Final edits' },
  { v: 'ready', label: 'Ready' }, { v: 'submitted', label: 'Used' },
]

// Prioritize by leverage: categories serving the most schools first, core order as tiebreak.
const sortBank = (bank: BankEssay[], count: (a: string) => number) =>
  [...bank].sort((a, b) => {
    const byCount = count(b.archetype) - count(a.archetype)
    if (byCount) return byCount
    const ai = CORE_ARCHETYPES.indexOf(a.archetype), bi = CORE_ARCHETYPES.indexOf(b.archetype)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

// Prewriting (Shemmassian step 1): brainstorm + draft a master essay per prompt category, reused
// per school. Each category carries its guiding questions + a freewrite draft.
export function PrewritingPage() {
  const { data, loading, mutate } = useData()
  const [selected, setSelected] = useState<string | null>(null)
  const [toAdd, setToAdd] = useState('')
  const seeded = useRef(false)

  // Once: seed the 6 core archetypes if missing + backfill default guiding questions on any entry
  // that predates the guiding_questions field (so they actually show up).
  useEffect(() => {
    if (!data || seeded.current) return
    const bank = data.secondaries?.essay_bank ?? []
    const present = new Set(bank.map(b => b.archetype))
    const missing = CORE_ARCHETYPES.filter(a => !present.has(a))
    const needsBackfill = bank.some(b => b.guiding_questions === undefined && GUIDING_QUESTIONS[b.archetype])
    if (missing.length === 0 && !needsBackfill) return
    seeded.current = true
    mutate(d => {
      const cur = d.secondaries?.essay_bank ?? []
      const filled = cur.map(b => b.guiding_questions === undefined && GUIDING_QUESTIONS[b.archetype]
        ? { ...b, guiding_questions: GUIDING_QUESTIONS[b.archetype] } : b)
      const adds = missing.map(a => {
        const c = ARCHETYPE_CATALOG.find(x => x.archetype === a)!
        return newBankEssay(c.archetype, c.label, c.pre_writable)
      })
      return { ...d, secondaries: { ...(d.secondaries ?? { essay_bank: [] }), essay_bank: [...filled, ...adds] } }
    })
  }, [data, mutate])

  if (loading || !data) return <div className="dashboard__loading">Loading…</div>

  // How many schools have a prompt mapped to each category → where prewriting has most leverage.
  const schools = data.schools ?? []
  const schoolCount = (archetype: string) => schools.filter(sc => (sc.secondary?.essays ?? []).some(e => e.maps_to === archetype)).length
  const bank = sortBank(data.secondaries?.essay_bank ?? [], schoolCount)
  const present = new Set(bank.map(b => b.archetype))
  const addable = ARCHETYPE_CATALOG.filter(a => !present.has(a.archetype))
  const active = bank.find(b => b.doc_path === selected) ?? bank[0]

  const editBank = (fn: (s: Secondaries) => Secondaries) =>
    mutate(d => ({ ...d, secondaries: fn(d.secondaries ?? { essay_bank: [] }) }))
  const patch = (archetype: string, p: Partial<BankEssay>) =>
    editBank(s => ({ ...s, essay_bank: s.essay_bank.map(b => b.archetype === archetype ? { ...b, ...p } : b) }))
  const saveQuestions = (archetype: string, qs: string[]) =>
    patch(archetype, { guiding_questions: qs.filter(q => q.trim() !== '') })

  function add() {
    const a = ARCHETYPE_CATALOG.find(x => x.archetype === toAdd)
    if (!a) return
    editBank(s => ({ ...s, essay_bank: [...s.essay_bank, newBankEssay(a.archetype, a.label, a.pre_writable)] }))
    setToAdd('')
  }

  return (
    <div className="page page--editor-view">
      <aside className="editor-view__tree sec-bank__list">
        <div className="sec-page__intro">
          <h2 className="tracker__h">Prewriting</h2>
          <p className="tracker__hint">One master draft per category, reused across schools. Ordered by how many schools need it.</p>
          <AgentButton className="agent-btn agent-btn--wide" phrase="find my secondary story gaps" label="✦ Find my story gaps" />
          <AgentButton className="agent-btn agent-btn--wide" phrase="cluster my secondary prompts" label="✦ Cluster my prompts" />
        </div>
        <ul className="sec-bank__items">
          {bank.map(b => {
            const n = schoolCount(b.archetype)
            return (
              <li key={b.archetype} className={`sec-bank__item${active?.doc_path === b.doc_path ? ' sec-bank__item--active' : ''}`}>
                <button className="sec-bank__name" onClick={() => setSelected(b.doc_path)}>
                  <span className="sec-bank__dot" data-status={b.status} title={b.status} />
                  <span className="sec-bank__label">{b.label}</span>
                  {b.pre_writable === false && <span className="sec-bank__tag">per-school</span>}
                  <span className="sec-bank__count" title={`${n} school${n === 1 ? '' : 's'} with a mapped prompt`}>{n}</span>
                </button>
              </li>
            )
          })}
          {bank.length === 0 && <li className="tracker__hint">Seeding the 6 core categories…</li>}
        </ul>
        {addable.length > 0 && (
          <div className="sec-bank__add">
            <select value={toAdd} onChange={e => setToAdd(e.target.value)}>
              <option value="">Add category…</option>
              {addable.map(a => <option key={a.archetype} value={a.archetype}>{a.label}</option>)}
            </select>
            <button onClick={add} disabled={!toAdd}>+ Add</button>
          </div>
        )}
      </aside>
      <main className="sec-prewrite">
        {active && (
          <>
            <div className="prewrite__head">
              <h2 className="tracker__h">{active.label}</h2>
              <div className="prewrite__head-actions">
                <select className="tracker__pill" data-status={active.status} value={active.status} onChange={e => patch(active.archetype, { status: e.target.value as ComponentStatus })}>
                  {STATUSES.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
                </select>
                <AgentButton phrase={`brainstorm secondary ideas for ${active.label}`} label="✦ Brainstorm ideas" />
              </div>
            </div>
            {active.pre_writable === false && <p className="tracker__hint prewrite__note">School-specific — write the anchor here, then layer specifics per school.</p>}
            {(() => {
              const mapped = (data.schools ?? []).filter(sc => (sc.secondary?.essays ?? []).some(e => e.maps_to === active.archetype))
              if (mapped.length === 0) return (
                <p className="tracker__hint prewrite__note" style={{ marginBottom: 4 }}>No prompts mapped here yet — run Cluster my prompts.</p>
              )
              return (
                <details className="prewrite__schools">
                  <summary className="prewrite__schools-label">{mapped.length} school{mapped.length === 1 ? '' : 's'} use this</summary>
                  <ul>
                    {mapped.map(sc => (
                      <li key={sc.name}>
                        <span>{sc.name}</span>
                        <span className="muted">
                          {sc.secondary_received_date
                            ? `received ${sc.secondary_received_date} · due ${plusDays(sc.secondary_received_date, 14)}`
                            : 'not received yet'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              )
            })()}
            <GuidingQuestions
              key={active.archetype}
              questions={active.guiding_questions ?? []}
              onSave={qs => saveQuestions(active.archetype, qs)}
            />
            <h3 className="prewrite__doc-label">Freewrite</h3>
            <div className="editor-view__doc prewrite__doc"><Editor filePath={active.doc_path} /></div>
          </>
        )}
      </main>
    </div>
  )
}

// Guiding questions for one category: clean numbered list, "Edit" to revise + Save/Cancel.
function GuidingQuestions({ questions, onSave }: { questions: string[]; onSave: (qs: string[]) => void }) {
  const { editing, draft, setDraft, start, cancel, save } = useEditSave(questions, onSave)

  if (!editing) {
    return (
      <details className="prewrite__qs">
        <summary className="prewrite__qs-head">
          <span>Guiding questions{questions.length > 0 ? ` (${questions.length})` : ''}</span>
          <button onClick={e => { e.preventDefault(); start() }}>✎ Edit</button>
        </summary>
        {questions.length === 0
          ? <p className="tracker__hint">No questions yet — Edit to add.</p>
          : <ol className="prewrite__qlist">{questions.map((q, i) => <li key={i} onClick={start} title="Click to edit">{q}</li>)}</ol>}
      </details>
    )
  }

  const setQ = (i: number, v: string) => setDraft(draft.map((q, idx) => (idx === i ? v : q)))
  const removeQ = (i: number) => setDraft(draft.filter((_, idx) => idx !== i))
  const addQ = () => setDraft([...draft, ''])
  return (
    <div className="prewrite__qs prewrite__qs--editing">
      <div className="prewrite__qs-head">
        <span>Guiding questions</span>
        <div className="prewrite__qs-actions">
          <button onClick={addQ}>+ question</button>
          <button onClick={cancel}>Cancel</button>
          <button className="prewrite__save" onClick={save}>Save</button>
        </div>
      </div>
      {draft.map((q, i) => (
        <div key={i} className="prewrite__q">
          <textarea className="prewrite__q-input" rows={2} value={q} placeholder="Guiding question…" onChange={e => setQ(i, e.target.value)} />
          <button className="sec-research__del" onClick={() => removeQ(i)} title="Remove">✕</button>
        </div>
      ))}
    </div>
  )
}
