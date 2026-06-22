
import type { SchoolEntry } from '../../lib/types'
const TIERS = ['reach', 'target', 'safety'] as const
const TC: Record<string, string> = { reach: 'var(--color-danger)', target: 'var(--color-warn)', safety: 'var(--color-pos)' }
export function SchoolListPanel({ schools }: { schools: SchoolEntry[] }) {
  const byTier = Object.fromEntries(TIERS.map(t => [t, schools.filter(s => s.tier?.toLowerCase() === t)])) as Record<string, SchoolEntry[]>
  const unknown = schools.filter(s => !s.tier || !TIERS.includes(s.tier.toLowerCase() as typeof TIERS[number]))
  const pipeCount = (kw: string) => schools.filter(s => s.pipeline?.toLowerCase().includes(kw)).length
  return (
    <div className="school-panel">
      <div className="tile__label">SCHOOL LIST ({schools.length})</div>
      <div className="school-pipeline">
        {[['Primaries Submitted', 'submitted'], ['Secondaries', 'secondary'], ['Interviews', 'interview']].map(([l, kw]) => (
          <div key={kw} className="pipeline-row"><span>{l}</span><span className="mono">{pipeCount(kw)}</span></div>
        ))}
      </div>
      <div className="school-tiers">
        {[...TIERS, 'unknown'].map(tier => {
          const list = tier === 'unknown' ? unknown : (byTier[tier] ?? [])
          if (!list.length) return null
          return (
            <div key={tier} className="school-tier">
              <div className="school-tier__header" style={{ color: TC[tier] ?? 'var(--color-muted)' }}>{tier.toUpperCase()} ({list.length})</div>
              <ul>{list.map(s => <li key={s.name} className="school-tier__item">{s.name}{s.casper_required && <span className="school-tag">CASPer</span>}{s.preview_required && <span className="school-tag">PREview</span>}</li>)}</ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
