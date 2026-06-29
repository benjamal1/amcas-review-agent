import { Dashboard } from '../components/dashboard/Dashboard'
import { GradeButtons } from '../components/terminal/GradeButtons'

// Primaries → Grading: the editable primary-application scorecard (primary essays only) + the
// primary grade buttons (these live here, not in the global terminal dock).
export function GradingPage() {
  return (
    <div className="page page--grading">
      <Dashboard />
      <GradeButtons />
    </div>
  )
}
