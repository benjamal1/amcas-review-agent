---
phase: 03-editor
goal: CodeMirror markdown editor for drafts/notes with load/save + debounced autosave + file tree
depends_on: 01-app-foundation
ac_refs: [AC6]
parallel_with: 02-dashboard
---

# PLAN — Phase 03: Editor

In-browser markdown editing replaces Obsidian editing. CodeMirror 6. Can be built in parallel
with Phase 02 (both depend only on Phase 01's file API).

## Tasks

### T1 — File tree / open
- `src/components/FileTree.tsx`: list `.md` under CONTENT_DIR (from `GET /api/files`), grouped by
  top folder (Personal Statement, Activities, Impactful Experience, Rec Letters, School List,
  Meeting Notes, Transcript). Click → open.
- annotate: skill=react-patterns · model=sonnet
- verify: tree shows real vault files grouped; click loads into editor.

### T2 — CodeMirror editor + frontmatter-aware
- `src/components/Editor.tsx`: `codemirror@6` + `@codemirror/lang-markdown`, dark theme matching
  cockpit tokens. Load via `GET /api/file?path=`. Show YAML frontmatter folded/dimmed (it's
  agent-owned; user edits body). Word/char count (AMCAS limits: PS, 700-char activities,
  1325-char MM, IE) — show count + limit hint per file type.
- annotate: skill=ui-ux-pro-max · model=sonnet · depends_on=T1
- verify: opening Personal Statement Draft.md shows text + char count vs limit.
- ac: AC6

### T3 — Debounced autosave
- Debounce ~800ms after edit → `PUT /api/file`. Save indicator (saving/saved). Conflict guard:
  if file changed on disk (chokidar) while editing, warn before overwrite (agent may have written
  scores — but agent writes score FILES not drafts, so low risk; still guard).
- annotate: skill=react-patterns · model=sonnet · depends_on=T2
- verify: edit → wait → reopen shows saved text; indicator transitions.
- ac: AC6

### T4 — Char-limit + review
- AMCAS limit enforcement display (warn over limit, not block). `react-reviewer`.
- annotate: skill=gsd-code-review · model=sonnet · depends_on=T3
- verify: AC6 met; over-limit draft shows warning.

## Verification (phase exit)
Open a draft, edit, autosave to disk, reopen → persisted. Char counts reflect AMCAS limits.
