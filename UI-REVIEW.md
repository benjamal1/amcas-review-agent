# UI Audit — AMCAS Review Agent

Audited: 2026-06-29 · Viewport: 1440×900 (full page) + 1440×560 (sidebar-open case)
Theme: dark "cockpit" · Design tokens: `app/src/index.css :root --color-*`

Scoring per pillar: 1 (broken) → 4 (excellent)

---

## Summary of fixes shipped

| Fix | File | Severity |
|-----|------|----------|
| `min-width: 0` on `.sec-bank__name` to fix category label clip without ellipsis on Prewriting page | `app/src/index.css` line 490 | MED |

---

## Pages

### 1. Overview (`/#/`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | 3-panel grid (sidebar / primary scorecard / secondaries) is clear. Composite score dominates correctly. |
| Spacing / rhythm | 4 | Consistent gap between score tiles; bottom status bar has good breathing room. |
| Color / contrast | 4 | Score numerals colored by domain (teal accent, green for ↑). Sidebar muted text contrasts well on dark bg. |
| Typography | 3 | Score numbers large and readable. Date labels `2026-06-04` in muted gray — readable but very small (10–11px equivalent). |
| Interaction states | 3 | Active nav item has left-border highlight; arrow "→" links visible. No obvious hover state shown in static pass. |
| Overflow / responsiveness | 4 | No overflow. 560px height renders fine (content scrollable). |

**Recommendations:**
- LOW: Bottom status bar `9/9 primary components ready · 0/106 secondary essays ready · 24 schools` uses inline text; consider pill/badge treatment to add visual separation.

---

### 2. Application Tracker (`/#/tracker`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | Collapsible sections (Primary / Secondaries / Schools) work well; progress bar at top is effective. |
| Spacing / rhythm | 4 | Row heights consistent; section headers spaced correctly. |
| Color / contrast | 4 | "Submitted" badges in dark dropdown look good. GPA/MCAT cells with green border stand out as live inputs. |
| Typography | 3 | Column headers (`SCHOOL`, `TIER`, etc.) in small-caps; readable. Dates `2026-06-27` render cleanly. |
| Interaction states | 3 | Dropdown selects clearly styled; date inputs show `mm/dd/yyyy` placeholder. |
| Overflow / responsiveness | 3 | Rightmost column ("SEC. SUBM…") clips at 1440px. The container has `overflow-x: auto` so users can scroll, but the clip gives no visual cue that more columns exist. |

**Recommendations:**
- MED: Add a subtle right-fade gradient on `.tracker__scroll` to signal that the schools table scrolls horizontally. The truncated "SEC. SUBM…" header is not discoverable without knowing to scroll.

---

### 3. Grading (`/#/grading`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | Dashboard-style: composite + red flags + todos top row; domain tiles; hard metrics + radar; competency grid; component cards; activity table. Excellent density. |
| Spacing / rhythm | 4 | Consistent card padding; competency grid has uniform gap. |
| Color / contrast | 4 | Score colors (green ≥8, orange 6–7, red ≤5) provide immediate signal. Hard metric values right-aligned and readable. |
| Typography | 4 | Score numerals sized well. Competency labels fit cleanly in their tiles. |
| Interaction states | 3 | Meeting todo input + Add button visible. Grade buttons in terminal (not visible in static pass). |
| Overflow / responsiveness | 4 | At 560px viewport the top-row cards stack correctly within the reduced height; all key info visible. |

**No issues found.**

---

### 4. Editor (`/#/editor`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 3 | Split pane: file tree left, editor right. Hierarchy is clear. "Select a file to edit" empty state is very minimal. |
| Spacing / rhythm | 3 | File list items have compact but adequate spacing. |
| Color / contrast | 3 | File names in default text color; section headers (ACTIVITIES, DOCUMENTS, etc.) in muted uppercase. |
| Typography | 3 | Long file names truncate with `…` — correct. Monospace filename below title is readable. |
| Interaction states | 3 | Active file would be highlighted; not shown in empty-pane state. |
| Overflow / responsiveness | 3 | File tree panel is 200px; long names truncate properly. |

**Recommendations:**
- LOW: "Select a file to edit" right-pane empty state is a bare string. Consider adding a small icon or a subtle prompt ("← pick a file from the list").

---

### 5. Review (`/#/review`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | Left TOC nav + main content split. Component score cards in 4-up grid. Competency table below. |
| Spacing / rhythm | 4 | Card grid spacing consistent. Table rows have good vertical rhythm. |
| Color / contrast | 4 | Competency tier dots (Strong = green, Present = yellow, Thin = red) are excellent visual hierarchy. |
| Typography | 4 | Score numerals, sub-dimension tags, and "last scored" dates all well-sized. |
| Interaction states | 3 | Left TOC items not visibly highlighted as active. |
| Overflow / responsiveness | 4 | Content wraps correctly; "Supported by" column text wraps naturally in long cells. |

