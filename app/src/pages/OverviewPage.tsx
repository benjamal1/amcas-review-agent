import { Dashboard } from '../components/dashboard/Dashboard'

// At-a-glance, read-only. All editing happens on the Grading page.
export function OverviewPage() {
  return (
    <div className="page page--grading">
      <Dashboard readOnly />
    </div>
  )
}
