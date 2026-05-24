# Activities List Rubric

AMCAS Work/Activities section:
- Up to **15 entries**
- **700 characters** per experience description
- Up to **3 Most Meaningful** designations with **1,325 characters** each
- AAMC asks: transformative nature, impact made, personal growth

20 AMCAS experience types: Artistic Endeavors, Community Service/Volunteer–Medical, Community Service/Volunteer–Non-Medical, Conferences Attended, Extracurricular Activities, Hobbies, Honors/Awards/Recognition, Intercollegiate Athletics, Leadership–Not Listed Elsewhere, Military Service, Other, Paid Employment–Medical, Paid Employment–Non-Medical, Physician Shadowing/Clinical Observation, Presentations/Posters, Publications, Research/Lab, Social Justice/Advocacy, Teaching/Tutoring/Teaching Assistant.

---

## Sub-dimension 1: Experience Breadth

Does the activities list cover the key AAMC EAE experience categories? Strong applications demonstrate breadth AND depth — not just a long list of thin experiences.

Key categories adcoms look for:
- Research/Lab (ideally with a publication, poster, or meaningful contribution)
- Clinical (direct patient exposure, not just observation)
- Physician Shadowing
- Community Service / Volunteering (sustained, not one-time)
- Leadership or Teaching
- Paid employment (optional but valuable for context)

| Score | Anchor |
|---|---|
| 1–3 | Missing 2+ major categories. Heavy skew toward one type (e.g., all research, no clinical). |
| 4–5 | Covers most categories but one key area (usually clinical or service) is thin or absent. |
| 6–7 | All major categories represented. Hours are competitive in at least 2–3 areas. |
| 8–9 | Strong coverage. Multiple entries per major category showing depth, not just presence. |
| 10 | Exceptional breadth and depth. Every major category represented with meaningful contributions. Leadership + research + clinical all at a level that would stand independently. |

---

## Sub-dimension 2: Description Quality (Average across all entries)

AMCAS gives 700 characters per entry. Strong descriptions are specific and impact-focused, not job-description-style summaries.

**Weak pattern (avoid):** "Worked in the emergency department assisting nurses and physicians with patient care tasks."
**Strong pattern:** "Assisted ED team during trauma activations; observed airway management and chest compressions on a 43-year-old cardiac arrest. Asked the attending to explain the decision to stop resuscitation — began thinking about how physicians navigate uncertainty with families."

| Score | Anchor |
|---|---|
| 1–3 | Descriptions read like job postings. No specifics, no reflection, no impact. |
| 4–5 | Some entries are specific, most are generic. Opportunities for vivid detail are missed. |
| 6–7 | Most entries have at least one specific detail. Some have genuine reflection. A few are still too summary-like. |
| 8–9 | Strong entries throughout. Specifics, impact, and brief reflection visible in most entries. |
| 10 | Every 700 characters is maximally used. Each entry could stand alone as a mini-story. |

---

## Sub-dimension 3: Most Meaningful Depth

The 3 Most Meaningful entries have 1,325 extra characters. AAMC asks for: transformative nature, impact made, personal growth. This is the richest real estate in the activities section.

| Score | Anchor |
|---|---|
| 1–3 | Most Meaningful entries read the same as regular entries. Space not used meaningfully. No additional reflection. |
| 4–5 | Some attempt at reflection but stays surface-level. "This experience confirmed my desire to become a physician." |
| 6–7 | Genuine reflection present. Applicant explains *why* this was most meaningful, not just *what* happened. |
| 8–9 | Specific transformative moment described. Reader understands precisely what changed and why. AAMC competencies are implicitly demonstrated. |
| 10 | All 1,325 characters earn their place. Three distinct meaningful experiences each illuminate a different dimension of the applicant. Together they cover breadth of character. |

---

## Sub-dimension 4: Non-Redundancy

Does each entry add something different? Do activities and the personal statement cover different ground (or do they repeat the same stories)?

| Score | Anchor |
|---|---|
| 1–3 | Multiple entries describe essentially the same experience. Activities heavily overlap with personal statement. |
| 4–5 | Some redundancy. 2–3 entries cover similar territory. PS and activities partially overlap. |
| 6–7 | Mostly distinct. Minor overlaps but each entry adds something. |
| 8–9 | Clean separation. Each entry has its own lane. PS and activities cover different dimensions. |
| 10 | Zero redundancy. Activities and PS together form a complete, non-overlapping picture of the applicant. |

---

## Per-Entry Description Scoring

When running a deep score or when asked to score activities individually, score each entry's description separately using this scale:

| Score | Anchor |
|---|---|
| 9–10 | Specific scene, vivid detail, brief reflection — could stand alone as a mini-story |
| 7–8 | Mostly specific with some impact language; minor generic phrases |
| 5–6 | Mix of specific and generic; impact present but undersold |
| 3–4 | Mostly generic job-posting language; opportunity for specificity missed |
| 1–2 | Reads as a duty list with no specifics or reflection |

For Most Meaningful entries, score depth separately:

| Score | Anchor |
|---|---|
| 9–10 | Full 1,325 chars used purposefully; transformative moment named; growth arc clear |
| 7–8 | Genuine reflection present; explains why most meaningful, not just what happened |
| 5–6 | Some reflection but stays surface-level; space not fully utilized |
| 3–4 | Barely extends beyond the 700-char description; no additional insight |
| 1–2 | Indistinguishable from regular entry; wasted space |

---

## Scoring Checklist

After scoring all four sub-dimensions:
1. Calculate avg_score: (breadth + description_quality + most_meaningful_depth + non_redundancy) / 4
2. Write reasoning for each score — cite specific entries or patterns
3. Update `Activities/activities-scores.md` frontmatter
4. **Update the Per-Entry Scores table** — one row per activity with: experience name, type, description quality score, MM designation, MM depth score (if applicable), revision priority (🔴 ≤5 / 🟡 6–7 / 🟢 8–10), and one-line note
5. Recalculate `description_quality` frontmatter as average of all individual description scores
6. Recalculate `most_meaningful_depth` frontmatter as average of individual MM depth scores
7. Update `Agent/scorecard.md` activities_avg field
8. Recalculate composite
9. Run improvement priorities update
