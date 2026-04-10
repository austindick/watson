---
phase: 21-tech-debt-wiring-fixes
plan: 01
subsystem: plugin
tags: [plugin.json, watson-session-start, resume, slash-commands, session-lifecycle]

# Dependency graph
requires:
  - phase: 20-audit-gap-closure
    provides: audit identifying INT-01 through INT-04 integration wiring gaps
  - phase: 18-recovery-lifecycle-commands
    provides: resume.md subskill, plugin.json manifest, watson-session-start.js hook
provides:
  - resume.md registered as discoverable /watson:resume slash command
  - Start fresh handler invokes watson-init without undefined operation parameter
  - Decline marker cleaned at every session start (truly session-scoped)
  - Recovery notification directs users to /watson:resume for context-aware recovery
affects: [plugin-distribution, session-lifecycle, slash-command-discoverability]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Plugin commands array follows lifecycle order: status, resume, discuss, loupe"
    - "Session-start hook cleans ephemeral markers before any session logic runs"

key-files:
  created: []
  modified:
    - .claude-plugin/plugin.json
    - skills/core/skills/resume.md
    - scripts/watson-session-start.js

key-decisions:
  - "resume.md placed after status.md in commands array — lifecycle order (status, resume, discuss, loupe)"
  - "watson-init called without operation parameter for Start fresh — absence of parameter is the new-prototype path"
  - "Decline marker cleanup placed before session recovery check — clean state before any session logic"

patterns-established:
  - "Plugin commands array reflects user lifecycle order, not alphabetical"
  - "Session-start hook cleans all ephemeral markers at startup"

requirements-completed: [RESM-01, RESM-02, ACTV-02, SESS-01, SESS-02]

# Metrics
duration: 5min
completed: 2026-04-09
---

# Phase 21 Plan 01: Tech Debt Wiring Fixes Summary

**Four integration gaps (INT-01 to INT-04) closed: resume.md registered as slash command, Start fresh operation param removed, decline marker cleanup added, and recovery notification updated to /watson:resume**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-09T21:00:00Z
- **Completed:** 2026-04-09T21:05:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Registered `./skills/core/skills/resume.md` in plugin.json commands array so `/watson:resume` is discoverable as a standalone slash command (INT-01)
- Removed `operation: "new"` from the Start fresh handler in resume.md — watson-init treats absence of the parameter as the new-prototype path; passing `"new"` was undefined behavior (INT-02)
- Added `/tmp/watson-declined.json` cleanup at session start in watson-session-start.js so the "don't ask again" decline is truly session-scoped (INT-03)
- Updated recovery notification text from `/watson` to `/watson:resume` so users are directed to the context-aware recovery command (INT-04)

## Task Commits

Each task was committed atomically:

1. **Task 1: Register resume.md in plugin.json and fix Start fresh operation parameter** - `1ec93c6` (feat)
2. **Task 2: Add decline marker cleanup and fix recovery notification in watson-session-start.js** - `0449a80` (feat)

## Files Created/Modified

- `.claude-plugin/plugin.json` - Added resume.md to commands array (4 entries: status, resume, discuss, loupe)
- `skills/core/skills/resume.md` - Removed `operation: "new"` from Start fresh handler
- `scripts/watson-session-start.js` - Added decline marker cleanup block; updated recovery notification text

## Decisions Made

- Resume.md placed second in commands array (after status.md) — logical lifecycle order: status check, then resume, then discuss/loupe for new work
- Watson-init called with no parameters for Start fresh — the default path in watson-init handles new-prototype flow; `operation: "new"` was not a recognized value
- Decline marker cleanup inserted before the session recovery check — ensures all ephemeral markers are clean before session logic runs

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 4 INT gaps and 2 FLOW gaps from v1.3-MILESTONE-AUDIT.md are resolved
- FLOW-07 complete: /watson:resume is now a discoverable slash command and recovery notification points to it
- FLOW-08 complete: Decline marker is cleaned at every session start — truly session-scoped behavior
- v1.3 milestone can ship clean

---
*Phase: 21-tech-debt-wiring-fixes*
*Completed: 2026-04-09*
