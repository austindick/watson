---
phase: 07-draft-commit-amendment-model
plan: 02
subsystem: skills
tags: [watson, skill, builder, amendments, pending, committed, session-start, build-warning]

# Dependency graph
requires:
  - phase: 07-draft-commit-amendment-model plan 01
    provides: "[PENDING]/[COMMITTED] amendment lifecycle in discuss.md; STATUS.md drafts: tracking"
provides:
  - "Session-start surfacing of pending amendments in SKILL.md returning-prototype flow"
  - "Review pending amendments action with Commit all / Discard all / Keep pending options"
  - "Soft build warning at Tier 2 dispatch (once per session via pendingWarningShown flag)"
  - "[COMMITTED]-only amendment filter in builder.md"
  - "Backwards compat for pre-Phase-7 unmarked amendment lines"
affects:
  - builder — now filters [PENDING] lines; only [COMMITTED] and unmarked amendments applied
  - loupe — routes through SKILL.md Tier 2 soft warning gate before dispatch

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Session-start pending count surfacing via STATUS.md drafts: array parse"
    - "pendingWarningShown flag in /tmp/watson-active.json prevents repeat soft build warning"
    - "Amendment filter: [COMMITTED] applied, [PENDING] skipped, unmarked treated as committed"

key-files:
  created: []
  modified:
    - ~/.claude/skills/watson/SKILL.md
    - ~/.claude/skills/watson/agents/builder.md

key-decisions:
  - "Soft build warning fires once per session — pendingWarningShown persists in /tmp/watson-active.json for session lifetime"
  - "Review pending amendments choice appears only when drafts: non-empty — conditional display avoids noise on clean sessions"
  - "Backwards compat: pre-Phase-7 unmarked amendment lines treated as committed — no migration needed"
  - "Commit-all from Review screen uses same sequence as discuss.md Ready gate — single authoritative pattern"

patterns-established:
  - "SKILL.md line budget: 167 -> 179 lines (21 lines of buffer remaining for Phase 8)"
  - "Amendment filter rule documented in Critical Constraints — builder.md constraint 8"

requirements_completed: [DRFT-01, DRFT-02, DRFT-03]

# Metrics
duration: 5min
completed: 2026-04-02
---

# Phase 7 Plan 02: Draft/Commit Amendment Model — SKILL.md + builder.md Summary

**Session-start pending amendment surfacing and [COMMITTED]-only builder filter complete the draft/commit lifecycle: pending amendments are visible every session, reviewable with commit/discard options, and excluded from builds until committed.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-02T05:00:00Z
- **Completed:** 2026-04-02T05:05:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- SKILL.md returning-prototype flow now shows `[M] pending amendment(s)` in the summary line and adds "Review pending amendments" as a fourth choice when `drafts:` is non-empty
- "Review pending amendments" handler assembles a design-language diff and offers Commit all / Discard all / Keep pending — same diff format as the discuss.md commit gate
- Soft build warning at Tier 2 dispatch fires once per session via `pendingWarningShown` flag in `/tmp/watson-active.json`
- builder.md Step 1 extended with amendment filter: `[COMMITTED]` lines applied, `[PENDING]` lines skipped, unmarked lines (pre-Phase-7) treated as committed
- Critical Constraint 8 added to builder.md formalizing the filter rule

## Task Commits

Each task was committed atomically:

1. **Task 1: Add session-start pending surfacing and soft build warning to SKILL.md** - `3abb725` (feat)
2. **Task 2: Add [COMMITTED]-only amendment filter to builder.md** - `c9cdf3e` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified
- `~/.claude/skills/watson/SKILL.md` — Returning-prototype flow updated with conditional pending count + Review choice; soft build warning added to Tier 2 dispatch block
- `~/.claude/skills/watson/agents/builder.md` — Amendment filter step added after Step 1; Critical Constraint 8 added

## Decisions Made
- Soft build warning fires once per session using `pendingWarningShown: true` in `/tmp/watson-active.json`, avoiding repeated interruptions when the user builds multiple sections in one session
- The Review pending amendments handler reuses the same commit-all sequence as the discuss.md Ready gate — one authoritative pattern, no divergence
- Backwards compat for pre-Phase-7 prototypes: unmarked amendment lines are treated as committed, avoiding any forced migration

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Draft/commit amendment lifecycle is fully implemented across discuss.md (Plan 01), SKILL.md, and builder.md (Plan 02)
- DRFT-01 through DRFT-04 requirements all covered
- SKILL.md at 179 lines (21 lines of buffer for Phase 8 additions)
- Phase 8 can proceed with the pending/committed model as a stable foundation

---
*Phase: 07-draft-commit-amendment-model*
*Completed: 2026-04-02*
