import { useState, useEffect, useRef } from 'react'
import { marked } from 'marked'
import { Editor } from '../components/editor/Editor'
import { headingSlug as slug } from '../lib/format'
import { fetchDoc, saveDoc } from '../lib/docs'
import { IS_STATIC } from '../lib/env'

const PATH = 'story-bank.md'
const TASK = /^(\s*[-*] )\[[ xX]\]/
type Heading = { id: string; text: string; level: number }

// Flip the idx-th task-list line's checkbox in the markdown source.
function flipLine(src: string, idx: number, checked: boolean): string {
  let i = -1
  return src.split('\n').map(l => {
    if (!TASK.test(l)) return l
    i++
    return i === idx ? l.replace(/\[[ xX]\]/, checked ? '[x]' : '[ ]') : l
  }).join('\n')
}
const countUsed = (src: string) => {
  const lines = src.split('\n').filter(l => TASK.test(l))
  return { used: lines.filter(l => /\[[xX]\]/.test(l)).length, total: lines.length }
}

// Story Bank: anecdote material with per-story "used" tracking. Each bullet is a task-list
// item; checking it (marks the story used) persists straight back to story-bank.md.
export function StoryBankPage() {
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [content, setContent] = useState('')
  const [toc, setToc] = useState<Heading[]>([])
  const ref = useRef<HTMLElement>(null)
  const contentRef = useRef('')
  contentRef.current = content

  useEffect(() => {
    if (mode !== 'view') return
    let dead = false
    fetchDoc(PATH)
      .then(content => { if (!dead) setContent(content ?? '') })
      .catch(() => { if (!dead) setContent('') })
    return () => { dead = true }
  }, [mode])

  async function persist(next: string) {
    setContent(next) // optimistic
    await saveDoc(PATH, next, {}).catch(() => {}) // no-op in static export
  }

  const html = mode === 'view' ? (marked.parse(content) as string) : ''

  // Build TOC + wire up the (otherwise-disabled) task-list checkboxes after each render.
  useEffect(() => {
    const el = ref.current
    if (mode !== 'view' || !el) { setToc([]); return }
    const seen = new Set<string>()
    setToc([...el.querySelectorAll('h2, h3')].map(h => {
      let id = slug(h.textContent ?? ''); while (seen.has(id)) id += '-x'
      seen.add(id); (h as HTMLElement).id = id
      return { id, text: h.textContent ?? '', level: h.tagName === 'H3' ? 3 : 2 }
    }))
    const boxes = [...el.querySelectorAll('input[type=checkbox]')] as HTMLInputElement[]
    const wired = boxes.map((box, idx) => {
      box.closest('li')?.classList.toggle('story--used', box.checked)
      if (IS_STATIC) { box.disabled = true; return () => {} } // read-only export: show state, don't flip
      box.disabled = false
      const h = () => persist(flipLine(contentRef.current, idx, box.checked))
      box.addEventListener('change', h)
      return () => box.removeEventListener('change', h)
    })
    return () => wired.forEach(off => off())
  }, [html, mode])

  const jump = (id: string) => ref.current?.querySelector(`#${CSS.escape(id)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const { used, total } = countUsed(content)

  return (
    <div className="page docpage">
      <div className="docpage__bar">
        <span className="docpage__intro">Story Bank — raw moments for essays & secondaries. Check a story to mark it used.</span>
        <span className="story__counter">{used}/{total} used</span>
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
            ? <article ref={ref} className="markdown-body story-bank" dangerouslySetInnerHTML={{ __html: html }} />
            : <Editor filePath={PATH} />}
        </div>
      </div>
    </div>
  )
}
