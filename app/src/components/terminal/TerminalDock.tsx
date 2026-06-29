import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Terminal } from './Terminal'

// One app-level terminal, mounted once and toggled from anywhere. Staying mounted keeps the
// claude session (pty) alive across page navigation. Avoids multiple Terminal singletons.
type Ctx = { open: boolean; toggle: () => void; setOpen: (v: boolean) => void }
const TerminalDockCtx = createContext<Ctx | null>(null)
export function useTerminalDock() {
  const c = useContext(TerminalDockCtx)
  if (!c) throw new Error('useTerminalDock outside provider')
  return c
}

export function TerminalDockProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen(o => !o), [])
  return <TerminalDockCtx.Provider value={{ open, toggle, setOpen }}>{children}</TerminalDockCtx.Provider>
}

const MIN_H = 120

export function TerminalDock() {
  const { open, setOpen } = useTerminalDock()
  const [height, setHeight] = useState(320)
  const drag = useRef<{ y: number; h: number } | null>(null)

  const onMove = useCallback((e: MouseEvent) => {
    if (!drag.current) return
    const maxH = window.innerHeight - 120
    setHeight(Math.max(MIN_H, Math.min(maxH, drag.current.h + (drag.current.y - e.clientY))))
  }, [])
  const onUp = useCallback(() => { drag.current = null; document.body.style.cursor = '' }, [])
  useEffect(() => {
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [onMove, onUp])

  return (
    <div className={`term-dock${open ? ' term-dock--open' : ''}`} style={{ height: open ? height : 0 }}>
      <div
        className="term-dock__handle"
        onMouseDown={e => { drag.current = { y: e.clientY, h: height }; document.body.style.cursor = 'row-resize' }}
        onDoubleClick={() => setHeight(h => (h > 200 ? MIN_H : window.innerHeight - 160))}
        title="Drag to resize · double-click to toggle size"
      >
        <span className="term-dock__grip" />
        <span className="term-dock__title">TERMINAL</span>
        <button className="term-dock__close" onClick={() => setOpen(false)} title="Close terminal">✕</button>
      </div>
      <div className="term-dock__body"><div className="terminal-panel"><div className="terminal-panel__term"><Terminal /></div></div></div>
    </div>
  )
}
