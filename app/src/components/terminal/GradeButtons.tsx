
import { getSharedTerminal } from './Terminal'

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

export function GradeButtons({ sessionActive }: { sessionActive: boolean }) {
  function inject(phrase: string) {
    const { ws } = getSharedTerminal()
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert('Terminal not connected. Check the terminal panel.')
      return
    }
    if (!sessionActive) {
      // Start claude first, then send phrase after a moment
      ws.send(JSON.stringify({ type: 'input', data: 'claude\n' }))
      setTimeout(() => ws.send(JSON.stringify({ type: 'input', data: phrase + '\n' })), 3000)
      return
    }
    ws.send(JSON.stringify({ type: 'input', data: phrase + '\n' }))
  }

  return (
    <div className="grade-buttons">
      <div className="grade-buttons__label">GRADE BUTTONS</div>
      {!sessionActive && <div className="grade-buttons__hint">No active session — will start claude first</div>}
      <button className="grade-btn grade-btn--full" onClick={() => inject('grade my full application')}>
        ★ Full Application Grading
      </button>
      <div className="grade-buttons__grid">
        {COMMANDS.map(c => <button key={c.label} className="grade-btn" onClick={() => inject(c.phrase)}>{c.label}</button>)}
      </div>
    </div>
  )
}
