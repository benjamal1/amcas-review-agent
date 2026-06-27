import { useState } from 'react'
import { useData } from '../hooks/useData'
import { Editor } from '../components/editor/Editor'
import { ARCHETYPE_CATALOG, newBankEssay } from '../lib/secondaries'
import type { ComponentStatus, Secondaries } from '../lib/types'

const STATUSES: { v: ComponentStatus; label: string }[] = [
  { v: 'not-started', label: 'Not started' }, { v: 'drafting', label: 'Drafting' },
  { v: 'under-review', label: 'Under review' }, { v: 'final-edits', label: 'Final edits' },
  { v: 'ready', label: 'Ready' }, { v: 'submitted', label: 'Used' },
]

// The essay bank: master archetype drafts pre-written before secondaries arrive, reused per school.
export function EssayBankPage() {
  const { data, loading, mutate } = useData()
  const [selected, setSelected] = useState<string | null>(null)
  const [toAdd, setToAdd] = useState('')
  if (loading || !data) return <div className="dashboard__loading">Loading…</div>

  const bank = data.secondaries?.essay_bank ?? []
  const present = new Set(bank.map(b => b.archetype))
  const addable = ARCHETYPE_CATALOG.filter(a => !present.has(a.archetype))

  const editBank = (fn: (s: Secondaries) => Secondaries) =>
    mutate(d => ({ ...d, secondaries: fn(d.secondaries ?? { essay_bank: [] }) }))

  const setStatus = (archetype: string, status: ComponentStatus) =>
    editBank(s => ({ ...s, essay_bank: s.essay_bank.map(b => b.archetype === archetype ? { ...b, status } : b) }))

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
          <h2 className="tracker__h">Essay Bank</h2>
          <p className="tracker__hint">Master drafts (~400–600w). Adapt per school — don't paste.</p>
        </div>
        <ul className="sec-bank__items">
          {bank.map(b => (
            <li key={b.archetype} className={`sec-bank__item${selected === b.doc_path ? ' sec-bank__item--active' : ''}`}>
              <button className="sec-bank__name" onClick={() => setSelected(b.doc_path)}>
                {b.label}{b.pre_writable === false && <span className="sec-bank__tag">per-school</span>}
              </button>
              <select className="tracker__pill" data-status={b.status} value={b.status} onChange={e => setStatus(b.archetype, e.target.value as ComponentStatus)}>
                {STATUSES.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
              </select>
            </li>
          ))}
          {bank.length === 0 && <li className="tracker__hint">No drafts yet — add an archetype below.</li>}
        </ul>
        {addable.length > 0 && (
          <div className="sec-bank__add">
            <select value={toAdd} onChange={e => setToAdd(e.target.value)}>
              <option value="">Add archetype…</option>
              {addable.map(a => <option key={a.archetype} value={a.archetype}>{a.label}</option>)}
            </select>
            <button onClick={add} disabled={!toAdd}>+ Add</button>
          </div>
        )}
      </aside>
      <main className="editor-view__main">
        <div className="editor-view__doc"><Editor filePath={selected} /></div>
      </main>
    </div>
  )
}