**Recommendations:**
- LOW: The left Review TOC (Component Scores / Competency Coverage / Priorities / Red Flags / _example-personal-statement) shows `_example-personal-statement` as a bare filename link. This is a template/example file — consider filtering out underscore-prefixed files from the TOC or rendering them with a muted style to distinguish them from real scored documents.

---

### 6. Coursework (`/#/coursework`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 3 | Simple list with Add input. Only 1 course seeded. |
| Spacing / rhythm | 3 | The single row and add-row are clean. Large empty area below. |
| Color / contrast | 3 | Delete (×) button visible. |
| Typography | 3 | Course name and subject field readable. |
| Interaction states | 3 | "subject" select and "Add course" input styled consistently. |
| Overflow / responsiveness | 4 | No overflow. |

**Recommendations:**
- LOW: With only 1 course entered, the page is mostly empty white space. A hint like "Add courses one by one, or ask Claude to import them from your transcript" would improve first-use clarity.

---

### 7. Rubrics (`/#/rubrics`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | 3-panel: app sidebar / rubric list / rubric content. Content renders markdown tables and bullet lists cleanly. |
| Spacing / rhythm | 4 | Rubric content has proper heading hierarchy (h2 > h3) and table padding. |
| Color / contrast | 4 | Table alternates are subtle; headings are white on dark background. |
| Typography | 3 | Body text in rubric content has a comfortable line length (~700px). Far right ~250px is unused white space. |
| Interaction states | 3 | Active rubric item highlighted in rubric list. |
| Overflow / responsiveness | 4 | No overflow; tables scroll horizontally when needed. |

**Recommendations:**
- LOW: Rubric content area has ~250px of empty right margin at 1440px. Consider widening `max-width` of the content column or allowing the text area to use more horizontal space.

---

### 8. Score History (`/#/score-history`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | 3-panel: sidebar / category list with counts / table content. Good visual hierarchy. |
| Spacing / rhythm | 4 | Tables have consistent row height; note column wraps naturally. |
| Color / contrast | 4 | Mode badges ("quick", "full", "rubric fix", "final") as plain text are readable. |
| Typography | 3 | Date column `2026-05-17` wraps to two lines in narrow cells — acceptable but slightly noisy. |
| Interaction states | 3 | Category list items highlight on hover. |
| Overflow / responsiveness | 4 | `hist__scroll` has `overflow-x: auto` — wide tables scroll correctly. |

**No actionable issues found.**

---

### 9. Applicant Image (`/#/applicant-image`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | 3-panel: sidebar / ToC / content. ToC has correct depth (section → subsection). |
| Spacing / rhythm | 4 | Prose headings, bold labels, and bullet lists all have good vertical rhythm. |
| Color / contrast | 4 | Strong white text on dark background; bold terms pop cleanly. |
| Typography | 4 | Body text line length is appropriate; h2 headings well-sized. |
| Interaction states | 3 | Edit button top-right visible. |
| Overflow / responsiveness | 4 | Long paragraphs wrap correctly; no overflow. |

**No issues found.**

---

### 10. Story Bank (`/#/story-bank`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | 3-panel with ToC nav. "0/44 used" counter in header is a nice affordance. |
| Spacing / rhythm | 4 | Story items with checkboxes have correct spacing; section h2 headers well-spaced. |
| Color / contrast | 4 | Unchecked boxes contrast well against dark background. |
| Typography | 3 | Story text items (long sentences) are set at a comfortable reading size. |
| Interaction states | 3 | Checkboxes functional; "Edit" button visible. |
| Overflow / responsiveness | 4 | No overflow. |

**No issues found.**

---

### 11. Meeting Notes (`/#/meeting-notes`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | 3-panel: sidebar / meeting list / View+Edit tabs + content. |
| Spacing / rhythm | 4 | Meeting list items with dates readable; tab switch clean. |
| Color / contrast | 4 | Active meeting item in cyan/teal accent; others in default text. |
| Typography | 4 | Rendered markdown (action item bullets, headers) well-sized. |
| Interaction states | 4 | View / Edit tabs clearly switch. Active meeting highlighted. |
| Overflow / responsiveness | 4 | Long bullet items wrap correctly. |

**No issues found.**

---

### 12. Knowledge (`/#/knowledge`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 3 | 3-panel: sidebar / source list / View+Edit content. Single `_example-source` is placeholder. |
| Spacing / rhythm | 3 | Minimal content, but layout is clean. |
| Color / contrast | 3 | `_example-source` item highlighted in background color (active). |
| Typography | 3 | "Example source" heading and descriptive text readable. |
| Interaction states | 3 | View / Edit tabs visible. |
| Overflow / responsiveness | 4 | No overflow. |

