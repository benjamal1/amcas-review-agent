import { useState } from 'react'
import { FileTree } from './FileTree'
import { Editor } from './Editor'
import { ActivityEditor } from './ActivityEditor'
import { useFiles } from '../../hooks/useFiles'
export function EditorPanel() {
  const { files, labels } = useFiles()
  const [selected, setSelected] = useState<string | null>(null)
  const isActivity = !!selected && selected.includes('/activities/')
  return (
    <div className="editor-panel">
      <div className="editor-panel__tree"><FileTree files={files} selected={selected} onSelect={setSelected} labels={labels} /></div>
      <div className="editor-panel__editor">
        {isActivity ? <ActivityEditor filePath={selected!} /> : <Editor filePath={selected} />}
      </div>
    </div>
  )
}
