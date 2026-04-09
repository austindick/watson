---
phase: 19-standalone-commands-flexible-entry
plan: "02"
subsystem: ui
tags: [watson, skills, routing, blueprint, git-branch]

requires:
  - phase: 19-01
    provides: discuss.md and loupe.md with standalone Phase -1 preambles

provides:
  - watson-init.md Phase 0C direct-input mode for flexible continue (branch, URL, slug, path)
  - SKILL.md Path B flexible input detection routing to watson-init direct-input mode
  - SKILL.md colon-variant routing documentation (/watson:discuss, /watson:loupe bypass SKILL.md)

affects:
  - skills/core/utilities/watson-init.md
  - skills/core/SKILL.md
  - any future skills that invoke watson-init continue flows

tech-stack:
  added: []
  patterns:
    - "direct-input mode pattern: classify userInput (watson-branch, url, directory, slug, unknown) then resolve blueprintPath for each type"
    - "offerConversion: optional flag pattern for callers to request watson/* branch conversion offer"
    - "SKILL.md router pattern: space-variants (/watson discuss) go through SKILL.md; colon-variants (/watson:discuss) bypass it"

key-files:
  created: []
  modified:
    - skills/core/utilities/watson-init.md
    - skills/core/SKILL.md

key-decisions:
  - "direct-input mode added to watson-init as Phase 0C; placed between Phase 0B and Single-File Detection"
  - "SKILL.md Path B detects pasted flexible input vs bare Continue selection; routes to direct-input or branch-list accordingly"
  - "offerConversion: true passed from SKILL.md Path B so non-watson inputs get conversion offer in full /watson flow"
  - "Colon-variant routing (/watson:discuss, /watson:loupe) documented in SKILL.md Intent Classification as independent skill dispatch bypassing SKILL.md"

patterns-established:
  - "Flexible input classification: check watson-branch -> url -> directory -> slug -> unknown in order"
  - "Scaffold offer: when no blueprint found at user-specified location, ask before creating"

requirements-completed: [FLEX-01, FLEX-02, STND-01, STND-02]

duration: 2min
completed: 2026-04-09
---

# Phase 19 Plan 02: Flexible Continue and SKILL.md Router Routing Summary

**watson-init Phase 0C direct-input mode parses branch names, URLs, slugs, and directory paths; SKILL.md Path B routes pasted input through direct-input with conversion offer**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-09T17:03:34Z
- **Completed:** 2026-04-09T17:05:01Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added Phase 0C: Direct Input to watson-init.md — classifies userInput (watson-branch, url, directory, slug, unknown), resolves blueprintPath for each type, offers scaffold when no blueprint found, and offers watson/* conversion when offerConversion: true
- Added userInput and offerConversion parameters to watson-init Input table; operation field updated to document "direct-input" value
- Updated SKILL.md Path B to detect pasted flexible input alongside "Continue" selection and route to direct-input mode with offerConversion: true
- Added colon-variant routing note in Intent Classification section clarifying /watson:discuss and /watson:loupe bypass SKILL.md entirely
- SKILL.md remains at 214 lines (within 215-line budget)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add direct-input mode to watson-init.md** - `b60f512` (feat)
2. **Task 2: Refactor SKILL.md routing and add flexible continue** - `7d7bb24` (feat)

**Plan metadata:** (docs commit — see final commit hash after state update)

## Files Created/Modified
- `skills/core/utilities/watson-init.md` - Added Phase 0C direct-input section, userInput and offerConversion input parameters
- `skills/core/SKILL.md` - Updated Path B with flexible input detection, added colon-variant routing note

## Decisions Made
- Placed Phase 0C after Phase 0B and before Single-File Detection to follow the existing phase ordering pattern
- Used ordered classification (watson-branch → url → directory → slug → unknown) to avoid ambiguity when input could match multiple types
- offerConversion is caller-controlled (not default true) so direct-input mode can be invoked from non-SKILL.md callers without forcing conversion prompts
- Colon-variants documented in SKILL.md but not handled by it — clarifies the routing contract to future maintainers

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 19 is now complete (both plans executed)
- watson-init supports all four flexible input types for continue
- SKILL.md is the lightweight router it was designed to be
- discuss.md and loupe.md operate as both standalone skills and SKILL.md-dispatched subskills

---
*Phase: 19-standalone-commands-flexible-entry*
*Completed: 2026-04-09*
