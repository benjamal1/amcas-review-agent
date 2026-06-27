import { Dashboard } from '../components/dashboard/Dashboard'

// The single scorecard surface — editable. Grade buttons + terminal live in the global
// dock (open from the sidebar), available on every page.
export function OverviewPage() {
  return (
    <div className="page page--grading">
      <Dashboard />
    </div>
  )
}
