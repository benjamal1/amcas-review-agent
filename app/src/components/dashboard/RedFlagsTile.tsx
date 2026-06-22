
import type { Scorecard } from '../../lib/types'
export function RedFlagsTile({ sc }: { sc: Scorecard | null }) {
  const n = sc?.red_flag_count ?? 0
  return (
    <div className={`tile tile--flags${n > 0 ? ' tile--flags-active' : ''}`}>
      <div className="tile__label">RED FLAGS</div>
      <div className="tile__score-big">{n}</div>
    </div>
  )
}
