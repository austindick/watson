---
phase: 28-think-skill
plan: "02"
subsystem: ui
tags: [skill, design-toolkit, routing, think, core]

requires:
  - phase: 28-think-skill/28-01
    provides: "/think SKILL.md standalone skill with @references/ pattern and return status schema"
  - phase: 27-play-skill
    provides: "/play redirect pattern, core SKILL.md read-only state check"

provides:
  - "Updated skills/core/SKILL.md — /think redirect, Tier 1 dispatches @skills/think/SKILL.md, Discuss->Build Chain updated"

affects: [29-design-skill, 30-design-hardening, 31-save-skill]

tech-stack:
  added: []
  patterns:
    - "Redirect pattern applied consistently: /think and /play both redirect at shortcut level with identical phrasing"
    - "Skill routing: core SKILL.md dispatches standalone skill files (@skills/think/SKILL.md), not subskill .md files"

key-files:
  created: []
  modified:
    - skills/core/SKILL.md

key-decisions:
  - "Redirect phrasing mirrors /play exactly: 'Design thinking is handled by /think directly. Just type /think.' — consistency signals intent"
  - "All 'discuss' routing terminology updated to '/think' — no lingering discuss subskill references in ambient routing layer"
  - "Red Flags table updated to reference /think not discuss — ensures agents route to correct skill when reading self-correction hints"

patterns-established:
  - "Skill redirect pattern: explicit /skill shortcuts in core SKILL.md redirect at shortcut level, never dispatch inline"

requirements-completed: [THINK-01, THINK-05]

duration: 4min
completed: "2026-04-14"
---

# Phase 28 Plan 02: Core Routing Update Summary

**core SKILL.md /think redirect wired and Tier 1 dispatch updated from @skills/discuss.md to @skills/think/SKILL.md — extraction complete**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-14T13:24:44Z
- **Completed:** 2026-04-14T13:27:44Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Updated /think shortcut to redirect pattern (same phrasing as /play) — explicit invocations now exit core immediately
- Changed Tier 1 dispatch from `@skills/discuss.md` to `@skills/think/SKILL.md` — ambient routing now flows through standalone skill
- Updated Discuss -> Build Chain header and all "discuss" terminology throughout — no lingering discuss references in routing layer
- Verified clean separation: no circular refs, no @skills/discuss.md, all reference files present, status schema intact in both directions

## Task Commits

1. **Task 1: Update core SKILL.md routing to dispatch /think** - `28de7c8` (feat)
2. **Task 2: Verify /think and core separation is clean** - verification only, no files changed

**Plan metadata:** _(added with this commit)_

## Files Created/Modified

- `skills/core/SKILL.md` — Updated routing: /think redirect, Tier 1 (think) dispatch to @skills/think/SKILL.md, Discuss->Build Chain, Red Flags table, Constraints section

## Decisions Made

- Redirect phrasing mirrors /play exactly: "Design thinking is handled by /think directly. Just type /think." — consistent redirect language signals a deliberate plugin-level pattern
- All "discuss" references in user-facing routing guidance updated to "/think" — ensures the ambient skill routes to the correct skill and agents reading Red Flags get accurate self-correction hints
- Red Flags rows updated: "route to discuss" → "route to /think", "discuss subskill handles all design exploration" → "/think skill handles all design exploration"

## Deviations from Plan

None — plan executed exactly as written. All 11 listed changes applied cleanly. Task 2 found no issues requiring fixes.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- /think extraction is complete: standalone skill created (Phase 28-01) and core routing updated (Phase 28-02)
- Phase 29 (design-skill extraction) can proceed: the @references/ pattern and core routing update pattern are both established
- discuss.md remains in skills/core/skills/ as legacy — can be cleaned up in Phase 29 or a future cleanup task

---
*Phase: 28-think-skill*
*Completed: 2026-04-14*
