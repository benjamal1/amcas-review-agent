import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import '../../styles/terminal.css'

// Shared refs so GradeButtons can inject into the running session
let _ws: WebSocket | null = null
let _xterm: XTerm | null = null
export function getSharedTerminal() { return { ws: _ws, xterm: _xterm } }

export function Terminal({ onSessionDetect }: { onSessionDetect?: (active: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const xterm = new XTerm({
      theme: { background: '#0F1419', foreground: '#C9D1D9', cursor: '#36D6C3', selectionBackground: '#2A323C', black: '#0F1419', brightBlack: '#2A323C', red: '#F85149', green: '#3FB950', yellow: '#D29922', blue: '#58A6FF', magenta: '#BC8CFF', cyan: '#36D6C3', white: '#C9D1D9', brightWhite: '#E6EDF3' },
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13, lineHeight: 1.4, cursorBlink: true,
    })
    const fit = new FitAddon()
    xterm.loadAddon(fit)
    xterm.open(ref.current)
    fit.fit()
    _xterm = xterm

    let disposed = false // set on unmount; stops reconnect from resurrecting a dead session
    function connect() {
      if (disposed) return
      const ws = new WebSocket(`ws://${location.host}/pty`)
      _ws = ws
      ws.onopen = () => ws.send(JSON.stringify({ type: 'resize', cols: xterm.cols, rows: xterm.rows }))
      ws.onmessage = e => {
        if (disposed) return
        xterm.write(e.data)
        if (onSessionDetect && typeof e.data === 'string') {
          // Detect active claude session by spinner chars or prompt
          onSessionDetect(e.data.includes('✻') || e.data.includes('⠋') || e.data.includes('⠙'))
        }
      }
      ws.onclose = () => { if (!disposed) setTimeout(connect, 2000) }
    }
    connect()
    xterm.onData(d => _ws?.send(JSON.stringify({ type: 'input', data: d })))

    const obs = new ResizeObserver(() => {
      fit.fit()
      _ws?.send(JSON.stringify({ type: 'resize', cols: xterm.cols, rows: xterm.rows }))
    })
    obs.observe(ref.current)

    return () => {
      disposed = true
      obs.disconnect()
      _ws?.close()
      xterm.dispose()
      _ws = null; _xterm = null
    }
  }, [onSessionDetect])

  return <div ref={ref} className="terminal-container" />
}
