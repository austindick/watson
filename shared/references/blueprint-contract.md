# Blueprint Contract

The blueprint is the shared data layer between all Design Toolkit skills. Every skill that reads or writes blueprint files MUST follow these rules.

## Directory Structure

Each prototype has a `blueprint/` directory containing 5 files:
- CONTEXT.md — Problem statement, hypotheses, design decisions
- LAYOUT.md — Per-section layout specs (token tables, component trees, annotated CSS)
- DESIGN.md — Per-section design tokens and visual specs
- INTERACTION.md — States, transitions, user flows, responsive behavior
- STATUS.md — Machine-readable session state (YAML frontmatter + human summary)

## Cross-Skill Rules

### Write Protocol
- **Always use Edit tool** (section replacement), never Write tool (full overwrite)
- Exception: Initial scaffold (watson-init/play) uses Write to create empty templates
- Reason: Edit preserves surrounding content; Write destroys other skills' data

### Amendment Protocol
- Design decisions use [PENDING] / [COMMITTED] lifecycle markers
- /think writes [PENDING] amendments to CONTEXT.md Design Decisions
- /design builder filters out [PENDING] lines — only [COMMITTED] decisions affect builds
- /save or explicit user action flips [PENDING] → [COMMITTED]
- STATUS.md `drafts[]` tracks pending amendment descriptions

### Lifecycle Classification
- **overwrite** — latest write replaces previous content (most sections)
- **append-only** — entries are added, never removed or reordered (Design Decisions, sections_built)
- **prepend-only** — new entries go to position 0, oldest dropped at cap (STATUS.md sessions)
- **set-once** — written at scaffold time, never changed (identity fields)

### Section Ownership
- No skill "owns" a file exclusively — multiple skills read and write each file
- Ownership is at the **section level**, not file level
- See per-file schemas for section-level lifecycle rules

### Reference Type Marker
- Line 2 of LAYOUT.md, DESIGN.md, and INTERACTION.md contains `Reference: {type}`
- Valid values: `figma`, `prod-clone`, `discuss-only`
- Set by the pipeline that creates the section; read by builder for confidence calibration

### Required vs Optional
- Required fields MUST be present (may contain placeholder text like `_Not yet defined._`)
- Optional fields MAY be absent entirely
- See per-file schemas for field classifications

## Per-File Schemas

- @shared/references/artifact-schemas/CONTEXT.md
- @shared/references/artifact-schemas/LAYOUT.md
- @shared/references/artifact-schemas/DESIGN.md
- @shared/references/artifact-schemas/INTERACTION.md
- @shared/references/artifact-schemas/STATUS.md
