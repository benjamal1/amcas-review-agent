// Blank starting-point content for the "Clear All Data" reset button.
// Kept in code (not a second content.example/ tree) — content/ ships with demo
// data already, this is the only place a truly empty scaffold needs to exist.

const ACTIVITY_STUB = (order: number) => `---
experience_name: ""
experience_type: ""
organization: ""
dates_start: ""
dates_end: ""
hours_completed: null
hours_anticipated: null
most_meaningful: false
order: ${order}
---

Begin writing here — one activity per file, up to 700 characters (AMCAS limit). Fill in the fields
above first (name, AMCAS category, org, dates, hours), then describe what you actually did:
your responsibilities, a concrete outcome or number, and anything you built, fixed, or led.
`

export const BLANK_DATA_JSON = {
  scorecard: {
    composite: null,
    red_flag_count: 0,
    domains: {
      personal_narrative: { avg: null, trend: '→', last_updated: '' },
      clinical_experience: { avg: null, trend: '→', last_updated: '' },
      research_academics: { avg: null, trend: '→', last_updated: '' },
      extracurriculars: { avg: null, trend: '→', last_updated: '' },
      service_community: { avg: null, trend: '→', last_updated: '' },
    },
    hard_metrics: {
      gpa_cumulative: null, gpa_bcpm: null,
      mcat_total: null, mcat_cars: null, mcat_cp: null, mcat_bb: null, mcat_ps: null,
    },
  },
  competencies: [
    'Service Orientation', 'Social Skills', 'Cultural Competence', 'Teamwork', 'Oral Communication',
    'Ethical Responsibility', 'Reliability and Dependability', 'Resilience and Adaptability',
    'Capacity for Improvement', 'Critical Thinking', 'Quantitative Reasoning', 'Scientific Inquiry',
    'Written Communication', 'Living and Working with Others', 'Empathy and Compassion',
    'Human Behavior', 'Medical Knowledge',
  ].map(name => ({ name, score: null, tier: null, supported_by: [] as string[] })),
  priorities: [] as unknown[],
  todos: { open: [] as unknown[], done: [] as unknown[] },
  component_scores: {
    personal_statement: { score: null, last_scored: '' },
    activities: { score: null, last_scored: '' },
    impactful_experience: { score: null, last_scored: '' },
  },
  activity_entries: [] as unknown[],
  rec_letters: [
    { recommender: 'Dr. Jane Smith', title: 'Professor of Biology', relationship: 'Research supervisor',
      status: 'pending', submitted: false, requested_date: '', received_date: '', notes: '' },
  ],
  schools: [
    { name: 'School Name', tier: 'target', pipeline: 'researching', casper_required: false,
      preview_required: false, secondary_submitted: false, interview: false, notes: '',
      secondary: {
        research_notes_path: 'documents/secondaries/school-name/_research.md',
        prompt_source_year: '2025-2026 (prior-year)',
        essays: [{ prompt: 'Why do you want to attend our school?', maps_to: 'why-us', status: 'not-started', char_limit: 300 }],
      } },
  ],
  coursework: [{ name: 'Organic Chemistry I', subject: 'Chemistry' }],
  secondaries: {
    brainstorm_path: 'documents/secondaries/_brainstorm.md',
    essay_bank: [
      { archetype: 'adversity', label: 'Adversity / Challenge / Failure', doc_path: 'documents/secondaries/_bank/adversity.md', status: 'not-started', pre_writable: true },
      { archetype: 'leadership', label: 'Leadership', doc_path: 'documents/secondaries/_bank/leadership.md', status: 'not-started', pre_writable: true },
      { archetype: 'diversity', label: 'Diversity / Contribution', doc_path: 'documents/secondaries/_bank/diversity.md', status: 'not-started', pre_writable: true },
      { archetype: 'service', label: 'Community Service', doc_path: 'documents/secondaries/_bank/service.md', status: 'not-started', pre_writable: true },
      { archetype: 'research', label: 'Research', doc_path: 'documents/secondaries/_bank/research.md', status: 'not-started', pre_writable: true },
      { archetype: 'additional', label: 'Additional Info / Anything else', doc_path: 'documents/secondaries/_bank/additional.md', status: 'not-started', pre_writable: true },
      { archetype: 'why-us', label: 'Why Us', doc_path: 'documents/secondaries/_bank/why-us.md', status: 'not-started', pre_writable: false },
    ],
  },
}

export const BLANK_FILES: { path: string; content: string }[] = [
  { path: 'documents/personal-statement.md', content: '# Personal Statement\n\nPaste your personal statement draft here. AMCAS limit: 5,300 characters.\n' },
  { path: 'documents/impactful-experience.md', content: '# Most Meaningful Experience\n\nPaste your most meaningful experience essay here. AMCAS limit: 1,325 characters.\n' },
  ...Array.from({ length: 15 }, (_, i) => ({ path: `documents/activities/activity-${String(i + 1).padStart(2, '0')}.md`, content: ACTIVITY_STUB(i + 1) })),
  { path: 'documents/activities/README.md', content: '# Activities\n\nCreate one .md file per activity. The editor will list them here.\n' },
  { path: 'documents/secondaries/README.md', content: '# Secondaries — document layout\n\nMarkdown sources for the Secondaries section, grouped by folder in the Editor.\n' },
  { path: 'documents/secondaries/_brainstorm.md', content: '# Secondary brainstorm — story & experience inventory\n\nRaw material to draw from before drafting the bank.\n\n- **Experience —** what happened · what shifted · archetype(s)\n' },
  { path: 'documents/secondaries/_bank/adversity.md', content: '# Adversity / Challenge / Failure — master draft\n\n[Draft here.]\n' },
  { path: 'documents/secondaries/_bank/leadership.md', content: '# Leadership — master draft\n\n[Draft here.]\n' },
  { path: 'documents/secondaries/_bank/diversity.md', content: '# Diversity / Contribution — master draft\n\n[Draft here.]\n' },
  { path: 'documents/secondaries/_bank/service.md', content: '# Community Service — master draft\n\n[Draft here.]\n' },
  { path: 'documents/secondaries/_bank/research.md', content: '# Research — master draft\n\n[Draft here.]\n' },
  { path: 'documents/secondaries/_bank/additional.md', content: '# Additional Info — master draft\n\n[Draft here.]\n' },
  { path: 'documents/secondaries/_bank/why-us.md', content: '# Why Us — anchor notes\n\n[Draft here — Why-Us is finished per school, this is shared material only.]\n' },
  { path: 'documents/secondaries/school-name/_research.md', content: '# School Name — secondary research\n\n## Mission / values\n\n## Distinctive programs\n\n## Prior-year prompts\n\n## Personal ties / why me here\n' },
  { path: 'feedback/README.md', content: '# Feedback\n\nThe review agent writes per-component coaching feedback here. Empty until a deep score runs.\n' },
  { path: 'knowledge/README.md', content: '# Knowledge\n\nSources the applicant finds useful — advising notes, articles, strategy guides. Add one markdown file per source.\n' },
  { path: 'meeting-notes/_template.md', content: '---\ndate: ""\nattendees: []\n---\n\n## Notes\n\n## Todos\n\n- [ ] \n' },
  { path: 'story-bank.md', content: '# Story Bank\n\nSpecific moments with secondary-essay potential. Raw material — capture, don\'t filter.\n\n### Initiative / Self-direction\n- [ ] (example) Cold-called clinics until landing a shadowing role.\n\n### Precision / Hands\n- [ ] (example) A moment that shows careful, skilled hands.\n' },
]
