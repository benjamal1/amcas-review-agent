# STATE — amcas-review-agent

last_updated: 2026-06-21
current_phase: 01-app-foundation (PLANNED, not started)
milestone: Local-app rebuild
mode: planning complete → ready to implement

## Milestone
Rebuild Obsidian-vault folder → standalone local web app. Same repo, branch
`local-app-rebuild`, history preserved. Spec:
`.planning/specs/2026-06-21-local-app-migration-design.md`. Roadmap: `.planning/ROADMAP.md`.

## Position
Pipeline planning run for Phase 01 done:
- Step 1 discuss → covered by brainstorm spec (CONTEXT).
- Step 3 search-first → `phases/01-app-foundation/01-RESEARCH.md` (assemble proven libs).
- Step 4 AC → `phases/01-app-foundation/01-BRIEF.md` (AC1–AC13).
- Step 5/6 plan → `phases/01-app-foundation/01-PLAN.md` (T1–T5).

## Next — READY TO EXECUTE
Full plan set written for all 5 phases. Orchestrator entry point: **`.planning/EXECUTION.md`**
(read first — build order DAG, locked stack, full functionality-coverage map, conventions).
UI locked: dark cockpit. Plans: `.planning/phases/0{1..5}-*/`. Start at Phase 01 T1
(branch + scaffold). Intended flow: user compacts, switches to Sonnet, Sonnet orchestrates.

## Backlog / non-goals
See ROADMAP.md (School List, Secondaries, generalize) and parked non-goals (SDK, headless,
hosting).

## Pipeline Skips
- [2026-06-21] Phase 01, Step 2 (provision-project): skipped during planning — no app deps yet,
  global ~/.claude skills apply. Backfill: run /provision-project --target ./.claude --type software
  before/at implementation if project-local skills wanted.
