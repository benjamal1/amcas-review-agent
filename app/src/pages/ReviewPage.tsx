import { useEffect, useState } from 'react'
import { marked } from 'marked'
import { useData } from '../hooks/useData'
import { fetchFiles, fetchDoc } from '../lib/docs'
import type { ScoreSnapshot } from '../lib/types'

import { pretty } from '../lib/format'

type Doc = { path: string; html: string; title: string }
const latestDims = (h?: ScoreSnapshot[]) => {
  if (!h?.length) return [] as [string, number][]
  const r = h[h.length - 1]
  return Object.entries(r).filter(([k, v]) => !['date', 'mode', 'note', 'composite'].includes(k) && typeof v === 'number') as [string, number][]
}

// The "detailed grading" review surface: structured judgments from data.json + the agent's
// prose feedback docs, organized with a jump-link table of contents.
export function ReviewPage() {
  const { data, loading } = useData()
  const [docs, setDocs] = useState<Doc[]>([])

  useEffect(() => {
    let dead = false
    fetchFiles('feedback', false).then(async f => {
      const files = f as string[]
      const settled = await Promise.allSettled(files.map(async p => {
        const content = await fetchDoc(p)
        return { path: p, html: marked.parse(content ?? '') as string, title: (p.split('/').pop() ?? p).replace(/\.md$/, '') }
      }))
      // one bad file shouldn't drop the rest
      const loaded = settled.filter(s => s.status === 'fulfilled').map(s => (s as PromiseFulfilledResult<Doc>).value)
      if (!dead) setDocs(loaded)
    }).catch(() => { if (!dead) setDocs([]) })
    return () => { dead = true }
  }, [])

  if (loading) return <div className="dashboard__loading">Loading…</div>
  if (!data) return <div className="dashboard__empty">No data.</div>

  const cs = data.component_scores
  const comps = [
    { label: 'Experiences', sc: cs?.experiences },
    { label: 'Personal Statement', sc: cs?.personal_statement },
    { label: 'Work & Activities', sc: cs?.activities },
    { label: 'Competency', sc: cs?.competency },
    { label: 'Impactful Experience', sc: cs?.impactful_experience },
  ].filter(c => c.sc)
  const competencies = data.competencies ?? []
  const priorities = data.priorities ?? []
  const flags = data.red_flags ?? []
  const active = flags.filter(f => f.status === 'active')
  const resolved = flags.filter(f => f.status === 'resolved')

  const toc = [
    { id: 'components', label: 'Component Scores' },
    { id: 'competencies', label: 'Competency Coverage' },
    { id: 'priorities', label: 'Priorities' },
    { id: 'redflags', label: 'Red Flags' },
    ...docs.map((d, i) => ({ id: `doc-${i}`, label: d.title })),
  ]

  return (
    <div className="page page--single docs2">
      <nav className="docs2__toc">
        <span className="docs2__toc-label">Review</span>
        {toc.map(t => <a key={t.id} href={`#${t.id}`}>{t.label}</a>)}
      </nav>
      <div className="docs2__body">
        <section id="components" className="docs2__section">
          <h2 className="docs2__h">Component Scores</h2>
          <div className="review__comps">
            {comps.map(c => (
              <div key={c.label} className="review__comp">
                <div className="review__comp-head"><span>{c.label}</span><span className="review__score">{c.sc?.score ?? '—'}</span></div>
                <div className="review__dims">
                  {latestDims(c.sc?.history).map(([k, v]) => <span key={k} className="review__dim">{pretty(k)} <b>{v}</b></span>)}
                </div>
                {c.sc?.last_scored && <div className="review__meta">last scored {c.sc.last_scored}{c.sc.mode ? ` · ${c.sc.mode}` : ''}</div>}
              </div>
            ))}
          </div>
        </section>

        <section id="competencies" className="docs2__section">
          <h2 className="docs2__h">Competency Coverage</h2>
          <div className="hist__scroll">
            <table className="hist__table">
              <thead><tr><th>Competency</th><th>Score</th><th>Tier</th><th>Supported by</th></tr></thead>
              <tbody>
                {competencies.map(c => (
                  <tr key={c.name}>
                    <td>{c.name}</td><td className="hist__score">{c.score ?? '—'}</td><td>{c.tier ?? '—'}</td>
                    <td className="review__support">{(c.supported_by ?? []).join('; ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="priorities" className="docs2__section">
          <h2 className="docs2__h">Priorities</h2>
          {priorities.length === 0 ? <p className="hist__empty">None recorded.</p>
            : <ol className="review__priorities">{priorities.map((p, i) => <li key={i}>{p}</li>)}</ol>}
        </section>

        <section id="redflags" className="docs2__section">
          <h2 className="docs2__h">Red Flags</h2>
          {active.length === 0 ? <p className="review__clear">✓ No active red flags</p>
            : <ul className="review__flags">{active.map((f, i) => <li key={i} className="review__flag--active"><b>{f.flag}</b> {f.location && <span>· {f.location}</span>}</li>)}</ul>}
          {resolved.length > 0 && <details className="review__resolved"><summary>{resolved.length} resolved</summary>
            <ul className="review__flags">{resolved.map((f, i) => <li key={i}>{f.id ? `${f.id}: ` : ''}{f.flag} <span className="review__res">— {f.resolved_date} {f.resolution}</span></li>)}</ul>
          </details>}
        </section>

        {docs.map((d, i) => (
          <section key={d.path} id={`doc-${i}`} className="docs2__section">
            <h2 className="docs2__h">{d.title}</h2>
            <article className="markdown-body" dangerouslySetInnerHTML={{ __html: d.html }} />
          </section>
        ))}
      </div>
    </div>
  )
}
