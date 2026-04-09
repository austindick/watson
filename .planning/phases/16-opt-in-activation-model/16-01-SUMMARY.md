---
phase: 16-opt-in-activation-model
plan: "01"
subsystem: activation
tags: [watson, opt-in, gate, ambient-rule, session]

requires: []
provides:
  - Opt-in gate in SKILL.md that blocks description-match activations behind AskUserQuestion
  - Session-scoped decline marker via /tmp/watson-declined.json
  - watson-session-start.js removes ~/.claude/rules/watson-ambient.md on upgrade
affects:
  - Any future changes to SKILL.md routing or activation model
  - Phase 16 plan 02 (if it builds on activation model)

tech-stack:
  added: []
  patterns:
    - "Gate-first pattern: check explicit invocation, then decline marker, then prompt — before any activation logic"
    - "Session-scoped decline: /tmp/ file persists for session lifetime, cleared on /clear"

key-files:
  created: []
  modified:
    - skills/core/SKILL.md
    - scripts/watson-session-start.js

key-decisions:
  - "Gate uses /tmp/watson-declined.json as session-scoped decline marker (not persistent)"
  - "Tier 0 passthrough narrowed to active-session-only; gate now handles ambient suppression"
  - "Red Flags table compacted (not removed) to maintain line budget under 215"

patterns-established:
  - "Gate-before-activation: SKILL.md gate runs before session toggle, state file write, and recovery"

requirements-completed:
  - ACTV-01
  - ACTV-02

duration: 2min
completed: "2026-04-09"
---

# Phase 16 Plan 01: Opt-in Activation Model Summary

**AskUserQuestion gate added to SKILL.md: description-match activations prompt "Want Watson's help?", explicit /watson bypasses, decline writes /tmp/watson-declined.json; watson-session-start.js removes old watson-ambient.md on upgrade**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-09T13:18:41Z
- **Completed:** 2026-04-09T13:20:41Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Gate logic added at top of SKILL.md before all routing — explicit /watson bypasses, decline marker exits silently, all other activations show AskUserQuestion with three options
- "No, don't ask again this session" writes /tmp/watson-declined.json to suppress future description-match prompts for the session
- watson-session-start.js now removes ~/.claude/rules/watson-ambient.md on upgrade with user notification; falls back gracefully on permission errors
- Tier 0 passthrough narrowed to "active session only" since gate now handles ambient suppression
- File stays at 213 lines (under 215 limit) via Red Flags table compaction

## Task Commits

Each task was committed atomically:

1. **Task 1: Update watson-session-start.js to remove old ambient rule** - `0a694e3` (feat)
2. **Task 2: Add description-match gate to SKILL.md** - `20ed956` (feat)

## Files Created/Modified

- `skills/core/SKILL.md` - Added opt-in gate at top, narrowed Tier 0, compacted Red Flags
- `scripts/watson-session-start.js` - Added ambient rule removal with try/catch, kept recovery check

## Decisions Made

- Gate uses /tmp/watson-declined.json as session-scoped decline marker — not a persistent user preference, clears on /clear. Keeps the model simple for v1.
- Tier 0 passthrough description updated to "active session only" since the gate (not Tier 0) now guards against unwanted activation at description-match time.
- Red Flags table prose was shortened (not rows removed) to stay within the 215-line budget.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Opt-in gate is live. Watson will never auto-activate without user confirmation.
- Existing installs with watson-ambient.md get cleaned up automatically on next session start.
- /watson explicit invocation still works exactly as before — gate is bypass-transparent.

---
*Phase: 16-opt-in-activation-model*
*Completed: 2026-04-09*
