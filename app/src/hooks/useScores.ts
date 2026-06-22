import { useState, useEffect, useCallback } from 'react'
import { loadDashboardData } from '../lib/scores'
import type { DashboardData } from '../lib/types'
export function useScores() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const reload = useCallback(() => {
    setLoading(true)
    loadDashboardData().then(d => { setData(d); setLoading(false) }).catch(e => { setError(String(e)); setLoading(false) })
  }, [])
  useEffect(reload, [reload])
  return { data, loading, error, reload }
}
