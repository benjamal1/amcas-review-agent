import React from 'react'
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

export function Dashboard({ registerReload }: { registerReload?: (fn: () => void) => void }) {
  const { data, loading, error, reload } = useScores()
  React.useEffect(() => { registerReload?.(reload) }, [registerReload, reload])
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
