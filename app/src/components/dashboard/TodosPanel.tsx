import { useState } from 'react'
import type { AppData, Mutate } from '../../lib/types'

type Todos = AppData['todos']

// Editable meeting todos. Check moves open→done; uncheck moves back; add appends to open.
export function TodosPanel({ todos, mutate }: { todos: Todos | undefined; mutate: Mutate }) {
  const open = todos?.open ?? []
  const done = todos?.done ?? []
  const [draft, setDraft] = useState('')

  const setTodos = (next: Todos) => mutate(d => ({ ...d, todos: next }))
  const check = (i: number) => setTodos({ open: open.filter((_, j) => j !== i), done: [...done, open[i]] })
  const uncheck = (i: number) => setTodos({ open: [...open, done[i]], done: done.filter((_, j) => j !== i) })
  const add = () => { const t = draft.trim(); if (!t) return; setTodos({ open: [...open, t], done }); setDraft('') }

  return (
    <div className="tile tile--todos">
      <div className="tile__label">MEETING TODOS ({open.length} open / {done.length} done)</div>
      <ul className="todos__list">
        {open.map((t, i) => (
          <li key={`o${i}`}>
            <label><input type="checkbox" checked={false} onChange={() => check(i)} /> {t}</label>
          </li>
        ))}
        {done.map((t, i) => (
          <li key={`d${i}`} className="todos__done">
            <label><input type="checkbox" checked readOnly onChange={() => uncheck(i)} /> <s>{t}</s></label>
          </li>
        ))}
      </ul>
      <div className="todos__add">
        <input
          value={draft} placeholder="Add a todo…" aria-label="New todo"
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add() }}
        />
        <button onClick={add}>Add</button>
      </div>
    </div>
  )
}
