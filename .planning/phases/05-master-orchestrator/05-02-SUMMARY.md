---
phase: 05-master-orchestrator
plan: 02
subsystem: ui
tags: [watson, skill, subskill, e2e, integration-test, figma, pipeline]

# Dependency graph
requires:
  - phase: 05-master-orchestrator
    provides: SKILL.md intent router and loupe.md pipeline orchestrator written and audit-clean (05-01)
  - phase: 04-discuss-subskill
    provides: discuss.md subskill with conversation engine and blueprint handoff
provides:
  - End-to-end Watson pipeline verified on real Figma frame
  - Four E2E-identified runtime issues fixed inline
  - Library-first consultation rule added to SKILL.md, discuss.md, loupe.md
  - Non-blocking Figma pre-fetch established in discuss.md
  - Partial research agent failure recovery added to loupe.md
  - Global Phase 2 wait gate added to loupe.md
affects: [watson, loupe, discuss, builder, phase-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Library-first consultation: check conventions book before any codebase exploration"
    - "Non-blocking Figma pre-fetch during discuss conversation"
    - "Global research-agent wait gate: all Phase 2 agents complete before any Phase 3 dispatch"
    - "Null-safe agent output: missing LAYOUT.md or DESIGN.md logs warning and continues"

key-files:
  created: []
  modified:
    - ~/.claude/skills/watson/SKILL.md
    - ~/.claude/skills/watson/skills/loupe.md
    - ~/.claude/skills/watson/skills/discuss.md

key-decisions:
  - "Library-first rule is enforced in all three skill files — SKILL.md (new section), discuss.md Phase 0, loupe.md Phase 0"
  - "Figma pre-fetch is background-only during discuss; data is only needed at build time"
  - "Phase 2 research agents are dispatched in parallel across all sections then waited globally — not section-by-section"
  - "Missing research agent output (LAYOUT.md or DESIGN.md) is a logged warning, not a pipeline halt"

patterns-established:
  - "Background Figma fetch during discuss: announce 'pulling in background', cache result, include in return status"
  - "Phase 2 global wait: dispatch all, wait all, verify all, then proceed to Phase 3"

requirements-completed: [ORCH-01, ORCH-02, ORCH-03]

# Metrics
duration: ~30min
completed: 2026-03-31
---

# Phase 5 Plan 02: E2E Integration Test + Inline Fixes Summary

**E2E test revealed four runtime issues; all fixed inline — conventions underutilization, blocking Figma fetch, missing agent output fallback, and premature Phase 3 dispatch**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-31T18:00:00Z
- **Completed:** 2026-03-31T18:30:00Z
- **Tasks:** 2 (Task 1 passed clean; Task 2 E2E test + 4 inline fixes)
- **Files modified:** 3

## Accomplishments

- Task 1 (language audit) passed with zero violations — no prohibited technical terms in user-facing messages
- E2E test ran successfully end-to-end: discuss conversation, Figma analysis, research agents, prototype build, import self-correction all worked
- Four runtime issues identified during E2E test fixed inline with targeted edits — no file rewrites

## Task Commits

1. **Task 1: Language audit** — `1b631a0` (from prior phase completion, pre-verified clean)
2. **Fix 1 — Library First Rule in SKILL.md** — `d4a847a` (fix)
3. **Fix 2 — Non-blocking Figma pre-fetch in discuss.md** — `f1d8c3e` (fix)
4. **Fix 3 — Partial agent failure recovery in loupe.md** — `86c13a3` (fix)
5. **Fix 4 — Global Phase 2 wait gate in loupe.md** — `da1cfb7` (fix)
6. **Fix 1b/2b — Conventions-first enforcement in discuss.md + loupe.md** — `46eeed4` (fix)

## Files Created/Modified

- `~/.claude/skills/watson/SKILL.md` — Added Library First Rule section (12 lines) before Setup Flow
- `~/.claude/skills/watson/skills/discuss.md` — Two targeted edits: non-blocking Figma fetch instruction + conventions-first enforcement in Phase 0 load rule
- `~/.claude/skills/watson/skills/loupe.md` — Three targeted edits: conventions-first enforcement in Phase 0, global Phase 2 wait gate, null-safe agent output fallback in Phase 3

## Decisions Made

- Library-first rule is declared at three layers (SKILL.md, discuss.md, loupe.md) so the instruction is visible at every entry point — redundancy is intentional
- Figma pre-fetch remains purely background; discuss never blocks on it or uses it for conversation decisions
- Phase 2 dispatches all sections in parallel (unchanged) but now waits globally for all of them before any Phase 3 dispatch begins
- Missing LAYOUT.md or DESIGN.md is a warning + graceful continuation, not a retry or halt — builder and reviewer already accept null paths

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Conventions book underutilization — Watson explored codebase for known patterns**
- **Found during:** Task 2 (E2E test)
- **Issue:** Watson repeatedly grepped the codebase for route registration, dev server commands, and project layout — all documented in its own playground-conventions book
- **Fix:** Added explicit Library First Rule section to SKILL.md; added "consult before exploring" note to Phase 0 in discuss.md and loupe.md
- **Files modified:** SKILL.md, discuss.md, loupe.md
- **Committed in:** d4a847a, 46eeed4

**2. [Rule 1 - Bug] Figma pre-fetch blocked discuss conversation**
- **Found during:** Task 2 (E2E test)
- **Issue:** Watson said "I'll analyze your Figma frame while we continue" but then stalled for several minutes waiting on the Figma MCP call before responding
- **Fix:** Clarified that mcp__figma__get_figma_data must be dispatched as a background agent; conversation continues immediately; result is cached for return status
- **Files modified:** discuss.md
- **Committed in:** f1d8c3e

**3. [Rule 1 - Bug] No explicit fallback when layout/design agent produces no output**
- **Found during:** Task 2 (E2E test) — page-header layout agent produced no LAYOUT.md
- **Issue:** Watson recovered ad-hoc by building from DESIGN.md + Figma data; recovery was not documented in loupe.md so it relied on in-context improvisation
- **Fix:** Added explicit pre-dispatch file existence check before Phase 3 — missing file logs warning and sets path to null; builder accepts null paths
- **Files modified:** loupe.md
- **Committed in:** 86c13a3

**4. [Rule 1 - Bug] Phase 3 dispatch started before all Phase 2 agents finished**
- **Found during:** Task 2 (E2E test)
- **Issue:** Layout agent for one section completed after the build had already started; loupe was processing sections individually (wait-per-section) rather than waiting globally
- **Fix:** Changed Phase 2 to dispatch all sections first, then wait globally for all agents before any Phase 3 begins
- **Files modified:** loupe.md
- **Committed in:** da1cfb7

---

**Total deviations:** 4 auto-fixed (all Rule 1 — bugs found during E2E verification)
**Impact on plan:** All fixes are correctness improvements from live test evidence. No scope creep. SKILL.md remains under 200 lines (148 lines).

## Issues Encountered

None beyond the four documented fixes. Language audit (Task 1) passed clean with zero prohibited terms. The E2E pipeline completed successfully end-to-end including discuss conversation, Figma analysis, research agent dispatch, prototype code build, import self-correction, and consolidation.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Watson pipeline is end-to-end verified on a real Figma frame
- All four identified runtime issues resolved with targeted edits
- ORCH-01 (routing), ORCH-02 (chain), ORCH-03 (language) requirements satisfied
- Watson 1.0 Phase 5 complete — pipeline is shippable

---
*Phase: 05-master-orchestrator*
*Completed: 2026-03-31*
