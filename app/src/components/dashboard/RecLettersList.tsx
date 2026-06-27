import { useState } from 'react'
import type { RecLetter, Mutate } from '../../lib/types'

const STATUSES = ['pending', 'requested', 'received', 'submitted']

// Editable rec-letter status rows (recommender/status/submitted). The AI review/score is separate.
export function RecLettersList({ letters, mutate }: { letters: RecLetter[]; mutate: Mutate }) {
  const [name, setName] = useState('')
  const set = (next: RecLetter[]) => mutate(d => ({ ...d, rec_letters: next }))
  const edit = (i: number, patch: Partial<RecLetter>) => set(letters.map((l, j) => (j === i ? { ...l, ...patch } : l)))
  const remove = (i: number) => set(letters.filter((_, j) => j !== i))
  const add = () => { const n = name.trim(); if (!n) return; set([...letters, { recommender: n, status: 'pending', submitted: false }]); setName('') }

  return (
    <div className="rec-list">
      <div className="tile__label">REC LETTERS ({letters.filter(l => l.submitted).length}/{letters.length})</div>
      <ul>
        {letters.map((l, i) => (
          <li key={i} className="rec-list__item">
            <input
              className="rec-list__name" value={l.recommender ?? l.name ?? ''} aria-label="Recommender"
              onChange={e => edit(i, { recommender: e.target.value })}
            />
            <select value={l.status ?? 'pending'} aria-label="Status" onChange={e => edit(i, { status: e.target.value })}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className="rec-list__submitted">
              <input type="checkbox" checked={!!l.submitted} onChange={e => edit(i, { submitted: e.target.checked })} /> submitted
            </label>
            <button onClick={() => remove(i)} aria-label="Remove">✕</button>
          </li>
        ))}
      </ul>
      <div className="rec-list__add">
        <input value={name} placeholder="Add recommender…" aria-label="New recommender"
          onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add() }} />
        <button onClick={add}>Add</button>
      </div>
    </div>
  )
}
