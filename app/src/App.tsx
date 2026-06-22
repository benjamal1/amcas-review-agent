import React from 'react'

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="logo">AMCAS Review Agent</span>
      </header>
      <main className="app-main">
        <section className="panel panel--dashboard" aria-label="Dashboard">
          <p className="panel__placeholder">Dashboard — loading…</p>
        </section>
        <section className="panel panel--editor" aria-label="Editor">
          <p className="panel__placeholder">Editor — loading…</p>
        </section>
        <section className="panel panel--terminal" aria-label="Terminal">
          <p className="panel__placeholder">Terminal — loading…</p>
        </section>
      </main>
    </div>
  )
}