**Recommendations:**
- LOW: The `_example-source` item has an underscore prefix indicating it's a template/example. Consider rendering it with a muted italic style (e.g., `color: var(--color-muted)`) so users know it's a scaffold they can delete or replace, not real content.

---

### 13. Activity Log (`/#/log`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 3 | Simple full-width page with heading and empty-state message. |
| Spacing / rhythm | 3 | Heading and hint text adequately spaced. |
| Color / contrast | 3 | Default text on dark background — fine. |
| Typography | 3 | "No activity yet" message clear. |
| Interaction states | N/A | No interactive elements in empty state. |
| Overflow / responsiveness | 4 | No overflow. |

**No issues found.**

---

### 14. User Guide (`/#/guide`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | Single-column prose; h2 sections (`General`, `Primaries`, `Secondaries`, `Getting your data in`, `Grading with the agent`). |
| Spacing / rhythm | 4 | Inline `code` spans and `strong` text break up density well. |
| Color / contrast | 4 | Inline code chips have background tint for visibility. |
| Typography | 4 | Line length comfortable (~700–750px). |
| Interaction states | N/A | Read-only page. |
| Overflow / responsiveness | 4 | No overflow. |

**No issues found.**

---

### 15. Claude Config (`/#/claude`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | 3-panel: sidebar / ROUTER + SUBAGENTS list / rendered CLAUDE.md content. |
| Spacing / rhythm | 4 | Subagent list uses monospace, visually distinct from the prose content. |
| Color / contrast | 4 | Active "CLAUDE.md (router)" item highlighted in accent. Inline code chips readable. |
| Typography | 4 | CLAUDE.md renders headings, tables, blockquotes, and code correctly. |
| Interaction states | 3 | View / Edit tabs visible. |
| Overflow / responsiveness | 4 | Long table rows in CLAUDE.md don't overflow (table has `overflow-x: auto`). |

**No issues found.**

---

### 16. Secondaries — Prewriting (`/#/secondaries/prewriting`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | 3-panel: sidebar / category list / category detail with schools + guiding questions + freewrite editor. |
| Spacing / rhythm | 4 | Category list items compact but readable; guiding questions numbered list well-spaced. |
| Color / contrast | 4 | Status dot colors (muted / warn / accent / pos) map to prewriting stages clearly. |
| Typography | 3 | Category labels truncate at 200px panel — now fixed (see shipped fixes). |
| Interaction states | 3 | Active category in cyan; "Brainstorm ideas" and action buttons outlined in accent. |
| Overflow / responsiveness | 4 | No horizontal overflow. |

**Fix shipped:** Added `min-width: 0` to `.sec-bank__name` so category labels that exceed the 200px panel width truncate with `…` instead of clipping invisibly. Before the fix, "Additional Info / Anything else" and "Adversity / Challenge / Failure" overflowed without showing `…` and their count badges were hidden. After fix, all 6 items show `…` correctly with count badges visible.

---

### 17. Secondaries — Schools (`/#/secondaries`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | Table: SCHOOL / ESSAYS / SEC. DEADLINE / REGRADE / Open→. 24 schools visible. "0/106 essays ready" counter clear. |
| Spacing / rhythm | 4 | Row height consistent; "Open →" links right-aligned with good whitespace. |
| Color / contrast | 4 | "Open →" in teal accent visually separated from data columns. |
| Typography | 3 | School names are plain text; long names like "Cleveland Clinic Lerner College of Medicine of Case Western Reserve University" wrap to 2 lines, creating row height inconsistency. |
| Interaction states | 3 | "Open →" links are the primary CTA — they stand out clearly. |
| Overflow / responsiveness | 3 | All columns fit at 1440px — good. Long school names cause variable row height. |

**Recommendations:**
- LOW: Long school names cause uneven row heights. Consider capping school name to 1 line with `text-overflow: ellipsis` and a `title` tooltip for the full name, or allowing 2-line names explicitly to avoid the half-wrapped look.

---

### 18. Secondaries — Workspace (`/#/secondaries/workspace`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | 2-panel: left (description + 3 action buttons) / right (code editor). Clear purpose. |
| Spacing / rhythm | 4 | Action buttons stacked with even gap; description text adequately spaced. |
| Color / contrast | 4 | Action buttons use accent outline style consistently. |
| Typography | 3 | Left panel description text is quite small (13px ish) and gray. |
| Interaction states | 3 | Buttons visible and labeled clearly. |
| Overflow / responsiveness | 4 | No overflow. |

**No actionable issues.**

---

