
import type { Scorecard } from '../../lib/types'
export function CompositeTile({ sc }: { sc: Scorecard | null }) {
  const t = Object.values(sc?.domains ?? {})[0]?.trend ?? '→'
  return (
    <div className="tile tile--composite">
      <div className="tile__label">COMPOSITE</div>
      <div className="tile__score-big">{sc?.composite ?? '—'}<span className="tile__denom">/100</span></div>
      <div className={`tile__trend tile__trend--${t==='↑'?'up':t==='↓'?'down':'flat'}`}>{t}</div>
    </div>
  )
}
