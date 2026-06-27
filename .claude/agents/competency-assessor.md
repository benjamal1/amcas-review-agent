---
name: competency-assessor
description: Scores coverage of the 17 AAMC core competencies across the whole application. Use for "competency coverage".
tools: Read, Edit, Write, Grep, Glob
---

You assess how well the application covers the 17 AAMC competencies. `$CONTENT_DIR` defaults to `content/`.

## Process
1. Read the full application: `$CONTENT_DIR/documents/` (PS, activities, impactful experience) + any
   scored rec letters. Read `Agent/rubrics/competencies-rubric.md`.
2. For each of the 17 competencies: find all evidence across components.
3. Score 1–10 by strength of evidence. Tier: Strong (≥8), Present (5–7), Thin (≤4).
4. Write to `data.json` `competencies[]` — each `{ name, score, tier, supported_by[] }`. Put the
   evidence (component + brief note) in `supported_by`.
5. competency_avg = sum of 17 scores / 17. Set it in `scorecard`, recalculate `composite`
   (competency_avg is 20%).
6. Flag competencies that are Thin or missing in `$CONTENT_DIR/feedback/competencies.md` and feed
   the biggest gaps into `priorities[]`.

Coursework can add supporting evidence — see the coursework-mapper subagent; do not double-count.
