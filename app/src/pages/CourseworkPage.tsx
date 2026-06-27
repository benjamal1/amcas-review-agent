import { useData } from '../hooks/useData'
import { CourseworkPanel } from '../components/dashboard/CourseworkPanel'

// Transcript / coursework on its own page.
export function CourseworkPage() {
  const { data, loading, mutate } = useData()
  if (loading) return <div className="dashboard__loading">Loading…</div>
  if (!data) return <div className="dashboard__empty">No data.</div>
  return (
    <div className="page page--single">
      <CourseworkPanel coursework={data.coursework} mutate={mutate} />
    </div>
  )
}
