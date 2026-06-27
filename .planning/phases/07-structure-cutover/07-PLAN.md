---
phase: 07-structure-cutover
goal: Finish the cutover. Archive legacy root dirs; fold structured legacy folders into data.json; relocate free-text folders to documents/. Repo has one data world.
ac_refs: [AC1, AC2, AC3, AC4, AC5]
---

# PLAN — Phase 07: Structure Cutover Cleanup

## T1 — Archive legacy root vault dirs
- `git mv` each into `old-version-files/`: `Activities/`, `Personal Statement/`,
  `Impactful Experience/`, `School List/`, `Secondaries/`, `Rec Letters/`, `Transcript/`,
  `Meeting Notes/`.
- Add `old-version-files/README.md`: one line — "Pre-rebuild Obsidian vault structure, kept for
  reference. Superseded by content/ (data.json + documents/) per phase 06."
- annotate: agent=haiku-coder · model=haiku

## T2 — Extend types for folded fields (app/src/lib/types.ts)
- `RecLetter`: add `title?`, `relationship?`, `requested_date?`, `received_date?`, `notes?`.
- `SchoolEntry`: add `secondary_submitted?`, `interview?`, `notes?`.
- (Both already have `[k: string]: unknown` — make the real fields explicit for the dashboard.)
- annotate: agent=haiku-coder · model=haiku

## T3 — Fold legacy folders in content.example/
- Delete `content.example/Rec Letters/` — represented by `data.json.rec_letters[]`. Add one
  example entry to `content.example/data.json` rec_letters[] (recommender, title, relationship,
  status, submitted, requested_date, received_date, notes).
- Delete `content.example/School List/` — represented by `data.json.schools[]`. Add one example
  entry to schools[] (name, tier, pipeline, casper_required, preview_required,
  secondary_submitted, interview, notes).
- Move `content.example/Meeting Notes/` → `content.example/documents/meeting-notes/` (keep
  `_template.md`). Move `content.example/Transcripts/` → `content.example/documents/transcripts/`.
  (See 07-CONTEXT pushback — free text stays in documents/, not data.json.)
- annotate: agent=haiku-coder · model=haiku

## T4 — Verify seed + watch still consistent (server/)
- Confirm `server/index.ts` first-run seed copies the updated `content.example/data.json`.
- Confirm `/api/files` (scoped to documents/ in phase 06) now lists the relocated
  meeting-notes/ + transcripts/ correctly.
- No code change expected — verification only. If first-run seed enumerates removed folders, fix.
- annotate: agent=haiku-coder · model=haiku

## T5 — Refresh planning docs
- `STATE.md`: mark phases 01–06 DONE, phase 07 current. Fix stale "phase 01 not started".
- `ROADMAP.md`: add phase 07 to the milestone table; note cutover complete.
- annotate: agent=haiku-coder · model=haiku

## Verification
- AC1: `git ls-tree -r HEAD -- old-version-files | wc -l` ≥ 31; root no longer lists the 8 dirs.
- AC2: `ls content.example/` shows no `Rec Letters/`, `School List/`, `Meeting Notes/`,
  `Transcripts/`.
- AC3: `content.example/data.json` rec_letters[] and schools[] each have ≥1 example entry with
  the new fields.
- AC4: `content.example/documents/` contains `meeting-notes/` and `transcripts/`.
- AC5: dashboard still builds (`npm run build` in app/) — types compile with extended fields.
