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
  secondary?: SchoolSecondary
  [k: string]: unknown
}

// ── Secondaries ──
// One school's secondary prompt + the draft answering it (maps to a bank archetype).
export interface SecondaryEssay {
  prompt: string; char_limit?: number
  maps_to?: string            // archetype key from the essay bank
  doc_path?: string           // content/documents/secondaries/<school-slug>/<n>.md
  status: ComponentStatus
  confirmed?: boolean         // true = this year's confirmed prompt; false/undefined = anticipated (prior-year)
  chance?: number             // admit.org % likelihood this prompt recurs this cycle (confirmed = 100)
}
// Per-school secondary block: research notes, prompts/essays, and the school-specific regrade.
export interface SchoolSecondary {
  research_notes_path?: string  // …/<school-slug>/_research.md
  prompt_source_year?: string   // e.g. "2025-2026 (prior-year)"
  essays: SecondaryEssay[]
  links?: { label: string; url: string }[]  // user-added reference links for this school
  scorecard?: Scorecard         // full per-school recompute (primary baseline + these secondaries)
  last_regraded?: string
}
// A master archetype draft in the essay bank (pre-written, reused across schools).
export interface BankEssay {
  archetype: string           // "adversity" | "leadership" | … | custom key
  label: string
  doc_path: string            // content/documents/secondaries/_bank/<archetype>.md
  status: ComponentStatus
  pre_writable?: boolean      // false for "why us" (anchor + per-school only)
  guiding_questions?: string[] // Shemmassian brainstorm prompts for this category (editable)
}
export interface Secondaries {
  brainstorm_path?: string    // content/documents/secondaries/_brainstorm.md
  essay_bank: BankEssay[]
  stages?: Record<string, ComponentStatus>  // macro pipeline: brainstorming, prewriting, casper_preview
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
    experiences?: ComponentScore
    competency?: ComponentScore
  }
  activity_entries: ActivityEntry[]
  rec_letters: RecLetter[]
  schools: SchoolEntry[]
  coursework: CourseEntry[]
  application_checklist?: ApplicationChecklist
  primary_components?: Record<string, PrimaryComponent>
  red_flags?: RedFlag[]
  secondaries?: Secondaries
  activity_log?: { date: string; summary: string }[]
}
