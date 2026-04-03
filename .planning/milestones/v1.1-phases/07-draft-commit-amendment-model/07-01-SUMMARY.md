---
phase: 07-draft-commit-amendment-model
plan: 01
subsystem: skills
tags: [discuss, amendments, pending, committed, blueprint, status-md]

# Dependency graph
requires:
  - phase: 06-ambient-activation-status-md-schema
    provides: STATUS.md schema with drafts: [] stub in YAML frontmatter
provides:
  - "[PENDING]/[COMMITTED] amendment lifecycle in discuss.md"
  - "Same-property update-in-place rule for amendments"
  - "STATUS.md drafts: management after each amendment write"
  - "Ready gate conditional diff display from pending amendments"
  - "Commit-all sequence on 'Let's build' (PENDING -> COMMITTED)"
  - "Mid-build flow integration with pending model"
affects:
  - builder — must skip [PENDING] lines, use only [COMMITTED] amendments
  - 07-02-PLAN (session-start surfacing of pending amendments)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "[PENDING]/[COMMITTED] prefix on amendment lines as inline state storage"
    - "Property-slug derived IDs for STATUS.md drafts: array (sidebar/width -> sidebar-width)"
    - "Same-property update-in-place: one entry per property, always the latest decision"
    - "Commit-all (never selective) at the Ready gate — all pending or none"

key-files:
  created: []
  modified:
    - ~/.claude/skills/watson/skills/discuss.md

key-decisions:
  - "Every new amendment prefixed [PENDING] — no bare amendments, no exceptions"
  - "Same-property amendments replace in place (regardless of PENDING or COMMITTED status)"
  - "STATUS.md drafts: array updated after each write using Edit tool, never Write"
  - "Commit-all sequence is all-or-nothing — no selective commit at the Ready gate"
  - "Mid-build flow leaves amendments as [PENDING]; commit-all only runs at main Ready gate"
  - "Builder skips [PENDING] lines — only [COMMITTED] amendments applied at build time"

patterns-established:
  - "Pending state: inline markers on amendment lines, not a separate tracking file"
  - "Diff-to-design-language translation at commit gate (human-readable, not raw syntax)"

requirements-completed:
  - DRFT-01
  - DRFT-02
  - DRFT-03

# Metrics
duration: 2min
completed: 2026-04-02
---

# Phase 7 Plan 01: Draft/Commit Amendment Model — discuss.md Update Summary

**[PENDING]/[COMMITTED] amendment lifecycle wired into discuss.md: every amendment starts pending, the Ready gate shows a design-language diff, and "Let's build" runs a commit-all sequence that locks all pending amendments before handing off to the builder.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-02T04:52:58Z
- **Completed:** 2026-04-02T04:54:53Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Every new amendment in discuss.md now carries a `[PENDING]` prefix — no bare amendments can be written
- Same-property update-in-place rule ensures one entry per property slug at all times
- STATUS.md `drafts:` array is updated after each amendment write using a slug derived from the property
- Ready gate conditionally shows a design-language diff (grouped by file) when `drafts:` is non-empty
- "Let's build" runs commit-all (replaces all `[PENDING]` with `[COMMITTED]`, clears `drafts:`) before returning `ready_for_build`
- "Just save decisions" explicitly leaves all amendments as `[PENDING]`
- Mid-build discuss flow integrated: both "Rebuild now" and "Save for later" leave amendments pending; commit-all only fires at the main Ready gate

## Task Commits

Each task was committed atomically:

1. **Task 1: Add [PENDING] amendment write logic and STATUS.md drafts management** - `269fb0c` (feat)
2. **Task 2: Extend Ready gate with diff display and commit-all sequence** - `871da8b` (feat)

**Plan metadata:** (pending — see final commit below)

## Files Created/Modified
- `~/.claude/skills/watson/skills/discuss.md` — Amendment write section updated with [PENDING] prefix, same-property update-in-place, STATUS.md drafts management; Ready gate extended with conditional diff + commit-all sequence; mid-build Dedup Contract section updated with pending model integration

## Decisions Made
- Commit-all is all-or-nothing — no selective commit UI at the Ready gate. To hold an amendment back, the user discusses it away before hitting the gate.
- STATUS.md `drafts:` array uses property-slug IDs (`sidebar-width`, `header-layout`) derived from the amendment property portion, replacing `/` with `-`
- Builder skips `[PENDING]` lines entirely — the pending/committed distinction is the safety boundary between "in discussion" and "ready to build"
- Mid-build flow ("Rebuild now") returns `ready_for_build` but WITHOUT committing pending amendments — builder uses only committed state from the last full Ready gate passage

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- discuss.md now fully implements the pending/committed lifecycle
- Plan 07-02 can implement session-start surfacing of pending amendments (reading STATUS.md `drafts:` array, showing the review screen, "Commit all / Discard all / Keep pending" options)
- Builder agent will need a plan to filter `[PENDING]` lines and apply only `[COMMITTED]` amendments

---
*Phase: 07-draft-commit-amendment-model*
*Completed: 2026-04-02*
