import { useEffect, useState } from 'react'
import { marked } from 'marked'
import { fetchRubrics, fetchRubric } from '../lib/docs'

// Read-only viewer for the scoring rubrics (Agent/rubrics/*.md).
// ponytail: marked without sanitizer — rubrics are app-shipped local files, not user input.
const pretty = (name: string) =>
  name.replace(/\.md$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export function RubricsPage() {
  const [files, setFiles] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [html, setHtml] = useState<string>('')

  useEffect(() => {
    fetchRubrics()
      .then(f => { setFiles(f); if (f.length) setSelected(f[0]) })
      .catch(() => setFiles([]))
  }, [])

  useEffect(() => {
    if (!selected) { setHtml(''); return }
    let dead = false
    fetchRubric(selected)
      .then(content => { if (!dead) setHtml(marked.parse(content) as string) })
      .catch(() => { if (!dead) setHtml('<p class="docs__error">Could not load.</p>') })
    return () => { dead = true }
  }, [selected])

  return (
    <div className="page page--docs">
      <aside className="docs__list">
        <h2 className="docs__list-title">Rubrics</h2>
        {files.length === 0 && <p className="docs__empty">No rubrics found in Agent/rubrics/.</p>}
        {files.map(f => (
          <button
            key={f}
            className={`docs__item${selected === f ? ' docs__item--active' : ''}`}
            onClick={() => setSelected(f)}
          >{pretty(f)}</button>
        ))}
      </aside>
      <article className="docs__view markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
