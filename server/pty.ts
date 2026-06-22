import type { FastifyInstance } from 'fastify'

// ponytail: graceful-degrade — node-pty has native build; isolate so it can't break the server
let nodePty: typeof import('node-pty') | null = null
try { nodePty = require('node-pty') } catch { console.warn('[pty] node-pty unavailable — terminal disabled') }

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
    const proc = nodePty!.spawn(shell, [], {
      name: 'xterm-color', cols: 80, rows: 24,
      cwd: contentDir, env: process.env as Record<string, string>,
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
