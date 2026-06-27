import { useState } from 'react'
import { FileTree } from '../components/editor/FileTree'
import { Editor } from '../components/editor/Editor'
import { useFiles } from '../hooks/useFiles'

const PREFIX = 'documents/secondaries/'

// All secondary docs in one editor — bank drafts, brainstorm, and every school's essays/notes.
// Mirrors the Primaries Editor; scoped to documents/secondaries/.
export function SecondariesEditorPage() {
  const { files, labels } = useFiles()
  const [selected, setSelected] = useState<string | null>(null)
  const mine = files.filter(f => f.startsWith(PREFIX))
  return (
    <div className="page page--editor-view">
      <aside className="editor-view__tree">
        <FileTree files={mine} selected={selected} onSelect={setSelected} labels={labels} />
        {mine.length === 0 && <p className="tracker__hint" style={{ padding: 12 }}>No secondary docs yet — start one in the Essay Bank or a school's Editor.</p>}
      </aside>
      <main className="editor-view__main">
        <div className="editor-view__doc"><Editor filePath={selected} /></div>
      </main>
    </div>
  )
}
