import { useState } from 'react'
import { FileTree } from '../components/editor/FileTree'
import { Editor } from '../components/editor/Editor'
import { ActivityEditor } from '../components/editor/ActivityEditor'
import { useFiles } from '../hooks/useFiles'

const isActivity = (p: string | null) => !!p && p.includes('/activities/')

// Primary application docs only: personal statement, most-meaningful/impactful, and the
// Work/Activities entries. Secondaries + rec letters have their own editors elsewhere.
const isPrimary = (p: string) =>
  p === 'documents/personal-statement.md' ||
  p === 'documents/impactful-experience.md' ||
  p.startsWith('documents/activities/')

// Docs/Word-style editor: file tree | big editor. Need the terminal? Open the global
// terminal dock from the sidebar — it sits below the editor on any page.
export function EditorPage() {
  const { files, labels } = useFiles()
  const primaryFiles = files.filter(isPrimary)
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div className="page page--editor-view">
      <aside className="editor-view__tree">
        <FileTree files={primaryFiles} selected={selected} onSelect={setSelected} labels={labels} />
      </aside>
      <main className="editor-view__main">
        <div className="editor-view__doc">
          {isActivity(selected) ? <ActivityEditor filePath={selected!} /> : <Editor filePath={selected} />}
        </div>
      </main>
    </div>
  )
}
