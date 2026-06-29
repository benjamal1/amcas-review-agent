import { Editor } from '../components/editor/Editor'
import { AgentButton } from '../components/terminal/AgentButton'

const SCRATCH = 'documents/secondaries/_workspace.md'

// General Editor: a freeform secondaries workspace. Write here, or ask Claude what to work on —
// it reads your priorities + gaps, calls the right secondary helpers, guides you, and (only when
// you confirm) moves what you've written into the correct doc.
export function SecondaryWorkspacePage() {
  return (
    <div className="page page--editor-view sec-workspace">
      <aside className="editor-view__tree sec-workspace__side">
        <div className="sec-page__intro">
          <h2 className="tracker__h">General Editor</h2>
          <p className="tracker__hint">Freeform secondaries workspace. Write in the pad, or ask Claude what to do — it reads your priorities and gaps, calls the right helpers (brainstorm, fit research, prompt mapping), guides you, and — only when you say so — moves what you've written into the right doc.</p>
        </div>
        <AgentButton className="agent-btn agent-btn--wide" phrase="what should I work on next for secondaries" label="✦ What should I work on?" />
        <AgentButton className="agent-btn agent-btn--wide" phrase="guide me through my secondaries" label="✦ Guide me" />
        <AgentButton className="agent-btn agent-btn--wide" phrase="move my workspace draft to the right doc" label="✦ Move my draft to its doc" />
        <p className="tracker__hint sec-workspace__note">Claude reads this pad (<code>_workspace.md</code>) when you ask it to move your draft.</p>
      </aside>
      <main className="editor-view__main"><div className="editor-view__doc"><Editor filePath={SCRATCH} /></div></main>
    </div>
  )
}
