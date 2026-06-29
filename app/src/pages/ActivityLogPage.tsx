import { useData } from '../hooks/useData'

export function ActivityLogPage() {
  const { data, loading } = useData()

  if (loading || !data) {
    return <div className="dashboard__loading">Loading…</div>
  }

  const log = data.activity_log ?? []

  return (
    <div className="page page--single">
      <h1>Activity Log</h1>
      <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '14px' }}>
        What's been done — agents append a recap after each task. Glance here instead of keeping the terminal open.
      </p>

      {log.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
          No activity yet. Agents log a one-line recap here after each task.
        </p>
      ) : (
        <ul className="actlog">
          {[...log].reverse().map((entry, idx) => (
            <li key={idx} className="actlog__item">
              <span className="actlog__date">{entry.date}</span>
              <span className="actlog__summary">{entry.summary}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
