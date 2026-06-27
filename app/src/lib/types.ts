export interface DomainScore { avg: number; trend: string; last_updated?: string }
export interface HardMetrics {
  gpa_cumulative?: number; gpa_bcpm?: number; mcat_total?: number
  mcat_cars?: number; mcat_cp?: number; mcat_bb?: number; mcat_ps?: number
  [k: string]: number | undefined
}
// One dated snapshot of a score (component-level or composite). Dimension scores
// (specificity, arc, …) ride along as extra numeric keys.
export interface ScoreSnapshot { date: string; mode?: string; avg?: number; composite?: number; note?: string; [dim: string]: string | number | undefined }
export interface Scorecard {
  composite?: number; red_flag_count?: number
  domains?: Record<string, DomainScore>; hard_metrics?: HardMetrics
  composite_history?: ScoreSnapshot[]
}
export interface Competency { name: string; score?: number; tier?: string; supported_by?: string[]; history?: ScoreSnapshot[] }
// Red-flag log (active negatives + resolved history).
export interface RedFlag {
  id?: string; flag: string; location?: string; severity?: string
  status: 'active' | 'resolved'; resolution?: string; resolved_date?: string
}
export interface ComponentScore { score?: number; last_scored?: string; mode?: string; history?: ScoreSnapshot[] }
export interface ActivityEntry { name: string; description_quality?: number; most_meaningful_depth?: number; [k: string]: unknown }
export interface RecLetter { recommender?: string; title?: string; relationship?: string; status?: string; submitted?: boolean; requested_date?: string; received_date?: string; notes?: string; name?: string; [k: string]: unknown }
// Per-school application tracking (the premed-spreadsheet row).
export type SchoolStatus =
  | 'pre-secondary' | 'secondary-received' | 'secondary-submitted'
  | 'interview-invited' | 'interviewed' | 'waitlisted' | 'accepted' | 'rejected' | 'withdrawn'
export interface SchoolEntry {
  name: string; tier?: string; rank?: number; location?: string; pipeline?: string
  status?: SchoolStatus; status_history?: StatusEvent[]
  casper_required?: boolean; preview_required?: boolean; secondary_fee?: number
  secondary_received_date?: string; secondary_deadline?: string; target_submit_date?: string
  secondary_submitted_date?: string
  interview_date?: string
  secondary_submitted?: boolean; interview?: boolean; notes?: string
  [k: string]: unknown
}
// Top-level primary-application checklist.
export interface ApplicationChecklist {
  amcas_submitted_date?: string; transcripts_sent?: boolean; mcat_released?: boolean
  lor_count?: number; committee_letter?: boolean; casper_done?: boolean; preview_done?: boolean
}

// Per-component progress through the primary application.
export type ComponentStatus =
  | 'not-started' | 'drafting' | 'under-review' | 'final-edits' | 'ready' | 'submitted' | 'not-applicable'
export interface StatusEvent { status: ComponentStatus | SchoolStatus; date: string }
export interface PrimaryComponent { status: ComponentStatus; status_history?: StatusEvent[] }
export interface CourseEntry { name: string; subject?: string }
export type Mutate = (fn: (d: AppData) => AppData) => void
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
  application_checklist?: ApplicationChecklist
  primary_components?: Record<string, PrimaryComponent>
  red_flags?: RedFlag[]
}
