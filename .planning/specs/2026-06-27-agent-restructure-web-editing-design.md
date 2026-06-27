---
date: 2026-06-27
topic: agent-restructure-web-editing
status: design-approved
---

# Design — Agent Restructure + Web Editing

## Problem

`Agent/CLAUDE.md` is one 618-line file that mixes two unrelated jobs:
1. **AI judgment** — scoring essays/activities/experiences, competency coverage, metrics reads,
   rec-letter review, meeting-note extraction, coursework→competency mapping.
2. **Pure data entry** — hard metrics (GPA/MCAT), school list add/pipeline/requirements,
   rec-letter status fields, meeting-todo check-off, coursework rows.

Today both run through the terminal ("ask Claude to do it"). The data-entry half should be done
in the website (the dashboard is currently 100% read-only; `PUT /api/data` exists but nothing
calls it). The file is also long, has hardcoded MCAT/GPA tiers from the agent's memory, and the
impactful-experience rubric duplicates dimensions used by every essay.

## Decisions (owner, 2026-06-27)

- **Scope:** everything end-to-end (agent restructure + web forms + refs + rubric) — not design-only.
- **Subagents:** Claude Code subagents; `CLAUDE.md` becomes a thin router. `AGENTS.md` = flattened
  fallback for Codex.
- **MCAT refs:** extract to a structured `Agent/reference/metrics.json` (cite source+year); agent
  reads it instead of hardcoded tables.
- **Essay rubric:** shared base file + separate per-essay files that reference it.
- **Web forms:** all four data-entry sets (hard metrics, school list, rec-letter status,
  todos+coursework).
- **MSAR lookup:** case-by-case from the school list, one school at a time (bulk extraction was
  buggy). Not a bulk import.
- **UI placement:** inline-edit the existing dashboard panels + a dedicated School add/detail flow.

## Architecture

### Halves

| Agent (judgment) → subagent | Web form (data entry) |
|---|---|
| essay scoring (PS, impactful, secondary, disadvantaged) | hard metrics (GPA/MCAT) |
| activities scoring (per-entry + component) | school add / pipeline / requirements |
| experiences scoring (5 substance dims) | rec-letter status fields |
| competency coverage | meeting todos (add / check) |
| metrics assessment (the read) | coursework rows |
| rec-letter review/score (never auto) | |
| meeting-todo extraction | |
| coursework→competency mapping | |

The agent reads `data.json`; the app writes it. Data entry no longer goes through the terminal.

### Component 1 — Agent restructure

- `Agent/CLAUDE.md` → router (~100 lines): identity, data model (`data.json`/`documents/`/
  `feedback/`), feedback style (coach-don't-rewrite), **dispatch table** (trigger phrase →
  subagent), global "what you don't do." No mode bodies.
- `.claude/agents/` subagents, each self-contained (frontmatter `name`/`description`/`tools`;
  reads its rubric, writes `data.json` + `feedback/<component>.md`):
  - `essay-scorer` — PS / impactful / secondary / disadvantaged; deep + quick; base+overlay rubric.
  - `activities-scorer` — per-entry description quality + MM depth + activities component.
  - `experiences-scorer` — research/clinical/shadowing/service/leadership substance.
  - `competency-assessor` — 17 AAMC competencies coverage.
  - `metrics-advisor` — competitive read; reads `Agent/reference/metrics.json`.
  - `rec-letter-reviewer` — Brown HCA 5-section review/score; never runs unasked.
  - `meeting-todo-extractor` — parse `documents/meeting-notes/` → `todos.open[]`.
  - `coursework-mapper` — `coursework[]` → competency `supported_by`.
- `AGENTS.md` (repo root) — generated flattened copy (router + all subagent bodies inlined) so
  Codex keeps parity without Task dispatch. Documented as generated; regenerate when agents change.
- Removes all stale `Agent/scorecard.md` / `*-scores.md` / vault-folder references (rewrite).

Trigger phrases preserved so `GradeButtons.tsx` keeps working (it injects phrases into `claude`).

### Component 2 — Shared essay rubric

- `Agent/rubrics/essay-base-rubric.md` — common dimensions: specificity, reflection depth,
  impact clarity, voice/authenticity (1–10 each, with anchors).
- Per-essay files reference the base + add one overlay dimension:
  - `personal-statement-rubric.md` — overlay: why-medicine narrative arc / coherence.
  - `impactful-experience-rubric.md` (new) — overlay: relevance to medicine.
  - `secondary-rubric.md` (new) — overlay: prompt fit / school specificity.
  - `disadvantaged-rubric.md` (new) — overlay: adversity framing without victimhood.
