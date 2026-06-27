---
phase: 07-structure-cutover
type: refactor
size: small
date: 2026-06-27
---

# Context — Structure Cutover Cleanup

## Problem
Repo is mid-cutover. The local-app rebuild (phases 01–05) + data-model refactor (phase 06,
`data.json` + `documents/`) shipped, but the old Obsidian world was never removed:

1. **8 legacy vault dirs still tracked at repo root** (~31 files): `Activities/`,
   `Personal Statement/`, `Impactful Experience/`, `School List/` (20 files), `Secondaries/`,
   `Rec Letters/`, `Transcript/`, `Meeting Notes/`. The app reads `content/data.json` +
   `documents/` now, so these are dead weight at root — two parallel data worlds.
2. **`content.example/` is internally inconsistent**: it has the new `data.json` + `documents/`
   AND leftover legacy-style template folders (`Meeting Notes/`, `Rec Letters/`,
   `School List/`, `Transcripts/`) that don't fit the new model.

## Decisions (owner, 2026-06-27)
- **Legacy root dirs → archive, not delete.** Move all 8 into `old-version-files/`
  (`git mv`, history preserved). Not deleted — kept for reference.
- **content.example legacy folders → fold into `data.json`.** Single source of truth.

## Fold mapping
| Legacy folder | Maps to | Notes |
|---|---|---|
| `Rec Letters/_template.md` | `data.json.rec_letters[]` | Schema already has `rec_letters`. Extend `RecLetter` type with the template's extra fields. |
| `School List/Schools/_template.md` | `data.json.schools[]` | Schema already has `schools`. Extend `SchoolEntry` with `secondary_submitted`, `interview`, `notes`. |
| `Meeting Notes/_template.md` | **→ `documents/` (recommended)** | Free text, not scored, not in schema. See pushback. |
| `Transcripts/_template.md` | **→ `documents/` (recommended)** | Raw transcript prose. See pushback. |

## Pushback — Meeting Notes & Transcripts
Owner chose "fold into data.json" for all four. Folding **Rec Letters + School List** is
clean — they're structured records and already in the schema. But **Meeting Notes and
Transcripts are free-text prose**, not in the `AppData` schema, and never scored. Stuffing raw
prose into `data.json` makes the file unwieldy, kills the editor's per-file editing, and adds
schema fields nothing reads yet (YAGNI).

Recommendation: put them under `content.example/documents/` (e.g. `documents/meeting-notes/`,
`documents/transcripts/`) as editor-openable markdown. data.json stays structured-only. If the
dashboard later needs to *list* them, add a thin `documents[]` index then — not now.

This is a one-call deviation from the literal answer; T3 implements the recommendation. Flip to
data.json arrays only if the dashboard must surface them.

## Scope
- **In:** archive root dirs; fold Rec Letters + School List into data.json + types; relocate
  Meeting Notes + Transcripts to documents/; refresh content.example seed; update STATE/ROADMAP.
- **Out:** dashboard components (read same types — no UI change), Agent/CLAUDE.md scoring logic,
  server endpoints (already scoped to documents/ in phase 06).
