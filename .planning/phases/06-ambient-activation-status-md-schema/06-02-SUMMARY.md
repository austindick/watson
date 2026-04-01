---
phase: 06-ambient-activation-status-md-schema
plan: 02
subsystem: ui
tags: [watson, skill, ambient-activation, session-toggle, claude-code, hooks]

requires:
  - phase: 06-ambient-activation-status-md-schema
    provides: "06-01 — STATUS.md canonical schema reference artifact"

provides:
  - "Path-specific ambient rule at ~/.claude/rules/watson-ambient.md that suggests /watson in Playground context"
  - "SKILL.md session toggle model: /watson activates, /watson off deactivates, state file lifecycle"
  - "settings.json SessionEnd hook cleans up /tmp/watson-active.json on session end"
  - "settings.json SessionStart hook notifies user if Watson was active before /clear"
  - "Status line shows Watson: ON when /tmp/watson-active.json exists"

affects: [watson-skill, ambient-activation, prototype-playground, session-state]

tech-stack:
  added: []
  patterns:
    - "Path-specific rule file in ~/.claude/rules/ for Playground-context ambient suggestions without SKILL.md paths: field"
    - "State file at /tmp/watson-active.json as session-level toggle signal (written on load, deleted on off/SessionEnd)"
    - "Status line injection via existing share-proto-statusline.js Watson check"

key-files:
  created:
    - "~/.claude/rules/watson-ambient.md — path-specific rule suggesting /watson in src/pages/**"
  modified:
    - "~/.claude/skills/watson/SKILL.md — session toggle model, Routing section, /watson off, state file write, welcome message, v1.2.0"
    - "~/.claude/settings.json — SessionEnd cleanup hook, SessionStart /clear recovery hook"
    - "~/.claude/hooks/share-proto-statusline.js — Watson: ON indicator when state file exists"

key-decisions:
  - "Use ~/.claude/rules/ path-specific rule (not SKILL.md paths:) for ambient suggestion — preserves /watson slash command autocomplete"
  - "State file /tmp/watson-active.json is the single source of truth for Watson ON/OFF — minimal JSON, just needs to exist"
  - "Status line Watson indicator added to existing share-proto-statusline.js rather than a separate PostToolUse hook"
  - "SessionEnd hook deletes state file; SessionStart hook notifies user if Watson was active before /clear"

patterns-established:
  - "Ambient rule pattern: rule file with paths: glob suggests activation without auto-loading skill — user must still run /watson"
  - "Session toggle via state file: write on load, delete on deactivate/session-end"

requirements-completed: [AMBI-01, AMBI-02, AMBI-03]

duration: ~12min
completed: 2026-04-01
---

# Phase 06 Plan 02: Ambient Activation + Session Toggle Summary

**Path-specific ambient rule with state-file session toggle: Watson suggests activation in Playground context, /watson on/off controls full session, status line shows Watson: ON**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-01T20:20:00Z
- **Completed:** 2026-04-01T20:32:44Z
- **Tasks:** 1/2 (Task 2 pending human verification)
- **Files modified:** 4

## Accomplishments

- Created `~/.claude/rules/watson-ambient.md` with `paths: src/pages/**` glob — ambient rule suggests `/watson` without auto-activating, preserving slash command registration
- Updated `SKILL.md` to session toggle model: renamed Activation section to Routing, added `/watson off` handler with state file cleanup, added state file write on load, added first-invocation welcome message, removed voice prefix, bumped to v1.2.0 (165 lines, under 200)
- Added `SessionEnd` hook to `settings.json` to delete `/tmp/watson-active.json` at session end
- Added `SessionStart` hook to `settings.json` to notify user if Watson was active before `/clear`
- Added `Watson: ON` indicator to `share-proto-statusline.js` — shows in status line when state file exists

## Task Commits

1. **Task 1: Create ambient rule, update SKILL.md to session toggle model, configure hooks** - `4e34f58` (feat)

**Plan metadata:** (pending — awaiting human verification at Task 2)

## Files Created/Modified

- `/Users/austindick/.claude/rules/watson-ambient.md` — Path-specific ambient rule suggesting /watson in src/pages/**
- `/Users/austindick/.claude/skills/watson/SKILL.md` — Session toggle model, v1.2.0, 165 lines
- `/Users/austindick/.claude/settings.json` — SessionEnd and SessionStart hooks added
- `/Users/austindick/.claude/hooks/share-proto-statusline.js` — Watson: ON status line indicator

## Decisions Made

- Path-specific rule file approach used instead of `paths:` in SKILL.md frontmatter — avoids breaking slash command autocomplete (this was the core problem from plan 01)
- Status line Watson indicator added to the existing `share-proto-statusline.js` rather than a separate `PostToolUse` hook — cleaner, consistent with existing status line architecture
- State file `/tmp/watson-active.json` is minimal (just `{}`) — existence is the signal, content is unused at this stage

## Deviations from Plan

None — plan executed as specified. The plan suggested using a PostToolUse hook for the status line OR the existing `statusLine` config if available. The existing `statusLine` config was found (`share-proto-statusline.js`) so the Watson indicator was injected there — consistent with plan guidance.

## Issues Encountered

None.

## User Setup Required

None — all changes are to user-global Claude Code config files (`~/.claude/`). No environment variables or external services required.

## Next Phase Readiness

- Task 2 (human-verify) is pending: user must test the full session toggle lifecycle in the Playground
- After verification passes, requirements AMBI-01, AMBI-02, AMBI-03 are complete
- Phase 06 will be complete after Task 2 verification

---
*Phase: 06-ambient-activation-status-md-schema*
*Completed: 2026-04-01*
