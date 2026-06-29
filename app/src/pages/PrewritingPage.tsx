import { useState, useEffect, useRef } from 'react'
import { useData } from '../hooks/useData'
import { Editor } from '../components/editor/Editor'
import { ARCHETYPE_CATALOG, CORE_ARCHETYPES, newBankEssay } from '../lib/secondaries'
import type { BankEssay, ComponentStatus, Secondaries } from '../lib/types'

const STATUSES: { v: ComponentStatus; label: string }[] = [
  { v: 'not-started', label: 'Not started' }, { v: 'drafting', label: 'Drafting' },
  { v: 'under-review', label: 'Under review' }, { v: 'final-edits', label: 'Final edits' },
  { v: 'ready', label: 'Ready' }, { v: 'submitted', label: 'Used' },
]

// order: core 6 first (Shemmassian), then any added extras
const sortBank = (bank: BankEssay[]) =>
  [...bank].sort((a, b) => {
    const ai = CORE_ARCHETYPES.indexOf(a.archetype), bi = CORE_ARCHETYPES.indexOf(b.archetype)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

// Prewriting (Shemmassian step 1): brainstorm + draft a master essay per prompt category, reused
// per school. Each category carries its guiding question(s) + a freewrite draft.
export function PrewritingPage() {
  const { data, loading, mutate } = useData()
  const [selected, setSelected] = useState<string | null>(null)
  const [toAdd, setToAdd] = useState('')
  const seeded = useRef(false)

  // Seed the 6 core archetypes once if missing (idempotent — only appends cores not present).
  useEffect(() => {
    if (!data || seeded.current) return
    const present = new Set((data.secondaries?.essay_bank ?? []).map(b => b.archetype))
    const missing = CORE_ARCHETYPES.filter(a => !present.has(a))
    if (missing.length === 0) return
    seeded.current = true
    const adds = missing.map(a => {
      const c = ARCHETYPE_CATALOG.find(x => x.archetype === a)!
      return newBankEssay(c.archetype, c.label, c.pre_writable)
    })
    mutate(d => ({ ...d, secondaries: { ...(d.secondaries ?? { essay_bank: [] }), essay_bank: [...(d.secondaries?.essay_bank ?? []), ...adds] } }))
  }, [data, mutate])

  if (loading || !data) return <div className="dashboard__loading">Loading…</div>

  const bank = sortBank(data.secondaries?.essay_bank ?? [])
  const present = new Set(bank.map(b => b.archetype))
  const addable = ARCHETYPE_CATALOG.filter(a => !present.has(a.archetype))
  const active = bank.find(b => b.doc_path === selected) ?? bank[0]

  const editBank = (fn: (s: Secondaries) => Secondaries) =>
    mutate(d => ({ ...d, secondaries: fn(d.secondaries ?? { essay_bank: [] }) }))
  const patch = (archetype: string, p: Partial<BankEssay>) =>
    editBank(s => ({ ...s, essay_bank: s.essay_bank.map(b => b.archetype === archetype ? { ...b, ...p } : b) }))
  const setQuestions = (archetype: string, qs: string[]) => patch(archetype, { guiding_questions: qs })

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
          <p className="tracker__hint">Start right after submitting primaries. Per category: answer the guiding question, set a 15-min timer, freewrite without editing — then underline anything interesting, funny, unusual, or personal.</p>
        </div>
        <ul className="sec-bank__items">
          {bank.map(b => (
            <li key={b.archetype} className={`sec-bank__item${active?.doc_path === b.doc_path ? ' sec-bank__item--active' : ''}`}>
              <button className="sec-bank__name" onClick={() => setSelected(b.doc_path)}>
                {b.label}{b.pre_writable === false && <span className="sec-bank__tag">per-school</span>}
              </button>
              <select className="tracker__pill" data-status={b.status} value={b.status} onChange={e => patch(b.archetype, { status: e.target.value as ComponentStatus })}>
                {STATUSES.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
              </select>
            </li>
          ))}
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
      <main className="editor-view__main">
        {active && (
          <>
            <div className="sec-page__intro prewrite__head">
              <h2 className="tracker__h">{active.label}</h2>
              {active.pre_writable === false && <p className="tracker__hint">School-specific — write the anchor here, then layer specifics per school.</p>}
            </div>
            <GuidingQuestions
              questions={active.guiding_questions ?? []}
              onChange={qs => setQuestions(active.archetype, qs)}
            />
            <div className="editor-view__doc prewrite__doc"><Editor filePath={active.doc_path} /></div>
          </>
        )}
      </main>
    </div>
  )
}

// Editable list of guiding questions for one category.
function GuidingQuestions({ questions, onChange }: { questions: string[]; onChange: (qs: string[]) => void }) {
  const set = (i: number, v: string) => onChange(questions.map((q, idx) => (idx === i ? v : q)))
  const remove = (i: number) => onChange(questions.filter((_, idx) => idx !== i))
  const addOne = () => onChange([...questions, ''])
  return (
    <div className="prewrite__qs">
      <div className="prewrite__qs-head"><span>Guiding questions</span><button onClick={addOne}>+ question</button></div>
      {questions.length === 0 && <p className="tracker__hint">No questions yet — add one to brainstorm against.</p>}
      {questions.map((q, i) => (
        <div key={i} className="prewrite__q">
          <textarea className="prewrite__q-input" rows={2} value={q} placeholder="Guiding question…" onChange={e => set(i, e.target.value)} />
          <button className="sec-research__del" onClick={() => remove(i)} title="Remove">✕</button>
        </div>
      ))}
    </div>
  )
}
