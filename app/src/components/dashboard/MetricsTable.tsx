import type { HardMetrics, Mutate } from '../../lib/types'

// Editable hard-metrics. GPAs are entered directly; the MCAT total is derived from its four
// section subscores (only the sections are editable — the total updates automatically).
const GPA_FIELDS: { key: keyof HardMetrics; label: string; min: number; max: number; step: number }[] = [
  { key: 'gpa_cumulative', label: 'GPA Cumulative', min: 0, max: 4, step: 0.01 },
  { key: 'gpa_bcpm', label: 'GPA BCPM', min: 0, max: 4, step: 0.01 },
]
const MCAT_SECTIONS: { key: keyof HardMetrics; label: string }[] = [
  { key: 'mcat_cp', label: 'Chem/Phys (C/P)' },
  { key: 'mcat_cars', label: 'CARS' },
  { key: 'mcat_bb', label: 'Bio/Biochem (B/B)' },
  { key: 'mcat_ps', label: 'Psych/Soc (P/S)' },
]

export function MetricsTable({ metrics, mutate }: { metrics: HardMetrics | undefined; mutate: Mutate }) {
  const m = metrics ?? {}
  const carsFlag = (m.mcat_cars ?? 999) < 127
  const bcpmFlag = m.gpa_bcpm != null && m.gpa_cumulative != null && m.gpa_bcpm < m.gpa_cumulative - 0.05

  // MCAT total = sum of the four sections (only when all four are present).
  const sectionVals = MCAT_SECTIONS.map(s => m[s.key])
  const total = sectionVals.every(v => typeof v === 'number') ? (sectionVals as number[]).reduce((a, b) => a + b, 0) : undefined

  function setGpa(key: keyof HardMetrics, raw: string) {
    const v = raw === '' ? undefined : Number(raw)
    if (v !== undefined && Number.isNaN(v)) return
    mutate(d => ({ ...d, scorecard: { ...d.scorecard, hard_metrics: { ...d.scorecard?.hard_metrics, [key]: v } } }))
  }

  function setSection(key: keyof HardMetrics, raw: string) {
    const v = raw === '' ? undefined : Number(raw)
    if (v !== undefined && Number.isNaN(v)) return
    mutate(d => {
      const hm = { ...d.scorecard?.hard_metrics, [key]: v }
      const vals = MCAT_SECTIONS.map(s => hm[s.key])
      hm.mcat_total = vals.every(x => typeof x === 'number') ? (vals as number[]).reduce((a, b) => a + b, 0) : undefined
      return { ...d, scorecard: { ...d.scorecard, hard_metrics: hm } }
    })
  }

  return (
    <div className="metrics-table">
      <div className="metrics-table__label">HARD METRICS</div>
      <table><tbody>
        {GPA_FIELDS.map(f => (
          <tr key={f.key}>
            <td>{f.label}{f.key === 'gpa_bcpm' && bcpmFlag ? ' ⚠' : ''}</td>
            <td>
              <input type="number" min={f.min} max={f.max} step={f.step}
                value={m[f.key] ?? ''} placeholder="—"
                onChange={e => setGpa(f.key, e.target.value)} aria-label={f.label} />
            </td>
          </tr>
        ))}
        <tr className="metrics-table__total">
          <td>MCAT Total</td>
          <td><span className="metrics-table__derived" title="Sum of the four section scores">{total ?? '—'}</span></td>
        </tr>
        {MCAT_SECTIONS.map(f => (
          <tr key={f.key} className="metrics-table__sub">
            <td>{f.label}{f.key === 'mcat_cars' && carsFlag ? ' ⚠' : ''}</td>
            <td>
              <input type="number" min={118} max={132} step={1}
                value={m[f.key] ?? ''} placeholder="—"
                onChange={e => setSection(f.key, e.target.value)} aria-label={f.label} />
            </td>
          </tr>
        ))}
      </tbody></table>
    </div>
  )
}
