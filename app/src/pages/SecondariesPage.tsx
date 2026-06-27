import { Link } from 'react-router-dom'
import { useData } from '../hooks/useData'
import { ScorecardSummary } from '../components/dashboard/ScorecardSummary'
import { schoolSlug, schoolEssayProgress, averageSecondaryScorecard, regradedCount } from '../lib/secondaries'

const today = () => new Date().toISOString().slice(0, 10)

// Secondaries Overview: progress across schools (essay completion + deadlines) and the grading
// average (mean of per-school regrades). Each school links to its routed detail.
export function SecondariesPage() {
  const { data, loading } = useData()
  if (loading || !data) return <div className="dashboard__loading">Loading…</div>
  const schools = data.schools ?? []
  const avg = averageSecondaryScorecard(schools)
  const graded = regradedCount(schools)

  const totals = schools.reduce((acc, s) => {
    const p = schoolEssayProgress(s)
    acc.done += p.done; acc.total += p.total
    return acc
  }, { done: 0, total: 0 })
  const pct = totals.total ? Math.round((totals.done / totals.total) * 100) : 0

  return (
    <div className="page page--single sec-overview">
      <section className="sec-overview__progress">
        <div className="tracker__primary-head">
          <h2 className="tracker__h">Secondary Essays</h2>
          <span className="tracker__ready">{totals.done}/{totals.total} essays ready</span>
        </div>
        <div className="tracker__bar"><span className="tracker__bar-fill" style={{ width: `${pct}%` }} /></div>

        {schools.length === 0 && <p className="tracker__hint">No schools yet — add them on the Application Tracker.</p>}
        <table className="tracker__table sec-overview__table">
          <thead>
            <tr><th>School</th><th>Essays</th><th>Sec. deadline</th><th>Regrade</th><th></th></tr>
          </thead>
          <tbody>
            {schools.map(s => {
              const p = schoolEssayProgress(s)
              const overdue = s.secondary_deadline && s.secondary_deadline < today()
              const composite = s.secondary?.scorecard?.composite
              return (
                <tr key={s.name}>
                  <td className="tracker__name">{s.name}</td>
                  <td>{p.total ? `${p.done}/${p.total}` : '—'}</td>
                  <td className={overdue ? 'tracker__overdue' : ''}>{s.secondary_deadline ?? '—'}{overdue ? ' ⚠' : ''}</td>
                  <td>{composite != null ? `${composite}/100` : '—'}</td>
                  <td><Link className="sec-overview__open" to={`/secondaries/${schoolSlug(s.name)}/research`}>Open →</Link></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className="sec-overview__grading">
        <ScorecardSummary
          sc={avg}
          title={`Secondaries Grading Overview — average of ${graded} regraded school${graded === 1 ? '' : 's'}`}
          empty="No schools regraded yet. Open a school → Grading to run its regrade."
        />
      </section>
    </div>
  )
}
