---
phase: 06-data-model-refactor
goal: Single data.json replaces 8 score md files. documents/ holds essay text. Behavior unchanged.
ac_refs: [AC1, AC2, AC3, AC4, AC5, AC6]
---

# PLAN — Phase 06: Data Model Refactor

## T1 — Update types (app/src/lib/types.ts)
- Add `AppData` interface matching data.json schema (scorecard, competencies, priorities, todos,
  component_scores, activity_entries, rec_letters, schools).
- Keep existing granular types (Scorecard, Competency, etc.) — AppData composes them.
- annotate: agent=haiku-coder · model=haiku

## T2 — Server: /api/data endpoint (server/files.ts)
- `GET /api/data` — read + JSON.parse `$CONTENT_DIR/data.json`; return 200 or 404 if absent.
- `PUT /api/data` — write atomically: write to `.data.json.tmp`, rename to `data.json`.
- Keep existing `/api/files` but scope it to `documents/` subtree only.
- Keep `/api/file?path=` for editor reads/writes (documents only, sandbox still applies).
- annotate: agent=haiku-coder · model=haiku · security_trigger=path-sandbox

## T3 — scores.ts: read data.json (app/src/lib/scores.ts)
- Replace `loadDashboardData()`: single `GET /api/data` call, map AppData → DashboardData.
- Remove all individual `fetchFile()` calls for score files.
- annotate: agent=haiku-coder · model=haiku

## T4 — watch.ts: detect data.json (server/watch.ts)
- Add `data.json` to the score-file regex so changes broadcast `isScore: true`.
- annotate: agent=haiku-coder · model=haiku

## T5 — content.example/ restructure
- Delete all `*-scores.md` files and Agent/ score stubs.
- Add `content.example/data.json` (zeroed schema).
- Add `content.example/documents/personal-statement.md` (placeholder).
- Add `content.example/documents/impactful-experience.md`.
- Add `content.example/documents/activities/` with one placeholder.
- annotate: agent=haiku-coder · model=haiku

## T6 — Agent/CLAUDE.md: output format note
- Add a short section telling the agent to write scores to `data.json` (read existing file,
  merge updated fields, write back). Keep all rubric/scoring logic intact.
- annotate: agent=haiku-coder · model=haiku · depends_on=[T1]

## T7 — server/index.ts: first-run seed
- Copy `content.example/data.json` → `content/data.json` on first run (replace existing md-based
  first-run copy of scorecard.template.md).
- annotate: agent=haiku-coder · model=haiku · depends_on=[T5]

## Verification
- AC1: curl /api/data returns JSON; curl -X PUT /api/data with body writes file.
- AC2: curl /api/files lists only documents/.
- AC3: dashboard loads with data from data.json.
- AC4: touch data.json → ws client receives isScore:true broadcast.
- AC5: ls content.example/ shows no *-scores.md.
- AC6: grep "data.json" Agent/CLAUDE.md returns a hit.
