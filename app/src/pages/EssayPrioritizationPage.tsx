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

// admit.org recurrence-likelihood tiers (used for the Chance column colour).
const chanceTier = (c: number) => (c >= 90 ? 't1' : c >= 60 ? 't2' : c >= 49 ? 't3' : 't4')

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

  // Expected reuse per theme = Σ over distinct schools of (that school's prompt chance / 100).
  // Unknown chance is treated as full weight (100) so a missing scrape doesn't bury a theme;
  // confirmed prompts carry 100. So a theme covering 5 schools at ~99% outranks 6 at ~30%.
  const themeChance = new Map<string, Map<string, number>>() // theme -> school -> best chance (0–100)
  for (const school of data.schools) {
    if (!school.secondary?.essays?.length) continue
    for (const essay of school.secondary.essays) {
      if (!essay.maps_to) continue
      const w = themeChance.get(essay.maps_to) ?? new Map<string, number>()
      themeChance.set(essay.maps_to, w)
      const c = essay.chance ?? 100
      w.set(school.name, Math.max(w.get(school.name) ?? 0, c))
    }
  }
  const expectedReuse = (theme?: string) =>
    theme ? [...(themeChance.get(theme)?.values() ?? [])].reduce((s, c) => s + c / 100, 0) : 0

  const rows: EssayRow[] = rawRows.map(r => ({ ...r, reuse: expectedReuse(r.essay.maps_to) }))

  // Sort: expected-reuse DESC, then theme label; unmapped (reuse 0) naturally last
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
              <th title="Expected reuse = sum of each covered school's recurrence chance">Reuse</th>
              <th>Chance</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="tracker__empty">
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
                <td>{r.reuse.toFixed(1)}</td>
                <td>{r.essay.chance != null
                  ? <span className={`ep-chance ep-chance--${chanceTier(r.essay.chance)}`}>{r.essay.chance}%</span>
                  : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
