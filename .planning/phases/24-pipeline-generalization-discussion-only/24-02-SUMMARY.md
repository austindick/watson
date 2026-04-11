---
phase: 24-pipeline-generalization-discussion-only
plan: "02"
subsystem: ui
tags: [discuss, describeOnly, hybrid-detection, codebase-map, ready_for_hybrid_build]

# Dependency graph
requires:
  - phase: 24-pipeline-generalization-discussion-only
    provides: CONTEXT.md with locked decisions for describeOnly and hybrid build patterns
  - phase: 22-codebase-map-library-book
    provides: codebase-map BOOK.md and CHAPTER.md structure with surface name tables

provides:
  - discuss.md Inputs section with describeOnly flag documented
  - describeOnly mode adaptive depth behavior (clearly-simple/ambiguous/clearly-complex paths)
  - Phase 0 conditional codebase-map loading for hybrid surface detection
  - Hybrid detection subsection in Discuss-Only Build Path with AskUserQuestion confirmation
  - ready_for_hybrid_build return status with surfaceName and discuss-only sections schema

affects:
  - loupe.md (consumes ready_for_hybrid_build status, dispatches surface-resolver with surfaceName)
  - SKILL.md (reads ready_for_hybrid_build, dispatches loupe with mode=prod-clone)
  - surface-resolver (receives surfaceName from loupe after hybrid detection)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - describeOnly flag pattern for loupe-dispatched discuss without prior session
    - Confirmatory AskUserQuestion for hybrid surface detection (not auto-switching)
    - Status-only return from discuss (never dispatches agents, loupe routes from there)
    - Conditional book loading gated on input flag

key-files:
  created: []
  modified:
    - skills/core/skills/discuss.md

key-decisions:
  - "In describeOnly mode, clearly-simple tier still runs Discuss-Only Build Path (writes LAYOUT.md + DESIGN.md) before returning ready_for_build — the skip is conversational questions only, not artifact writing"
  - "Hybrid detection triggers a confirmatory AskUserQuestion (not automatic mode switching) using Looks-like language"
  - "ready_for_hybrid_build sections[] contains only discuss-only sections; prod-clone base sections resolved by surface-resolver in loupe"
  - "describeOnly abbreviated discussion uses Phases 5-6 only (no Pattern Research) for ambiguous and clearly-complex tiers"

patterns-established:
  - "Input flag gating: conditional book loading and mode behavior gated on describeOnly boolean"
  - "Status-only handoff: discuss never dispatches agents regardless of mode; always returns status to orchestrator"
  - "Confirmatory surface detection: candidate match requires user confirmation via AskUserQuestion before hybrid triggers"

requirements-completed: [DISC-01, DISC-02]

# Metrics
duration: 2min
completed: 2026-04-11
---

# Phase 24 Plan 02: Discuss describeOnly Mode and Hybrid Detection Summary

**discuss.md extended with describeOnly flag enabling adaptive-depth direct-from-loupe builds, codebase-map hybrid surface detection, and ready_for_hybrid_build return status**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-11T03:20:40Z
- **Completed:** 2026-04-11T03:22:39Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Added Inputs section to discuss.md documenting describeOnly parameter with full mode behavior table
- Extended Phase 0 with conditional codebase-map loading (describeOnly mode only) for hybrid surface detection
- Extended Phase 2 Complexity Scaling with describeOnly-specific behavior for all three tiers, including the critical pitfall guard (clearly-simple still writes artifacts before returning ready_for_build)
- Added Hybrid detection subsection to Discuss-Only Build Path: surface name index scan, confirmatory AskUserQuestion, and ready_for_hybrid_build path
- Extended Loupe Handoff Return Status with ready_for_hybrid_build status value, JSON schema example, and surfaceName field documentation

## Task Commits

Each task was committed atomically:

1. **Task 1: Add describeOnly input, conditional codebase-map loading, and adaptive depth behavior** - `f1b642d` (feat)
2. **Task 2: Add hybrid detection and ready_for_hybrid_build return status** - `b845857` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `skills/core/skills/discuss.md` - Added Inputs section, Phase 0 conditional codebase-map loading, Phase 2 describeOnly tiers, Hybrid detection subsection, ready_for_hybrid_build status and schema

## Decisions Made

- In describeOnly mode, "clearly simple" tier still runs Discuss-Only Build Path before returning ready_for_build — preserves DISC-02 requirement that artifacts are always written
- Abbreviated discussion for ambiguous/clearly-complex tiers in describeOnly: Phases 5-6 only, no Pattern Research — keeps the path lean while still covering core design questions
- Hybrid detection is confirmatory (AskUserQuestion with "Looks like you want to build on...") rather than automatic — prevents silent mode switching per Pitfall 3 from research
- sections[] in ready_for_hybrid_build contains only discuss-only sections; loupe routes prod-clone base sections to surface-resolver separately

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- discuss.md now supports describeOnly mode and returns ready_for_hybrid_build
- Plan 24-01 (loupe.md multi-mode entry) is a sibling plan in this phase; together they implement the full discussion-only and hybrid build pipeline
- SKILL.md hybrid chain (reading ready_for_hybrid_build and dispatching loupe with mode=prod-clone + surfaceName) is addressed in plan 24-03 if scoped there, or already covered in the SKILL.md dispatch logic

---
*Phase: 24-pipeline-generalization-discussion-only*
*Completed: 2026-04-11*
