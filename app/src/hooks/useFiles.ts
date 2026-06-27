import { useState, useEffect } from 'react'

type FileMeta = { path: string; name: string }

// Lists document paths plus a path→display-name map (experience_name/title from
// frontmatter), so the tree can show e.g. an activity's name instead of activity-01.md.
export function useFiles() {
  const [files, setFiles] = useState<string[]>([])
  const [labels, setLabels] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/files?meta=1', { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<FileMeta[]>
      })
      .then(data => {
        setFiles(data.map(d => d.path))
        setLabels(Object.fromEntries(data.filter(d => d.name).map(d => [d.path, d.name])))
        setLoading(false)
      })
      .catch(e => {
        if (e instanceof Error && e.name === 'AbortError') return
        setError(String(e))
        setLoading(false)
      })
    return () => controller.abort()
  }, [])

  return { files, labels, loading, error }
}
