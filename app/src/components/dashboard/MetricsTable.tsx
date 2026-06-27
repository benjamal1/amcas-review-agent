import type { HardMetrics, Mutate } from '../../lib/types'

// Editable hard-metrics. Writes scorecard.hard_metrics via mutate; ranges mirror server validation.
const FIELDS: { key: keyof HardMetrics; label: string; min: number; max: number; step: number }[] = [
  { key: 'gpa_cumulative', label: 'GPA Cumulative', min: 0, max: 4, step: 0.01 },
  { key: 'gpa_bcpm', label: 'GPA BCPM', min: 0, max: 4, step: 0.01 },
  { key: 'mcat_total', label: 'MCAT Total', min: 472, max: 528, step: 1 },
  { key: 'mcat_cars', label: 'CARS', min: 118, max: 132, step: 1 },
  { key: 'mcat_cp', label: 'C/P', min: 118, max: 132, step: 1 },
  { key: 'mcat_bb', label: 'B/B', min: 118, max: 132, step: 1 },
  { key: 'mcat_ps', label: 'P/S', min: 118, max: 132, step: 1 },
]

export function MetricsTable({ metrics, mutate }: { metrics: HardMetrics | undefined; mutate: Mutate }) {
  const m = metrics ?? {}
  const carsFlag = (m.mcat_cars ?? 999) < 127
  const bcpmFlag = m.gpa_bcpm != null && m.gpa_cumulative != null && m.gpa_bcpm < m.gpa_cumulative - 0.05

  function set(key: keyof HardMetrics, raw: string) {
    const v = raw === '' ? undefined : Number(raw)
    if (v !== undefined && Number.isNaN(v)) return
    mutate(d => ({
      ...d,
      scorecard: { ...d.scorecard, hard_metrics: { ...d.scorecard?.hard_metrics, [key]: v } },
    }))
  }

  return (
    <div className="metrics-table">
      <div className="metrics-table__label">HARD METRICS</div>
      <table><tbody>
        {FIELDS.map(f => {
          const flagged = (f.key === 'mcat_cars' && carsFlag) || (f.key === 'gpa_bcpm' && bcpmFlag)
          return (
            <tr key={f.key}>
              <td>{f.label}{flagged ? ' ⚠' : ''}</td>
              <td>
                <input
                  type="number" min={f.min} max={f.max} step={f.step}
                  value={m[f.key] ?? ''} placeholder="—"
                  onChange={e => set(f.key, e.target.value)}
                  aria-label={f.label}
                />
              </td>
            </tr>
          )
        })}
      </tbody></table>
    </div>
  )
}
