# Design — AMCAS Review Agent → standalone local web app

**Date:** 2026-06-21
**Status:** Approved (brainstorm)
**Supersedes:** Obsidian/Dataview as the working surface

## Problem

Today the tool is an Obsidian-vault folder driven by a Claude/Codex agent. Two pain points:

1. **Two trees by hand.** A live vault tree (personal data + dev artifacts) and a manually
   de-personalized public repo, kept in sync by hand. Error-prone; the strip is manual.
2. **Two apps + heavy deps.** Day-to-day use requires Obsidian (+ Dataview + DataviewJS
   enabled) for the dashboard AND a separate Claude Code terminal for grading. High setup
   friction for new users; app-switching for the owner.

The entire Obsidian dependency is **13 DataviewJS blocks** in `Application Dashboard.md`
reading YAML frontmatter. The data model (markdown + frontmatter + tables) and the agent's
read/write logic are already Obsidian-independent.

## Goal

A standalone **local** app: clone → `npm install` → `npm run dev` → open browser. One window
replaces Obsidian-for-editing + Obsidian-for-dashboard + the separate Claude terminal. Obsidian
becomes optional file storage only. Data model unchanged.

Local-only is intrinsic: the embedded terminal runs the *user's own* Claude Code, which only
makes sense on the user's machine — not a hosted server.

## Non-goals (parked)

- Embedded agent via Claude Agent SDK — rejected (extra token cost). Use the user's existing
  Claude Code via an embedded terminal instead.
- Fully-headless background grading (Level 3) — inherits n8n-claude-runner wedge-bug
  brittleness; revisit only if Level 2 still feels like friction.
- Hosting / multi-user — local-only by design.
- School List filtering, Secondaries section — existing backlog, unaffected by this migration.

## Architecture

One small **Node server (Fastify)** is the backbone — it serves the built UI, exposes file
I/O, and hosts the terminal websocket. Front-end is **Vite + React**.

```
┌─────────────────────── browser (localhost) ───────────────────────┐
│  Dashboard (Chart.js/Recharts)   │   Editor (CodeMirror 6)          │
│  score tiles · radar · tables    │   live markdown edit + autosave  │
├──────────────────────────────────┴──────────────────────────────── │
│  Terminal (xterm.js)  ── ws ──>  node-pty  (claude runs here)        │
│  Grading buttons type trigger phrases into THIS session             │
└─────────────────────────────────────────────────────────────────────┘
            │ REST file I/O            │ chokidar watch → push refresh
            ▼                          ▼
   Fastify server  ───────────  content dir (plain .md + frontmatter)
```

### Components (isolated units)

| Unit | Responsibility | Depends on |
|---|---|---|
| `server/index` | Fastify app, static serve, wire routes | fastify |
| `server/files` | read/write/list `.md` under content dir; frontmatter parse; **path-sandboxed** to content dir (reject traversal) | gray-matter |
| `server/pty` | spawn shell in content dir, stream over ws; inject text on demand (for buttons) | node-pty, ws |
| `server/watch` | chokidar on content dir → ws event → UI refresh | chokidar |
| `ui/Dashboard` | read score frontmatter via files API, render tiles + radar + tables | chart lib |
| `ui/Editor` | CodeMirror load/save, debounced autosave | codemirror |
| `ui/Terminal` | xterm.js bound to `/pty` ws | xterm |
| `ui/GradeButtons` | send trigger phrase to the pty session | — |

`node-pty` isolated in `server/pty` — it has a native-build wrinkle; isolating it lets the
terminal/buttons degrade gracefully (or be dropped) without touching the rest.

## UI direction — Dark cockpit (locked)

Clean, very visual, dark command-center. Trustworthy, data-forward — fits the embedded terminal.

- **Palette:** slate bg `#0F1419` · panel `#161B22` · raised `#1C232C` · hairline `#2A323C` ·
  text `#C9D1D9` · muted `#8B949E` · accent cyan `#36D6C3` · positive `#3FB950` · warn `#D29922` ·
  danger `#F85149`. One accent only (cyan) — semantic colors reserved for score/trend meaning.
- **Type:** Geist (or Inter) for UI; JetBrains Mono for terminal + numerals/scores. Big numeral
  for composite. Real scale contrast (composite huge, labels small-caps muted).
