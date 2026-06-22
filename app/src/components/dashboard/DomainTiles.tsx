
import type { DomainScore } from '../../lib/types'
const LABELS: Record<string, string> = { personal_narrative: 'Personal Narrative', clinical_experience: 'Clinical', research_academics: 'Research / Academics', extracurriculars: 'Extracurriculars', service_community: 'Service' }
const sc = (v: number) => v >= 8 ? 'var(--color-pos)' : v >= 5 ? 'var(--color-warn)' : 'var(--color-danger)'
const tc = (t: string) => t === '↑' ? 'var(--color-pos)' : t === '↓' ? 'var(--color-danger)' : 'var(--color-muted)'
export function DomainTiles({ domains }: { domains: Record<string, DomainScore> | undefined }) {
  if (!domains) return <div className="tile__empty">No domain data</div>
  return (
    <div className="domain-tiles">
      {Object.entries(domains).map(([k, d]) => (
        <div key={k} className="tile tile--domain">
          <div className="tile__label">{(LABELS[k] ?? k).toUpperCase()}</div>
          <div className="tile__score" style={{ color: sc(d.avg) }}>{d.avg?.toFixed(1) ?? '—'}<span className="tile__denom">/10</span></div>
          <span style={{ color: tc(d.trend), fontSize: 14 }}>{d.trend}</span>
          {d.last_updated && <div className="tile__date">{d.last_updated}</div>}
        </div>
      ))}
    </div>
  )
}
