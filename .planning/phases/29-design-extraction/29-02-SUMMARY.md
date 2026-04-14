---
phase: 29-design-extraction
plan: "02"
subsystem: skills
tags: [design, routing, core, loupe, dispatch, skill-extraction]

# Dependency graph
requires:
  - phase: 29-design-extraction/29-01
    provides: Standalone skills/design/SKILL.md as the dispatch target
  - phase: 28-think-skill/28-02
    provides: /think redirect pattern and routing update approach
provides:
  - Updated core SKILL.md dispatching @skills/design/SKILL.md (not loupe.md) in all 3 locations
  - /design shortcut redirect matching /think and /play pattern
  - Clean separation: zero @skills/loupe.md refs, zero @skills/discuss.md refs, zero circular refs
affects:
  - 30-design-hardening (core routing is now correct; hardening builds on skills/design/SKILL.md)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Standalone skill redirect pattern: /design → 'Building is handled by /design directly. Just type /design.' — consistent with /think and /play"
    - "All three loupe.md dispatch sites (Tier 2, ready_for_build, ready_for_hybrid_build) updated to @skills/design/SKILL.md"

key-files:
  created: []
  modified:
    - skills/core/SKILL.md

key-decisions:
  - "Core SKILL.md Constraints updated: 'Skills (/play, /think, /design, /save) contain all execution logic — agents are dispatched by skills, never by core SKILL.md' — removes subskill framing entirely"
  - "Colon variant note updated to flag /think:discuss and /design:loupe as legacy, with standalone skills as canonical entry points"

patterns-established:
  - "Standalone skill redirect: when plugin.json owns a command, core SKILL.md adds redirect-and-exit pattern matching /play, /think, /design"

requirements-completed: [DSGN-01, DSGN-03]

# Metrics
duration: 3min
completed: 2026-04-14
---

# Phase 29 Plan 02: Core Routing Update Summary

**All loupe.md dispatch sites in core SKILL.md replaced with @skills/design/SKILL.md, /design shortcut added as redirect-and-exit, zero circular or stale refs remain**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-14T13:56:40Z
- **Completed:** 2026-04-14T13:59:30Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Replaced all 3 `@skills/loupe.md` dispatches with `@skills/design/SKILL.md` in core SKILL.md
- Added `/design` shortcut redirect (consistent with /think and /play patterns)
- Updated "Before dispatching loupe:" to "Before dispatching /design:" in Tier 2 section
- Updated Red Flags table: "dispatch loupe" → "dispatch /design"
- Updated Constraints section: removed subskill framing, lists all 4 standalone skills
- Updated colon variants line to mark /design:loupe as legacy
- Task 2 verification: all 12 agents reachable, no circular refs, no discuss.md refs, plugin.json registered

## Task Commits

Each task was committed atomically:

1. **Task 1: Update core SKILL.md routing to dispatch /design skill** - `646c112` (feat)
2. **Task 2: Verify /design and core separation is clean** - no file changes needed (all checks passed)

**Plan metadata:** _(docs commit hash recorded after state update)_

## Files Created/Modified
- `skills/core/SKILL.md` - All loupe.md dispatch sites replaced with @skills/design/SKILL.md; /design redirect added; constraints updated (141 lines, under 165 limit)

## Decisions Made
- **Constraints section rewrite**: "Skills (/think, /design) and subskills (loupe.md) contain all execution logic" removed the subskill concept entirely. New wording: "Skills (/play, /think, /design, /save) contain all execution logic — agents are dispatched by skills, never by core SKILL.md." This is accurate now that all execution logic lives in standalone skills.
- **Red Flags table updated**: Both "dispatch loupe" references changed to "dispatch /design" — keeping the behavior intent intact while reflecting the correct dispatch target.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Core routing is complete: /design invocations reach skills/design/SKILL.md via both explicit shortcut and ambient Tier 2 dispatch
- Phase 30 hardening (convergent loop, page-container type, token enforcement, verification gate) can proceed directly against skills/design/SKILL.md
- All 12 agents reachable, plugin.json registered, no stale loupe/discuss references in either routing file

---
*Phase: 29-design-extraction*
*Completed: 2026-04-14*
