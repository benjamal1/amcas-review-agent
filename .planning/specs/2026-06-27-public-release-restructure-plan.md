# Public-Release Restructure Plan

**Date:** 2026-06-27
**Goal:** Turn this mixed dev/app/reference folder into a clean, public-ready OSS repo —
app only, no personal data, no dev noise, no CLAUDE.md conflicts. Private planning &
old-version reference material moves out of the repo (not deleted).

> **Nothing is executed yet.** This is for review. Approve, edit, or veto each section.

---

## 0. Key findings (from audit)

- ✅ **No real personal data tracked.** `*-scores.md` say `last_scored: "example"`; school
  files have empty frontmatter. **No git-history scrub required.**
- ⚠️ **No `LICENSE`** — must add before public use.
- ⚠️ **Duplicate/old example trees.** Top-level `content.example/` is a hybrid (new
  `documents/` + leftover old `Meeting Notes/`, `Rec Letters/`, `School List/`, `Transcripts/`).
  `content/content.example/` is untracked local cruft (under gitignored `/content/`).
- ⚠️ **`Agent/` mixes source + runtime output.** Source = `CLAUDE.md`, `rubrics/`.
  Likely generated = `experiences-scores.md`, `red-flags.md`, `competency-coverage.md`,
  `improvement-priorities.md`, `meeting-todos.md`, `scorecard.md`.

---

## 1. Target public repo layout

```
amcas-review-agent/                  ← public OSS repo = the APP only
├── LICENSE                          ← NEW (choice below)
├── README.md                        ← keep, light edits
├── CLAUDE.md                        ← NEW: lean CONTRIBUTOR guide (build/test/arch)
├── package.json  package-lock.json  tsconfig*  vite/*  .nvmrc
├── app/                             ← frontend
├── server/                          ← backend (pty/files/watch)
├── Agent/
│   ├── AGENT.md                     ← renamed from Agent/CLAUDE.md (runtime prompt; ships)
│   └── rubrics/                     ← scoring rubrics (source)
├── content.example/                 ← ONE clean seed template (new documents/ layout)
└── .gitignore                       ← extended
```

Everything else leaves the repo (see §3).

## 2. CLAUDE.md model (resolves the conflict worry)

Per Anthropic's memory docs, CLAUDE.md files **concatenate root→leaf** when Claude launches
in a subdir — they don't override. So:

- **Root `CLAUDE.md`** = contributor scope only (how to build/run/test, architecture). Public.
- **`Agent/AGENT.md`** = the scoring agent's *runtime* prompt. Renamed from `Agent/CLAUDE.md`
  so nobody mistakes it for dev config, and so it doesn't auto-inject when developing the app.
- **Your personal dev-workflow notes** = NOT in this repo (they live in the private workspace,
  §3), so they can never conflict or leak.

## 3. What leaves the repo (move to private workspace — NOT deleted)

Destination options in §6. These are `git rm` from the public repo; copies preserved in the
private location first.

| Path | Reason |
|------|--------|
| `Activities/`, `Impactful Experience/`, `Personal Statement/`, `Rec Letters/`, `School List/`, `Transcript/`, `Meeting Notes/`, `Secondaries/` | old-version stub dirs; superseded by `content.example/` |
| `.planning/` | internal phase planning — not product (keep a curated design doc in `/docs` if desired) |
| `content/` (local, gitignored) incl. `content/content.example/` | your real data + local cruft; stays local only |
| `Agent/experiences-scores.md`, `red-flags.md`, `competency-coverage.md`, `improvement-priorities.md`, `meeting-todos.md`, `scorecard.md` | runtime outputs, not source — gitignore + untrack (confirm in §6) |

## 4. Exact git operations (after backups in §6)

```bash
# 4a. remove old-version stub dirs from the repo
git rm -r "Activities" "Impactful Experience" "Personal Statement" "Rec Letters" \
         "School List" "Transcript" "Meeting Notes" "Secondaries"

# 4b. untrack Agent runtime outputs (keep on disk)
git rm --cached "Agent/experiences-scores.md" "Agent/red-flags.md" \
                "Agent/competency-coverage.md" "Agent/improvement-priorities.md" \
                "Agent/meeting-todos.md" "Agent/scorecard.md"

# 4c. rename runtime prompt
git mv "Agent/CLAUDE.md" "Agent/AGENT.md"

# 4d. remove internal planning from public repo (kept in private workspace)
git rm -r ".planning"

# 4e. delete local example cruft (untracked, no git op)
rm -rf "content/content.example"
```

Then: clean `content.example/` to a single coherent template, add `LICENSE`, write root
`CLAUDE.md`, extend `.gitignore`, update `README.md` references.

## 5. .gitignore additions

```gitignore
# Agent runtime outputs (generated, not source)
Agent/experiences-scores.md
Agent/red-flags.md
Agent/competency-coverage.md
Agent/improvement-priorities.md
Agent/meeting-todos.md
Agent/scorecard.md

# Internal planning / private workspace
/.planning/
```

## 6. Decisions needed from you

1. **LICENSE:** MIT (simplest, permissive) vs Apache-2.0 (permissive + patent grant) vs other?
2. **Private workspace destination** for the material in §3 — pick one:
   - (a) a separate **private git repo** (`amcas-review-agent-private`),
   - (b) **untracked local folder** next to the repo (no second git repo),
   - (c) into the **Obsidian vault** (the old dirs are vault-style already).
3. **`.planning/`** — strip entirely from public (recommended), or keep a curated
   `docs/DESIGN.md` distilled from the migration spec?
4. **Agent output files** — confirm `experiences-scores.md`, `red-flags.md`,
   `competency-coverage.md`, `improvement-priorities.md`, `meeting-todos.md`, `scorecard.md`
   are runtime-generated (untrack) vs hand-authored source (keep).
5. **Repo name** — keep `amcas-review-agent` for the public app (recommended), since the
   private material is now *separate notes*, not a parallel copy of the project.

## 7. Out of scope of git (runtime)

- **Terminal opens app/content only:** already true — `server/pty.ts` spawns the shell with
  `cwd: CONTENT_DIR` (`server/index.ts:13`, default `./content`). No restructure needed; just
  confirm `CONTENT_DIR` points inside the app for the published build.
