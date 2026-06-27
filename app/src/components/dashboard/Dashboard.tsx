import '../../styles/dashboard.css'
import { useData } from '../../hooks/useData'
import { CompositeTile } from './CompositeTile'
import { RedFlagsTile } from './RedFlagsTile'
import { TodosPanel } from './TodosPanel'
import { DomainTiles } from './DomainTiles'
import { DomainRadar } from './DomainRadar'
import { MetricsTable } from './MetricsTable'
import { CourseworkPanel } from './CourseworkPanel'
import { CompetencyHeatmap } from './CompetencyHeatmap'
import { ComponentCards } from './ComponentCards'
import { ActivityTable } from './ActivityTable'
import { RecLettersList } from './RecLettersList'
import { PrioritiesPanel } from './PrioritiesPanel'
import { SchoolListPanel } from './SchoolListPanel'

export function Dashboard() {
  const { data, loading, error, mutate } = useData()
  if (loading) return <div className="dashboard__loading">Loading dashboard…</div>
  if (!data) return <div className="dashboard__empty">No data. Set CONTENT_DIR to your vault folder and restart.</div>
  const sc = data.scorecard ?? null
  return (
    <div className="dashboard">
      {error && <div className="dashboard__error" role="alert">Save error: {error}</div>}
      <div className="dashboard__overview">
        <CompositeTile sc={sc} /><RedFlagsTile sc={sc} />
        <TodosPanel todos={data.todos} mutate={mutate} />
      </div>
      <div className="dashboard__scores">
        <div className="dashboard__scores-left">
          <DomainTiles domains={sc?.domains} />
          <MetricsTable metrics={sc?.hard_metrics} mutate={mutate} />
          <CourseworkPanel coursework={data.coursework} mutate={mutate} />
        </div>
        <DomainRadar domains={sc?.domains} />
      </div>
      <CompetencyHeatmap competencies={data.competencies ?? []} />
      <ComponentCards
        ps={data.component_scores?.personal_statement ?? null}
        act={data.component_scores?.activities ?? null}
        ie={data.component_scores?.impactful_experience ?? null}
      />
      <ActivityTable entries={data.activity_entries ?? []} />
      <div className="dashboard__right-col">
        <RecLettersList letters={data.rec_letters ?? []} mutate={mutate} />
        <PrioritiesPanel priorities={data.priorities ?? []} />
      </div>
      <SchoolListPanel schools={data.schools ?? []} coursework={data.coursework} mutate={mutate} />
    </div>
  )
}
