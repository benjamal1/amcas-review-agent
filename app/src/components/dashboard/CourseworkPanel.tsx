import { useState } from 'react'
import type { CourseEntry, Mutate } from '../../lib/types'

const BLANK: CourseEntry = { name: '', subject: '', course_no: '', year: '', level: '', term: '', type: '', grade: '' }

// Editable transcript coursework mirroring the AMCAS Academic Record. Feeds requirements checks +
// competency mapping. Columns follow AMCAS: level/year/term, classification (subject), course no,
// name, course type (AP/PF/CC), grade.
export function CourseworkPanel({ coursework, mutate }: { coursework: CourseEntry[] | undefined; mutate: Mutate }) {
  const rows = coursework ?? []
  const [draft, setDraft] = useState<CourseEntry>(BLANK)

  const set = (next: CourseEntry[]) => mutate(d => ({ ...d, coursework: next }))
  const add = () => { const n = draft.name.trim(); if (!n) return; set([...rows, { ...draft, name: n }]); setDraft(BLANK) }
  const remove = (i: number) => set(rows.filter((_, j) => j !== i))
  const edit = (i: number, field: keyof CourseEntry, v: string) =>
    set(rows.map((r, j) => (j === i ? { ...r, [field]: v } : r)))

  return (
    <div className="coursework-panel">
      <div className="metrics-table__label">COURSEWORK ({rows.length})</div>
      <div className="coursework-panel__scroll">
        <table className="coursework-table"><thead>
          <tr>
            <th>Lvl</th><th>Year</th><th>Term</th><th>Class</th><th>Course&nbsp;No</th><th>Course Name</th><th>Type</th><th>Grade</th><th></th>
          </tr>
        </thead><tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td><input className="cw-xs" value={r.level ?? ''} aria-label="Level" onChange={e => edit(i, 'level', e.target.value)} /></td>
              <td><input className="cw-sm" value={r.year ?? ''} aria-label="Year" onChange={e => edit(i, 'year', e.target.value)} /></td>
              <td><input className="cw-xs" value={r.term ?? ''} aria-label="Term" onChange={e => edit(i, 'term', e.target.value)} /></td>
              <td><input className="cw-xs" value={r.subject ?? ''} aria-label="Classification" onChange={e => edit(i, 'subject', e.target.value)} /></td>
              <td><input className="cw-sm" value={r.course_no ?? ''} aria-label="Course number" onChange={e => edit(i, 'course_no', e.target.value)} /></td>
              <td><input value={r.name} aria-label="Course name" onChange={e => edit(i, 'name', e.target.value)} /></td>
              <td><input className="cw-xs" value={r.type ?? ''} aria-label="Course type" onChange={e => edit(i, 'type', e.target.value)} /></td>
              <td><input className="cw-xs" value={r.grade ?? ''} aria-label="Grade" onChange={e => edit(i, 'grade', e.target.value)} /></td>
              <td><button onClick={() => remove(i)} aria-label="Remove">✕</button></td>
            </tr>
          ))}
          <tr>
            <td><input className="cw-xs" value={draft.level ?? ''} placeholder="FR" aria-label="New level" onChange={e => setDraft({ ...draft, level: e.target.value })} /></td>
            <td><input className="cw-sm" value={draft.year ?? ''} placeholder="2023-2024" aria-label="New year" onChange={e => setDraft({ ...draft, year: e.target.value })} /></td>
            <td><input className="cw-xs" value={draft.term ?? ''} placeholder="S1" aria-label="New term" onChange={e => setDraft({ ...draft, term: e.target.value })} /></td>
            <td><input className="cw-xs" value={draft.subject ?? ''} placeholder="BIOL" aria-label="New classification" onChange={e => setDraft({ ...draft, subject: e.target.value })} /></td>
            <td><input className="cw-sm" value={draft.course_no ?? ''} placeholder="BIOL 0200" aria-label="New course number" onChange={e => setDraft({ ...draft, course_no: e.target.value })} /></td>
            <td><input value={draft.name} placeholder="Add course…" aria-label="New course" onChange={e => setDraft({ ...draft, name: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') add() }} /></td>
            <td><input className="cw-xs" value={draft.type ?? ''} placeholder="AP" aria-label="New type" onChange={e => setDraft({ ...draft, type: e.target.value })} /></td>
            <td><input className="cw-xs" value={draft.grade ?? ''} placeholder="A" aria-label="New grade" onChange={e => setDraft({ ...draft, grade: e.target.value })} /></td>
            <td><button onClick={add}>+</button></td>
          </tr>
        </tbody></table>
      </div>
    </div>
  )
}
