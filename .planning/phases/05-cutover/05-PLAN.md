---
phase: 05-cutover
goal: Data separation (gitignore content, ship engine+templates), drop Obsidian artifacts, README + CLAUDE.md, parity verify, merge to main
depends_on: [02-dashboard, 03-editor, 04-terminal]
ac_refs: [AC11, AC12, AC13]
---

# PLAN — Phase 05: Separation + Cutover

Turn the working app into a clean shippable repo: engine + templates tracked, personal content
gitignored, Obsidian artifacts removed, docs updated, parity verified, branch merged.

## Tasks

### T1 — Content separation
- Decide repo layout: app code + `Agent/CLAUDE.md` + `Agent/rubrics/` tracked; `content/` is the
  default CONTENT_DIR and is **gitignored**. Provide `content.example/` with empty/template files:
  `scorecard.template.md` (zeroed frontmatter), empty draft stubs, one sample school note,
  `_template.md` rec letter, Meeting Notes/Transcript placeholders.
- `.gitignore`: `/content/`, any stray personal `*-scores.md`, `applicant-image.md`,
  `session-context-*.md`, `.agents/`, `node_modules`, build output.
- First-run: if `content/` absent, copy `content.example/` → `content/`.
- annotate: skill=backend-patterns · model=sonnet
- verify (AC11): fresh `content/` → `git status` shows no personal md staged.
- ac: AC11

### T2 — Drop Obsidian artifacts
- Remove `Application Dashboard.md`, `demo.gif`, `Usage Guide.md` (fold into README), and the
  Obsidian-specific `.obsidian`/Dataview assumptions. Keep files readable in Obsidian (still plain
  md) but nothing REQUIRES it.
- annotate: agent=haiku-coder · model=haiku · depends_on=T1
- verify (AC13): files gone; nothing references Dataview/DataviewJS.

### T3 — Docs: README + Agent/CLAUDE.md
- Rewrite README for the app: clone → `npm install` → `npm run dev` → open localhost; CONTENT_DIR
  config; "type `claude` in the terminal or click a grade button"; Obsidian now optional.
- Update `Agent/CLAUDE.md` folder-structure + dashboard references (no more Dataview; dashboard is
  the web app; the agent still just reads/writes the same md files). Keep all scoring logic intact.
- annotate: skill=writing-clearly-and-concisely · model=sonnet · depends_on=T2
- verify (AC12): a fresh clone runs and opens to a working empty-state dashboard.
- ac: AC12, AC13

### T4 — Parity verify vs old dashboard
- `gsd-verify-work` against AC1–AC13. Point CONTENT_DIR at the live vault folder; confirm every
  panel matches the Obsidian dashboard's data. Confirm grade-button loop. Confirm separation.
- annotate: skill=gsd-verify-work · model=sonnet · depends_on=T3
- verify: all AC met or exceptions documented.

### T5 — Merge + register
- Merge `local-app-rebuild` → `main` (history preserved). Push. Update vault status doc + memory.
- annotate: skill=git-workflow · model=sonnet · depends_on=T4
- verify: main builds + runs; PROJECTS.md/status doc reflect "local app shipped".

## Verification (phase exit)
Clean repo: engine+templates only, personal content gitignored, no Obsidian dependency, README
accurate, parity confirmed, merged to main. v1 done → ready to build new features (School List
interactivity, Secondaries) on the app.
