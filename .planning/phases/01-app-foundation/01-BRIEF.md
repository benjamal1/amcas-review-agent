# Acceptance Criteria — AMCAS local app (v1)

Verifiable criteria for the whole v1 rebuild. Each is a runnable/observable check.

## Data layer
- **AC1** Server reads `CONTENT_DIR` from env/config; defaults to `./content`. Starting with
  `CONTENT_DIR=<vault folder>` serves that folder's markdown.
- **AC2** `GET /api/files` lists `.md` under CONTENT_DIR; `GET /api/file?path=` returns body +
  parsed frontmatter; `PUT /api/file` writes it back. Round-trip preserves frontmatter exactly.
- **AC3 (security)** Any path containing `..` or resolving outside CONTENT_DIR is rejected 400.
  Has a unit test. Server binds `127.0.0.1` only.

## Dashboard
- **AC4** Given `scorecard.md` frontmatter, the dashboard renders composite, the 5 domain tiles
  with trend arrows, the radar chart, and the hard-metrics table — matching the values the old
  Dataview dashboard showed for the same file.
- **AC5** All 13 former DataviewJS panels have a React equivalent (or are explicitly dropped with
  a note). No Obsidian/Dataview required to view any of it.

## Editor
- **AC6** Opening a draft (`Personal Statement Draft.md`) shows it in CodeMirror; edits autosave
  (debounced) to disk; reopening shows the saved text.

## Terminal + grading
- **AC7** Terminal panel runs a shell `cd`'d to CONTENT_DIR; typing `claude` starts a session.
- **AC8** Clicking "Quick Score PS" injects the trigger phrase into the running claude session
  (visible in the terminal). No `claude --print`, no headless spawn.
- **AC9** When the agent writes a score file, chokidar detects it and the dashboard refreshes
  within ~1s without manual reload.
- **AC10** If no claude session is running, a grade button prompts to start one (does not error
  silently).

## Separation / cutover
- **AC11** `.gitignore` excludes CONTENT_DIR and any personal score files; `git status` on a
  fresh content dir shows no personal `.md` staged.
- **AC12** Repo ships engine + templates only: `Agent/CLAUDE.md`, `Agent/rubrics/`, sample/empty
  content templates. A fresh clone runs `npm install && npm run dev` and opens to a working
  (empty-state) dashboard.
- **AC13** `Application Dashboard.md` and `demo.gif` removed; README reflects the app, not Obsidian.

## Out of scope (v1)
Embedded SDK agent, headless grading, hosting, School List filtering, Secondaries, packaged binary.
