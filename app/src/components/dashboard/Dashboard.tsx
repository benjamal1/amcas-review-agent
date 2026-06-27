import { useEffect } from 'react'
import '../../styles/dashboard.css'
import { useScores } from '../../hooks/useScores'
import { CompositeTile } from './CompositeTile'
import { RedFlagsTile } from './RedFlagsTile'
import { TodosTile } from './TodosTile'
import { DomainTiles } from './DomainTiles'
import { DomainRadar } from './DomainRadar'
import { MetricsTable } from './MetricsTable'
import { CompetencyHeatmap } from './CompetencyHeatmap'
import { ComponentCards } from './ComponentCards'
import { ActivityTable } from './ActivityTable'
import { RecLettersList } from './RecLettersList'
import { PrioritiesPanel } from './PrioritiesPanel'
import { SchoolListPanel } from './SchoolListPanel'

export function Dashboard() {
  const { data, loading, error, reload } = useScores()
  // Live-reload on score-file changes (chokidar → /watch). Self-contained so any
  // page rendering the dashboard stays current without prop-drilling.
  useEffect(() => {
    let ws: WebSocket | null = null
    let dead = false
    function connect() {
      if (dead) return
      ws = new WebSocket(`ws://${location.host}/watch`)
      ws.onmessage = e => {
        try { const m = JSON.parse(e.data); if (m.type === 'file-changed' && m.isScore) reload() } catch {}
      }
      ws.onclose = () => { if (!dead) setTimeout(connect, 3000) }
    }
    connect()
    return () => { dead = true; ws?.close() }
  }, [reload])
  if (loading) return <div className="dashboard__loading">Loading dashboard…</div>
  if (error) return <div className="dashboard__error">Error loading data: {error}</div>
  if (!data) return <div className="dashboard__empty">No data. Set CONTENT_DIR to your vault folder and restart.</div>
  const { scorecard: sc, competencies, priorities, todoOpen, todoDone, psScore, activitiesScore, ieScore, activityEntries, recLetters, schools } = data
  return (
    <div className="dashboard">
      <div className="dashboard__overview">
        <CompositeTile sc={sc} /><RedFlagsTile sc={sc} /><TodosTile open={todoOpen} done={todoDone} />
      </div>
      <div className="dashboard__scores">
        <div className="dashboard__scores-left"><DomainTiles domains={sc?.domains} /><MetricsTable metrics={sc?.hard_metrics} /></div>
        <DomainRadar domains={sc?.domains} />
      </div>
      <CompetencyHeatmap competencies={competencies} />
      <ComponentCards ps={psScore} act={activitiesScore} ie={ieScore} />
      <ActivityTable entries={activityEntries} />
      <div className="dashboard__right-col"><RecLettersList letters={recLetters} /><PrioritiesPanel priorities={priorities} /></div>
      <SchoolListPanel schools={schools} />
    </div>
  )
}
