# Agent Reference — AMCAS / MSAR source documents

Official AAMC publications, committed for development + scoring context. These are the public
reference docs the agent's rubrics and School List logic are derived from. Not loaded into runtime
sessions automatically — read on demand when building or verifying application logic.

## amcas/
| File | Pages | Source |
|---|---|---|
| `2026-amcas-applicant-guide.pdf` | 100 | 2026 AMCAS Applicant Guide (drove v1). AAMC content, mirrored by Rutgers NJMS (AAMC rotated the 2026 page to 2027). |
| `2027-amcas-applicant-guide.pdf` | 95 | Current cycle. https://students-residents.aamc.org/media/11616/download |
| `2027-amcas-application-worksheet.pdf` | 35 | https://students-residents.aamc.org/media/14376/download |
| `anatomy-of-an-applicant.pdf` | 25 | AAMC premed competencies self-assessment (basis for the 17-competency rubric). https://students-residents.aamc.org/media/10606/download |

## msar/
17 of AAMC's free MSAR reports for applicants/advisors
(https://students-residents.aamc.org/medical-school-admission-requirements/medical-school-admission-requirements-reports-applicants-and-advisors).
Most relevant to School List / requirements logic: `letter-of-evaluation-preferences`,
`secondary-application-info`, `interview-policies`, `preview-exam-policies`,
`premedical-coursework-chart`, `admission-policies`, `mcat-dates-considered`,
`community-college-coursework`. Plus: applications-accepted, application-transfer-policies,
daca-policies, debt-information, deposit (n/a), main-campus-address-contact, mission-statement,
support-gender-sexual-minority, tuition-fees-insurance, waitlist-procedures.

Not available at fetch time (removed/rotated from AAMC): deposit-due-date, 2022 BA/BS-MD program list.

_Fetched 2026-06-27 from official AAMC sources (aamc.org). © AAMC; redistributed here for
personal development reference._
