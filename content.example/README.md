# Content Directory

Copy this folder to `../content/` (gitignored) or set `CONTENT_DIR` to your existing vault folder.
The app seeds `content/` from this folder on first run.

## Layout

- **`data.json`** — all structured data the dashboard reads: `scorecard` (composite, domains,
  hard metrics), `competencies` (17 AAMC), `priorities`, `todos`, `component_scores`,
  `activity_entries`, `rec_letters`, `schools`.
- **`documents/`** — free-text the editor opens:
  - `personal-statement.md`, `impactful-experience.md`
  - `activities/` — one file per activity
  - `meeting-notes/`, `transcripts/` — reference text
- **`feedback/`** — prose coaching write-ups per component (created by the agent; rendered in the
  Grading Docs view).

The agent writes structured scores to `data.json` and prose to `feedback/`. It does not use the
old per-file `*-scores.md` layout.
