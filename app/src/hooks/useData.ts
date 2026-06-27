import { useState, useEffect, useCallback, useRef } from 'react'
import type { AppData } from '../lib/types'

// Single source of truth for the editable data.json. GET on mount, optimistic PUT on mutate,
// live-refresh via /watch. All editable panels share one write path.
export function useData() {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<AppData | null>(null)

  const reload = useCallback(async () => {
    try {
      const r = await fetch('/api/data')
      if (!r.ok) { ref.current = null; setData(null); setLoading(false); return }
      const d = (await r.json()) as AppData
      ref.current = d; setData(d); setError(null); setLoading(false)
    } catch (e) {
      setError(String(e)); setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  // Live reload when the agent (or another tab) writes data.json.
  useEffect(() => {
    let ws: WebSocket | null = null
    let dead = false
    const connect = () => {
      if (dead) return
      ws = new WebSocket(`ws://${location.host}/watch`)
      ws.onmessage = e => {
        try { const m = JSON.parse(e.data); if (m.type === 'file-changed' && m.isScore) reload() } catch {}
      }
      ws.onclose = () => { if (!dead) setTimeout(connect, 3000) }
    }
    connect()
    return () => { dead = true; ws?.close() }
  }, [reload])

  // Apply fn to a clone, optimistically render, PUT; roll back on failure.
  const mutate = useCallback(async (fn: (d: AppData) => AppData) => {
    const base = ref.current
    if (!base) return
    const next = fn(structuredClone(base))
    ref.current = next; setData(next); setError(null)
    try {
      const r = await fetch('/api/data', {
        method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(next),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        ref.current = base; setData(base); setError(j.error ?? `write failed (${r.status})`)
      }
    } catch (e) {
      ref.current = base; setData(base); setError(String(e))
    }
  }, [])

  return { data, loading, error, reload, mutate }
}
