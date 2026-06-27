import { Dashboard } from '../components/dashboard/Dashboard'

// Read-only scores summary — just the dashboard, full height.
export function GradingPage() {
  return (
    <div className="page page--grading">
      <Dashboard />
    </div>
  )
}
