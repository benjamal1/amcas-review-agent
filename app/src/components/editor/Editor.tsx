import { useEffect, useRef, useState, useCallback } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorState } from '@codemirror/state'
import { marked } from 'marked'
import { fetchDoc, fetchDocFull, saveDoc } from '../../lib/docs'
import { IS_STATIC } from '../../lib/env'

// match lowercase live paths under content/documents/
const LIMITS: Record<string, { label: string; limit: number }> = {
  'personal-statement':   { label: 'Personal Statement', limit: 5300 },
  'activities':           { label: 'Activity', limit: 700 },
  'impactful-experience': { label: 'Most Meaningful', limit: 1325 },
}
function detectLimit(path: string) {
  for (const [k, v] of Object.entries(LIMITS)) if (path.includes(k)) return v
  return null
}

type EditorProps = { filePath: string | null; onSave?: (ok: boolean) => void }

// Static export is read-only → render the doc as nice markdown instead of a code editor.
export function Editor(props: EditorProps) {
  return IS_STATIC ? <StaticDocView filePath={props.filePath} /> : <EditorCM {...props} />
}

// Read-only rendered view of a markdown doc (used in the static export). ponytail: marked without
// a sanitizer — these are the applicant's own local files, not third-party input.
function StaticDocView({ filePath }: { filePath: string | null }) {
  const [content, setContent] = useState('')
  useEffect(() => {
    if (!filePath) { setContent(''); return }
    let dead = false
    fetchDoc(filePath).then(c => { if (!dead) setContent(c) }).catch(() => { if (!dead) setContent('') })
    return () => { dead = true }
  }, [filePath])

  const lim = filePath ? detectLimit(filePath) : null
  const over = lim && content.length > lim.limit
  return (
    <div className="editor-wrap">
      <div className="editor-toolbar">
        {filePath ? (
          <>
            <span className="editor-toolbar__path" title={filePath}>{(filePath.split('/').pop() ?? filePath).replace(/\.md$/, '')}</span>
            {lim && <span className={`editor-toolbar__chars${over ? ' editor-toolbar__chars--over' : ''}`}>{content.length}/{lim.limit} {lim.label}{over ? ' ⚠ over' : ''}</span>}
          </>
        ) : <span className="editor-toolbar__empty">Select a file to view</span>}
      </div>
      <article className="editor-cm editor-cm--rendered markdown-body"
        dangerouslySetInnerHTML={{ __html: content ? (marked.parse(content) as string) : '' }} />
    </div>
  )
}

function EditorCM({ filePath, onSave }: EditorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fmRef = useRef<Record<string, unknown>>({})
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [charCount, setCharCount] = useState(0)

  const save = useCallback(async (content: string) => {
    if (!filePath || IS_STATIC) return // static export is read-only
    setSaveState('saving')
    try {
      await saveDoc(filePath, content, fmRef.current)
      setSaveState('saved'); onSave?.(true)
    } catch { setSaveState('error') }
  }, [filePath, onSave])

  useEffect(() => {
    if (!filePath || !ref.current) return
    let dead = false
    fetchDocFull(filePath) // missing file → start empty (new doc)
      .then(({ content, frontmatter }) => {
        if (dead) return
        fmRef.current = frontmatter
        viewRef.current?.destroy()
        viewRef.current = new EditorView({
          parent: ref.current!,
          state: EditorState.create({
            doc: content,
            extensions: [
              basicSetup, markdown(), oneDark,
              EditorView.editable.of(!IS_STATIC), // static export: view-only, no phantom edits
              EditorView.lineWrapping, // essays are one long line per paragraph — wrap them
              EditorView.updateListener.of(u => {
                if (!u.docChanged) return
                const c = u.state.doc.toString(); setCharCount(c.length)
                if (debRef.current) clearTimeout(debRef.current)
                debRef.current = setTimeout(() => save(c), 800)
              }),
              EditorView.theme({
                '&': { height: '100%', background: 'var(--color-panel)' },
                '.cm-scroller': { fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '1.6' },
                '.cm-gutters': { background: 'var(--color-panel)', borderRight: '1px solid var(--color-hairline)' },
              }),
            ],
          }),
        })
        setCharCount(content.length)
        setSaveState('idle')
      })
      .catch(() => { if (!dead) setSaveState('error') })
    return () => {
      dead = true
      if (debRef.current) clearTimeout(debRef.current)
      viewRef.current?.destroy()
      viewRef.current = null
    }
  }, [filePath, save])

  const lim = filePath ? detectLimit(filePath) : null
  const over = lim && charCount > lim.limit

  return (
    <div className="editor-wrap">
      <div className="editor-toolbar">
        {filePath ? (
          <>
            <span className="editor-toolbar__path" title={filePath}>
              {(filePath.split('/').pop() ?? filePath).replace(/\.md$/, '')}
            </span>
            <span className={`editor-toolbar__save editor-toolbar__save--${saveState}`}>
              {saveState === 'saving' ? 'saving…' : saveState === 'saved' ? '✓ saved' : saveState === 'error' ? '⚠ error' : ''}
            </span>
            {lim && <span className={`editor-toolbar__chars${over ? ' editor-toolbar__chars--over' : ''}`}>{charCount}/{lim.limit} {lim.label}{over ? ' ⚠ over' : ''}</span>}
          </>
        ) : <span className="editor-toolbar__empty">Select a file to edit</span>}
      </div>
      <div ref={ref} className="editor-cm" />
    </div>
  )
}
