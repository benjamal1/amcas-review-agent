# ROADMAP — amcas-review-agent

## Active milestone: Local-app rebuild (decided 2026-06-21)

Rebuild from an Obsidian-vault folder into a standalone local web app. Same repo, branch
`local-app-rebuild`, history preserved. Spec: `.planning/specs/2026-06-21-local-app-migration-design.md`.
Data model unchanged (markdown + frontmatter). Obsidian → optional file storage only.

| Phase | Goal | Key AC |
|---|---|---|
| **01 — Foundation** | Branch + Vite/React + Fastify scaffold; sandboxed file REST; `CONTENT_DIR` config; app shell with 3 empty panels | AC1–AC3 |
| **02 — Dashboard** | Port the 13 DataviewJS panels → React components reading frontmatter; chart lib | AC4–AC5 |
| **03 — Editor** | CodeMirror markdown editor, load/save, debounced autosave | AC6 |
| **04 — Terminal + grading** | `@xterm/xterm` + `node-pty` over ws; grade buttons inject into visible session; chokidar refresh | AC7–AC10 |
| **05 — Separation + cutover** | gitignore content; ship engine+templates; drop `Application Dashboard.md`+`demo.gif`; README + CLAUDE.md update; verify parity vs old dashboard | AC11–AC13 |
| **06 — Data-model refactor** | Single `content/data.json` + `documents/` replaces per-score md files; `/api/data` | — |
| **07 — Structure cutover** | Archive legacy root vault dirs → `old-version-files/`; fold Rec Letters + School List into `data.json`; relocate Meeting Notes + Transcripts → `documents/` | — |

Phases are sequential-ish but 02/03 can overlap (independent panels). 01 gates all.
Milestone shipped; 06–07 were post-rebuild structure cleanup.

## Backlog (post-rebuild, unchanged)

- **School List tracker** — filtering/sorting/dashboard integration; finish MSAR import. Now a
  set of app components instead of Dataview.
- **Secondaries** — per-school secondary essay drafting + rubric.
- **Generalize for broader use** — strip single-applicant assumptions; guided first-run.

## Parked (explicit non-goals for this milestone)
Embedded Claude Agent SDK (token cost), headless grading (brittle), hosting/multi-user (local by
design), packaged binary.
