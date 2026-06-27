# Secondaries Section — Design Spec

**Date:** 2026-06-27 · **Branch:** `secondaries-first-research-guidance` · **Status:** design (pre-build)

Builds the Secondaries half of the app: prewriting (brainstorm + essay bank), per-school
secondary tracking/editing/grading, and a per-school **regrade** model that folds each school's
secondaries into a school-specific composite. Restores a primary-only grading view and adds a
top-level roll-up Overview.

---

## 1. Research basis (why this shape)

Premed-advisor consensus (Shemmassian, GradPilot, ProspectiveDoctor, MedSchoolCoach, Motivate MD):

- **~7 pre-writable archetypes** cover most prompts. "Why Us" is the exception — only a personal
  anchor + per-school research is pre-writable; it lives school-side, not in the bank.
- **Workflow:** brainstorm raw material → write 400–600w master drafts (the "essay bank") → on
  arrival, map prompt → master → adapt (never paste) → **2-week turnaround** (already encoded as the
  tracker's received+14 default).
- **Per-school tracking:** received date, # prompts, prompt topics, word limits, which master maps,
  per-essay status, submit date, fee, notes. Prior-year prompts strongly predict current ones.

### Archetype seed list (essay bank — addable)
| Archetype | Length | Pre-writable? |
|---|---|---|
| Adversity / Challenge / Failure | 300–500w | yes |
| Leadership | 300–500w | yes |
| Diversity / Contribution | 300–500w | yes |
| Community Service | 300–500w | yes |
| Research | 300–500w | yes |
| Additional Info / "Anything else" | 250–500w | yes |
| **Why Us** | 250–500w | anchor + per-school only |

Addable extras offered in UI: Gap year / "what have you been doing", Greatest accomplishment,
Teamwork/conflict, Meaningful clinical / why-medicine, Career goals/specialty, Underserved/rural,
Ethical dilemma, Anti-racism, COVID-impact.

### Resource links to surface (Research subpage)
ProspectiveDoctor prompt database, Shemmassian 2025–26 list, Med School Insiders database,
MedicalSchoolHQ essay library, SDN school-specific threads / "Secondary Essay Bank 2018–2023",
admit.org full list.

---

## 2. Current state (grounding)

- `Sidebar.tsx`: nav groups General / Primaries / **Secondaries** (1 placeholder item).
- `/` Overview and `/grading` Grading both render the **same** `Dashboard` (read-only vs editable)
  off the single primary `scorecard` in `data.json`.
- `ApplicationTrackerPage` already tracks per-school secondary dates (received/deadline/target/
  submitted, +14 auto-deadline), CASPer/PREview, status history.
- `essay-scorer` agent already scores a `secondary` essay vs `Agent/rubrics/secondary-rubric.md`,
  but the per-school structure it would write to doesn't exist yet.
- Editor `FileTree` auto-groups by folder → a `documents/secondaries/<school>/` folder renders free.
- **Gaps:** no essay bank, no brainstorming, no per-school secondary detail, no regrade, no
  secondaries grading overview, no primary-only-scoped grading view.

---

## 3. Information architecture

```
General
├── Overview (/)              ← TOP-LEVEL ROLL-UP: primary composite + secondaries average + tracking
├── Application Tracker        ← + new secondaries-progress summary tile (links to Secondaries Overview)
├── Applicant Image
└── Knowledge

Primaries
├── Grading (/grading)        ← PRIMARY-ONLY composite (restore primary-scoped view)
├── Score History · Review · Rubrics · Coursework · Editor   (unchanged)

Secondaries
├── Overview (/secondaries)            ← progress dashboard + grading overview (avg of regrades)
├── Prewriting
│   ├── Brainstorming (/secondaries/brainstorm)   ← story/experience inventory (raw material)
│   └── Essay Bank   (/secondaries/bank)          ← master archetype drafts + status
└── Schools
    └── /secondaries/:school            ← per-school detail, 3 subpages:
        ├── Research  (/secondaries/:school/research)   ← why-us notes, prompts, word limits, links
        ├── Editor    (/secondaries/:school/editor)     ← this school's secondary essays
        └── Grading   (/secondaries/:school/grading)    ← REGRADE: full recompute w/ secondaries
```

**Routing:** routed detail pages (not nav-per-school, not inline expand). Schools come from the
existing `schools[]` list (web-owned). The Secondaries Overview lists schools → links to each detail.

---

## 4. Grading model

### Primaries → Grading
Scoped to **primary essays only**. This is today's `Dashboard` on the primary `scorecard`. No
secondary evidence touches it. (Restores the explicit primary-only view the user removed.)

### Per-school regrade (Secondaries → :school → Grading)
**Full recompute, secondaries as added evidence.** Start from the primary baseline (all domains,
competencies, activities, metrics), then re-run scoring with the primary application **plus this
school's secondary essays** as combined evidence. Every domain is open to revision. Same composite
formula as the router. Output = a **school-specific scorecard** stored on that school's entry.

> New agent job. The existing `essay-scorer` scores a single secondary essay; the regrade is a
> whole-application recompute per school. Add a `secondary-regrader` agent (or a router "regrade
> <school>" flow) that: reads primary `scorecard` + the school's secondary docs → recomputes domains/
> competencies/composite → writes `schools[i].secondary.scorecard`. De-personalized, coaching prose
> to `feedback/secondary-<school>.md`.

### Secondaries → Overview (grading)
**Average of all per-school regrade composites** (and domain averages) across schools that have been
regraded. Schools not yet regraded are excluded from the denominator (mirror the tracker's N/A logic).

### Global Overview (/)
Top-level roll-up: primary composite tile + secondaries-average tile + tracking progress, each
linking into its section. Read-only at-a-glance.

---

## 5. Data model (`data.json` / `types.ts`)

Keep the existing primary `scorecard` as the **primary-only** composite. Add:

```ts
// Essay bank — master archetype drafts
interface BankEssay {
  archetype: string            // "adversity" | "leadership" | … | custom
  label: string                // display name
  doc_path: string             // content/documents/secondaries/_bank/<archetype>.md
  status: ComponentStatus      // reuse existing status enum
  pre_writable?: boolean       // false for "why us"
}

// Per-school secondary block (hangs off SchoolEntry)
interface SecondaryEssay {
  prompt: string
  word_limit?: number
  maps_to?: string             // archetype key from the bank
  doc_path?: string            // content/documents/secondaries/<school-slug>/<n>.md
  status: ComponentStatus
}
interface SchoolSecondary {
  research_notes_path?: string // content/documents/secondaries/<school-slug>/_research.md
  prompt_source_year?: string  // e.g. "2025-2026 (prior-year)"
  essays: SecondaryEssay[]
  scorecard?: Scorecard        // the regrade output (reuse Scorecard shape)
  last_regraded?: string
}

// additions:
interface SchoolEntry { /* … */ secondary?: SchoolSecondary }
interface AppData {
  /* … */
  secondaries?: {
    brainstorm_path?: string   // content/documents/secondaries/_brainstorm.md
    essay_bank: BankEssay[]
  }
}
```

- **Secondaries grading overview** = computed (average across `schools[].secondary.scorecard`), not
  stored — derive at render, like the tracker's `pct`.
- **Files:** master drafts in `content/documents/secondaries/_bank/`, brainstorming in
  `_brainstorm.md`, per-school essays + research in `content/documents/secondaries/<school-slug>/`.
  Editor + `essay-scorer` pick these up via the existing `FileTree` grouping.

---

## 6. Pages to build

| Page | Route | Notes |
|---|---|---|
| Secondaries Overview | `/secondaries` | progress (per-school essay status, overdue, due-soon) + grading-avg tiles; school list → detail links |
| Brainstorming | `/secondaries/brainstorm` | single markdown doc editor (story inventory) |
| Essay Bank | `/secondaries/bank` | list of archetype drafts (seed 7 + add custom), status, open in editor |
| School detail (tabbed) | `/secondaries/:school` | tabs/subroutes: Research · Editor · Grading |
| → Research | `/secondaries/:school/research` | why-us notes doc, prompts table (prompt/word-limit/maps-to), resource links |
| → Editor | `/secondaries/:school/editor` | reuse `Editor` scoped to this school's folder |
| → Grading | `/secondaries/:school/grading` | reuse `Dashboard` on `secondary.scorecard`; "Regrade" action |
| Restore Primaries grading scope | `/grading` | ensure composite reflects primary-only (it already does — verify, label clearly) |
| Global Overview roll-up | `/` | add secondaries-average tile + section links |

Reuse: `Dashboard` (parametrize which scorecard it reads), `Editor`/`FileTree`, tracker overdue
logic, status enum/pills.

---

## 7. Agent / router changes

- Add `secondary-regrader` agent (full per-school recompute) **or** a router "regrade `<school>`"
  flow. Reads primary scorecard + school secondary docs → writes `schools[i].secondary.scorecard` +
  `feedback/secondary-<school>.md`. De-personalized, coaching-first, no rewrites.
- `essay-scorer` secondary path: point its "tracked on schools[] entry" target at
  `schools[i].secondary.essays[]` once the structure exists.
- Update `CLAUDE.md` dispatch table + composite notes for the secondaries grading overview (average)
  vs primary composite (primary-only).

---

## 8. Build phases (proposed)

1. **Data model + types** — `secondaries` block, `SchoolSecondary`, file conventions. No UI.
2. **Nav + routing** — Secondaries group items, `/secondaries/*` routes, school detail shell w/ tabs.
3. **Prewriting** — Brainstorming doc page + Essay Bank (seed archetypes, addable, editor hookup).
4. **Per-school Research + Editor** — research notes/prompts UI; editor scoped to school folder.
5. **Grading** — parametrize `Dashboard` for a passed-in scorecard; per-school Grading page +
   Secondaries Overview average; restore explicit Primaries-only grading; global Overview roll-up.
6. **Agent** — `secondary-regrader` + router/CLAUDE.md updates; wire `essay-scorer` secondary target.

---

## 9. Open questions / assumptions

- **A:** School slug = kebab-cased `school.name`; collisions unlikely (names unique in tracker).
- **A:** Regrade is on-demand (button), not auto on every secondary edit.
- **A:** Secondaries overview average excludes un-regraded schools from the denominator.
- **Q (later):** Do per-school regrades feed `score_history` per school, or only latest? (defer)
```
