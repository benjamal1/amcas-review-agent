import { Terminal } from './Terminal'

// The global terminal dock holds just the terminal. Page-specific action buttons (grade buttons,
// secondary agent buttons) live on their relevant pages, not here.
export function TerminalPanel() {
  return (
    <div className="terminal-panel">
      <div className="terminal-panel__term"><Terminal /></div>
    </div>
  )
}
