---
phase: 08-agent-restructure-web-editing
type: acceptance-criteria
---

# AC Brief — Phase 08

## Acceptance criteria (verifiable)

**Agent restructure**
- AC1 — `Agent/CLAUDE.md` ≤ ~130 lines, contains a dispatch table mapping every GradeButtons
  trigger phrase to a subagent; no scoring-mode bodies remain.
- AC2 — `.claude/agents/` contains 8 subagent files (essay-scorer, activities-scorer,
  experiences-scorer, competency-assessor, metrics-advisor, rec-letter-reviewer,
  meeting-todo-extractor, coursework-mapper), each with valid frontmatter (name/description/tools).
- AC3 — `AGENTS.md` exists at repo root = flattened router + inlined subagent bodies (Codex
  fallback); a header notes it is generated.
- AC4 — No remaining references to `Agent/scorecard.md`, `*-scores.md`, or legacy vault folders in
  CLAUDE.md or any subagent (`grep` returns clean).

**Rubric**
- AC5 — `Agent/rubrics/essay-base-rubric.md` exists (specificity, reflection, impact, voice).
- AC6 — `personal-statement-rubric.md` + new `impactful-experience-rubric.md`, `secondary-rubric.md`,
  `disadvantaged-rubric.md` each reference the base + define one overlay dimension.

**Reference**
- AC7 — `Agent/reference/metrics.json` parses; has `gpa_tiers`, `mcat_tiers`, `cars_floor`,
  `source`, `year`. `metrics-advisor` reads it (no hardcoded tier tables in the agent).

**Web editing**
- AC8 — `useData()` write hook: edits PUT `/api/data`; `/watch` triggers refresh.
- AC9 — Inline edit works for: hard metrics (GPA/MCAT), rec-letter status rows, todos
  (add/check/uncheck), coursework rows. Each persists to `data.json` and survives reload.
- AC10 — School add: `POST /api/schools/lookup?name=` returns a matched MSAR record (or null),
  one school at a time; add form pre-fills and appends to `schools[]`.
- AC11 — School detail: pipeline fields editable; requirements check runs the keyword match against
  `coursework[]` and writes `courses_verified`/`courses_missing`.
- AC12 — `PUT /api/data` rejects out-of-range metrics (GPA>4, MCAT>528) with 400.

**Regression**
- AC13 — `npx vitest run` green (incl. existing `files.test.ts`); `npm run build` (app) exit 0.
- AC14 — Grade buttons still dispatch (trigger phrase → correct subagent).
