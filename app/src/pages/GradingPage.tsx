import { Dashboard } from '../components/dashboard/Dashboard'

// Editable dashboard. The terminal + grade buttons live in the global dock (open it
// from the sidebar), available here and on every page.
export function GradingPage() {
  return (
    <div className="page page--grading">
      <Dashboard />
    </div>
  )
}
