import { useState } from 'react'
import type { RedFlag } from '../../lib/types'

// Active red flags listed prominently; resolved ones collapsed underneath.
export function RedFlagsPanel({ flags }: { flags: RedFlag[] }) {
  const [showResolved, setShowResolved] = useState(false)
  const active = flags.filter(f => f.status === 'active')
  const resolved = flags.filter(f => f.status === 'resolved')

  return (
    <div className="redflags-panel">
      <div className="redflags-panel__label">RED FLAGS</div>
      {active.length === 0
        ? <div className="redflags-panel__clear">✓ No active red flags</div>
        : <ul className="redflags-panel__list">
            {active.map((f, i) => (
              <li key={f.id ?? i} className="redflags-panel__item redflags-panel__item--active">
                <span className="redflags-panel__flag">{f.flag}</span>
                {f.location && <span className="redflags-panel__loc">{f.location}</span>}
              </li>
            ))}
          </ul>}
      {resolved.length > 0 && (
        <>
          <button className="redflags-panel__toggle" onClick={() => setShowResolved(s => !s)}>
            {showResolved ? '▾' : '▸'} {resolved.length} resolved
          </button>
          {showResolved && (
            <ul className="redflags-panel__list">
              {resolved.map((f, i) => (
                <li key={f.id ?? i} className="redflags-panel__item redflags-panel__item--resolved">
                  <span className="redflags-panel__flag">{f.id ? `${f.id}: ` : ''}{f.flag}</span>
                  {f.resolution && <span className="redflags-panel__res">{f.resolved_date} — {f.resolution}</span>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
