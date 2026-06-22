import { useState } from 'react'
import { FileTree } from './FileTree'
import { Editor } from './Editor'
import { useFiles } from '../../hooks/useFiles'
export function EditorPanel() {
  const { files } = useFiles()
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div className="editor-panel">
      <div className="editor-panel__tree"><FileTree files={files} selected={selected} onSelect={setSelected} /></div>
      <div className="editor-panel__editor"><Editor filePath={selected} /></div>
    </div>
  )
}
