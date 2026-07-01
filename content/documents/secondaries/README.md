# Secondaries — document layout

Markdown sources for the Secondaries section. The app's Editor groups by folder automatically.

```
secondaries/
├── _brainstorm.md          # raw story/experience inventory (pre-writing)
├── _bank/                  # master archetype drafts (the "essay bank")
│   ├── adversity.md
│   ├── leadership.md
│   ├── diversity.md
│   ├── service.md
│   ├── research.md
│   ├── additional.md
│   └── why-us.md           # anchor only — Why-Us is finished per school
└── <school-slug>/          # one folder per school (kebab-cased name)
    ├── _research.md        # why-us notes, mission/program fit, prior-year prompts
    └── 1.md, 2.md, …       # one file per secondary essay for that school
```

Paths are referenced from `data.json` (`secondaries.essay_bank[].doc_path`,
`schools[].secondary.*`). Files are created as drafts are written — the bank/school files don't all
need to exist up front.
