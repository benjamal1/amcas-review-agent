import { useState } from 'react'
import { FileTree } from '../components/editor/FileTree'
import { Editor } from '../components/editor/Editor'
import { ActivityEditor } from '../components/editor/ActivityEditor'
import { TerminalPanel } from '../components/terminal/TerminalPanel'
import { useFiles } from '../hooks/useFiles'

const isActivity = (p: string | null) => !!p && p.includes('/activities/')

// Docs/Word-style editor: file tree | big editor, with an optional terminal
// pane beside it for grading the doc you're working on.
export function EditorPage() {
  const { files, labels } = useFiles()
  const [selected, setSelected] = useState<string | null>(null)
  const [showTerm, setShowTerm] = useState(false)
  return (
    <div className="page page--editor-view">
      <aside className="editor-view__tree">
        <FileTree files={files} selected={selected} onSelect={setSelected} labels={labels} />
      </aside>
      <main className={`editor-view__main${showTerm ? ' editor-view__main--split' : ''}`}>
        <div className="editor-view__doc">
          <div className="editor-view__bar">
            <button className="editor-view__term-toggle" onClick={() => setShowTerm(s => !s)}>
              {showTerm ? '⟩ Hide terminal' : '⟨ Show terminal'}
            </button>
          </div>
          {isActivity(selected) ? <ActivityEditor filePath={selected!} /> : <Editor filePath={selected} />}
        </div>
        {showTerm && (
          <div className="editor-view__term"><TerminalPanel /></div>
        )}
      </main>
    </div>
  )
}
