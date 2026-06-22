
import type { HardMetrics } from '../../lib/types'
export function MetricsTable({ metrics }: { metrics: HardMetrics | undefined }) {
  if (!metrics) return <div className="tile__empty">No metrics</div>
  const carsFlag = (metrics.mcat_cars ?? 999) < 127
  const bcpmFlag = metrics.gpa_bcpm !== undefined && metrics.gpa_cumulative !== undefined && metrics.gpa_bcpm < metrics.gpa_cumulative - 0.05
  const rows: [string, string | number | undefined][] = [
    ['GPA Cumulative', metrics.gpa_cumulative?.toFixed(2)],
    [bcpmFlag ? 'GPA BCPM ⚠' : 'GPA BCPM', metrics.gpa_bcpm?.toFixed(2)],
    ['MCAT Total', metrics.mcat_total],
    [carsFlag ? 'CARS ⚠ <127' : 'CARS', metrics.mcat_cars],
    ['C/P', metrics.mcat_cp], ['B/B', metrics.mcat_bb], ['P/S', metrics.mcat_ps],
  ]
  return (
    <div className="metrics-table">
      <div className="metrics-table__label">HARD METRICS</div>
      <table><tbody>{rows.map(([l, v]) => <tr key={String(l)}><td>{l}</td><td>{v ?? '—'}</td></tr>)}</tbody></table>
    </div>
  )
}
