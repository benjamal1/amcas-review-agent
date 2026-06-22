---
phase: 01-app-foundation
goal: Branch + Vite/React + Fastify scaffold with sandboxed file layer and CONTENT_DIR config; app shell with 3 empty panels
gates: [02-dashboard, 03-editor, 04-terminal, 05-cutover]
ac_refs: [AC1, AC2, AC3]
---

# PLAN — Phase 01: App Foundation

Foundation only: repo branch, scaffolding, the data/file layer (the backbone everything else
reads through), and an empty 3-panel shell. No charts/editor/terminal logic yet — those are
later phases that plug into this.

## Tasks

### T1 — Branch + scaffold
- `git checkout -b local-app-rebuild` in `~/projects/amcas-review-agent`.
- Scaffold Vite + React + TS in `app/` (or repo root `src/` + `server/`). Add `.nvmrc` (pin Node
  for node-pty later). Add `package.json` scripts: `dev` (vite + server concurrently), `build`,
  `start`.
- Keep `Agent/CLAUDE.md`, `Agent/rubrics/`, `.planning/`. Do NOT delete Obsidian files yet
  (Phase 05 cutover removes `Application Dashboard.md` + `demo.gif`).
- annotate: agent=haiku-coder · skill=vite-patterns · model=haiku · parallel=no (gates rest)
- verify: `npm run dev` starts; blank app loads at localhost.

### T2 — Fastify server + CONTENT_DIR
- `server/index.ts`: Fastify, bind `127.0.0.1`, `@fastify/static` for built UI.
- Config: read `CONTENT_DIR` from env, default `./content`. Log resolved abs path on boot.
- annotate: agent=haiku-coder · skill=backend-patterns · model=sonnet · depends_on=T1
- verify: server boots, `GET /api/health` 200, logs CONTENT_DIR.
- ac: AC1

### T3 — Sandboxed file API (security-critical)
- `server/files.ts`: `listMarkdown()`, `readFile(path)`, `writeFile(path, body)`. gray-matter
  parse on read; preserve frontmatter on write.
- **Path sandbox:** resolve against CONTENT_DIR, reject `..`/absolute-escape with 400. This is
  the one trust boundary — TDD it.
- Routes: `GET /api/files`, `GET /api/file?path=`, `PUT /api/file`.
- annotate: agent=tdd-guide · skill=tdd-workflow · model=sonnet · depends_on=T2
- verify (test): round-trip read/write preserves frontmatter; traversal (`../etc/passwd`,
  absolute path) → 400. `npm test` green.
- ac: AC2, AC3

### T4 — App shell (3 empty panels)
- React layout: Dashboard (top), Editor (left) | Terminal (bottom) — placeholders.
- A `useFiles` hook hitting the file API; a file-tree/list in a sidebar reading `GET /api/files`.
- Design bar: medadmit-grade polish — apply global web design-quality rules (hierarchy, real
  type pairing, intentional spacing; not a default template). Tokens in CSS custom props.
- annotate: agent=react-reviewer(after) · skill=ui-ux-pro-max · model=sonnet · depends_on=T2
- verify: app shows 3 panels + file list populated from CONTENT_DIR.

### T5 — Phase review + gate
- `gsd-code-review` + `security-review` (focus: path sandbox T3). Address CRITICAL/HIGH.
- annotate: skill=gsd-code-review · model=sonnet · depends_on=[T3,T4]
- verify: AC1–AC3 met; no CRITICAL/HIGH open.

## Verification (phase exit)
- `npm run dev` → 3-panel app, file list from CONTENT_DIR.
- `npm test` → file-layer + sandbox tests green.
- Manual: point `CONTENT_DIR` at the live vault folder, confirm the list shows the real `.md`.

## Notes
- Chart lib (Recharts vs Chart.js) decided in Phase 02, not here.
- node-pty deferred to Phase 04 (isolated module) so its native-build risk doesn't block
  foundation.
- annotations are manual frontmatter fallback (plan-orchestrate `/orchestrate` not assumed
  installed) — per pipeline Step 6 graceful-degrade.
