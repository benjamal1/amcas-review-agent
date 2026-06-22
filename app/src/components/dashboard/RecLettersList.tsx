
import type { RecLetter } from '../../lib/types'
function icon(s?: string) { const v = (s ?? '').toLowerCase(); return v.includes('submitted') || v.includes('received') ? '✓' : v.includes('pending') ? '◷' : '○' }
export function RecLettersList({ letters }: { letters: RecLetter[] }) {
  return (
    <div className="rec-list">
      <div className="tile__label">REC LETTERS ({letters.filter(l => l.submitted).length}/{letters.length})</div>
      {!letters.length ? <div className="tile__empty">No letters tracked</div> : (
        <ul>{letters.map((l, i) => <li key={i} className="rec-list__item"><span className="rec-list__icon">{icon(l.status)}</span><span>{l.recommender ?? l.name}</span>{l.status && <span className="rec-list__status">{l.status}</span>}</li>)}</ul>
      )}
    </div>
  )
}
