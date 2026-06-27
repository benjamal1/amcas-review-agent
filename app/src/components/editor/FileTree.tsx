import { useState } from 'react'
import '../../styles/editor.css'
type Groups = Record<string, string[]>
// Group by parent directory (full path minus filename) so nested folders like
// documents/activities/ render as their own group instead of all lumping under 'documents'.
function group(files: string[]): Groups {
  const g: Groups = {}
  for (const f of files) {
    const i = f.lastIndexOf('/')
    const k = i === -1 ? '(root)' : f.slice(0, i)
    if (!g[k]) g[k] = []
    g[k].push(f)
  }
  return g
}
// 'documents/activities' → 'activities' for display; keep full path as the key.
function folderLabel(dir: string): string {
  return dir === '(root)' ? dir : (dir.split('/').pop() ?? dir)
}
export function FileTree({ files, selected, onSelect, labels = {} }: { files: string[]; selected: string | null; onSelect: (p: string) => void; labels?: Record<string, string> }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const groups = group(files)
  return (
    <div className="filetree">
      {Object.entries(groups).map(([folder, folderFiles]) => (
        <div key={folder} className="filetree__group">
          <button className="filetree__folder" onClick={() => setCollapsed(p => ({ ...p, [folder]: !p[folder] }))} title={folder}>
            <span className="filetree__chevron">{collapsed[folder] ? '▶' : '▼'}</span>{folderLabel(folder)}
          </button>
          {!collapsed[folder] && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {folderFiles.map(f => {
                const fname = f.split('/').pop() ?? f
                const label = labels[f]
                return (
                  <li key={f}>
                    <button className={`filetree__file${selected === f ? ' filetree__file--active' : ''}`} onClick={() => onSelect(f)} title={f}>
                      {label
                        ? <><span className="filetree__name">{label}</span><span className="filetree__fname">{fname}</span></>
                        : fname}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
