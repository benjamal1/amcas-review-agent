import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Terminal } from './Terminal'

// One app-level terminal, mounted once and toggled from anywhere. Staying mounted keeps the
// claude session (pty) alive across page navigation. Avoids multiple Terminal singletons.
type Side = 'bottom' | 'right'
type Ctx = { open: boolean; toggle: () => void; setOpen: (v: boolean) => void; side: Side; setSide: (s: Side) => void }
const TerminalDockCtx = createContext<Ctx | null>(null)
export function useTerminalDock() {
  const c = useContext(TerminalDockCtx)
  if (!c) throw new Error('useTerminalDock outside provider')
  return c
}

export function TerminalDockProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  // ponytail: localStorage, not a settings backend — a single UI pref
  const [side, setSideState] = useState<Side>(() => (localStorage.getItem('termSide') === 'right' ? 'right' : 'bottom'))
  const toggle = useCallback(() => setOpen(o => !o), [])
  const setSide = useCallback((s: Side) => { setSideState(s); localStorage.setItem('termSide', s) }, [])
  return <TerminalDockCtx.Provider value={{ open, toggle, setOpen, side, setSide }}>{children}</TerminalDockCtx.Provider>
}

const MIN = 120

export function TerminalDock() {
  const { open, setOpen, side, setSide } = useTerminalDock()
  const [height, setHeight] = useState(320)
  const [width, setWidth] = useState(480)
  const drag = useRef<{ x: number; y: number; h: number; w: number } | null>(null)

  const onMove = useCallback((e: MouseEvent) => {
    if (!drag.current) return
    if (side === 'bottom') {
      const maxH = window.innerHeight - 120
      setHeight(Math.max(MIN, Math.min(maxH, drag.current.h + (drag.current.y - e.clientY))))
    } else {
      const maxW = window.innerWidth - 320
      setWidth(Math.max(280, Math.min(maxW, drag.current.w + (drag.current.x - e.clientX))))
    }
  }, [side])
  const onUp = useCallback(() => { drag.current = null; document.body.style.cursor = '' }, [])
  useEffect(() => {
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [onMove, onUp])

  const startDrag = (e: React.MouseEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, h: height, w: width }
    document.body.style.cursor = side === 'bottom' ? 'row-resize' : 'col-resize'
  }
  const sizeStyle = side === 'bottom'
    ? { height: open ? height : 0 }
    : { width: open ? width : 0 }

  return (
    <div className={`term-dock term-dock--${side}${open ? ' term-dock--open' : ''}`} style={sizeStyle}>
      {/* Right dock resizes from a left-edge strip; bottom dock resizes from its header bar. */}
      {side === 'right' && <div className="term-dock__redge" onMouseDown={startDrag} title="Drag to resize" />}
      <div
        className="term-dock__handle"
        onMouseDown={side === 'bottom' ? startDrag : undefined}
        onDoubleClick={side === 'bottom' ? () => setHeight(h => (h > 200 ? MIN : window.innerHeight - 160)) : undefined}
        title={side === 'bottom' ? 'Drag to resize · double-click to toggle size' : undefined}
      >
        <span className="term-dock__grip" />
        <span className="term-dock__title">TERMINAL</span>
        <button
          className="term-dock__side"
          onClick={() => setSide(side === 'bottom' ? 'right' : 'bottom')}
          title={side === 'bottom' ? 'Dock to right' : 'Dock to bottom'}
        >{side === 'bottom' ? '⇥' : '⤓'}</button>
        <button className="term-dock__close" onClick={() => setOpen(false)} title="Close terminal">✕</button>
      </div>
      <div className="term-dock__body"><div className="terminal-panel"><div className="terminal-panel__term"><Terminal /></div></div></div>
    </div>
  )
}
