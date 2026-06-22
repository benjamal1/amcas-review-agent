---
phase: 06-data-model-refactor
type: refactor
size: standard
date: 2026-06-22
---

# Context — Data Model Refactor

## Problem
Current data model mirrors the Obsidian/Dataview vault: 8 separate markdown files with YAML
frontmatter (`scorecard.md`, `competency-coverage.md`, `activities-scores.md`, etc.). This was the
right shape for Dataview but is the wrong shape for a web app.

## Goal
Single `data.json` holds all structured data. `documents/` holds essay text files. Dashboard reads
`data.json`. Editor opens files from `documents/`.

## Scope
- **In:** server /api/data endpoint, scores.ts reader, types.ts schema, watch.ts, content.example/
- **Out:** Agent/CLAUDE.md scoring logic (behavior unchanged, just output format changes)
- **Out:** Dashboard components, Editor components (read same TypeScript types, no changes)

## Data model decision
```
content/
├── data.json          ← ALL structured data (agent writes, dashboard reads)
└── documents/
    ├── personal-statement.md
    ├── impactful-experience.md
    └── activities/
        └── <activity-name>.md
```

## data.json schema (locked)
```json
{
  "scorecard": { "composite": 0, "red_flag_count": 0, "domains": {...}, "hard_metrics": {...} },
  "competencies": [{ "name": "", "score": null, "tier": "", "supported_by": [] }],
  "priorities": [],
  "todos": { "open": [""], "done": [""] },
  "component_scores": {
    "personal_statement": { "score": null, "last_scored": "" },
    "activities": { "score": null, "last_scored": "" },
    "impactful_experience": { "score": null, "last_scored": "" }
  },
  "activity_entries": [{ "name": "", "description_quality": null, "most_meaningful_depth": null }],
  "rec_letters": [{ "recommender": "", "status": "", "submitted": false }],
  "schools": [{ "name": "", "tier": "", "pipeline": "", "casper_required": false, "preview_required": false }]
}
```
