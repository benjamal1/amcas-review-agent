import { useData } from '../hooks/useData'
import { archetypeLabel as mapsLabel } from '../lib/secondaries'
import { plusDays } from '../lib/format'
import type { SecondaryEssay } from '../lib/types'

interface EssayRow {
  school: string
  received: string | undefined
  essay: SecondaryEssay
  reuse: number
}

export function EssayPrioritizationPage() {
  const { data, loading } = useData()

  if (loading || !data) return <div className="dashboard__loading">Loading…</div>

  // Collect one row per essay across all schools
  const rawRows: Omit<EssayRow, 'reuse'>[] = []
  for (const school of data.schools) {
    if (!school.secondary?.essays?.length) continue
    for (const essay of school.secondary.essays) {
      rawRows.push({ school: school.name, received: school.secondary_received_date, essay })
    }
  }

  // Reuse = distinct school count per maps_to theme
  const themeSchools = new Map<string, Set<string>>()
  for (const school of data.schools) {
    if (!school.secondary?.essays?.length) continue
    for (const essay of school.secondary.essays) {
      if (!essay.maps_to) continue
      if (!themeSchools.has(essay.maps_to)) themeSchools.set(essay.maps_to, new Set())
      themeSchools.get(essay.maps_to)!.add(school.name)
    }
  }

  const rows: EssayRow[] = rawRows.map(r => ({
    ...r,
    reuse: r.essay.maps_to ? (themeSchools.get(r.essay.maps_to)?.size ?? 0) : 0,
  }))

  // Sort: reuse DESC, then theme label; unmapped (reuse 0) naturally last
  rows.sort((a, b) => {
    if (b.reuse !== a.reuse) return b.reuse - a.reuse
    return mapsLabel(a.essay.maps_to).localeCompare(mapsLabel(b.essay.maps_to))
  })

  return (
    <div className="page page--single">
      <h1 className="ep__heading">Essay Prioritization</h1>
      <p className="ep__intro">Every prompt across schools, ordered by reuse efficiency — write the high-reuse themes first.</p>
      <div className="tracker__scroll">
        <table className="tracker__table tracker__table--prompts tracker__table--ep">
          <thead>
            <tr>
              <th>Prompt</th>
              <th>School</th>
              <th>Theme</th>
              <th>Chars</th>
              <th>Type</th>
              <th>Received</th>
              <th>Due</th>
              <th>Status</th>
              <th>Reuse</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="tracker__empty">
                  No essays yet — add prompts via a school's detail page.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.essay.prompt}</td>
                <td>{r.school}</td>
                <td>{mapsLabel(r.essay.maps_to)}</td>
                <td>{r.essay.char_limit ?? '—'}</td>
                <td>
                  <span className={`prompt-type prompt-type--${r.essay.confirmed ? 'confirmed' : 'anticipated'}`}>
                    {r.essay.confirmed ? 'Confirmed' : 'Anticipated'}
                  </span>
                </td>
                <td>{r.received ? `Yes · ${r.received}` : '—'}</td>
                <td>{r.received ? plusDays(r.received, 14) : '—'}</td>
                <td>{r.essay.status}</td>
                <td>{r.reuse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
