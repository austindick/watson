---
phase: 16-opt-in-activation-model
plan: "02"
subsystem: activation
tags: [watson, startup, fork-first, deferred-commit, batch-operations]

requires:
  - 16-01
provides:
  - Fork-first startup sequence: "New/Continue?" question before branch detection
  - Deferred scaffold commit: no git commit until first meaningful write
  - Batched branch-list operations: single bash invocation directive in watson-init
affects:
  - skills/core/SKILL.md startup flow (post-gate ordering)
  - skills/core/utilities/watson-init.md Branch Creation step 7

tech-stack:
  added: []
  patterns:
    - "Fork-first pattern: AskUserQuestion before any git branch detection"
    - "Deferred commit: scaffold files stay uncommitted until discuss/loupe/save-blueprint writes"
    - "Session recovery scoped to path: runs inside chosen fork branch, not before"

key-files:
  created: []
  modified:
    - skills/core/SKILL.md
    - skills/core/utilities/watson-init.md

key-decisions:
  - "Fork question (New/Continue?) comes before branch detection — branch list is not checked until user chooses Continue"
  - "Scaffold commit removed from Branch Creation step 7 — first commit is organic from first meaningful work"
  - "contributors.ts committed immediately as shared state exception (not scaffold)"
  - "Collaboration Fork section unchanged — its blueprint commit is intentional (not scaffold)"

patterns-established:
  - "Fork-before-detect: never run git branch --list before presenting the fork question"
  - "Deferred scaffold: Write blueprint files, do not git add/commit until discuss/loupe acts"

requirements-completed:
  - ACTV-03
  - ACTV-04
  - ACTV-05
  - ACTV-06

duration: 3min
completed: "2026-04-09"
---

# Phase 16 Plan 02: Startup Reorder — Fork First, Deferred Commit Summary

**Reordered Watson startup so "New or Continue?" is the first interactive question after the banner, session recovery moved inside each fork path, scaffold commit removed from Branch Creation (first commit now deferred to meaningful work), and branch-list operations batched into single bash invocation**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-09T13:22:21Z
- **Completed:** 2026-04-09T13:24:40Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `SKILL.md` activation flow reordered: standalone session recovery paragraph removed; fork question ("New/Continue?") now appears immediately after banner with no branch detection preceding it
- Session recovery moved inside Path A (step 1) and Path B (step 1) so it runs only in the context of the chosen path
- Path B note updated to state watson-init batches branch-list operations (branch list, STATUS.md reads, last commit dates) in a single bash invocation
- `watson-init.md` Branch Creation step 7 changed from `git add blueprint/ && git commit -m "watson: initialize..."` to a deferred-commit note — scaffold files stay uncommitted until discuss/loupe/save-blueprint writes
- contributors.ts exception documented: if a new contributor is added during Setup Flow, that commit happens immediately (shared state, not scaffold)
- Batch performance directive added to Branch List step 1 (ACTV-06)
- SKILL.md at 210 lines (under 215 budget)

## Task Commits

Each task was committed atomically:

1. **Task 1: Reorder SKILL.md startup sequence** - `e4f5a6e` (feat)
2. **Task 2: Remove scaffold commit from watson-init.md** - `b0441ba` (feat)

## Files Created/Modified

- `skills/core/SKILL.md` — Removed standalone session recovery; fork question now first; session recovery scoped to path A/B; batch directive for Path B
- `skills/core/utilities/watson-init.md` — Branch Creation step 7 deferred; contributors.ts exception added; batch note added to Branch List step 1

## Decisions Made

- Fork question comes before `git branch --list` — the branch list is only checked when the user chooses "Continue." This eliminates a git call on the "New" path entirely.
- Scaffold files remain uncommitted: the first `git add blueprint/` happens inside discuss, loupe, or save-blueprint when they write their first changes. This removes the 20-second empty-commit startup cost.
- Collaboration Fork section unchanged — its `git add blueprint/ && git commit` is a fork commit (intentional), not a scaffold commit. The plan's verification script had a false positive here; the structural requirement was correctly verified by scoping the check to Branch Creation only.

## Deviations from Plan

### Verification Script Adjustment

**Found during:** Task 2
**Issue:** The plan's automated check `!s.includes('git add blueprint/ && git commit -m')` returned a false positive because the Collaboration Fork section (explicitly preserved per plan) contains `git add blueprint/ && git commit -m "watson: fork..."`.
**Fix:** Verified the requirement by scoping the check to the Branch Creation section only. All four requirements (no scaffold commit, deferred note, contributors.ts exception, single bash batch) confirmed passing.
**Impact:** None — structural requirement met exactly as intended.

## Issues Encountered

None beyond the verification script false positive above.

## User Setup Required

None.

## Next Phase Readiness

- Watson startup now asks "New or Continue?" before any git operations.
- No more empty scaffold commit on new prototype creation — startup feels instant.
- Continue path branch-list operations directed to batch in single bash call.
- Phase 16 plan 02 complete. All ACTV-03 through ACTV-06 requirements satisfied.

---
*Phase: 16-opt-in-activation-model*
*Completed: 2026-04-09*
