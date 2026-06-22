import { useState } from 'react'
import '../../styles/editor.css'
type Groups = Record<string, string[]>
function group(files: string[]): Groups {
  const g: Groups = {}
  for (const f of files) { const k = f.includes('/') ? f.split('/')[0] : '(root)'; if (!g[k]) g[k] = []; g[k].push(f) }
  return g
}
export function FileTree({ files, selected, onSelect }: { files: string[]; selected: string | null; onSelect: (p: string) => void }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const groups = group(files)
  return (
    <div className="filetree">
      {Object.entries(groups).map(([folder, folderFiles]) => (
        <div key={folder} className="filetree__group">
          <button className="filetree__folder" onClick={() => setCollapsed(p => ({ ...p, [folder]: !p[folder] }))}>
            <span className="filetree__chevron">{collapsed[folder] ? '▶' : '▼'}</span>{folder}
          </button>
          {!collapsed[folder] && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {folderFiles.map(f => (
                <li key={f}><button className={`filetree__file${selected === f ? ' filetree__file--active' : ''}`} onClick={() => onSelect(f)}>{f.split('/').pop()}</button></li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
