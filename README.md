# AMCAS Review Agent

Standalone local web app for AMCAS application review. One browser window replaces Obsidian + Claude terminal.

## Quick start

```bash
git clone <this-repo>
cd amcas-review-agent
npm install
npm run dev
```

Open **http://localhost:5173**. First run copies `content.example/` → `content/` (gitignored).

## Point at your existing vault

```bash
CONTENT_DIR=/path/to/obsidian/vault npm run dev
```

## Using it

1. **Dashboard** — auto-populated from `content/data.json`; metrics, rec letters, todos, coursework,
   and the school list are **editable inline** (writes back to `data.json`)
2. **Editor** — click any file; edits autosave with AMCAS char-count hints
3. **Terminal** — type `claude` to start a session; **Grade Buttons** inject trigger phrases

When the agent or a form writes `data.json`, the dashboard refreshes automatically (~1s).

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vite + React + TypeScript |
| Backend | Fastify 5 (file API, PTY WebSocket, file watcher) |
| Editor | CodeMirror 6 |
| Terminal | xterm.js + node-pty |
| Charts | Recharts |

## Data model

Plain markdown + YAML frontmatter in `CONTENT_DIR`. Obsidian is optional storage only — no Dataview required.

## Agent

The scoring agent is a **router** (`CLAUDE.md` at repo root) that dispatches to specialist
subagents in `.claude/agents/` (essay-scorer, activities-scorer, experiences-scorer,
competency-assessor, metrics-advisor, rec-letter-reviewer, meeting-todo-extractor, coursework-mapper).
The Terminal panel launches `claude` **from the repo root**, so the router + subagents auto-load; it
passes `CONTENT_DIR` so agents read/write `data.json`, `documents/`, and `feedback/`.

Rubrics live in `Agent/rubrics/` (shared `essay-base-rubric.md` + per-essay overlays); reference data
(AAMC tiers, MSAR/AMCAS PDFs) in `Agent/reference/`.

**Codex users:** Codex reads `AGENTS.md` (generated — router + subagent bodies inlined). After
editing `CLAUDE.md` or `.claude/agents/`, regenerate: `node Agent/build-agents-md.mjs`.

Data entry (GPA/MCAT, school pipeline, rec-letter status, todos, coursework) is done in the website,
not the terminal — the agent reads those records and focuses on scoring/coaching.
