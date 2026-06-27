import { useEffect, useState, useCallback } from 'react'
import { marked } from 'marked'
import { Editor } from '../components/editor/Editor'

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Sources the applicant/user finds useful — the review agent reads content/knowledge/ for context.
// List + render + add + edit, reusing the doc Editor for editing.
export function KnowledgePage() {
  const [files, setFiles] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [html, setHtml] = useState('')
  const [editing, setEditing] = useState(false)
  const [adding, setAdding] = useState('')

  const loadList = useCallback(() => {
    fetch('/api/files?dir=knowledge').then(r => r.json())
      .then((f: string[]) => { setFiles(f); setSelected(s => s ?? f[0] ?? null) })
      .catch(() => setFiles([]))
  }, [])
  useEffect(() => { loadList() }, [loadList])

  useEffect(() => {
    if (!selected || editing) return
    let dead = false
    fetch(`/api/file?path=${encodeURIComponent(selected)}`).then(r => r.json())
      .then(({ content }: { content: string }) => { if (!dead) setHtml(marked.parse(content) as string) })
      .catch(() => { if (!dead) setHtml('<p>Could not load.</p>') })
    return () => { dead = true }
  }, [selected, editing])

  async function add() {
    const name = adding.trim()
    if (!name) return
    const path = `knowledge/${slug(name)}.md`
    await fetch(`/api/file?path=${encodeURIComponent(path)}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: `# ${name}\n\n`, frontmatter: { title: name, added: new Date().toISOString().slice(0, 10) } }),
    })
    setAdding(''); setSelected(path); setEditing(true); loadList()
  }

  return (
    <div className="page page--docs">
      <aside className="docs__list">
        <h2 className="docs__list-title">Knowledge</h2>
        <p className="docs__hint">Sources the agent reads for context.</p>
        <div className="knowledge__add">
          <input value={adding} placeholder="New source…" onChange={e => setAdding(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
          <button onClick={add}>+</button>
        </div>
        {files.length === 0 && <p className="docs__empty">No sources yet.</p>}
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
