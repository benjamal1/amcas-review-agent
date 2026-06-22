import React, { useState } from 'react'
import { Sidebar } from './components/Sidebar'

export default function App() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="logo">AMCAS</span>
        {selectedFile && (
          <span className="app-header__file">{selectedFile}</span>
        )}
      </header>
      <div className="app-body">
        <Sidebar selected={selectedFile} onSelect={setSelectedFile} />
        <main className="app-main">
          <section className="panel panel--dashboard" aria-label="Dashboard">
            <div className="panel__heading">Dashboard</div>
            <p className="panel__placeholder">Score data — phase 02</p>
          </section>
          <section className="panel panel--editor" aria-label="Editor">
            <div className="panel__heading">Editor</div>
            <p className="panel__placeholder">
              {selectedFile ? selectedFile : 'Select a file to edit — phase 03'}
            </p>
          </section>
          <section className="panel panel--terminal" aria-label="Terminal">
            <div className="panel__heading">Terminal</div>
            <p className="panel__placeholder">Claude session — phase 04</p>
          </section>
        </main>
      </div>
    </div>
  )
}
