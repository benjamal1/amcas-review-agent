import { injectPhrase } from './Terminal'
import { useTerminalDock } from './TerminalDock'

// Trigger phrases from Agent/CLAUDE.md
const COMMANDS = [
  { label: 'Quick Score PS', phrase: 'quick score my personal statement' },
  { label: 'Deep Score PS', phrase: 'deep score my personal statement' },
  { label: 'Quick Score Activities', phrase: 'quick score activities' },
  { label: 'Deep Score Activities', phrase: 'deep score activities' },
  { label: 'Score Activities Per Entry', phrase: 'score each activity' },
  { label: 'Score Experiences', phrase: 'score experiences' },
  { label: 'Quick Score Experiences', phrase: 'quick score experiences' },
  { label: 'Deep Score Impactful Exp', phrase: 'deep score impactful experience' },
  { label: 'Quick Score Impactful Exp', phrase: 'quick score impactful experience' },
  { label: 'Competency Coverage', phrase: 'competency coverage' },
  { label: 'Assess Metrics', phrase: 'assess my metrics' },
  { label: 'Update Meeting To-Dos', phrase: 'update meeting to-dos' },
  { label: 'Review Transcript', phrase: 'review my transcript' },
]

// Primary-application grade buttons. Mounted on the Grading page only (not in the global terminal).
export function GradeButtons() {
  const { setOpen } = useTerminalDock()
  const run = (phrase: string) => { setOpen(true); injectPhrase(phrase) }
  return (
    <div className="grade-buttons">
      <div className="grade-buttons__label">GRADE BUTTONS</div>
      <button className="grade-btn grade-btn--full" onClick={() => run('grade my full application')}>
        ★ Full Application Grading
      </button>
      <div className="grade-buttons__grid">
        {COMMANDS.map(c => <button key={c.label} className="grade-btn" onClick={() => run(c.phrase)}>{c.label}</button>)}
      </div>
    </div>
  )
}
