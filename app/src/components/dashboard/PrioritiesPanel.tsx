
export function PrioritiesPanel({ priorities }: { priorities: string[] }) {
  return (
    <div className="priorities">
      <div className="tile__label">TOP PRIORITIES</div>
      {!priorities.length ? <div className="tile__empty">No priorities found</div> : <ol>{priorities.map((p, i) => <li key={i}>{p}</li>)}</ol>}
    </div>
  )
}
