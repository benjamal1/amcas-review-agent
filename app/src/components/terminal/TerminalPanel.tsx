import React, { useState } from 'react'
import { Terminal } from './Terminal'
import { GradeButtons } from './GradeButtons'
export function TerminalPanel() {
  const [active, setActive] = useState(false)
  return (
    <div className="terminal-panel">
      <div className="terminal-panel__term"><Terminal onSessionDetect={setActive} /></div>
      <div className="terminal-panel__buttons"><GradeButtons sessionActive={active} /></div>
    </div>
  )
}
