import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebglAddon } from '@xterm/addon-webgl'
import '@xterm/xterm/css/xterm.css'
import '../../styles/terminal.css'
import { IS_STATIC } from '../../lib/env'

// Shared refs so buttons can inject into the running session
let _ws: WebSocket | null = null
let _xterm: XTerm | null = null
export function getSharedTerminal() { return { ws: _ws, xterm: _xterm } }

// Inject a trigger phrase into the shared terminal. Claude is auto-started on connect (see connect()),
// so this only types the phrase — no fragile "is a session running?" detection / relaunch.
export function injectPhrase(phrase: string) {
  if (IS_STATIC) { alert('The Claude agent runs only in the full local app — this shared export is read-only.'); return }
  if (!_ws || _ws.readyState !== WebSocket.OPEN) { alert('Terminal not connected. Open the terminal panel.'); return }
  // Claude's TUI reads \n as a literal newline (Shift+Enter) and \r as submit (Enter). Send the
  // text, then \r on the next tick so it lands as a real Enter outside the paste burst.
  _ws.send(JSON.stringify({ type: 'input', data: phrase }))
  setTimeout(() => _ws?.send(JSON.stringify({ type: 'input', data: '\r' })), 40)
}

export function Terminal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (IS_STATIC || !ref.current) return // no PTY server in the static export
    const xterm = new XTerm({
      theme: { background: '#0F1419', foreground: '#C9D1D9', cursor: '#36D6C3', selectionBackground: '#2A323C', black: '#0F1419', brightBlack: '#2A323C', red: '#F85149', green: '#3FB950', yellow: '#D29922', blue: '#58A6FF', magenta: '#BC8CFF', cyan: '#36D6C3', white: '#C9D1D9', brightWhite: '#E6EDF3' },
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13, lineHeight: 1.4, cursorBlink: true,
    })
    const fit = new FitAddon()
    xterm.loadAddon(fit)
    xterm.open(ref.current)
    // GPU-render the terminal so scrolling/output stays smooth. Falls back to the DOM renderer
    // if WebGL is unavailable or the context is lost.
    try {
      const webgl = new WebglAddon()
      webgl.onContextLoss(() => webgl.dispose())
      xterm.loadAddon(webgl)
    } catch { /* no WebGL — xterm keeps its default renderer */ }
    fit.fit()
    _xterm = xterm

    let disposed = false // set on unmount; stops reconnect from resurrecting a dead session
    let claudeLaunched = false // auto-start claude once per shell; server spawns a fresh shell each connect
    function connect() {
      if (disposed) return
      const ws = new WebSocket(`ws://${location.host}/pty`)
      _ws = ws
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'resize', cols: xterm.cols, rows: xterm.rows }))
        // Keep claude always open in the dock: launch it on connect (and again after a reconnect,
        // since the pty server gives a brand-new shell each time). Buttons then only type the phrase.
        if (!claudeLaunched) { claudeLaunched = true; ws.send(JSON.stringify({ type: 'input', data: 'claude\n' })) }
      }
      ws.onmessage = e => { if (!disposed) xterm.write(e.data) }
      ws.onclose = () => { if (!disposed) { claudeLaunched = false; setTimeout(connect, 2000) } }
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
  }, [])

  if (IS_STATIC) return (
    <div className="terminal-container terminal-container--static">
      Terminal &amp; Claude agent run only in the full local app — this shared export is read-only.
    </div>
  )
  return <div ref={ref} className="terminal-container" />
}
