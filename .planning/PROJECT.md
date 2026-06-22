# PROJECT — amcas-review-agent

## What it is
A self-contained, markdown-driven AI agent that lives inside an Obsidian vault folder and
reviews every component of an AMCAS medical-school application. Runs under Claude Code or
Codex. No build, no server, no external services — the "runtime" is the agent reading
`Agent/CLAUDE.md` + the rubrics in `Agent/rubrics/` and reading/writing score files.

Product persona + all operating logic: `Agent/CLAUDE.md` (the applicant-facing agent).
This `.planning/` tree is **operator/dev context only** — it does NOT load into product
sessions (no root CLAUDE.md, by design — running the agent = `cd` into repo root, so a root
CLAUDE.md would pollute the applicant-facing persona).

## Goal / status
No committed end goal. Shipped and working for the original 2026 cycle; now in
**document + maintain** mode. Stated intent (README): generalize + polish for broader use,
"someday." Treat new build-out as opt-in, not scheduled.

## Stakeholders
- Owner/operator: benjamal1 (also the original applicant)
- Future users: pre-med applicants without paid advising (per README mission)

## Constraints
- Must stay self-contained inside the vault folder; no external folder dependencies.
- Agent must NOT rewrite application content unless explicitly asked (coaching mode).
- Personal application data is stripped from the public repo.
- School List Python scripts (`extract_msar.py`, `import_csv.py`) run on Mac only — the
  agent never runs them.
- Dashboard auto-updates via Obsidian Dataview/DataviewJS — agent does not hand-edit it
  (exception: the radar-chart data block).

## Related
- Vault registry: `System/architecture/PROJECTS.md` (row: amcas-review-agent)
- Status doc: `System/architecture/projects/amcas-review-agent.md`
- Drives the `medschool-tracker` vault tree.
