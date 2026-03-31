---
phase: 05-master-orchestrator
plan: 01
subsystem: orchestration
tags: [skill-routing, intent-classification, pipeline-orchestration, watson, subskill]

# Dependency graph
requires:
  - phase: 04-discuss-subskill
    provides: discuss.md return status contract (ready_for_build, discussion_only, cancelled) and blueprintPath/sections[] handoff
  - phase: 03-research-agents
    provides: all seven agents (decomposer, layout, design, builder, reviewer, consolidator) with their dispatch params
  - phase: 02-library-system
    provides: LIBRARY.md index and BOOK.md manifests for library path resolution
  - phase: 01-foundation-scaffold
    provides: watson-init utility for blueprint scaffolding
provides:
  - SKILL.md production intent router — three-tier classification, setup detection, discuss-to-loupe chain
  - loupe.md pipeline orchestrator — library resolution, parallel research, sequential build+review, consolidation
affects: [05-02-integration-test, watson-end-to-end, watson-users]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two-layer routing: SKILL.md dispatches subskills, subskills dispatch agents — never cross layers"
    - "Three-tier intent classification: discuss / build / ask with session calibration"
    - "Discuss-to-loupe auto-chain gated on return status JSON (explicit case handling)"
    - "Phase 0 library resolution from LIBRARY.md + BOOK.md manifests before any agent dispatch"
    - "Section-type filtering: referenceType=figma gets full research pipeline; discuss-only skips layout+design"
    - "Designer-language progress updates — no agent names, file paths, or artifact names in user-facing messages"

key-files:
  created:
    - "~/.claude/skills/watson/skills/loupe.md"
  modified:
    - "~/.claude/skills/watson/SKILL.md"

key-decisions:
  - "SKILL.md stays under 200 lines (136 lines): all execution logic delegated to subskills"
  - "SKILL.md dispatches subskills only (discuss.md, loupe.md) — never agents directly"
  - "Three discuss return statuses are explicit cases in SKILL.md — no fallthrough; calling loupe for discussion_only or cancelled is forbidden"
  - "loupe.md Phase 0 resolves libraryPaths[] from LIBRARY.md + BOOK.md before any agent dispatch; no path improvisation"
  - "Discuss-only sections skip layout+design research agents (no Figma node); blueprint populated by discuss"
  - "watsonMode: true on every agent dispatch in loupe.md — no exceptions"
  - "Setup flow (watson-init) runs only for new prototypes; returning users skip directly to intent classification"
  - "interactionPath: null for Watson 1.0 — interaction agent deferred to v1.1+"

patterns-established:
  - "Pattern: SKILL.md as thin router — all logic in subskills, no file reads or MCP calls at orchestrator layer"
  - "Pattern: Discuss → loupe chain reads status JSON from discuss; SKILL.md is the chain owner, not loupe"
  - "Pattern: loupe.md pipeline phases numbered 0–5; Phase 0 is always library resolution"
  - "Pattern: Section-isolated error handling — one section failure does not halt pipeline; silent retry once per agent"

requirements-completed: [ORCH-01, ORCH-02, ORCH-03, ORCH-04, ORCH-05]

# Metrics
duration: 2min
completed: 2026-03-31
---

# Phase 5 Plan 01: Master Orchestrator Summary

**SKILL.md rewritten as 136-line production intent router with three-tier classification and discuss-to-loupe chain; loupe.md created as 220-line Figma-to-code pipeline orchestrator wiring all seven agents**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-31T17:28:55Z
- **Completed:** 2026-03-31T17:31:15Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Replaced the 39-line SKILL.md signpost with a production intent router (136 lines) — under the 200-line ORCH-05 limit
- Implemented three-tier intent classification with signal matrix, session calibration note, and explicit shortcuts (/watson discuss, /watson loupe, /watson help)
- Implemented discuss-to-loupe auto-chain with all three return statuses handled as explicit cases
- Created loupe.md — new 220-line pipeline orchestrator with library resolution, parallel research phase, sequential build+review phase, and consolidation
- loupe.md correctly filters sections by referenceType before dispatching research agents (discuss-only sections skip layout+design)

## Task Commits

Each task was committed atomically (to the home `~/.claude` git repo):

1. **Task 1: Write SKILL.md — intent router** - `5fc3aa4` (feat)
2. **Task 2: Write loupe.md — pipeline orchestrator** - `ab18712` (feat)

**Plan metadata:** (see below — docs commit to project repo)

## Files Created/Modified

- `~/.claude/skills/watson/SKILL.md` — rewritten from 39-line signpost to 136-line production intent router
- `~/.claude/skills/watson/skills/loupe.md` — new file; 220-line pipeline orchestrator

## Decisions Made

- SKILL.md dispatches only subskills (discuss.md, loupe.md) — never agents directly. Verified with grep: 0 `@agents/` occurrences.
- All three discuss return statuses (`ready_for_build`, `discussion_only`, `cancelled`) are explicit cases — no fallthrough logic.
- loupe.md Phase 0 resolves `libraryPaths[]` from both design-system and playground-conventions books before any dispatch.
- `watsonMode: true` appears 7 times in loupe.md — once per agent dispatch.
- Setup flow only runs for new prototypes; returning users detect blueprint presence and skip to intent classification.
- `interactionPath: null` in all builder dispatch blocks — interaction agent deferred to Watson 1.1+.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. The xargs-based verification command in the plan produced a false FAIL on the `@agents/` check due to a zsh expression evaluation quirk (multi-line grep -c output). Direct count confirmed 0 occurrences.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- SKILL.md and loupe.md complete — both files satisfy ORCH-01 through ORCH-05
- Ready for Plan 05-02: end-to-end integration test on a real Figma frame
- No blockers

---
*Phase: 05-master-orchestrator*
*Completed: 2026-03-31*
