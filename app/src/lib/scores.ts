import type { AppData, DashboardData } from './types'

export async function loadDashboardData(): Promise<DashboardData> {
  const r = await fetch('/api/data')
  if (!r.ok) {
    // Return empty state — dashboard shows "No data" message
    return {
      scorecard: null, competencies: [], priorities: [],
      todoOpen: 0, todoDone: 0,
      psScore: null, activitiesScore: null, ieScore: null,
      activityEntries: [], recLetters: [], schools: [],
    }
  }
  const d: AppData = await r.json()
  return {
    scorecard: d.scorecard ?? null,
    competencies: d.competencies ?? [],
    priorities: d.priorities ?? [],
    todoOpen: d.todos?.open?.length ?? 0,
    todoDone: d.todos?.done?.length ?? 0,
    psScore: d.component_scores?.personal_statement ?? null,
    activitiesScore: d.component_scores?.activities ?? null,
    ieScore: d.component_scores?.impactful_experience ?? null,
    activityEntries: d.activity_entries ?? [],
    recLetters: d.rec_letters ?? [],
    schools: d.schools ?? [],
  }
}
