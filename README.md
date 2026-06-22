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

1. **Dashboard** — auto-populated from score file YAML frontmatter
2. **Editor** — click any file; edits autosave with AMCAS char-count hints
3. **Terminal** — type `claude` to start a session; **Grade Buttons** inject trigger phrases

When the agent writes score files, the dashboard refreshes automatically (~1s).

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

`Agent/CLAUDE.md` contains the scoring agent. Run it from the Terminal panel via `claude` or click a Grade Button.
