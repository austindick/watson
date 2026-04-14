---
phase: 29-design-extraction
plan: "01"
subsystem: skills
tags: [design, pipeline, skill, agents, figma, prod-clone, porting]

# Dependency graph
requires:
  - phase: 28-think-skill
    provides: /think SKILL.md as dispatch target for describe-only mode
  - phase: 26-plugin-scaffold
    provides: skills/design/SKILL.md stub, plugin.json registration, quietMode convention
provides:
  - Full standalone /design skill at skills/design/SKILL.md (417 lines)
  - 11 agent dispatches via @skills/core/agents/ path convention
  - Phase 0a PRD read with graceful fallback for missing CONTEXT.md
  - 3-mode entry: figma URL, prod-clone experience name, describe-only via /think
affects:
  - 29-design-extraction (30-design-hardening reads this file for hardening work)
  - phase 30 hardening (convergent loop, token enforcement, verification gate all build on this SKILL.md)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "@skills/core/agents/{name}.md for cross-skill agent dispatch from skills/design/"
    - "Phase 0a PRD read as non-blocking step before library resolution"
    - "Standalone vs dispatched invocation handled via Phase -1 detection"

key-files:
  created: []
  modified:
    - skills/design/SKILL.md

key-decisions:
  - "/design dispatch paths use @skills/core/agents/ prefix — explicit paths avoid ambiguity for agents outside skills/design/ directory"
  - "Describe-only mode dispatches @skills/think/SKILL.md foreground (not suggest-not-dispatch) — architectural parity with loupe.md locked decision"
  - "PRD read is Phase 0a (before library resolution), not a gate — missing CONTEXT.md is a normal standalone invocation, not an error"

patterns-established:
  - "Cross-skill agent dispatch from extracted skill: use @skills/core/agents/{name}.md (explicit over shorthand)"

requirements-completed: [DSGN-01, DSGN-02, DSGN-03, DSGN-11, DSGN-12]

# Metrics
duration: 2min
completed: 2026-04-14
---

# Phase 29 Plan 01: /design Extraction Summary

**Full 6-phase build pipeline ported from loupe.md into standalone skills/design/SKILL.md with @skills/core/agents/ dispatch paths, /think describe-only handoff, and PRD-read step**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-14T13:40:16Z
- **Completed:** 2026-04-14T13:42:24Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Replaced 11-line stub in skills/design/SKILL.md with 417-line standalone pipeline
- Updated all 11 agent dispatch paths from `@agents/` to `@skills/core/agents/` to work from skills/design/ context
- Replaced `@skills/discuss.md` with `@skills/think/SKILL.md` for describe-only mode handoff (Phase 28 alignment)
- Added Phase 0a PRD read — reads CONTEXT.md if present, proceeds without error if absent (DSGN-11)
- Removed all Watson/Loupe branding from user-facing text and internal references

## Task Commits

Each task was committed atomically:

1. **Task 1: Port loupe.md to standalone /design SKILL.md** - `f96b550` (feat)

**Plan metadata:** _(docs commit hash recorded after state update)_

## Files Created/Modified
- `skills/design/SKILL.md` - Full standalone build pipeline (417 lines), replaces 11-line stub

## Decisions Made
- **@skills/core/agents/ dispatch paths**: The RESEARCH.md identified path ambiguity as Pitfall 2. Using explicit `@skills/core/agents/{name}.md` instead of the `@agents/` shorthand from loupe.md removes any possibility of the runtime looking in `skills/design/agents/` (which doesn't exist). This matches the plan's interface spec exactly.
- **Describe-only foreground dispatch preserved**: The "Describe what you want" option dispatches `@skills/think/SKILL.md` foreground rather than using suggest-not-dispatch. This maintains architectural parity with the locked loupe.md decision — it's a genuine handoff, not a suggestion, because the user explicitly chose to describe rather than build.
- **PRD read as Phase 0a**: Inserted between Phase -1 and Phase 0 so it runs after blueprint detection but before library resolution. This keeps context available for the full pipeline while maintaining the non-blocking design (DSGN-11).

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- skills/design/SKILL.md is ready for Phase 30 hardening (convergent loop, page-container type, token enforcement, verification gate)
- All 12 agents reachable via @skills/core/agents/ paths
- PRD read integration makes /think → /design handoff complete

---
*Phase: 29-design-extraction*
*Completed: 2026-04-14*
