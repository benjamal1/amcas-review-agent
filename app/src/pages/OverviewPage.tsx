import { Dashboard } from '../components/dashboard/Dashboard'
import { EditorPanel } from '../components/editor/EditorPanel'
import { TerminalPanel } from '../components/terminal/TerminalPanel'

// Landing "at a glance" view — dashboard on top, editor | terminal below.
export function OverviewPage() {
  return (
    <div className="overview-grid">
      <section className="panel panel--dashboard" aria-label="Dashboard"><Dashboard /></section>
      <section className="panel panel--editor" aria-label="Editor"><EditorPanel /></section>
      <section className="panel panel--terminal" aria-label="Terminal"><TerminalPanel /></section>
    </div>
  )
}
