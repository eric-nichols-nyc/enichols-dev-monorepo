# Portfolio knowledge (assistant context)

Markdown source of truth for **grounded Q&A** in the portfolio chat assistant. Structured UI (cards, grids, artifacts) still comes from `data/*`.

## Layout

```
knowledge/
├── README.md                 # this file
├── candidate/
│   ├── candidate-profile.md  # who Eric is
│   ├── tech-stack.md         # technologies & proficiency
│   └── experience.md         # career timeline
└── projects/
    └── {project.id}.md       # one file per published project in data/projects.ts
```

## Authoring rules

- **Facts only** — migrate from `data/resume.ts`, `data/about.ts`, `data/experience.ts`, `data/projects.ts`, `data/tech.json`; do not invent metrics or employers.
- **Slugs** — project filenames must match `data/projects.ts` `id` (e.g. `audiograph.md`).
- **Sections** — use H2 (`##`) headings; the context loader slices by section name.
- **Split concerns** — profile vs stack vs jobs vs projects (see `docs/feature-specs/knowledge-assistant/02-knowledge-sources.md`).

## When facts change

Update the relevant knowledge file **and** the matching `data/*` source until a later spec consolidates UI from knowledge.
