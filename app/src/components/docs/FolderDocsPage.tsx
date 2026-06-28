import { useEffect, useState, useCallback } from 'react'
import { marked } from 'marked'
import { Editor } from '../editor/Editor'

const today = () => new Date().toISOString().slice(0, 10)
const clean = (s: string) => s.trim().replace(/[/\\]/g, '-') // keep spaces/case; just strip path seps

// List + render + add + edit a folder of markdown notes (content/<dir>/*.md). Shared by
// Knowledge and Meeting Notes. datePrefix → new files named "YYYY-MM-DD <name>.md".
export function FolderDocsPage({ dir, title, hint, addPlaceholder, datePrefix = false }:
  { dir: string; title: string; hint: string; addPlaceholder: string; datePrefix?: boolean }) {
  const [files, setFiles] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [html, setHtml] = useState('')
  const [editing, setEditing] = useState(false)
  const [adding, setAdding] = useState('')

  const loadList = useCallback(() => {
    fetch(`/api/files?dir=${encodeURIComponent(dir)}`).then(r => r.json())
      .then((f: string[]) => { setFiles(f); setSelected(s => s ?? f[0] ?? null) })
      .catch(() => setFiles([]))
  }, [dir])
  useEffect(() => { loadList() }, [loadList])

  useEffect(() => {
    if (!selected || editing) return
    let dead = false
    fetch(`/api/file?path=${encodeURIComponent(selected)}`).then(r => r.json())
      .then(({ content }: { content: string }) => { if (!dead) setHtml(marked.parse(content ?? '') as string) })
      .catch(() => { if (!dead) setHtml('<p>Could not load.</p>') })
    return () => { dead = true }
  }, [selected, editing])

  async function add() {
    const name = clean(adding)
    if (!name) return
    const fname = datePrefix ? `${today()} ${name}.md` : `${name}.md`
    const path = `${dir}/${fname}`
    await fetch(`/api/file?path=${encodeURIComponent(path)}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: `# ${name}\n\n`, frontmatter: { title: name, date: today() } }),
    })
    setAdding(''); setSelected(path); setEditing(true); loadList()
  }

  return (
    <div className="page page--docs">
      <aside className="docs__list">
        <h2 className="docs__list-title">{title}</h2>
        <p className="docs__hint">{hint}</p>
        <div className="knowledge__add">
          <input value={adding} placeholder={addPlaceholder} onChange={e => setAdding(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
          <button onClick={add}>+</button>
        </div>
        {files.length === 0 && <p className="docs__empty">None yet.</p>}
        {files.map(f => (
          <button key={f} className={`docs__item${selected === f ? ' docs__item--active' : ''}`}
            onClick={() => { setSelected(f); setEditing(false) }}>
            {(f.split('/').pop() ?? f).replace(/\.md$/, '')}
          </button>
        ))}
      </aside>
      <article className="docs__view">
        {selected && (
          <div className="knowledge__toolbar">
            <button className={editing ? '' : 'knowledge__btn--on'} onClick={() => setEditing(false)}>View</button>
            <button className={editing ? 'knowledge__btn--on' : ''} onClick={() => setEditing(true)}>Edit</button>
          </div>
        )}
        {editing
          ? <Editor filePath={selected} />
          : <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />}
      </article>
    </div>
  )
}
