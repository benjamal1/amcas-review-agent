import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchDocFull, saveDoc } from '../../lib/docs'

// Official AMCAS Work/Activities experience types.
const AMCAS_TYPES = [
  'Artistic Endeavors',
  'Community Service/Volunteer - Medical/Clinical',
  'Community Service/Volunteer - Not Medical/Clinical',
  'Conferences Attended',
  'Extracurricular Activities',
  'Hobbies',
  'Honors/Awards/Recognitions',
  'Intercollegiate Athletics',
  'Leadership - Not Listed Elsewhere',
  'Military Service',
  'Other',
  'Paid Employment - Medical/Clinical',
  'Paid Employment - Not Medical/Clinical',
  'Physician Shadowing/Clinical Observation',
  'Presentations/Posters/Abstracts',
  'Publications',
  'Research/Lab',
  'Teaching/Tutoring/Teaching Assistant',
]
const DESC_LIMIT = 700
const MM_LIMIT = 1325

type Meta = {
  experience_name?: string
  experience_type?: string
  organization?: string
  dates_start?: string
  dates_end?: string
  hours_completed?: number | null
  hours_anticipated?: number | null
  most_meaningful?: boolean
  most_meaningful_summary?: string
  order?: number
  [k: string]: unknown
}

// Self-contained editor for one activity file: metadata form + description.
// Owns the whole file (frontmatter + body) so there's no clobber race with the
// generic markdown Editor.
export function ActivityEditor({ filePath }: { filePath: string }) {
  const [meta, setMeta] = useState<Meta>({})
  const [desc, setDesc] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedFor = useRef<string | null>(null)

  // Load on file change
  useEffect(() => {
    let dead = false
    loadedFor.current = null
    fetchDocFull(filePath)
      .then(({ content, frontmatter }) => {
        if (dead) return
        setMeta((frontmatter ?? {}) as Meta)
        setDesc(content.trim())
        loadedFor.current = filePath
        setSaveState('idle')
      })
      .catch(() => { if (!dead) setSaveState('error') })
    return () => { dead = true; if (debRef.current) clearTimeout(debRef.current) }
  }, [filePath])

  const persist = useCallback((nextMeta: Meta, nextDesc: string) => {
    setSaveState('saving')
    saveDoc(filePath, nextDesc ? nextDesc + '\n' : '', nextMeta) // no-op in static export
      .then(() => setSaveState('saved'))
      .catch(() => setSaveState('error'))
  }, [filePath])

  // Debounced autosave; skip until the current file has finished loading.
  const queueSave = useCallback((nextMeta: Meta, nextDesc: string) => {
    if (loadedFor.current !== filePath) return
    if (debRef.current) clearTimeout(debRef.current)
    debRef.current = setTimeout(() => persist(nextMeta, nextDesc), 700)
  }, [filePath, persist])

  function setField<K extends keyof Meta>(key: K, value: Meta[K]) {
    setMeta(prev => { const next = { ...prev, [key]: value }; queueSave(next, desc); return next })
  }
  function onDesc(value: string) { setDesc(value); queueSave(meta, value) }

  const descOver = desc.length > DESC_LIMIT
  const mm = !!meta.most_meaningful
  const mmSummary = (meta.most_meaningful_summary as string) ?? ''
  const mmOver = mmSummary.length > MM_LIMIT

  return (
    <div className="activity-editor">
      <div className="activity-editor__bar">
        <span className="activity-editor__title">{meta.experience_name || (filePath.split('/').pop() ?? '').replace(/\.md$/, '')}</span>
        <span className={`editor-toolbar__save editor-toolbar__save--${saveState}`}>
          {saveState === 'saving' ? 'saving…' : saveState === 'saved' ? '✓ saved' : saveState === 'error' ? '⚠ error' : ''}
        </span>
      </div>

      <div className="activity-editor__scroll">
        <div className="activity-form">
          <label className="activity-form__row activity-form__row--wide">
            <span>Experience Name</span>
            <input value={meta.experience_name ?? ''} onChange={e => setField('experience_name', e.target.value)} />
          </label>
          <label className="activity-form__row activity-form__row--wide">
            <span>Experience Type</span>
            <select value={meta.experience_type ?? ''} onChange={e => setField('experience_type', e.target.value)}>
              <option value="">— select AMCAS category —</option>
              {AMCAS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="activity-form__row activity-form__row--wide">
            <span>Organization</span>
            <input value={meta.organization ?? ''} onChange={e => setField('organization', e.target.value)} />
          </label>
          <label className="activity-form__row">
            <span>Start</span>
            <input value={meta.dates_start ?? ''} onChange={e => setField('dates_start', e.target.value)} placeholder="MM/YYYY" />
          </label>
          <label className="activity-form__row">
            <span>End</span>
            <input value={meta.dates_end ?? ''} onChange={e => setField('dates_end', e.target.value)} placeholder="MM/YYYY or Present" />
          </label>
          <label className="activity-form__row">
            <span>Hours completed</span>
            <input type="number" value={meta.hours_completed ?? ''} onChange={e => setField('hours_completed', e.target.value === '' ? null : Number(e.target.value))} />
          </label>
          <label className="activity-form__row">
            <span>Hours anticipated</span>
            <input type="number" value={meta.hours_anticipated ?? ''} onChange={e => setField('hours_anticipated', e.target.value === '' ? null : Number(e.target.value))} />
          </label>
          <label className="activity-form__row activity-form__check">
            <input type="checkbox" checked={mm} onChange={e => setField('most_meaningful', e.target.checked)} />
            <span>Most Meaningful (max 3)</span>
          </label>
        </div>

        <div className="activity-editor__field">
          <div className="activity-editor__field-head">
            <span>Description</span>
            <span className={descOver ? 'activity-editor__count activity-editor__count--over' : 'activity-editor__count'}>
              {desc.length}/{DESC_LIMIT}{descOver ? ' ⚠ over' : ''}
            </span>
          </div>
          <textarea className="activity-editor__textarea" value={desc} onChange={e => onDesc(e.target.value)} rows={8} />
        </div>

        {mm && (
          <div className="activity-editor__field">
            <div className="activity-editor__field-head">
              <span>Most Meaningful Summary</span>
              <span className={mmOver ? 'activity-editor__count activity-editor__count--over' : 'activity-editor__count'}>
                {mmSummary.length}/{MM_LIMIT}{mmOver ? ' ⚠ over' : ''}
              </span>
            </div>
            <textarea className="activity-editor__textarea" value={mmSummary} onChange={e => setField('most_meaningful_summary', e.target.value)} rows={12} />
          </div>
        )}
      </div>
    </div>
  )
}
