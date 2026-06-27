import { useEffect, useState } from 'react'
import { marked } from 'marked'

// Read-only viewer for agent-generated grading feedback in content/feedback/*.md.
// ponytail: marked without sanitizer — source is the user's own local agent output,
// not untrusted web input. Add DOMPurify if feedback ever ingests external content.
export function GradingDocsPage() {
  const [files, setFiles] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [html, setHtml] = useState<string>('')

  useEffect(() => {
    fetch('/api/files?dir=feedback')
      .then(r => r.json())
      .then((f: string[]) => { setFiles(f); if (f.length && !selected) setSelected(f[0]) })
      .catch(() => setFiles([]))
  }, [])

  useEffect(() => {
    if (!selected) { setHtml(''); return }
    let dead = false
    fetch(`/api/file?path=${encodeURIComponent(selected)}`)
      .then(r => r.json())
      .then(({ content }: { content: string }) => { if (!dead) setHtml(marked.parse(content) as string) })
      .catch(() => { if (!dead) setHtml('<p class="docs__error">Could not load.</p>') })
    return () => { dead = true }
  }, [selected])

  return (
    <div className="page page--docs">
      <aside className="docs__list">
        <h2 className="docs__list-title">Grading Docs</h2>
        {files.length === 0 && <p className="docs__empty">No feedback yet. Run a deep score — the agent writes to content/feedback/.</p>}
        {files.map(f => (
          <button
            key={f}
            className={`docs__item${selected === f ? ' docs__item--active' : ''}`}
            onClick={() => setSelected(f)}
          >{(f.split('/').pop() ?? f).replace(/\.md$/, '')}</button>
        ))}
      </aside>
      <article className="docs__view markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
