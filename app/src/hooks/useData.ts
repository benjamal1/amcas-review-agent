import { useState, useEffect, useCallback, useRef } from 'react'
import type { AppData } from '../lib/types'
import { fetchData, putData } from '../lib/docs'
import { IS_STATIC } from '../lib/env'

// Single source of truth for the editable data.json. GET on mount, optimistic PUT on mutate,
// live-refresh via /watch. All editable panels share one write path.
export function useData() {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<AppData | null>(null)
  const inFlight = useRef(0) // open PUTs — suppress /watch reloads that would clobber optimistic state

  const reload = useCallback(async () => {
    if (inFlight.current > 0) return // a mutate is mid-PUT; its result is authoritative, not the server's stale read
    try {
      const d = await fetchData<AppData>()
      ref.current = d; setData(d); setError(null); setLoading(false)
    } catch (e) {
      ref.current = null; setData(null); setError(String(e)); setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  // Live reload when the agent (or another tab) writes data.json. Static export has no watcher.
  useEffect(() => {
    if (IS_STATIC) return
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
    inFlight.current++
    try {
      const res = await putData(next) // no-op in static export → keeps optimistic state, no persistence
      if (!res.ok) { ref.current = base; setData(base); setError(res.error ?? 'write failed') }
    } catch (e) {
      ref.current = base; setData(base); setError(String(e))
    } finally {
      inFlight.current--
    }
  }, [])

  return { data, loading, error, reload, mutate }
}
