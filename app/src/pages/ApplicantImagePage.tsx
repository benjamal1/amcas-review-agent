import { useState, useEffect } from 'react'
import { marked } from 'marked'
import { Editor } from '../components/editor/Editor'

const PATH = 'applicant-image.md'

// The agent-maintained holistic profile (content/applicant-image.md). Renders as formatted
// markdown by default; toggle to edit. ponytail: marked w/o sanitizer — local own-file content.
export function ApplicantImagePage() {
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [html, setHtml] = useState('')

  useEffect(() => {
    if (mode !== 'view') return
    let dead = false
    fetch(`/api/file?path=${encodeURIComponent(PATH)}`)
      .then(r => r.json())
      .then(({ content }: { content: string }) => { if (!dead) setHtml(marked.parse(content) as string) })
      .catch(() => { if (!dead) setHtml('<p class="docs__error">Could not load.</p>') })
    return () => { dead = true }
  }, [mode])

  return (
    <div className="page page--applicant-image">
      <div className="applicant-image__bar">
        <span className="applicant-image__intro">
          Applicant Image — the profile the review agent reads before every session.
        </span>
        <button className="applicant-image__toggle" onClick={() => setMode(m => (m === 'view' ? 'edit' : 'view'))}>
          {mode === 'view' ? '✎ Edit' : '✓ Done'}
        </button>
      </div>
      {mode === 'view'
        ? <article className="docs__view markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
        : <Editor filePath={PATH} />}
    </div>
  )
}
