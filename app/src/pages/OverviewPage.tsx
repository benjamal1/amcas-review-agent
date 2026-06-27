import { Link } from 'react-router-dom'
import { useData } from '../hooks/useData'
import { ScorecardSummary } from '../components/dashboard/ScorecardSummary'
import { averageSecondaryScorecard, regradedCount, schoolEssayProgress } from '../lib/secondaries'
import type { ComponentStatus } from '../lib/types'

const DONE: ComponentStatus[] = ['ready', 'submitted']

// Top-level roll-up: primary composite + secondaries average + tracking snapshot, each linking
// into its section. Read-only at-a-glance; editing lives on Grading / the per-school pages.
export function OverviewPage() {
  const { data, loading } = useData()
  if (loading || !data) return <div className="dashboard__loading">Loading…</div>
  const schools = data.schools ?? []
  const avg = averageSecondaryScorecard(schools)
  const graded = regradedCount(schools)

  const pc = data.primary_components ?? {}
  const pcVals = Object.values(pc).filter(c => c.status !== 'not-applicable')
  const pcReady = pcVals.filter(c => DONE.includes(c.status)).length
  const secTot = schools.reduce((a, s) => { const p = schoolEssayProgress(s); a.done += p.done; a.total += p.total; return a }, { done: 0, total: 0 })

  return (
    <div className="page page--grading rollup">
      <div className="rollup__row">
        <Link to="/grading" className="rollup__col">
          <ScorecardSummary sc={data.scorecard ?? null} title="Primary Application — primary essays only" empty="No primary scores yet." />
        </Link>
        <Link to="/secondaries" className="rollup__col">
          <ScorecardSummary sc={avg} title={`Secondaries — average of ${graded} regraded school${graded === 1 ? '' : 's'}`} empty="No schools regraded yet." />
        </Link>
      </div>
      <Link to="/tracker" className="rollup__tracking">
        <span className="rollup__stat"><b>{pcReady}/{pcVals.length}</b> primary components ready</span>
        <span className="rollup__stat"><b>{secTot.done}/{secTot.total}</b> secondary essays ready</span>
        <span className="rollup__stat"><b>{schools.length}</b> schools</span>
      </Link>
    </div>
  )
}
