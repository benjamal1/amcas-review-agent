import { useState, useEffect, useRef } from 'react'
import { marked } from 'marked'
import { Editor } from '../editor/Editor'
import { fetchDoc } from '../../lib/docs'
import { IS_STATIC } from '../../lib/env'

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
type Heading = { id: string; text: string; level: number }

// Reusable doc surface: fixed bar + body of [in-page TOC | scrollable content], with a
// view/edit toggle. ponytail: marked w/o sanitizer — local own-file content.
export function MarkdownDocPage({ path, intro }: { path: string; intro: string }) {
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [html, setHtml] = useState('')
  const [toc, setToc] = useState<Heading[]>([])
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (mode !== 'view') return
    let dead = false
    fetchDoc(path)
      .then(content => { if (!dead) setHtml(marked.parse(content) as string) })
      .catch(() => { if (!dead) setHtml('<p class="docs__error">Could not load.</p>') })
    return () => { dead = true }
  }, [path, mode])

  // After render, slug the h2/h3 headings and build the TOC from the live DOM (version-proof).
  useEffect(() => {
    if (mode !== 'view' || !ref.current) { setToc([]); return }
    const hs = [...ref.current.querySelectorAll('h2, h3')] as HTMLElement[]
    const seen = new Set<string>()
    setToc(hs.map(h => {
      let id = slug(h.textContent ?? '')
      while (seen.has(id)) id += '-x'
      seen.add(id); h.id = id
      return { id, text: h.textContent ?? '', level: h.tagName === 'H3' ? 3 : 2 }
    }))
  }, [html, mode])

  const jump = (id: string) => ref.current?.querySelector(`#${CSS.escape(id)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="page docpage">
      <div className="docpage__bar">
        <span className="docpage__intro">{intro}</span>
        {!IS_STATIC && (
          <button className="docpage__toggle" onClick={() => setMode(m => (m === 'view' ? 'edit' : 'view'))}>
            {mode === 'view' ? '✎ Edit' : '✓ Done'}
          </button>
        )}
      </div>
      <div className="docpage__body">
        {mode === 'view' && toc.length > 0 && (
          <nav className="docpage__toc">
            {toc.map(h => (
              <button key={h.id} className={`docpage__toc-item docpage__toc-item--l${h.level}`} onClick={() => jump(h.id)}>{h.text}</button>
            ))}
          </nav>
        )}
        <div className="docpage__content">
          {mode === 'view'
            ? <article ref={ref} className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
            : <Editor filePath={path} />}
        </div>
      </div>
    </div>
  )
}
