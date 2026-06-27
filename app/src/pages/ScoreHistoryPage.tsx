import { useData } from '../hooks/useData'
import type { ScoreSnapshot } from '../lib/types'

// Dimension keys to surface as columns (everything except these meta keys).
const META = new Set(['date', 'mode', 'note', 'avg', 'composite'])
function dimCols(rows: ScoreSnapshot[]): string[] {
  const keys = new Set<string>()
  for (const r of rows) for (const k of Object.keys(r)) if (!META.has(k)) keys.add(k)
  return [...keys]
}
const pretty = (k: string) => k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

function HistoryTable({ rows, scoreKey }: { rows: ScoreSnapshot[]; scoreKey: 'avg' | 'composite' }) {
  if (!rows?.length) return <p className="hist__empty">No history yet.</p>
  const dims = dimCols(rows)
  return (
    <div className="hist__scroll">
      <table className="hist__table">
        <thead>
          <tr>
            <th>Date</th><th>Mode</th><th>{scoreKey === 'composite' ? 'Composite' : 'Avg'}</th>
            {dims.map(d => <th key={d}>{pretty(d)}</th>)}<th>Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td><td>{r.mode ?? '—'}</td>
              <td className="hist__score">{(r[scoreKey] as number | undefined) ?? '—'}</td>
              {dims.map(d => <td key={d}>{(r[d] as number | undefined) ?? '—'}</td>)}
              <td className="hist__note">{r.note ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ScoreHistoryPage() {
  const { data, loading } = useData()
  if (loading) return <div className="dashboard__loading">Loading…</div>
  if (!data) return <div className="dashboard__empty">No data.</div>
  const cs = data.component_scores
  const sections = [
    { id: 'composite', title: 'Composite', rows: data.scorecard?.composite_history ?? [], key: 'composite' as const },
    { id: 'ps', title: 'Personal Statement', rows: cs?.personal_statement?.history ?? [], key: 'avg' as const },
    { id: 'activities', title: 'Work & Activities', rows: cs?.activities?.history ?? [], key: 'avg' as const },
    { id: 'ie', title: 'Impactful Experience', rows: cs?.impactful_experience?.history ?? [], key: 'avg' as const },
  ]

  return (
    <div className="page page--single docs2">
      <nav className="docs2__toc">
        <span className="docs2__toc-label">Score History</span>
        {sections.map(s => <a key={s.id} href={`#${s.id}`}>{s.title} <span className="docs2__count">{s.rows.length}</span></a>)}
      </nav>
      <div className="docs2__body">
        {sections.map(s => (
          <section key={s.id} id={s.id} className="docs2__section">
            <h2 className="docs2__h">{s.title}</h2>
            <HistoryTable rows={s.rows} scoreKey={s.key} />
          </section>
        ))}
      </div>
    </div>
  )
}
