import { useData } from '../hooks/useData'
import { Editor } from '../components/editor/Editor'

const DEFAULT_PATH = 'documents/secondaries/_brainstorm.md'

// Pre-writing: a single free-form doc to inventory stories/experiences before drafting the bank.
export function BrainstormPage() {
  const { data, loading } = useData()
  if (loading || !data) return <div className="dashboard__loading">Loading…</div>
  const path = data.secondaries?.brainstorm_path ?? DEFAULT_PATH
  return (
    <div className="page page--editor-view">
      <main className="editor-view__main">
        <div className="sec-page__intro">
          <h2 className="tracker__h">Brainstorming</h2>
          <p className="tracker__hint">Raw material for the essay bank — list experiences, moments, and lessons, and tag which archetype each could feed.</p>
        </div>
        <div className="editor-view__doc"><Editor filePath={path} /></div>
      </main>
    </div>
  )
}
