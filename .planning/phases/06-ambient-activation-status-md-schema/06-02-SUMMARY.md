---
phase: 06-ambient-activation-status-md-schema
plan: 02
subsystem: ui
tags: [watson, ambient-activation, session-toggle, state-file, hooks, claude-code, rules, askuserquestion]

# Dependency graph
requires:
  - phase: 06-ambient-activation-status-md-schema
    provides: "06-01 — STATUS.md canonical schema reference artifact"

provides:
  - "Path-specific ambient rule at ~/.claude/rules/watson-ambient.md with AskUserQuestion gate targeting packages/design/prototype-playground/**"
  - "SKILL.md session toggle model: /watson activates, /watson off deactivates, state file lifecycle"
  - "Skill exclusivity directive in SKILL.md blocking brainstorming conflicts"
  - "settings.json SessionEnd hook cleans up /tmp/watson-active.json on session end"
  - "settings.json SessionStart hook notifies user if Watson was active before /clear"
  - "Watson ► Design Discussion activation header in discuss subskill"

affects: [watson-skill, ambient-activation, prototype-playground, session-state, watson-discuss]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Path-specific rule file in ~/.claude/rules/ for Playground-context ambient gate without SKILL.md paths: field"
    - "State file at /tmp/watson-active.json as session-level toggle signal (written on load, deleted on off/SessionEnd)"
    - "AskUserQuestion gate in ambient rule — blocks all work until user responds to Watson activation prompt"

key-files:
  created:
    - "~/.claude/rules/watson-ambient.md — AskUserQuestion gate for Playground context (packages/design/prototype-playground/**)"
  modified:
    - "~/.claude/skills/watson/SKILL.md — session toggle model, Routing section, /watson off, state file write, skill exclusivity directive, v1.2.0"
    - "~/.claude/settings.json — SessionEnd cleanup hook, SessionStart /clear recovery hook"
    - "~/.claude/skills/watson/skills/discuss.md — Watson ► Design Discussion activation header"

key-decisions:
  - "Path glob corrected from src/pages/** to packages/design/prototype-playground/** — actual Playground directory structure"
  - "Ambient rule upgraded from suggestion text to AskUserQuestion gate — enforces user sees prompt before any work proceeds"
  - "Skill exclusivity directive added to SKILL.md — prevents superpowers:brainstorming conflict when Watson is active"
  - "Discuss subskill activation header added — clear signal to user that discuss mode is active"
  - "watson-lite removed from skills/ and commands/ — eliminates routing ambiguity"

patterns-established:
  - "Ambient rule pattern: rule file with paths: glob uses AskUserQuestion to gate ALL work until user responds"
  - "Session toggle via state file: write on load, delete on deactivate/session-end"
  - "Skill exclusivity enforced in SKILL.md — external brainstorming skills explicitly blocked when Watson is ON"

requirements-completed: [AMBI-01, AMBI-02, AMBI-03]

duration: ~45min
completed: 2026-04-01
---

# Phase 06 Plan 02: Ambient Activation + Session Toggle Summary

