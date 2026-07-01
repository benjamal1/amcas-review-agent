import { useState, useEffect } from 'react'
import { fetchFiles, type FileMeta } from '../lib/docs'

// Lists document paths plus a path→display-name map (experience_name/title from
// frontmatter), so the tree can show e.g. an activity's name instead of activity-01.md.
export function useFiles() {
  const [files, setFiles] = useState<string[]>([])
  const [labels, setLabels] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let dead = false
    fetchFiles('documents', true)
      .then(data => {
        if (dead) return
        const metas = data as FileMeta[]
        setFiles(metas.map(d => d.path))
        setLabels(Object.fromEntries(metas.filter(d => d.name).map(d => [d.path, d.name])))
        setLoading(false)
      })
      .catch(e => { if (!dead) { setError(String(e)); setLoading(false) } })
    return () => { dead = true }
  }, [])

  return { files, labels, loading, error }
}
