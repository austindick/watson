---
phase: 17-save-blueprint-command
plan: "01"
subsystem: ui
tags: [watson, subskill, blueprint, save, gap-analysis, discuss]

# Dependency graph
requires:
  - phase: 16-opt-in-activation-model
    provides: gate logic, session state (/tmp/watson-active.json), fork-first startup
  - phase: 13-plugin-foundation
    provides: plugin structure, skills/core/ layout, @-dispatch reference pattern
provides:
  - save-blueprint subskill instruction set (skills/core/skills/save-blueprint.md)
  - [INFERRED] marker system for uncertain extracted decisions
  - Non-Watson session handling: convert-to-watson and save-in-place paths
  - Discuss bridge with abbreviated flow for gap resolution
affects:
  - phase 18 and beyond (any plan that references /watson:save-blueprint)
  - Phase 19 FLEX-02 (save-in-place discoverability)
  - skills/core/SKILL.md (save-blueprint registered as new subskill command)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single-pass subskill: runs in conversation context to access full session history — not dispatched to agents"
    - "[INFERRED] marker parallel to [PENDING]/[COMMITTED] lifecycle in blueprint files"
    - "Discuss bridge: dispatch @skills/discuss.md from save-blueprint with abbreviated flow (skip Phase 2 and core questions for populated sections)"

key-files:
  created:
    - skills/core/skills/save-blueprint.md
  modified: []

key-decisions:
  - "save-blueprint runs as single-pass analysis (not agent dispatch) because full conversation context is required"
  - "[INFERRED] markers are the persistent record of uncertain decisions — removed on user confirmation during discuss bridge, no [CONFIRMED] marker added"
  - "Watson stays inactive after save-blueprint completes on non-Watson path — no /tmp/watson-active.json written"
  - "Discuss bridge always returns to save-blueprint, never chains to loupe"
  - "Blueprint commit happens before showing summary — commit is the durable record, summary is a view"

patterns-established:
  - "Phase 0B non-Watson path: ask save location before extraction (avoids doing work then asking where to put it)"
  - "Three-source extraction: conversation + built code + git state, each classified as Confirmed or Inferred"
  - "Two-group gap summary: 'context I captured' vs 'design decisions I see' — user-facing language, not file names"

requirements-completed: [SAVE-01, SAVE-02, SAVE-03, SAVE-04]

# Metrics
duration: 12min
completed: 2026-04-09
---

# Phase 17 Plan 01: Save Blueprint Subskill Summary

**save-blueprint subskill with three-source extraction, [INFERRED] markers, gap analysis, discuss bridge, and non-Watson session handling across convert-to-watson and save-in-place paths**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-09T14:35:00Z
- **Completed:** 2026-04-09T14:47:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created `skills/core/skills/save-blueprint.md` — complete subskill instruction set for `/watson:save-blueprint`
- Implemented three-source context extraction (conversation, built code, git state) with confidence classification
- Documented gap analysis with two user-facing groups and four gap types
- Discuss bridge dispatches `@skills/discuss.md` with abbreviated flow, always returns to save-blueprint
- Non-Watson session handling: convert-to-watson (via watson-init) and save-in-place (auto-detect or ask) paths

## Task Commits

Each task was committed atomically:

1. **Task 1: Create save-blueprint.md subskill** - `5f05f64` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `skills/core/skills/save-blueprint.md` — Complete save-blueprint subskill: Phases 0-4, constraints, red flags (248 lines)

## Decisions Made
- save-blueprint runs as single-pass in the skill file (not agent-dispatched) because conversation history is only accessible to the active Claude context
- `[INFERRED]` markers are self-contained — removed inline when user confirms during discuss bridge; no separate confirmation marker added
- Watson stays inactive after non-Watson path completion — /tmp/watson-active.json is never written by save-blueprint
- Discuss bridge intercepts the return from discuss and does not chain to loupe — always stays in save-blueprint's flow with an inline note pointing to `/watson loupe`

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- `save-blueprint` subskill is complete and self-contained
- SKILL.md routing can register `/watson:save-blueprint` as an explicit command shortcut (not yet done — no plan covers this; save-blueprint is invocable directly as a subskill file)
- Phase 19 FLEX-02 closes the save-in-place discoverability gap noted in context

---
*Phase: 17-save-blueprint-command*
*Completed: 2026-04-09*
