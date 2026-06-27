import { useState } from 'react'
import type { CourseEntry, Mutate } from '../../lib/types'

// Editable transcript coursework ({ name, subject }). Feeds requirements checks + competency mapping.
export function CourseworkPanel({ coursework, mutate }: { coursework: CourseEntry[] | undefined; mutate: Mutate }) {
  const rows = coursework ?? []
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')

  const set = (next: CourseEntry[]) => mutate(d => ({ ...d, coursework: next }))
  const add = () => { const n = name.trim(); if (!n) return; set([...rows, { name: n, subject: subject.trim() }]); setName(''); setSubject('') }
  const remove = (i: number) => set(rows.filter((_, j) => j !== i))
  const edit = (i: number, field: keyof CourseEntry, v: string) =>
    set(rows.map((r, j) => (j === i ? { ...r, [field]: v } : r)))

  return (
    <div className="coursework-panel">
      <div className="metrics-table__label">COURSEWORK ({rows.length})</div>
      <table><tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td><input value={r.name} aria-label="Course name" onChange={e => edit(i, 'name', e.target.value)} /></td>
            <td><input value={r.subject ?? ''} placeholder="subject" aria-label="Subject" onChange={e => edit(i, 'subject', e.target.value)} /></td>
            <td><button onClick={() => remove(i)} aria-label="Remove">✕</button></td>
          </tr>
        ))}
        <tr>
          <td><input value={name} placeholder="Add course…" aria-label="New course" onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add() }} /></td>
          <td><input value={subject} placeholder="subject" aria-label="New subject" onChange={e => setSubject(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add() }} /></td>
          <td><button onClick={add}>+</button></td>
        </tr>
      </tbody></table>
    </div>
  )
}
