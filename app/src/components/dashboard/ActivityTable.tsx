import React from 'react'
import type { ActivityEntry } from '../../lib/types'
export function ActivityTable({ entries }: { entries: ActivityEntry[] }) {
  if (!entries.length) return <div className="tile__empty">No activity entries</div>
  const sorted = [...entries].sort((a, b) => ((a.description_quality ?? 10) + (a.most_meaningful_depth ?? 10)) - ((b.description_quality ?? 10) + (b.most_meaningful_depth ?? 10)))
  const bottom3 = new Set(sorted.slice(0, 3).map(e => String(e.name)))
  return (
    <div className="activity-table">
      <div className="activity-table__label">ACTIVITIES PER ENTRY</div>
      <table><thead><tr><th>Activity</th><th>Desc</th><th>MM</th></tr></thead>
      <tbody>{entries.map(e => (
        <tr key={String(e.name)} className={bottom3.has(String(e.name)) ? 'activity-table__low' : ''}>
          <td>{String(e.name)}{bottom3.has(String(e.name)) ? ' 🔴' : ''}</td>
          <td className="mono">{e.description_quality ?? '—'}</td>
          <td className="mono">{e.most_meaningful_depth ?? '—'}</td>
        </tr>
      ))}</tbody></table>
    </div>
  )
}
