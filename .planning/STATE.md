# STATE — amcas-review-agent

last_updated: 2026-07-01b
current_phase: 08-agent-restructure-web-editing (DONE) — milestone complete; post-milestone work ad-hoc on `main`
milestone: Agent restructure + web editing (DONE)
mode: shipping feature work directly on `main` (no active GSD phase)

## Milestone
Rebuild Obsidian-vault folder → standalone local web app. Same repo (`main`),
history preserved. Spec: `.planning/specs/2026-06-21-local-app-migration-design.md`.
Roadmap: `.planning/ROADMAP.md`.

## Position
Phase 08 (agent restructure + web editing) DONE on branch `working-structure-continue-planning`:
- `CLAUDE.md` router (root) + 8 `.claude/agents/` subagents + generated `AGENTS.md`; `claude`
  launches from repo root (pty cwd change), CONTENT_DIR via env.
- Shared essay rubric base + 4 per-essay overlays; `Agent/reference/metrics.json`.
- Server: `PUT /api/data` validation; `POST /api/schools/lookup` + `/requirements`.
- Web: `useData()` write hook + inline-edit panels (metrics, rec letters, todos, coursework) +
  School add/detail flow. 26 tests green, app build + server tsc green.
- Reversed PROJECT.md "no root CLAUDE.md" (required for repo-root launch).

## Local-app rebuild — all phases shipped to `main`
- Phase 01 app-foundation — Fastify + sandboxed file API (TDD) + 3-panel dark cockpit.
- Phase 02 dashboard — Recharts radar/heatmap/tiles, reads `/api/data`.
- Phase 03 editor — CodeMirror 6 + autosave.
- Phase 04 terminal — xterm.js + node-pty + grade buttons + chokidar `/watch`.
- Phase 05 cutover — gitignore + README + merge to main.
- Phase 06 data-model refactor — dropped per-score md files; single `content/data.json`
  + `content/documents/`. `/api/data` endpoint, `scores.ts` reads data.json.
- Phase 07 structure cutover — archived 8 legacy root vault dirs → `old-version-files/`;
  folded content.example Rec Letters + School List into `data.json` (rec_letters[]/schools[]);
  relocated Meeting Notes + Transcripts → `documents/`; refreshed content.example README;
  extended RecLetter/SchoolEntry types. Plan: `phases/07-structure-cutover/`.

## Boot verification (2026-06-27)
`npm run dev` → server :3001, vite :5173. Verified end-to-end:
- /api/health ✅ · /api/data ✅ (schema valid; data.json is empty stub, composite null)
- page serves ✅ · /api proxy via 5173 ✅
- terminal `/pty` ws ✅ (spawns real shell, direct + via proxy)
- `/watch` ws ✅
node-pty ESM fix (`createRequire`, commit 1056d97) confirmed working — no `[pty] unavailable`.
Prior session's ECONNRESET was a stale socket, not a real fault.

## Post-milestone work (ad-hoc on `main`, not GSD-phased)
- Secondaries workspace (prewriting, per-school prompt-mapping, essay prioritization) + 13 subagents.
- admit.org Chance% likelihood + weighted reuse.
- **2026-07-01** (commit `8f2b2c8`): shareable **static export** (`npm run build:static` → `dist-static/`,
  read-only, no server; `lib/docs.ts` data-access layer branching on `IS_STATIC`); dockable
  right-sidebar terminal; `@container` narrow-pane responsiveness; coursework AMCAS fields (43 rows);
  cross-essay/primary reuse guard on secondary agents; school Research tab split into
  `_research`/`_brainstorm`; Primaries editor scoped to primary docs; deleted 22 agent-dumped
  `_research.md` (backed up). Deployed via Netlify Drop from `~/Desktop/amcas-review-site` on the Mac.
- **2026-07-01 (later, commit `72be535`):** sidebar **orange "C" badge** on Claude-authored pages
  (Applicant Image, Story Bank, Activity Log, Review, Grading, Score History). Trimmed all 22
  activity-log mapping entries to bare `prompt -> category (story)` (dropped research-flag/reuse-cap
  bookkeeping — user request). **Gotcha surfaced:** the shared static export is a frozen snapshot;
  it doesn't reflect `content/` edits until `npm run build:static` + redeploy (caused a "nothing is
  changing" confusion — user was viewing the Netlify site, not localhost). Export rebuilt + re-pushed.

## Next
1. Static export polish if desired: render activity entries read-only in static too.
2. Public-release restructure still open (spec `.planning/specs/2026-06-27-public-release-restructure-plan.md`):
   LICENSE, move personal `content/`/`.planning/` out, `Agent/` source-vs-runtime split.
3. Backlog (ROADMAP.md): School List interactivity, generalize for broader use.

## Backlog / non-goals
See ROADMAP.md. Parked non-goals: SDK, headless, hosting.

## Pipeline Skips
- [2026-06-21] Phase 01, Step 2 (provision-project): skipped — global ~/.claude skills apply.
  Backfill if project-local skills wanted: /provision-project --target ./.claude --type software
- [2026-06-27] Phase 08, Step 1 (gsd-discuss-phase): satisfied by approved spec + brainstorming;
  CONTEXT derived from spec rather than re-asking. Backfill: n/a.
- [2026-06-27] Phase 08, Step 2 (provision-project): skipped — global ~/.claude skills apply.
- [2026-06-27] Phase 08, Step 3 (search-first): done inline during exploration (app edit-surface
  + harness mapping). Backfill: n/a.
- [2026-06-27] Phase 08, Step 5 (gsd-plan-phase research): covered by the design spec; no separate
  RESEARCH.md. Backfill: run gsd-plan-phase --research-phase 08 if deeper research wanted.
- [2026-06-27] Phase 08, Step 6 (plan-orchestrate): /orchestrate not assumed installed — used manual
  per-task annotations in PLAN.md (agent/skill/model/depends_on). Backfill: re-annotate if installed.
