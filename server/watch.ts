import type { FastifyInstance } from 'fastify'
import chokidar from 'chokidar'
import path from 'node:path'

const SCORE_RE = /(scorecard|.*-scores|competency-coverage|improvement-priorities|meeting-todos).md$/i

export function registerWatchRoute(app: FastifyInstance, contentDir: string) {
  const clients = new Set<import('ws').WebSocket>()

  app.get('/watch', { websocket: true }, (socket) => {
    clients.add(socket)
    socket.on('close', () => clients.delete(socket))
  })

  const watcher = chokidar.watch(contentDir, {
    ignored: /(^|[/\\])\./,  persistent: true, ignoreInitial: true,
  })

  let deb: ReturnType<typeof setTimeout> | null = null
  const broadcast = (fp: string) => {
    const msg = JSON.stringify({ type: 'file-changed', path: path.relative(contentDir, fp), isScore: SCORE_RE.test(fp) })
    for (const c of clients) { try { c.send(msg) } catch {} }
  }
  const onChange = (fp: string) => { if (deb) clearTimeout(deb); deb = setTimeout(() => broadcast(fp), 300) }
  watcher.on('change', onChange).on('add', onChange)
  app.addHook('onClose', async () => watcher.close())
}
