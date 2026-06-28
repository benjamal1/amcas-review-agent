import { useEffect, useState, useCallback } from 'react'
import { marked } from 'marked'

type Item = { id: string; name: string; group: string }

// View + edit the agent's own instructions (router CLAUDE.md + .claude/agents/*.md).
// Separate API from content files; edits write straight back to the repo.
export function ClaudePage() {
  const [items, setItems] = useState<Item[]>([])
  const [sel, setSel] = useState<string | null>(null)
  const [content, setContent] = useState('')   // saved content
  const [draft, setDraft] = useState('')        // editor buffer
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/agent-config').then(r => r.json())
      .then((it: Item[]) => { setItems(it); setSel(s => s ?? it[0]?.id ?? null) })
      .catch(() => setItems([]))
  }, [])

  const load = useCallback((id: string) => {
    fetch(`/api/agent-config/file?id=${encodeURIComponent(id)}`).then(r => r.json())
      .then(({ content }: { content: string }) => { setContent(content ?? ''); setDraft(content ?? ''); setEditing(false) })
      .catch(() => { setContent(''); setDraft('') })
  }, [])
  useEffect(() => { if (sel) load(sel) }, [sel, load])

  async function save() {
    if (!sel) return
    setSaving(true)
    const r = await fetch(`/api/agent-config/file?id=${encodeURIComponent(sel)}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: draft }),
    }).catch(() => null)
    setSaving(false)
    if (r?.ok) { setContent(draft); setEditing(false) }
    else alert('Save failed.')
  }

  const groups = [...new Set(items.map(i => i.group))]
  const dirty = draft !== content

  return (
    <div className="page page--docs">
      <aside className="docs__list">
        <h2 className="docs__list-title">Claude Config</h2>
        <p className="docs__hint">The agent's router + subagent instructions. Edits write to the repo.</p>
        {groups.map(g => (
          <div key={g} className="claude__group">
            <div className="claude__group-title">{g}</div>
            {items.filter(i => i.group === g).map(i => (
              <button key={i.id} className={`docs__item${sel === i.id ? ' docs__item--active' : ''}`} onClick={() => setSel(i.id)}>{i.name}</button>
            ))}
          </div>
        ))}
      </aside>
      <article className="docs__view">
        {sel && (
          <div className="knowledge__toolbar">
            <button className={editing ? '' : 'knowledge__btn--on'} onClick={() => { setDraft(content); setEditing(false) }}>View</button>
            <button className={editing ? 'knowledge__btn--on' : ''} onClick={() => setEditing(true)}>Edit</button>
            {editing && <button className="claude__save" disabled={!dirty || saving} onClick={save}>{saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}</button>}
          </div>
        )}
        {editing
          ? <textarea className="claude__editor" value={draft} onChange={e => setDraft(e.target.value)} spellCheck={false} />
          : <div className="markdown-body" dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }} />}
      </article>
    </div>
  )
}
