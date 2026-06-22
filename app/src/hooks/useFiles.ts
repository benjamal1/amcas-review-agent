import { useState, useEffect } from 'react'

export function useFiles() {
  const [files, setFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/files')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<string[]>
      })
      .then(data => { setFiles(data); setLoading(false) })
      .catch(e => { setError(String(e)); setLoading(false) })
  }, [])

  return { files, loading, error }
}
