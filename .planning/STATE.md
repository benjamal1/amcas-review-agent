# STATE — amcas-review-agent

last_updated: 2026-06-27
current_phase: 07-structure-cutover (DONE)
milestone: Local-app rebuild — COMPLETE & BOOT-VERIFIED
mode: built → verified running → ready for live-data + backlog

## Milestone
Rebuild Obsidian-vault folder → standalone local web app. Same repo (`main`),
history preserved. Spec: `.planning/specs/2026-06-21-local-app-migration-design.md`.
Roadmap: `.planning/ROADMAP.md`.

## Position — all phases shipped to `main`
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

## Next
1. Populate `content/data.json` with real applicant data (or point CONTENT_DIR at live source).
2. Exercise a grade button → confirm terminal injects scoring phrase end-to-end in browser.
3. Push to GitHub when ready.
4. Backlog (ROADMAP.md): School List interactivity, Secondaries panel, generalize.

## Backlog / non-goals
See ROADMAP.md. Parked non-goals: SDK, headless, hosting.

## Pipeline Skips
- [2026-06-21] Phase 01, Step 2 (provision-project): skipped — global ~/.claude skills apply.
  Backfill if project-local skills wanted: /provision-project --target ./.claude --type software
