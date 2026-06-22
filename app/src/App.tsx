import { useEffect, useRef } from 'react'
import { Dashboard } from './components/dashboard/Dashboard'
import { EditorPanel } from './components/editor/EditorPanel'
import { TerminalPanel } from './components/terminal/TerminalPanel'

export default function App() {
  const reloadRef = useRef<(() => void) | null>(null)

  // Wire chokidar file-change events → dashboard reload
  useEffect(() => {
    let ws: WebSocket | null = null
    function connect() {
      ws = new WebSocket(`ws://${location.host}/watch`)
      ws.onmessage = e => {
        try { const m = JSON.parse(e.data); if (m.type === 'file-changed' && m.isScore) reloadRef.current?.() } catch {}
      }
      ws.onclose = () => setTimeout(connect, 3000)
    }
    connect()
    return () => ws?.close()
  }, [])

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="logo">AMCAS</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-muted)' }}>Local Review Agent</span>
      </header>
      <div className="app-body">
        <main className="app-main">
          <section className="panel panel--dashboard" aria-label="Dashboard">
            <Dashboard registerReload={fn => { reloadRef.current = fn }} />
          </section>
          <section className="panel panel--editor" aria-label="Editor">
            <EditorPanel />
          </section>
          <section className="panel panel--terminal" aria-label="Terminal">
            <TerminalPanel />
          </section>
        </main>
      </div>
    </div>
  )
}