- **Depth:** layered panels (bg → panel → raised), soft 1px hairlines, subtle shadow on raised
  cards. No flat single-surface. Score tiles = raised cards with trend arrow + sparkline.
- **Data-viz first:** radar (domains), per-domain bars, 17-competency heatmap, score-history
  sparkline — treated as design, not afterthought (global design-quality rule).
- **Motion:** compositor-only (opacity/transform); score tiles count-up + arrow on refresh; no
  layout-shift on chokidar updates.
- **Anti-template:** not a default dark dashboard — hierarchy via scale, intentional rhythm,
  semantic color, designed hover/focus states. Tokens in CSS custom props.

## Data model — unchanged

Plain markdown + YAML frontmatter, exactly as today (`scorecard.md`, `*-scores.md`, essay
drafts, school notes). **Content dir is configurable** (env `CONTENT_DIR` / config) — point it
at any folder: a fresh `./content`, or the user's existing vault folder. This single knob:

- makes build-from-within work (point at real content locally), and
- solves data separation (below).

## Data flow — the loop

1. Edit essay in Editor → save → `.md` updated on disk.
2. Click **Quick Score PS** (or type it) → trigger phrase goes into the `claude` session in
   the terminal panel → agent reads rubric + draft, rewrites `*-scores.md` / `scorecard.md`.
3. chokidar sees the file change → pushes a refresh → Dashboard re-reads frontmatter → charts
   update. No done-file polling; the file change IS the signal.

Grading is **Level 2**: buttons drive the *visible* terminal session. No `claude --print`, no
headless background driving, no wedge-bug retry automation. If no `claude` session is running,
the button prompts to start one (or auto-launches one in the terminal panel).

## Data separation (folds in Phase 1)

The new repo ships the **engine** only:

- app code (`server/`, `ui/`)
- `Agent/CLAUDE.md` (agent instructions) + `Agent/rubrics/`
- template/example content (empty drafts, a sample school note, `scorecard.template.md`)

The user's **real content** lives in `CONTENT_DIR`, which is gitignored (or entirely outside
the repo). Consequences:

- No two divergent trees, no manual de-personalization.
- No repo-in-vault nesting.
- `git push` only ever sees engine + templates.

## Security / boundaries

- File API path-sandboxed to `CONTENT_DIR` — reject `..` traversal, absolute escapes.
- Server binds `127.0.0.1` only (local).
- Terminal spawns the user's shell with their own Claude — same trust as their machine; no new
  remote attack surface because nothing is exposed off-localhost.
- `.gitignore` must cover the content dir and any score files living inside the repo tree.

## Testing

- `server/files`: unit — read/write round-trip, frontmatter parse, traversal rejection (the
  one security-critical path → must have a test).
- `server/pty` + buttons: smoke — inject a phrase, assert it reaches the pty stream.
- `ui/Dashboard`: unit — given known frontmatter, renders correct tile values + radar data.
- Manual E2E: edit → grade button → file change → dashboard refresh.

## Migration / rollout

1. Stand up the app skeleton (server + 3 panels) reading the existing markdown data model.
2. Port the 13 DataviewJS panels → Dashboard components (same data source).
3. Wire grade buttons → pty.
4. Point `CONTENT_DIR` at the live vault folder, verify parity with the Obsidian dashboard.
5. Cut over; Obsidian becomes optional. **`Application Dashboard.md` is dropped** — the
   dashboard now lives entirely in the website.

## Resolved decisions

- **Same repo, new branch** — build in the existing `amcas-review-agent` repo to preserve its
  git history + public GitHub remote. Branch `local-app-rebuild`; the Obsidian→app pivot is a
  commit on that branch, merged to `main` when ready. (Rejected: new repo / new-folder-then-merge
  — they'd discard the history the user explicitly wants to keep.)
- **Drop `Application Dashboard.md`** (+ `demo.gif`) — dashboard rendered in the web app only.
- **Keep** `Agent/CLAUDE.md` + `Agent/rubrics/` (the engine) in the repo.

## Open questions for plan stage

- Chart lib: Chart.js (matches existing radar) vs Recharts (React-native). Decide at build.
- Packaging for non-dev users later (e.g. a single `npx`/binary) — out of scope for v1.
