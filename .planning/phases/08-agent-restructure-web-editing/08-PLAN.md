---
phase: 08-agent-restructure-web-editing
goal: Thin-router CLAUDE.md + 8 subagents; all data entry in web; metrics.json refs; shared essay rubric.
ac_refs: [AC1..AC14]
plan_orchestrate: manual-fallback   # /orchestrate commands not assumed installed
model_policy: haiku for single-file mechanical, sonnet for content/react/orchestration, no opus
---

# PLAN — Phase 08: Agent Restructure + Web Editing

Spec: `.planning/specs/2026-06-27-agent-restructure-web-editing-design.md`.
Execution lane: ECC orch (`orch-add-feature` / `orch-refine-code`) per task; TDD where logic exists.

## Wave A — Rubric + reference (parallel, agent-side, no deps)

### T1 — Shared essay rubric (AC5, AC6)
- Create `Agent/rubrics/essay-base-rubric.md`: specificity, reflection depth, impact clarity,
  voice/authenticity (1–10, anchors). Lift anchors from current Impactful Experience section.
- Refactor `personal-statement-rubric.md` → reference base + overlay (why-medicine arc/coherence).
- New `impactful-experience-rubric.md` (overlay: relevance to medicine),
  `secondary-rubric.md` (overlay: prompt fit), `disadvantaged-rubric.md` (overlay: adversity framing).
- annotate: agent=haiku-coder · skill=orch-refine-code · model=sonnet (content judgment)

### T2 — metrics.json (AC7)
- Create `Agent/reference/metrics.json`: gpa_tiers, mcat_tiers, cars_floor (127), source, year=2026,
  empty `school_medians:{}`. Numbers from current CLAUDE.md tables (already AAMC-derived); cite the
  committed guide PDF as source. Spot-check 2–3 figures against `Agent/reference/amcas/`.
- annotate: agent=haiku-coder · model=haiku

## Wave B — Subagents + router (depends T1 names, T2 path)

### T3 — 8 subagent files (AC2)
- `.claude/agents/`: essay-scorer, activities-scorer, experiences-scorer, competency-assessor,
  metrics-advisor, rec-letter-reviewer, meeting-todo-extractor, coursework-mapper.
- Each: frontmatter (name, description, tools: Read/Edit/Write/Grep), self-contained body lifted
  from the matching CLAUDE.md section, rewritten to read `data.json` + write `data.json`/`feedback/`.
  Strip all `Agent/*.md`/`scorecard.md`/vault-folder refs (AC4). metrics-advisor reads metrics.json.
  essay-scorer takes an essay-type arg, loads base+overlay.
- annotate: agent=haiku-coder · skill=orch-add-feature · model=sonnet · depends_on=[T1,T2]

### T4 — Thin-router CLAUDE.md (AC1, AC4)
- Rewrite `Agent/CLAUDE.md` ≤~130 lines: identity, data model, feedback style, dispatch table
  (every GradeButtons trigger phrase → subagent), global "what you don't do". Note data entry is
  now web-owned. No mode bodies.
- annotate: agent=haiku-coder · skill=orch-refine-code · model=sonnet · depends_on=[T3]

### T5 — Generate AGENTS.md (AC3)
- `AGENTS.md` at repo root = router + all 8 subagent bodies inlined (Codex fallback). Header: "GENERATED
  — edit Agent/CLAUDE.md + .claude/agents/, then regenerate." Add a tiny `Agent/build-agents-md.mjs`
  concat script so regen is one command.
- annotate: agent=haiku-coder · model=haiku · depends_on=[T3,T4]

## Wave C — Server (parallel with A/B)

### T6 — PUT /api/data validation (AC12)
- In `server/files.ts` PUT `/api/data`: validate shape + ranges (GPA 0–4, MCAT 472–528, sections
  118–132) before atomic write; 400 on malformed. Keep tmp+rename.
- TDD: test rejects out-of-range, accepts valid.
- annotate: agent=haiku-coder · skill=tdd-workflow · model=sonnet · security_trigger=input-validation

### T7 — School endpoints (AC10, AC11)
- `POST /api/schools/lookup?name=` — read `msar-lookup.json` (content-dir root / MSAR_LOOKUP),
  fuzzy match (exact→partial, skip OCR artifacts per old rules), return one record or null.
- `POST /api/schools/requirements` (or client util) — keyword-match `course_requirements` vs
  `coursework[]`, return covered/missing.
- TDD: lookup (exact/partial/artifact-skip/miss); requirements matcher (science categories).
- annotate: agent=haiku-coder · skill=tdd-workflow · model=sonnet

## Wave D — Web (depends C + hook)

### T8 — useData() write hook (AC8)
- `app/src/hooks/useData.ts`: GET `/api/data`, `mutate(fn)` → PUT `/api/data`, subscribe `/watch`
  for refresh. One write path for all panels.
- annotate: agent=haiku-coder · skill=orch-add-feature · model=sonnet

### T9 — Inline-edit panels (AC9)
- Make editable + wire to `useData().mutate`: `MetricsTable` (hard_metrics), `RecLettersList`
  (rec_letters[] rows), `TodosTile` (todos add/check), coursework table (coursework[]; new small
  panel or in metrics view). Client-side range validation mirrors T6.
- annotate: agent=haiku-coder · skill=orch-add-feature · model=sonnet · depends_on=[T8,T6]

### T10 — School add/detail flow (AC10, AC11)
- Add-school form (name → `/api/schools/lookup` → pre-fill → append schools[]). School detail/edit:
  pipeline toggles (primary/secondary/interview/decision, CASPer/PREview, letters_sent, tier, notes)
  → entry. Requirements-check button → T7 → write courses_verified/courses_missing + show report.
- annotate: agent=haiku-coder · skill=orch-add-feature · model=sonnet · depends_on=[T8,T7]

## Wave E — Verify (AC13, AC14)

### T11 — Tests alongside impl
- T6/T7 ship with their vitest tests (TDD). Add a dispatch smoke check: each trigger phrase maps to
  the right subagent name (parse CLAUDE.md dispatch table vs GradeButtons COMMANDS).
- annotate: agent=haiku-coder · model=haiku

### T12 — Full verify
- `npx vitest run` green; `cd app && npm run build` exit 0; manual: edit each panel → reload persists;
  grade button → correct subagent dispatched. Run `gsd-verify-work` against AC brief.
- annotate: skill=gsd-verify-work · model=sonnet

## Dependency DAG
- A (T1, T2) ∥ C (T6, T7) — independent, start together.
- B: T3←[T1,T2]; T4←T3; T5←[T3,T4].
- D: T8 (after T6); T9←[T8,T6]; T10←[T8,T7].
- E: T11 with C/D; T12 last.

## Verification (phase exit)
All AC1–AC14 in 08-BRIEF.md met. Tests + build green. Grade buttons dispatch. Data entry round-trips
through the web with no terminal involvement.
