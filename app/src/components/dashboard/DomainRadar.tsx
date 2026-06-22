
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import type { DomainScore } from '../../lib/types'
const SHORT: Record<string, string> = { personal_narrative: 'Personal', clinical_experience: 'Clinical', research_academics: 'Research', extracurriculars: 'Extracurricular', service_community: 'Service' }
export function DomainRadar({ domains }: { domains: Record<string, DomainScore> | undefined }) {
  if (!domains) return null
  const data = Object.entries(domains).map(([k, d]) => ({ subject: SHORT[k] ?? k, score: d.avg ?? 0, fullMark: 10 }))
  return (
    <div className="chart-panel">
      <div className="chart-panel__label">DOMAIN RADAR</div>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="var(--color-hairline)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-muted)', fontSize: 10 }} />
          <Radar dataKey="score" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
