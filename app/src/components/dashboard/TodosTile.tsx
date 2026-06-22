
export function TodosTile({ open, done }: { open: number; done: number }) {
  return (
    <div className="tile tile--todos">
      <div className="tile__label">MEETING TODOS</div>
      <div className="tile__score-big">{open}<span className="tile__denom"> open</span></div>
      <div className="tile__sub">{done} completed</div>
    </div>
  )
}