### 19. School Detail — Research tab (`/#/secondaries/harvard-medical-school/research`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 4 | Research tab / Editor tab / Grading tab at top. Left: prompts table with fixed-layout columns. Right: Why-us notes editor. |
| Spacing / rhythm | 4 | Prompt rows expand to wrap long prompt text — correct for reading long prompts. |
| Color / contrast | 4 | Status badge ("not-started") and type badge ("Anticipated") styled with subtle pill look. |
| Typography | 3 | MAPS TO column (116px fixed) shows "Diversity / Cont…" — expected given fixed-width table. |
| Interaction states | 3 | "Research fit" and "Map prompts" action buttons in accent. Edit prompts link visible. |
| Overflow / responsiveness | 4 | Fixed table-layout prevents overflow; column widths correct. |

**No actionable issues.**

---

### 20. School Detail — Editor tab (`/#/secondaries/harvard-medical-school/editor`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 3 | Left: prompt list with char count. Right: empty "Select a prompt to write." in large open space. |
| Spacing / rhythm | 3 | Prompt list compact; char badge visible. |
| Color / contrast | 3 | "4000CH" badge small but legible. |
| Typography | 3 | Truncated prompt previews in the left list convey enough context. |
| Interaction states | 3 | No prompt selected — empty state is bare plain text. |
| Overflow / responsiveness | 4 | No overflow. |

**Recommendations:**
- LOW: Empty right pane says "Select a prompt to write." in small plain text. Auto-selecting the first prompt on load would eliminate this empty state entirely.

---

### 21. School Detail — Grading tab (`/#/secondaries/harvard-medical-school/grading`)

| Pillar | Score | Notes |
|--------|-------|-------|
| Layout / hierarchy | 3 | Single empty-state card with "Not regraded yet…" message. "Run regrade in terminal" button top-right. |
| Spacing / rhythm | 3 | Empty state has adequate padding. |
| Color / contrast | 3 | Default text on dark card background — fine. |
| Typography | 3 | Message is clear and actionable. |
| Interaction states | 3 | "Run regrade in terminal" button styled consistently with other terminal-launch buttons. |
| Overflow / responsiveness | 4 | No overflow. |

**No actionable issues.**

---

## Cross-cutting observations

### Sidebar at 560px height
At 1440×560, the sidebar scrolls off its lower items (Score History, Secondaries section) but the active item remains visible and the Terminal toggle at the bottom is pinned. No content is clipped horizontally. This is acceptable behavior for the terminal-open state.

### Console errors (all pre-existing)
- `WebSocket connection to 'ws://localhost:5173/watch' failed` — Vite HMR WebSocket closes on every page navigation in Playwright. Not a real error.
- `404 /api/file?path=documents/secondaries/harvard-medical-school/_research.md` — expected; no research notes written yet for this school.
- `404 /api/file?path=documents/secondaries/_workspace.md` — expected; workspace file is created on first write.
- `useTerminalDock outside provider` — appears transiently after a Vite HMR reload but resolves on hard refresh. Pre-existing issue unrelated to this audit.

---

## Top 5 recommendations NOT auto-fixed (by severity)

1. **MED — Tracker table: no scroll affordance** (`/#/tracker`)
   The schools table scrolls right to reveal "SEC. SUBMITTED" and "SEC. DEADLINE" detail columns, but there is no visual cue (shadow/gradient) that more columns exist. Add a right-edge fade on `.tracker__scroll` with a CSS pseudo-element (`::after { position: sticky; right: 0; width: 32px; background: linear-gradient(to right, transparent, var(--color-bg)); }`) to signal scrollability.

2. **MED — School editor: auto-select first prompt** (`/secondaries/<school>/editor`)
   The editor right pane shows "Select a prompt to write." in a large empty space whenever no prompt is selected. Auto-selecting the first essay on page load (if no essay is yet started) would eliminate this blank state.

3. **LOW — Schools table: inconsistent row height from long school names** (`/#/secondaries`)
   "Cleveland Clinic Lerner College of Medicine of Case Western Reserve University" wraps to 3 lines. Either clamp the name to 1 line with `text-overflow: ellipsis; white-space: nowrap; overflow: hidden` + `title` attribute, or set an explicit `min-height` on rows so all heights are consistent.

4. **LOW — Review page: `_example-personal-statement` in sidebar TOC** (`/#/review`)
   Template/example files with underscore prefixes appear as real document links in the Review TOC. Filter them out or render them with `color: var(--color-muted)` and italic to signal they are scaffolds, not scored documents.

5. **LOW — Rubrics content area: wasted right margin** (`/#/rubrics`)
   At 1440px, the rubric text column ends around x=1100, leaving ~340px of dark space on the right. The rubric panel could widen by setting `max-width: none` on the content area when the viewport is wide, or the rubric list could collapse to a narrower panel so the content gets more room.