**Path-specific AskUserQuestion gate (packages/design/prototype-playground/**) + session toggle via /tmp/watson-active.json + verification fixes closing 4 behavioral gaps found during end-to-end testing**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-04-01T20:20:00Z
- **Completed:** 2026-04-01T21:05:00Z
- **Tasks:** 2/2 complete
- **Files modified:** 4

## Accomplishments

- Created `~/.claude/rules/watson-ambient.md` targeting the actual Playground directory (`packages/design/prototype-playground/**`) with an AskUserQuestion gate — blocks ALL work until user responds to Watson activation prompt, prevents silent AI bypass
- Updated `SKILL.md` to full session toggle model: renamed Activation section to Routing, added `/watson off` handler with state file cleanup, added state file write on load, added first-invocation welcome message, removed voice prefix, added skill exclusivity directive blocking brainstorming conflicts, bumped to v1.2.0
- Added `SessionEnd` and `SessionStart` hooks to `settings.json` for state lifecycle and /clear recovery
- Added `Watson ► Design Discussion` activation header to discuss subskill for clear mode signaling
- Removed watson-lite legacy skill and command to eliminate routing ambiguity

## Task Commits

1. **Task 1: Create ambient rule, update SKILL.md to session toggle model, configure hooks** - `4e34f58` (feat)
2. **Task 2: Verification fixes — path glob, AskUserQuestion gate, skill exclusivity, discuss header** - `5a1eb69` (fix)

## Files Created/Modified

- `~/.claude/rules/watson-ambient.md` — AskUserQuestion gate; paths: packages/design/prototype-playground/**
- `~/.claude/skills/watson/SKILL.md` — Session toggle model, skill exclusivity directive, v1.2.0, 167 lines
- `~/.claude/settings.json` — SessionEnd and SessionStart hooks
- `~/.claude/skills/watson/skills/discuss.md` — Watson ► Design Discussion activation header

## Decisions Made

- **AskUserQuestion gate over passive suggestion**: Passive suggestion text in the ambient rule was skippable — Claude could respond to the user's message first, burying the Watson prompt. The AskUserQuestion gate forces a blocking prompt before any other work.
- **Path glob was wrong in the plan**: Plan specified `src/pages/**` but the actual Playground is at `packages/design/prototype-playground/**`. The plan was written with an assumed path; corrected to actual.
- **Skill exclusivity directive**: `superpowers:brainstorming` and Watson's discuss subskill both handle creative/ideation work. Without an explicit block, they could co-activate and produce conflicting workflows. Added directive to SKILL.md.
- **Discuss activation header**: Users couldn't tell when discuss mode was active vs standard Watson routing. The `Watson ► Design Discussion` header provides an immediate, clear signal.

## Deviations from Plan

### Auto-fixed Issues (during human verification)

**1. [Rule 1 - Bug] Path glob targeted non-existent directory**
- **Found during:** Task 2 (end-to-end verification)
- **Issue:** Plan specified `src/pages/**` but Prototype Playground lives at `packages/design/prototype-playground/**`
- **Fix:** Updated `paths:` in watson-ambient.md to `packages/design/prototype-playground/**`
- **Files modified:** `~/.claude/rules/watson-ambient.md`
- **Committed in:** 5a1eb69

**2. [Rule 2 - Missing Critical] Ambient suggestion was passive — could be silently bypassed**
- **Found during:** Task 2 (end-to-end verification)
- **Issue:** Original suggestion text could be ignored if Claude responded to user's request before the suggestion was noticed
- **Fix:** Replaced with AskUserQuestion gate that checks `/tmp/watson-active.json` then blocks ALL other work until user responds
- **Files modified:** `~/.claude/rules/watson-ambient.md`
- **Committed in:** 5a1eb69

**3. [Rule 1 - Bug] Brainstorming skill could co-activate with Watson discuss subskill**
- **Found during:** Task 2 (end-to-end verification)
- **Issue:** `superpowers:brainstorming` is ambient and could activate alongside Watson, creating conflicting design workflows
- **Fix:** Added skill exclusivity directive to SKILL.md explicitly blocking external brainstorming skills when Watson is ON
- **Files modified:** `~/.claude/skills/watson/SKILL.md`
- **Committed in:** 5a1eb69

**4. [Rule 2 - Missing Critical] Discuss subskill had no activation signal**
- **Found during:** Task 2 (end-to-end verification)
- **Issue:** No clear indication to user when discuss mode was active vs general Watson routing
- **Fix:** Added `Watson ► Design Discussion` header that fires on discuss subskill activation
- **Files modified:** `~/.claude/skills/watson/skills/discuss.md`
- **Committed in:** 5a1eb69

---

**Total deviations:** 4 auto-fixed (2 bugs, 2 missing critical)
**Impact on plan:** All fixes necessary for AMBI-01 to actually work in practice. The path glob fix was essential — wrong path means rule never fires. The AskUserQuestion gate ensures the activation prompt cannot be silently skipped.

## Issues Encountered

- watson-lite legacy artifact was present in `~/.claude/skills/` and `~/.claude/commands/`; removed during verification to prevent routing ambiguity (pre-existing cleanup, not tracked as deviation)

## User Setup Required

None — all changes are to user-global Claude Code config files (`~/.claude/`). No environment variables or external services required.

## Next Phase Readiness

- AMBI-01, AMBI-02, AMBI-03 all closed
- Phase 06 complete: both 06-01 (STATUS.md schema + watson-init) and 06-02 (ambient activation toggle) delivered
- All 7 verification tests passed during end-to-end human verification

---
*Phase: 06-ambient-activation-status-md-schema*
*Completed: 2026-04-01*
