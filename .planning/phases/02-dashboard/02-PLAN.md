---
phase: 02-dashboard
goal: Port ALL 13 DataviewJS panels → React components (dark cockpit), reading the same frontmatter. No Obsidian needed to view anything.
depends_on: 01-app-foundation
ac_refs: [AC4, AC5]
---

# PLAN — Phase 02: Dashboard

Port every dashboard panel to React. Data source = the existing score files via the Phase-01
file API (gray-matter frontmatter). Chart lib: **Recharts** (React-native, less glue than
Chart.js). Apply the dark-cockpit design tokens.

## Data sources (frontmatter)
`Agent/scorecard.md` (composite, 5 domain avgs+trends+updated, hard metrics, red_flag_count,
score history table) · `Agent/competency-coverage.md` (17 competencies, score/tier/supported-by) ·
`Agent/improvement-priorities.md` · `Agent/meeting-todos.md` (open/completed counts) ·
`Personal Statement/ps-scores.md` · `Activities/activities-scores.md` ·
`Impactful Experience/impactful-experience-scores.md` · `Rec Letters/*.md` (recommender,status,
submitted) · `School List/Schools/*.md` (tier, pipeline frontmatter).

## Tasks

### T1 — Data hooks + frontmatter typing
- `src/lib/scores.ts`: typed loaders over the file API for each source above. One `useScores()`
  aggregator hook. Parse score-history markdown table from scorecard body (for sparkline).
- annotate: agent=haiku-coder · skill=react-patterns · model=sonnet
- verify: hook returns typed object for the real vault files; unknown/missing fields default safe.
- ac: AC4

### T2 — Overview panels
- Composite tile (big mono numeral /100 + trend + last_updated + count-up on change).
- Red-flags tile (count, links to red-flags list). Meeting-todos tile (N open · M completed).
- annotate: skill=ui-ux-pro-max · model=sonnet
- verify: values match the old Dataview Overview for the same scorecard.md.

### T3 — Scores panels (the data-viz core)
- 5 domain tiles (avg/10, trend arrow, _updated, mini bar). Radar chart (5 domains, Recharts).
- Score-history sparkline (from the history table). Hard-metrics table (GPA/BCPM/MCAT sections,
  flag CARS<127 + BCPM<cumulative per the agent's rules — display-only flags).
- 17-competency heatmap: grid cells colored by tier (Strong≥8 / Present5–7 / Thin≤4) + score +
  supported-by tooltip.
- annotate: skill=ui-ux-pro-max · model=sonnet · depends_on=T1
- verify: radar + tiles + heatmap render from real frontmatter; tiers/colors correct.
- ac: AC4, AC5

### T4 — Application Components panels
- PS / Activities / Impactful Experience cards (score/10, last_scored, mode). Per-entry
  activities table (description_quality + most_meaningful_depth, flag 3 lowest 🔴) from
  activities-scores.md. Rec Letters list (recommender, status icon, N of M submitted to HCA).
- improvement-priorities panel (top-5 list).
- annotate: skill=ui-ux-pro-max · model=sonnet · depends_on=T1
- verify: each component card matches old dashboard; per-entry table + priorities render.
- ac: AC5

### T5 — School List panels
- By-tier columns (reach/target/safety/unknown) listing schools from `School List/Schools/*.md`.
- Pipeline summary (N primaries submitted, N secondaries, N interviews). CASPer/PREview needed
  lists. (Full School-List interactivity is backlog; this is the read view.)
- annotate: skill=ui-ux-pro-max · model=sonnet · depends_on=T1
- verify: tier columns + pipeline counts match school notes.
- ac: AC5

### T6 — Panel parity audit + review
- Checklist: all 13 former DataviewJS panels have a React equivalent OR an explicit "dropped"
  note. `react-reviewer` + `gsd-code-review`.
- annotate: skill=gsd-code-review · model=sonnet · depends_on=[T2,T3,T4,T5]
- verify: AC4–AC5 met; parity checklist 13/13 resolved.

## Verification (phase exit)
Point CONTENT_DIR at the live vault folder → dashboard visually matches the Obsidian Dataview
dashboard's data (composite, domains, radar, components, school tiers, competency heatmap).
