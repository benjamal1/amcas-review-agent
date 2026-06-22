# EXECUTION — AMCAS local-app rebuild (orchestrator entry point)

**Read this first.** You (Sonnet orchestrator) are building the AMCAS review app per the plans
below. Goal: port ALL existing functionality into a dark-cockpit local web app, working FAST,
then iterate. Keep it lean — no extra ceremony.

## Context to load
1. `.planning/specs/2026-06-21-local-app-migration-design.md` — design + dark-cockpit UI tokens.
2. `.planning/ROADMAP.md` — phase map.
3. Phase plans: `.planning/phases/0{1..5}-*/0N-PLAN.md` (+ 01 RESEARCH/BRIEF).
4. `Agent/CLAUDE.md` (live copy: `~/obsidian-vault/Med School Application Dashboard/Agent/CLAUDE.md`)
   — the agent logic that STAYS; the app surfaces it, doesn't replace it.

## Repo / branch
Work in `~/projects/amcas-review-agent` on branch `local-app-rebuild` (preserves history). One
atomic commit per task (`feat:`/`chore:` etc). Merge to `main` in Phase 05. Do NOT push until
asked.

## Build order (DAG)
```
01 Foundation ──┬── 02 Dashboard ──┐
                ├── 03 Editor ─────┤
                └────────── 04 Terminal (needs 01+02) ──┐
                                                         └── 05 Cutover (needs 02,03,04)
```
- 01 gates everything. 02 and 03 run in parallel after 01. 04 needs 01+02. 05 last.
- Dispatch lane: `orchestrate-worktrees.js` for parallel 02/03, or just do them sequentially if
  simpler. Each task has `agent`/`skill`/`model` annotations in its PLAN — Haiku for mechanical
  single-file, Sonnet default, no Opus needed.

## Stack (locked, from search-first)
Vite + React + TS · Fastify 5 (`@fastify/static`, `@fastify/websocket`) · `@xterm/xterm@6` +
`node-pty@1.1` + `ws` · `codemirror@6` + `@codemirror/lang-markdown` · `gray-matter@4` ·
`chokidar@5` · Recharts. Bind 127.0.0.1. `CONTENT_DIR` env (default `./content`).

## Functionality coverage — port ALL of these (map → phase)
Agent behaviors stay in `Agent/CLAUDE.md` (run via embedded terminal). The APP must surface each:

| Capability (Agent/CLAUDE.md) | App surface | Phase |
|---|---|---|
| Composite + 5 domain scores, trends, history | tiles + radar + sparkline | 02-T2/T3 |
| Hard metrics + CARS/BCPM flags | metrics table | 02-T3 |
| 17 AAMC competency coverage | heatmap | 02-T3 |
| PS / Activities / IE scores | component cards | 02-T4 |
| Per-entry activities (desc + MM depth, 3 lowest) | per-entry table | 02-T4 |
| Rec letters (status, N submitted) | letters list | 02-T4 |
| Improvement priorities (top 5) | priorities panel | 02-T4 |
| Red flags | red-flags tile/list | 02-T2 |
| Meeting to-dos (open/done) | todos tile | 02-T2 |
| School List (tiers, pipeline, CASPer/PREview) | school panels (read) | 02-T5 |
| Draft editing (PS/Activities/IE + AMCAS char limits) | CodeMirror editor | 03 |
| Run any scoring command | grade buttons → terminal | 04-T3 |
| Metrics assessment / transcript / meeting extract | grade buttons | 04-T3 |
| Live scoring feedback loop | terminal + chokidar refresh | 04-T2/T4 |
| Data separation (no personal data pushed) | gitignore + templates | 05-T1 |

School-List *interactivity* (add/requirements/pipeline edits) and Secondaries are BACKLOG (post-v1)
— v1 ports the read views + the existing agent commands via buttons.

## Conventions
- Dark-cockpit tokens in CSS custom props (spec §UI direction). Anti-template: hierarchy via scale,
  semantic color for scores/trends only, designed hover/focus.
- Security: path-sandbox the file API to CONTENT_DIR (01-T3, tested); ws localhost-only; pty cwd
  = CONTENT_DIR.
- node-pty isolated + graceful-degrade (04-T1).
- Verify each phase against its AC refs (`.planning/phases/01-*/01-BRIEF.md`, AC1–AC13) before
  advancing.

## Start
Begin Phase 01, Task 1 (branch + scaffold). Then 02‖03, then 04, then 05. Check in with the user
after Phase 01 boots and after the Phase 04 end-to-end loop works.
