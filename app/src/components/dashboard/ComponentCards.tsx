import React from 'react'
import type { ComponentScore } from '../../lib/types'
function Card({ label, s }: { label: string; s: ComponentScore | null }) {
  return (
    <div className="tile">
      <div className="tile__label">{label}</div>
      <div className="tile__score" style={{ color: (s?.score ?? 0) >= 8 ? 'var(--color-pos)' : 'var(--color-text)' }}>{s?.score?.toFixed(1) ?? '—'}<span className="tile__denom">/10</span></div>
      {s?.last_scored && <div className="tile__date">{s.last_scored}</div>}
    </div>
  )
}
export function ComponentCards({ ps, act, ie }: { ps: ComponentScore | null; act: ComponentScore | null; ie: ComponentScore | null }) {
  return <div className="component-cards"><Card label="PERSONAL STATEMENT" s={ps} /><Card label="ACTIVITIES" s={act} /><Card label="IMPACTFUL EXPERIENCE" s={ie} /></div>
}