- `essay-scorer` loads base + the overlay for the essay type it's told to score.

### Component 3 — Metrics reference

- `Agent/reference/metrics.json`:
  ```json
  {
    "source": "2026 AMCAS Applicant Guide + AAMC matriculant data + MSAR reports",
    "year": 2026,
    "gpa_tiers": [{ "min": 3.80, "label": "Strong", "note": "..." }, ...],
    "mcat_tiers": [{ "min": 517, "max": 528, "label": "Top tier", "note": "..." }, ...],
    "cars_floor": 127,
    "school_medians": { "<school>": { "gpa": 3.9, "mcat": 520 } }
  }
  ```
  Numbers extracted from the committed PDFs; `school_medians` filled case-by-case from MSAR as
  schools are added (optional, may start empty).
- `metrics-advisor` reads this. The metrics web view (read-only) may render the tiers too.

### Component 4 — Web edit surface

Single write path: `useData()` hook — `GET /api/data` → mutate object → `PUT /api/data`;
`/watch` ws broadcast refreshes other views. `data.json` is single-user local → plain
read-modify-write, no locking.

Inline edits on existing panels:
- `MetricsTable` — editable GPA/MCAT fields → `scorecard.hard_metrics`.
- `RecLettersList` — editable recommender/status/submitted/dates per row → `rec_letters[]`.
- `TodosTile` — add row, check/uncheck → `todos.open[]`/`todos.done[]`.
- coursework — small editable table (name, subject) → `coursework[]` (new panel or in metrics view).

Dedicated School flow (heavier):
- `POST /api/schools/lookup?name=` — server-side MSAR fuzzy match (port the CLAUDE.md rules: exact
  then partial, skip OCR artifacts), returns one matched record or null. One school at a time.
- School add form: type name → lookup → pre-fill entry → user confirms → append to `schools[]`.
- School detail/edit: pipeline status fields (toggles for primary/secondary/interview/decision,
  CASPer/PREview, letters_sent, tier, notes) → that `schools[]` entry.
- Requirements check: a button that runs the keyword match (client or `POST /api/schools/requirements`)
  against `coursework[]`, writes `courses_verified`/`courses_missing`, shows the report.

The agent no longer needs school-add/pipeline/requirements logic; those sections leave CLAUDE.md.

## Data flow

1. User edits a panel → `useData()` PUT `/api/data` → server atomic write → `/watch` broadcasts →
   all views refresh.
2. User clicks a grade button → phrase into `claude` terminal → router dispatches subagent →
   subagent writes `data.json` + `feedback/` → `/watch` refreshes dashboard.
3. School add → `/api/schools/lookup` → form → PUT `/api/data`.

## Error handling

- All form inputs validated client-side (numeric ranges for GPA 0–4, MCAT 472–528) and rejected
  server-side on `PUT /api/data` (schema check before write; 400 on malformed).
- MSAR lookup miss → form opens with blank MSAR fields + a "not found" notice (mirrors old behavior).
- `PUT /api/data` writes atomically (tmp + rename, already implemented) so a failed write can't
  corrupt `data.json`.

## Testing

- Server: `POST /api/schools/lookup` (exact match, partial match, OCR-artifact skip, miss);
  `PUT /api/data` schema validation (reject out-of-range metrics).
- Web: requirements-check keyword matcher unit test (the science-GPA / category mapping).
- Subagents: smoke — each trigger phrase dispatches the right agent; agent writes valid `data.json`.
- Regression: existing `files.test.ts` stays green.

## Out of scope

- No change to the scoring rubric *content* beyond consolidation (same dimensions, same anchors).
- No multi-user / auth (local single-user by design).
- No bulk MSAR import (explicitly rejected — case-by-case only).
- No change to terminal/pty/editor internals.

## Build order (phases — detailed in the implementation plan)

1. Agent: shared essay rubric base + per-essay overlays; `metrics.json` extraction.
2. Agent: subagent files + thin-router CLAUDE.md + generated AGENTS.md.
3. Server: `PUT /api/data` validation; `POST /api/schools/lookup` (+ requirements endpoint).
4. Web: `useData()` write hook; inline-edit panels (metrics, rec letters, todos, coursework).
5. Web: School add/detail flow.
6. Verify: tests green, build green, grade buttons still dispatch.
