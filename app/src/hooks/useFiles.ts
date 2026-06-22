import { useState, useEffect } from 'react'

export function useFiles() {
  const [files, setFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/files', { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<string[]>
      })
      .then(data => { setFiles(data); setLoading(false) })
      .catch(e => {
        if (e instanceof Error && e.name === 'AbortError') return
        setError(String(e))
        setLoading(false)
      })
    return () => controller.abort()
  }, [])

  return { files, loading, error }
}
