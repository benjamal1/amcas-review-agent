import { injectPhrase } from './Terminal'
import { useTerminalDock } from './TerminalDock'

// In-app button that opens the terminal dock and injects an agent trigger phrase (same mechanism as
// the grade buttons). Used on the Prewriting + per-school pages to launch the secondaries agents.
export function AgentButton({ phrase, label, className = 'agent-btn' }: { phrase: string; label: string; className?: string }) {
  const { setOpen } = useTerminalDock()
  return (
    <button className={className} onClick={() => { setOpen(true); injectPhrase(phrase) }} title={`Run: ${phrase}`}>
      {label}
    </button>
  )
}
