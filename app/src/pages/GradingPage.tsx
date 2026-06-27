import { Dashboard } from '../components/dashboard/Dashboard'

// Primaries → Grading: the editable primary-application scorecard (primary essays only).
// The roll-up Overview links here; the terminal + grade buttons live in the global dock.
export function GradingPage() {
  return (
    <div className="page page--grading">
      <Dashboard />
    </div>
  )
}
