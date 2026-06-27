import type { Scorecard } from '../../lib/types'
import { CompositeTile } from './CompositeTile'
import { DomainTiles } from './DomainTiles'
import { DomainRadar } from './DomainRadar'

// Read-only composite + domains + radar from any Scorecard. Used for the per-school regrade,
// the secondaries average, and the top-level roll-up — anywhere a full editable Dashboard is overkill.
export function ScorecardSummary({ sc, title, empty }: { sc: Scorecard | null; title?: string; empty?: string }) {
  if (!sc) return (
    <div className="scsum">
      {title && <div className="scsum__title">{title}</div>}
      <div className="dashboard__empty">{empty ?? 'No score yet.'}</div>
    </div>
  )
  return (
    <div className="scsum">
      {title && <div className="scsum__title">{title}</div>}
      <div className="dashboard__overview"><CompositeTile sc={sc} /></div>
      <div className="dashboard__scores">
        <div className="dashboard__scores-left"><DomainTiles domains={sc.domains} /></div>
        <DomainRadar domains={sc.domains} />
      </div>
    </div>
  )
}
