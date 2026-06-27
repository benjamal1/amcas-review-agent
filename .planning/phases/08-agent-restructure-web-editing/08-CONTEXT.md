---
phase: 08-agent-restructure-web-editing
type: feature
size: large
date: 2026-06-27
---

# Context — Agent Restructure + Web Editing

Full design (approved 2026-06-27):
`.planning/specs/2026-06-27-agent-restructure-web-editing-design.md`. Read it first — this file is
the phase-scoped summary.

## Goal
Split `Agent/CLAUDE.md` (618 lines) into a thin router + Claude Code subagents; move all pure
data-entry off the terminal into the web app; ground MCAT/GPA tiers in a reference data file;
consolidate the essay rubric.

## Decisions (owner, 2026-06-27)
- End-to-end (agent restructure + web forms + refs + rubric).
- Claude Code subagents; `CLAUDE.md` = router; `AGENTS.md` = flattened Codex fallback.
- MCAT refs → `Agent/reference/metrics.json` (cite source+year).
- Essay rubric: shared base file + per-essay files referencing it.
- Web forms for all four data-entry sets; MSAR lookup case-by-case from the school list (no bulk).
- UI: inline-edit existing panels + dedicated School add/detail flow.

## Discovered state (from exploration)
- Harness = Claude Code (`GradeButtons.tsx` injects trigger phrases into a `claude` session) →
  subagents viable. Trigger phrases MUST be preserved.
- Dashboard panels are 100% read-only. `PUT /api/data` exists; no UI calls it.
- Existing rubrics: activities, competencies, experiences, narrative-coherence, personal-statement.
- Reference PDFs already committed under `Agent/reference/` (Phase 07).

## Out of scope
Scoring rubric content changes (beyond consolidation), auth/multi-user, bulk MSAR import,
terminal/pty/editor internals.
