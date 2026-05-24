# Narrative Coherence Rubric

This domain assesses the application as a whole — whether the pieces add up to one coherent person, whether that person is distinctively Benjamin, and whether the application contains any active negatives that drag it down.

---

## Sub-dimension 1: Through-Line

Does a single, consistent identity thread run through the personal statement, activities, and letters? Would an adcom reading all sections come away with one clear picture of who this applicant is?

| Score | Anchor |
|---|---|
| 1–3 | Sections contradict or ignore each other. PS describes one person; activities describe another. No unifying theme. |
| 4–5 | Partial through-line. Some thematic consistency but major sections don't reinforce each other. |
| 6–7 | Recognizable identity across sections. Theme present but not actively reinforced — coincidental rather than designed. |
| 8–9 | Strong through-line. PS themes are echoed in Most Meaningful entries. Letters confirm the same picture. |
| 10 | Masterful coherence. Every section is in conversation. Reading the application feels like getting to know one specific, vivid person. |

---

## Sub-dimension 2: Differentiation

Could this application belong to any competitive pre-med, or is it clearly and specifically Benjamin's?

| Score | Anchor |
|---|---|
| 1–3 | Generic application. Any ambitious pre-med with similar stats could submit this. No distinctive voice, perspective, or story. |
| 4–5 | Some distinctive elements but diluted by generic framing. A few specific stories surrounded by interchangeable language. |
| 6–7 | Noticeably individual. Reader gets a sense of this specific person. Some experiences are clearly unique. |
| 8–9 | Distinctively Benjamin. The combination of engineering background, bioelectric thread research, biomechanics teaching, and clinical exposure is not interchangeable. |
| 10 | Could not belong to anyone else. Specific enough in detail, perspective, and voice that reassigning it to another applicant would be obviously wrong. |

---

## Sub-dimension 3: Cross-Section Consistency

Do the hours, dates, and descriptions across sections agree with each other? Are there any contradictions between what the PS claims and what activities show?

| Score | Anchor |
|---|---|
| 1–3 | Clear contradictions. Hours claimed don't match descriptions. Activities mentioned in PS don't appear in activities list. |
| 4–5 | Minor inconsistencies. A story in the PS references an experience that's underrepresented in activities. |
| 6–7 | Mostly consistent. No glaring contradictions, but some loose ends. |
| 8–9 | Tight consistency. Every PS reference has a corresponding activity entry. Hours are plausible and coherent. |
| 10 | Perfect consistency. PS, activities, and letters all tell the same story from different angles. Zero contradictions. |

---

## Sub-dimension 4: Red Flag Score (inverse)

This sub-dimension REDUCES the coherence score. Each active red flag reduces the coherence_avg. Score starts at 10 and is reduced by red flag severity.

**Red flag catalog:**

| Red Flag | Severity | Score Reduction |
|---|---|---|
| Generic or unenthusiastic rec letter | Major | -2 per letter |
| Late secondary submission (>3 weeks) | Major | -2 |
| Unexplained multi-month activity gap | Moderate | -1 |
| Significant activity hours overlap or contradiction | Major | -2 |
| PS language that sounds AI-generated | Moderate | -1 |
| Activity descriptions that read as job postings | Minor | -0.5 per entry, max -2 |
| Most Meaningful entry that doesn't exceed regular entry | Minor | -0.5 per entry |
| Redundant stories across sections | Moderate | -1 per pair |
| Overclaiming (described as "lead researcher" with 2 months experience) | Major | -2 |
| Tone inconsistency (formal in PS, casual in activities) | Minor | -0.5 |

Calculate: Start at 10, subtract reduction for each active red flag. Floor at 1.

---

## Coherence Scoring Checklist

1. Score through-line, differentiation, and cross-section consistency (1–10 each)
2. Identify all active red flags, calculate red flag score
3. Calculate coherence_avg: (through_line + differentiation + cross_section + red_flag_score) / 4
4. Update `Agent/scorecard.md` coherence_avg field
5. Add/remove red flags from `Agent/red-flags.md` as appropriate
6. Recalculate composite
