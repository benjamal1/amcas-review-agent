import type { FastifyInstance } from 'fastify'
import { createRequire } from 'module'

// node-pty is CJS-only; use createRequire so it loads under ESM ("type":"module")
const _require = createRequire(import.meta.url)
let nodePty: typeof import('node-pty') | null = null
try { nodePty = _require('node-pty') } catch (e) { console.warn('[pty] node-pty unavailable — terminal disabled', e) }

export function registerPtyRoute(app: FastifyInstance, contentDir: string) {
  if (!nodePty) {
    app.get('/pty', { websocket: true }, (socket) => {
      socket.send('node-pty is not available. Run: npm rebuild node-pty\n')
      socket.close()
    })
    return
  }
  app.get('/pty', { websocket: true }, (socket) => {
    const shell = process.env.SHELL ?? (process.platform === 'win32' ? 'powershell.exe' : 'bash')
    // Launch at repo root so `claude` auto-loads the router CLAUDE.md + .claude/agents/.
    // The content dir is passed via CONTENT_DIR so agents resolve data.json/documents/feedback.
    const proc = nodePty!.spawn(shell, [], {
      name: 'xterm-color', cols: 80, rows: 24,
      cwd: process.cwd(),
      env: { ...process.env, CONTENT_DIR: contentDir } as Record<string, string>,
    })
    proc.onData(data => { try { socket.send(data) } catch {} })
    socket.on('message', (msg: Buffer | string) => {
      try {
        const p = JSON.parse(msg.toString())
        if (p.type === 'resize') proc.resize(p.cols, p.rows)
        else if (p.type === 'input') proc.write(p.data)
      } catch { proc.write(msg.toString()) }
    })
    socket.on('close', () => { try { proc.kill() } catch {} })
  })
}
