---
phase: 04-terminal
goal: Embedded xterm.js terminal over node-pty; grade buttons drive the visible session; chokidar auto-refresh
depends_on: [01-app-foundation, 02-dashboard]
ac_refs: [AC7, AC8, AC9, AC10]
---

# PLAN — Phase 04: Terminal + Grading (the differentiator)

Embedded terminal runs the user's own Claude Code. Grade buttons = **Level 2**: inject the
trigger phrase into the *visible* session. No headless, no `claude --print`. chokidar file-change
→ dashboard refresh. node-pty isolated so its native-build risk can't break the rest.

## Tasks

### T1 — PTY backend (isolated module)
- `server/pty.ts`: `@fastify/websocket` route `/pty`. On connect, `node-pty.spawn(shell, [], {cwd:
  CONTENT_DIR})`. Pipe pty→ws and ws→pty. Resize messages. ONE pty per ws; clean up on close.
- `.nvmrc` pin; document native rebuild. Feature-flag: if node-pty fails to load, route returns
  503 and UI shows "terminal unavailable" (graceful degrade — rest of app works).
- annotate: agent=tdd-guide · skill=backend-patterns · model=sonnet · depends_on(phase01)
- verify: ws echo — shell prompt appears; `ls` lists CONTENT_DIR.
- ac: AC7

### T2 — xterm.js panel
- `src/components/Terminal.tsx`: `@xterm/xterm@6` + fit addon, bound to `/pty` ws, dark cockpit
  theme + JetBrains Mono. Resize → send dims. Reconnect on drop.
- annotate: skill=react-patterns · model=sonnet · depends_on=T1
- verify: type in panel → shell responds; `claude` starts a session.
- ac: AC7

### T3 — Grade buttons (inject into visible session)
- `src/components/GradeButtons.tsx`: buttons for every agent command — Quick/Deep score PS ·
  Activities (+ per-entry) · Impactful Experience · Experiences · Competency Coverage · Assess
  Metrics · Extract Meeting To-dos · Review Transcript · (Rec letter review is explicit-ask, so a
  button that confirms first). Clicking sends the exact trigger phrase (from Agent/CLAUDE.md) +
  Enter into the pty.
- Guard (AC10): track session state from pty output; if no `claude` running, button prompts
  "Start the agent?" → types `claude` first, then the phrase.
- annotate: skill=ui-ux-pro-max · model=sonnet · depends_on=T2
- verify: click "Quick Score PS" → phrase appears in terminal, agent runs.
- ac: AC8, AC10

### T4 — chokidar auto-refresh
- `server/watch.ts`: chokidar on CONTENT_DIR (ignore `.git`, dotfiles). On change to a score file
  (`*-scores.md`, `scorecard.md`, `competency-coverage.md`, etc.) → ws broadcast → dashboard
  re-fetches affected source. Debounce ~300ms. No full reload, no layout shift (count-up only).
- annotate: skill=backend-patterns · model=sonnet · depends_on(phase02)
- verify: agent writes scorecard.md → dashboard tiles update within ~1s, no reload.
- ac: AC9

### T5 — End-to-end loop + review
- Manual E2E: edit PS → click Quick Score → watch agent score in terminal → dashboard refreshes.
- `gsd-code-review` + `security-review` (pty cwd sandbox, ws origin check — localhost only).
- annotate: skill=gsd-code-review · model=sonnet · depends_on=[T3,T4]
- verify: AC7–AC10 met; no CRITICAL/HIGH.

## Verification (phase exit)
Full loop works in one window: button → visible grading → file change → live dashboard update.
No `--print`, no headless. Terminal degrades gracefully if node-pty unavailable.
