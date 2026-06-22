import React from 'react'
import type { Competency } from '../../lib/types'
function color(tier?: string, score?: number) {
  if (tier === 'Strong' || (score !== undefined && score >= 8)) return 'var(--color-pos)'
  if (tier === 'Thin' || (score !== undefined && score <= 4)) return 'var(--color-danger)'
  return 'var(--color-warn)'
}
export function CompetencyHeatmap({ competencies }: { competencies: Competency[] }) {
  if (!competencies.length) return <div className="tile__empty">No competency data</div>
  return (
    <div className="heatmap">
      <div className="heatmap__label">17 AAMC COMPETENCIES</div>
      <div className="heatmap__grid">
        {competencies.map(c => (
          <div key={c.name} className="heatmap__cell" style={{ borderColor: color(c.tier, c.score) }} title={c.supported_by?.join(', ')}>
            <div className="heatmap__cell-score" style={{ color: color(c.tier, c.score) }}>{c.score ?? '—'}</div>
            <div className="heatmap__cell-name">{c.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
