---
phase: 19-standalone-commands-flexible-entry
plan: "03"
subsystem: ui
tags: [loupe, watson-init, standalone, flexible-entry, branch-search, uat-gaps]

# Dependency graph
requires:
  - phase: 19-01
    provides: Phase -1 standalone preambles for discuss and loupe; standalone detection pattern
  - phase: 19-02
    provides: Phase 0C direct-input mode in watson-init; SKILL.md flexible continue routing
provides:
  - loupe.md Phase -1 Step 5 auto-derives targetFilePath from blueprintPath (eliminates "where to write?" prompt)
  - watson-init.md url and slug handlers search all local branches before filesystem (resolves prototype/* and other non-watson/* naming)
  - watson-init.md branch-list health check uses AskUserQuestion with concrete scaffold options
affects: [loupe, watson-init, standalone-commands, flexible-entry]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "targetFilePath derivation: strip /blueprint from blueprintPath to get protoDir, then probe index.tsx > sole .tsx > STATUS.md > null"
    - "Branch search before filesystem: git branch --list '*${slug}*' before find src/pages/ in url and slug handlers"
    - "Explicit AskUserQuestion for scaffold offers: matching the Phase 0C directory handler pattern for consistency"

key-files:
  created: []
  modified:
    - skills/core/skills/loupe.md
    - skills/core/utilities/watson-init.md

key-decisions:
  - "targetFilePath auto-resolved in Phase -1 via protoDir probe (index.tsx -> sole .tsx -> STATUS.md -> null); Phase 3 consumes it if set"
  - "Branch search in url/slug handlers is unrestricted (all branches, not just watson/*) enabling prototype/* and other naming conventions"
  - "Health check scaffold offer uses AskUserQuestion with Yes/Cancel — no vague 'offer to re-scaffold' language"

patterns-established:
  - "Scaffold offer pattern: always use AskUserQuestion with explicit options, never vague text — matches Phase 0C directory handler"
  - "Branch search pattern: search all local branches before filesystem; single match auto-selects, multiple match presents picker"

requirements-completed: [STND-02, FLEX-01, FLEX-02]

# Metrics
duration: 2min
completed: 2026-04-09
---

# Phase 19 Plan 03: UAT Gap Closure Summary

**loupe targetFilePath auto-resolved from blueprintPath in standalone mode, all-branch search added to watson-init url/slug handlers, and branch-list health check upgraded to explicit AskUserQuestion scaffold offer**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-09T20:10:49Z
- **Completed:** 2026-04-09T20:12:03Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- loupe.md Phase -1 Step 5 now derives `targetFilePath` from `blueprintPath` automatically — protoDir probe eliminates the "Where should I write the code?" ask during standalone loupe
- loupe.md Phase 3 Resolve targetFilePath now documents the Phase -1 standalone path as the first priority check
- watson-init.md url and slug handlers search ALL local git branches (not just watson/*) before falling to filesystem — resolves Playground URLs pointing to prototype/* or other non-watson/* branches
- watson-init.md branch-list health check upgraded from vague prose to explicit AskUserQuestion with "Yes, create blueprint" / "Cancel" options and concrete scaffold follow-through

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix loupe standalone targetFilePath and watson-init URL/slug branch search** - `4d7dbaa` (feat)
2. **Task 2: Fix watson-init branch-list health check scaffold offer** - `e295758` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `skills/core/skills/loupe.md` - Added targetFilePath derivation in Phase -1 Step 5; updated Phase 3 Resolve targetFilePath to check Phase -1 result first
- `skills/core/utilities/watson-init.md` - Expanded url and slug handlers with branch search; upgraded branch-list health check to AskUserQuestion

## Decisions Made
- targetFilePath derivation order: index.tsx > sole .tsx in protoDir > STATUS.md recorded target > null (Phase 3 fallback)
- Branch search is unrestricted (`git branch --list "*${slug}*"`) so prototype/* and other naming conventions resolve without configuration
- Scaffold AskUserQuestion matches the Phase 0C directory handler pattern exactly — consistent UX across all entry points

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 3 UAT gaps closed: standalone loupe targetFilePath, Playground URL branch search, branch-list scaffold offer
- Phase 19 can now ship — these were the last blocking issues before Phase 19 is complete
- No blockers or concerns

---
*Phase: 19-standalone-commands-flexible-entry*
*Completed: 2026-04-09*
