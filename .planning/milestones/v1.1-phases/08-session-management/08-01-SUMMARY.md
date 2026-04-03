---
phase: 08-session-management
plan: 01
subsystem: ui
tags: [watson, session-management, git-branches, routing, status-line]

requires:
  - phase: 07-draft-commit-amendment-model
    provides: "pendingWarningShown flag in /tmp/watson-active.json; [PENDING] amendment prefix; drafts: field in STATUS.md"
  - phase: 06-ambient-activation-status-md-schema
    provides: "watson-init.md scaffold; /tmp/watson-active.json state file; STATUS.md schema with branch/sessions stubs; status line hook"

provides:
  - "2-path fork routing (new / continue) replacing blueprint gate in SKILL.md"
  - "Branch creation (watson/{slug} from main) with conflict detection and initial blueprint commit"
  - "Branch listing with inactive tagging, missing branch recovery, and collaboration fork support"
  - "Status line shows active branch name alongside Watson: ON"
  - "Session recovery on activation from /tmp/watson-session-end.json"
  - "Mid-session prototype switching via intent classification"

affects: [08-session-management, 09-any-future-subskill-additions]

tech-stack:
  added: []
  patterns:
    - "2-path fork as primary Watson entry point — always present 'new / continue' choice"
    - "Branch mechanics isolated in watson-init, routing decisions only in SKILL.md"
    - "Auto-commit guard before all branch switches: git status --porcelain check, skip if clean"
    - "Missing branch recovery: try remote first, then user-choice: fresh branch or return to list"
    - "watson/{slug} branch naming enforced without exception"

key-files:
  created: []
  modified:
    - "~/.claude/skills/watson/SKILL.md"
    - "~/.claude/skills/watson/utilities/watson-init.md"
    - "~/.claude/hooks/share-proto-statusline.js"

key-decisions:
  - "2-path fork replaces blueprint gate entirely — new / continue is THE entry point after Watson is ON"
  - "All git mechanics (branch creation, listing, switching) live in watson-init.md, not SKILL.md"
  - "Setup Flow no longer collects prototype name — name collected upstream in Path A before Setup Flow"
  - "No push to remote on branch creation — push deferred to first loupe build (Plan 02)"
  - "Missing branch recovery: try origin/{slug} first, then user chooses fresh branch or list return"
  - "Session recovery reads /tmp/watson-session-end.json on activation and writes to STATUS.md sessions:"

patterns-established:
  - "Routing decisions in SKILL.md, mechanics in utilities — SKILL.md stays routing-only"
  - "AskUserQuestion for all multi-option routing gates; plain text for name collection"
  - "Inactive = 30+ days since last commit; surfaced per-branch, not as separate prompt"

requirements-completed: [SESS-01, SESS-02, SESS-03, SESS-04]

duration: 3min
completed: 2026-04-03
---

# Phase 8 Plan 01: Session Management — 2-Path Fork and Branch Lifecycle

**Watson activation now presents a 2-path fork (new / continue) replacing the blueprint gate, with full git branch lifecycle operations delegated to watson-init and active branch name in the status line.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-03T00:35:12Z
- **Completed:** 2026-04-03T00:38:06Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Rewrote SKILL.md routing section: blueprint gate out, 2-path fork in — kept file at 176 lines (under 200 budget)
- Extended watson-init.md with Phase 0/0B dispatch sections plus Branch Operations utility (auto-commit guard, branch creation, branch listing, missing branch recovery, collaboration fork)
- Extended share-proto-statusline.js to show "Watson: ON (prototype-slug)" using state.branch from /tmp/watson-active.json

## Task Commits

1. **Task 1: Rewrite SKILL.md routing from blueprint gate to 2-path fork** - `b252668` (feat)
2. **Task 2: Extend watson-init.md with branch creation and branch operations utility** - `d153032` (feat)
3. **Task 3: Extend status line to show active branch name** - `43edd29` (feat)

## Files Created/Modified

- `~/.claude/skills/watson/SKILL.md` — Routing section rewritten: 2-path fork, session recovery, mid-session switching intent; Setup Flow updated to receive name from upstream
- `~/.claude/skills/watson/utilities/watson-init.md` — Phase 0/0B sections added; Branch Operations section with auto-commit guard, branch creation, branch list/switch, collaboration fork
- `~/.claude/hooks/share-proto-statusline.js` — Watson indicator extended to read state.branch and display prototype slug

## Decisions Made

- **Mechanics in watson-init, routing in SKILL.md:** The 2-path fork section in SKILL.md contains only routing decisions (which path, what to show, which dispatch). All git commands and branch mechanics live in watson-init.md. This keeps SKILL.md under the 200-line budget and follows the established "no execution logic in SKILL.md" constraint.
- **Setup Flow no longer collects prototype name:** Name collection moved to Path A (plain text question before Setup Flow). This avoids asking the user for their prototype name inside watson-init when it's already known at the routing layer.
- **No push on branch creation:** Deferred to first loupe build (Plan 02), consistent with CONTEXT.md decision.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

The SKILL.md and watson-init.md files live in a separate git repo (`/Users/austindick/.claude/skills/watson`) from the watson planning repo. The share-proto-statusline.js hook lives in a third repo rooted at `/Users/austindick`. Commits were made to the correct repos per file location.

## Next Phase Readiness

- Plan 08-01 complete: 2-path fork routing, branch lifecycle operations, status line display
- Plan 08-02 ready to execute: session end hook (SessionEnd / /watson off writes session entry to STATUS.md) and subskill action tracking (each subskill appends to /tmp/watson-active.json actions array)

---
*Phase: 08-session-management*
*Completed: 2026-04-03*
