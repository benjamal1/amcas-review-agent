# AMCAS Review Agent — Usage Guide

---

## Setup (one-time)

**1. Install Dataview plugin in Obsidian**
Settings → Community Plugins → Browse → search "Dataview" → Install → Enable
Then: Settings → Dataview → turn on **Enable DataviewJS queries**

**2. Open the agent**
Open Claude Code from inside the `Med School Application Dashboard/` folder.
The agent reads `Agent/CLAUDE.md` automatically — no setup needed.

---

## Where to Put Your Writing

| What | Where to paste it |
|---|---|
| Personal statement | `Personal Statement/Personal Statement Draft.md` |
| Activity descriptions | `Activities/Activities Master.md` |
| Rec letter draft | `Rec Letters/[Recommender Name].md` (use `_template.md` for new ones) |
| Impactful experience essay | `Impactful Experience/Impactful Experience Draft.md` |
| Secondary essays | `Secondaries/` — one note per school (coming later) |

---

## Commands

### Enter your metrics
Tell the agent your numbers in plain language:
> *"My GPA is 3.85, BCPM is 3.72, MCAT is 517 — C/P 130, CARS 129, B/B 129, P/S 129"*

The agent updates the scorecard automatically.

---

### Assess your metrics
> *"Assess my metrics"* / *"How competitive are my numbers?"*

Gives you a plain-language competitive read: GPA tier, MCAT tier, section balance flags, school list implications. One-time contextual assessment — not a repeating score.

---

### Score activities per entry
> *"Score each activity"* / *"Score activities individually"*

Scores every activity description individually (1–10) plus a separate depth score for each Most Meaningful entry. Results go into a per-entry table in `Activities/activities-scores.md` with a revision priority flag (🔴 High / 🟡 Medium / 🟢 Low) for each entry. The 3 lowest-scoring entries are flagged automatically.

---

### Quick Score
> *"Quick score my personal statement"*
> *"Quick score activities"*
> *"Quick score impactful experience"*
> *"Quick score"* (runs across everything)

Agent reads the component and auto-scores all sub-dimensions in one pass. Takes 1–2 minutes. Flags anything it's uncertain about. Updates the dashboard immediately.

**Use when:** you've just revised something and want to see if the needle moved.

---

### Deep Score
> *"Deep score my personal statement"*
> *"Deep score activities"*
> *"Deep score impactful experience"*

Agent reads the component, shows you its proposed score for each sub-dimension with reasoning, then asks you to confirm or push back before locking it in. Takes 5–10 minutes per component.

**Use when:** you want scores you actually trust, or when you're not sure the agent has full context.

---

### Update meeting to-dos
> *"Update meeting to-dos"* / *"Extract to-dos from meeting notes"*

Drop a meeting note or transcript into `Meeting Notes/` first. The agent reads all files in that folder, extracts action items, and appends new ones (with source tags) to `Agent/meeting-todos.md`. Skips duplicates automatically.

**Supported formats:**
- Processed notes with checkbox lists or "Action Items" sections — extraction is direct
- Raw transcripts — agent scans for action language

The dashboard's Meeting To-Dos panel shows your open count. Click "View full to-do list →" to see everything. Check off items manually in `Agent/meeting-todos.md` — completed items move to the Completed section when you next run an extraction.

---

### Read transcript (one-time)
> *"Read my transcript"*

Paste your course list into `Transcript/Courses.md` first. The agent maps courses to four science competencies (Living Systems, Human Behavior, Scientific Inquiry, Quantitative Reasoning) and adds the evidence to the competency heatmap. Does not affect GPA or composite — purely for competency evidence.

---

### Score competency coverage
> *"Score my competency coverage"*

Agent reads across your PS, activities, and any scored rec letters simultaneously. Scores all 17 AAMC competencies based on evidence found across the full application. Updates the competency heatmap on the dashboard.

**Run this after** scoring your PS and activities — it needs content to read.

---

### Review a rec letter
> *"Review my Vikas Srivastava letter"*
> *"Score my rec letter from [name]"*

Agent evaluates the letter against the Brown HCA 5-section rubric (Introduction, Observations, Readiness Examples, Comparative Statement, Summary/Endorsement). Scores each section and maps which AAMC competencies the letter covers — these feed into the competency heatmap.

**Note:** the agent never scores a rec letter unless you explicitly ask.

---

## Recommended First Session

Run these in order after you've pasted in your drafts:

1. `"My GPA is X, BCPM is X, MCAT is X (C/P X, CARS X, B/B X, P/S X)"` — enter metrics
2. `"Assess my metrics"` — get competitive read
3. `"Quick score my personal statement"` — baseline PS score
4. `"Quick score activities"` — baseline activities score
5. `"Quick score impactful experience"` — baseline IE score
6. `"Score my competency coverage"` — cross-application competency read

By the end, the dashboard shows your full profile and the improvement priorities list tells you exactly what to work on first.

---

## The Dashboard

Open `Application Dashboard.md` in Obsidian (Reading mode).

| Panel | What it shows |
|---|---|
| Composite Score | 0–100 rolling score + domain breakdown with trend arrows |
| Hard Metrics | Your GPA and MCAT (context only, not in composite) |
| Priorities & Flags | Top improvement actions + active red flag count |
| Competency Coverage | All 17 AAMC competencies with scores and tiers |
| Domain Score Profile | Radar chart of your 5 domain scores |
| Component tiles | PS, Activities, Impactful Experience, Rec Letters, Secondaries — each with current score and last-scored date |

The dashboard updates automatically after every scoring session. No manual editing needed.

---

## Scoring Scale

All sub-dimensions scored **1–10**:

| Score | Meaning |
|---|---|
| 9–10 | Exceptional — adcom would notice this |
| 7–8 | Strong — above average, minor room to improve |
| 5–6 | Adequate — present but not differentiated |
| 3–4 | Weak — needs meaningful revision |
| 1–2 | Missing or ineffective |

**Composite (0–100):** weighted average of 5 domains (Experiences 25%, PS 25%, Activities 20%, Competency Coverage 20%, Narrative Coherence 10%), scaled to 100.

**Competency tiers:**
- 🟢 Strong: 8–10
- 🟡 Present: 5–7
- 🔴 Thin: 1–4
- ⚪ Unscored: not yet assessed

---

## Adding a New Rec Letter

1. Copy `Rec Letters/_template.md`
2. Rename it to the recommender's name
3. Fill in the frontmatter fields (recommender, title, institution, relationship)
4. Paste the letter draft under `## Draft`
5. Ask the agent: `"Review my [name] letter"`

---

## Deadlines to Know

| Deadline | What |
|---|---|
| May 22, 2026 | All rec letters due to Brown HCA |
| Early June 2026 | Target primary application submission |
| Within 2 weeks of receipt | Return each secondary |

The agent flags the HCA deadline automatically if a letter's status is still "draft" within 5 days of May 22.

---

## What the Agent Won't Do

- Rewrite your essays (it evaluates, you revise — unless you explicitly ask for help)
- Score a rec letter without being asked
- Invent your GPA or MCAT if you haven't entered them
- Touch files outside this folder
