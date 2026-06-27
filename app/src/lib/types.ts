export interface DomainScore { avg: number; trend: string; last_updated?: string }
export interface HardMetrics {
  gpa_cumulative?: number; gpa_bcpm?: number; mcat_total?: number
  mcat_cars?: number; mcat_cp?: number; mcat_bb?: number; mcat_ps?: number
  [k: string]: number | undefined
}
export interface Scorecard {
  composite?: number; red_flag_count?: number
  domains?: Record<string, DomainScore>; hard_metrics?: HardMetrics
}
export interface Competency { name: string; score?: number; tier?: string; supported_by?: string[] }
export interface ComponentScore { score?: number; last_scored?: string; mode?: string }
export interface ActivityEntry { name: string; description_quality?: number; most_meaningful_depth?: number; [k: string]: unknown }
export interface RecLetter { recommender?: string; title?: string; relationship?: string; status?: string; submitted?: boolean; requested_date?: string; received_date?: string; notes?: string; name?: string; [k: string]: unknown }
export interface SchoolEntry { name: string; tier?: string; pipeline?: string; casper_required?: boolean; preview_required?: boolean; secondary_submitted?: boolean; interview?: boolean; notes?: string; [k: string]: unknown }
export interface CourseEntry { name: string; subject?: string }
export interface DashboardData {
  scorecard: Scorecard | null; competencies: Competency[]
  priorities: string[]; todoOpen: number; todoDone: number
  psScore: ComponentScore | null; activitiesScore: ComponentScore | null; ieScore: ComponentScore | null
  activityEntries: ActivityEntry[]; recLetters: RecLetter[]; schools: SchoolEntry[]
}
export interface AppData {
  scorecard: Scorecard
  competencies: Competency[]
  priorities: string[]
  todos: { open: string[]; done: string[] }
  component_scores: {
    personal_statement: ComponentScore
    activities: ComponentScore
    impactful_experience: ComponentScore
  }
  activity_entries: ActivityEntry[]
  rec_letters: RecLetter[]
  schools: SchoolEntry[]
  coursework: CourseEntry[]
}
