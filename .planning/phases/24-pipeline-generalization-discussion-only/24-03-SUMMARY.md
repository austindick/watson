---
phase: 24-pipeline-generalization-discussion-only
plan: "03"
subsystem: ui
tags: [watson, SKILL.md, routing, intent-marker, reference-header, builder, consolidator, prod-clone, discuss-only]

# Dependency graph
requires:
  - phase: 24-pipeline-generalization-discussion-only
    plan: "01"
    provides: loupe.md 3-mode entry with mode parameter and experienceName input contract
  - phase: 24-pipeline-generalization-discussion-only
    plan: "02"
    provides: discuss.md ready_for_hybrid_build return status with surfaceName

provides:
  - SKILL.md Tier 2 classification for experience name references (mode='prod-clone')
  - SKILL.md Tier 2 loupe dispatch with mode and experienceName parameters
  - SKILL.md Discuss-Loupe Chain handling all four return statuses including ready_for_hybrid_build
  - Reference: intent marker header in all three artifact schemas (LAYOUT, DESIGN, INTERACTION)
  - builder.md behavioral note for discuss-only library-defaults-first behavior
  - consolidator.md behavioral note for per-section Reference: marker preservation in mixed-mode builds

affects:
  - skills/core/skills/loupe.md (consumes mode and experienceName from SKILL.md dispatch)
  - skills/core/agents/builder.md (reads Reference: header from per-section artifacts)
  - skills/core/agents/consolidator.md (preserves Reference: markers during blueprint merge)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Intent marker pattern: Reference: header as second line of artifact files signals pipeline origin (figma | prod-clone | discuss-only)"
    - "Library-defaults-first: when Reference: discuss-only, builder uses Slate library defaults for unspecified values without asking"
    - "Per-section reference preservation: consolidator keeps each section's Reference: marker rather than flattening to a global value"
    - "Mode parameter forwarding: SKILL.md detects Figma URL or experience name reference and passes mode to loupe dispatch"

key-files:
  created: []
  modified:
    - skills/core/SKILL.md
    - skills/core/references/artifact-schemas/LAYOUT-EXAMPLE.md
    - skills/core/references/artifact-schemas/DESIGN-EXAMPLE.md
    - skills/core/references/artifact-schemas/INTERACTION-EXAMPLE.md
    - skills/core/agents/builder.md
    - skills/core/agents/consolidator.md

key-decisions:
  - "SKILL.md Discuss-Loupe Chain JSON schema block removed during compression to stay within 215-line budget; status cases are self-documenting"
  - "discussion_only case text compressed from full sentence to 'Decisions saved. When ready to build, say /watson.' — preserves intent, saves 1 line"
  - "SKILL.md at 204 lines (budget: 215) — 11 lines of headroom for future additions"

patterns-established:
  - "Reference: header: always second line of artifact, before any ## section — agents navigate by ## headers so placement is safe"
  - "Behavioral note placement: Reference: reading note goes in Step 1 (where spec files are loaded) — correct agent lifecycle hook"

requirements-completed: [DISC-03, DISC-04]

# Metrics
duration: 5min
completed: 2026-04-11
---

# Phase 24 Plan 03: SKILL.md Routing Extension and Reference: Intent Marker System Summary

**SKILL.md completes 3-mode routing (experience references → Tier 2 prod-clone, ready_for_hybrid_build chain), and Reference: intent markers land in all artifact schemas with builder and consolidator behavioral notes**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-11T03:25:00Z
- **Completed:** 2026-04-11T03:30:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Extended SKILL.md Tier 2 Defaults to classify experience name references ("build from [name]", "clone [name]") as Tier 2 with mode='prod-clone'
- Updated Tier 2 loupe dispatch to include mode and experienceName parameters per the loupe.md Phase -1 contract from Plan 01
- Added ready_for_hybrid_build as a handled status in the Discuss-Loupe Chain (dispatches loupe with mode='prod-clone', surfaceName, sections[] from discuss return)
- SKILL.md compressed from 214 lines to 204 lines — 11 lines of headroom without losing any functional content
- Added Reference: figma header (with values comment) as the second line of all three artifact schemas
- Added Reference: header reading behavioral note to builder.md Step 1 (discuss-only triggers library-defaults-first, figma/prod-clone proceeds normally)
- Added Reference: marker preservation behavioral note to consolidator.md Step 1 (mixed-mode builds keep per-section markers intact)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend SKILL.md with Tier 2 experience references, mode parameter, and ready_for_hybrid_build chain** - `7cfca1b` (feat)
2. **Task 2: Add Reference: header to artifact schemas and behavioral notes to builder and consolidator** - `023f153` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `skills/core/SKILL.md` — Tier 2 Defaults + experience reference classification, Tier 2 dispatch mode/experienceName params, Discuss-Loupe Chain ready_for_hybrid_build case; compressed from 214 to 204 lines
- `skills/core/references/artifact-schemas/LAYOUT-EXAMPLE.md` — Reference: figma header added as second line
- `skills/core/references/artifact-schemas/DESIGN-EXAMPLE.md` — Reference: figma header added as second line
- `skills/core/references/artifact-schemas/INTERACTION-EXAMPLE.md` — Reference: figma header added as second line
- `skills/core/agents/builder.md` — Reference: header reading behavioral note in Step 1
- `skills/core/agents/consolidator.md` — Reference: marker preservation behavioral note in Step 1

## Decisions Made

- SKILL.md JSON return schema block removed from Discuss-Loupe Chain during line-budget compression — the status case bullets are self-documenting; schema lives in discuss.md which is authoritative for return contract
- discussion_only case text shortened ("Decisions saved. When ready to build, say /watson.") — preserves the key user-facing message while saving a line
- ready_for_build case text shortened ("Building now.") — brevity appropriate for a transitional confirmation, matching the compressed style of the chain

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- SKILL.md now handles all three pipeline modes and all four discuss return statuses — routing layer is complete
- Reference: intent marker system is established across all artifact schemas; Figma agents (layout.md, design.md, interaction.md) will naturally write Reference: figma when they encounter the schema; source agents (source-layout.md, source-design.md, source-interaction.md) will write Reference: prod-clone; discuss agents write Reference: discuss-only
- Phase 24 is complete — all three plans (01 loupe, 02 discuss, 03 SKILL.md/schemas) form a coherent pipeline generalization for discussion-only and hybrid builds

---
*Phase: 24-pipeline-generalization-discussion-only*
*Completed: 2026-04-11*
