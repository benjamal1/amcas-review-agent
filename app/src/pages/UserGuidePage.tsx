// Static how-to. Edit this page directly when the app's surfaces change.
export function UserGuidePage() {
  return (
    <div className="page page--single guide">
      <h1 className="guide__title">User Guide</h1>
      <p className="guide__lead">A local agent for grading and tracking an AMCAS application. Data lives in <code>content/</code> (private, git-ignored); the review agent reads it plus your rubrics and knowledge sources.</p>

      <section className="guide__section">
        <h2>General</h2>
        <ul>
          <li><b>Overview</b> — read-only scorecard: composite, hard metrics, components, competencies at a glance.</li>
          <li><b>Application Tracker</b> — primary-component status board (with readiness meter) + per-school grid. Edits stage locally; hit <b>Save</b> to commit and record a status-history event.</li>
          <li><b>Applicant Image</b> — the synthesized narrative the application projects, rendered from markdown.</li>
          <li><b>Knowledge</b> — sources you find useful (advising notes, articles, strategy). The agent reads everything here for context. Add / view / edit in place.</li>
        </ul>
      </section>

      <section className="guide__section">
        <h2>Primaries</h2>
        <ul>
          <li><b>Grading</b> — editable scorecard. Open the <b>Terminal</b> (sidebar, bottom) and tell Claude to grade — e.g. “grade my personal statement” or “grade my full application”.</li>
          <li><b>Score History</b> — timestamped score progressions (composite, PS, activities, impactful) as tables.</li>
          <li><b>Review</b> — the detailed grading: competency coverage, priorities, red flags, component breakdown, plus the agent’s written feedback. Use the table of contents to jump.</li>
          <li><b>Rubrics</b> — the scoring rubrics the agent grades against.</li>
          <li><b>Coursework</b> — AMCAS course list and GPA mapping.</li>
          <li><b>Editor</b> — Docs-style editor for your essays and activity entries.</li>
        </ul>
      </section>

      <section className="guide__section">
        <h2>Secondaries</h2>
        <p>Next phase — per-school secondary essays, prompts, deadlines, and notes get their own tracker and grading, mirroring Primaries.</p>
      </section>

      <section className="guide__section">
        <h2>Grading with the agent</h2>
        <p>The buttons and terminal drive a Claude session rooted in this repo. It scores against the rubrics, writes structured results into <code>data.json</code> (surfaced in Overview / Score History / Review), and drops prose into <code>content/feedback/</code>. Essay feedback is coaching-first: it quotes the text, names the issue, points a direction — it won’t rewrite your voice unless you ask.</p>
      </section>
    </div>
  )
}
