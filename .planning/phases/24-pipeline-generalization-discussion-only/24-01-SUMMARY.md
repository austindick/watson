---
phase: 24-pipeline-generalization-discussion-only
plan: 01
subsystem: ui
tags: [watson, loupe, pipeline, prod-clone, multi-mode, surface-resolver, source-agents]

# Dependency graph
requires:
  - phase: 23-source-agents
    provides: surface-resolver, source-layout, source-design, source-interaction agents with defined input contracts
  - phase: 22-codebase-map-library-book
    provides: codebase-map book in LIBRARY.md for experience name lookup

provides:
  - loupe.md with 3-mode entry (figma, prod-clone, discuss-only) via Phase -1 AskUserQuestion
  - Auto-detection of Figma URLs and experience name references skipping mode prompt
  - Conditional codebase-map loading in Phase 0 for prod-clone and hybrid builds
  - surface-resolver foreground dispatch in Phase 1 for prod-clone mode
  - Hybrid section merge (prod-clone base sections + discuss-only additional sections)
  - Optional screenshot prompt between Phase 1 and Phase 2 for prod-clone builds
  - source-layout, source-design, source-interaction parallel dispatch in Phase 2 for prod-clone sections
  - PIPE-02 backward compatibility guard (default referenceType to figma when absent)
  - Prod-clone path resolution in Phase 3

affects: [24-02-discuss-only, 24-03-skill-md, loupe, discuss, SKILL.md]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "3-mode entry with auto-detection — Figma URL and experience name skip the prompt; bare invocation shows AskUserQuestion"
    - "Conditional library loading — codebase-map chapters appended to libraryPaths only for prod-clone/hybrid modes"
    - "Per-section referenceType routing — figma sections → Figma agents, prod-clone → source agents, discuss-only → skip Phase 2"
    - "Same-wave mixed dispatch — all sections across all referenceTypes dispatch simultaneously in Phase 2"
    - "Omit-when-null parameter — screenshotPath omitted entirely from dispatch (not passed as null)"

key-files:
  created: []
  modified:
    - skills/core/skills/loupe.md

key-decisions:
  - "Mode prompt lives in loupe.md Phase -1, not SKILL.md — preserves SKILL.md routing-only constraint"
  - "discuss.md dispatched from Phase -1 Describe path only — single explicit exception to existing constraint, documented inline"
  - "Screenshot prompt appears after surface-resolver returns but before Phase 2 dispatch; reuses existing .watson/screenshot.png silently"
  - "referenceType defaults to figma when absent on any section — PIPE-02 backward compatibility guard"
  - "All sections dispatch simultaneously in Phase 2 — figma + prod-clone in same wave"

patterns-established:
  - "Omit-when-null: never pass null for optional agent parameters — omit the key entirely"
  - "Conditional book loading: Phase 0 extends libraryPaths with codebase-map chapters only when prod-clone sections are present"

requirements-completed: [PIPE-01, PIPE-02, PIPE-03, PIPE-04, PIPE-05, PIPE-06]

# Metrics
duration: 2min
completed: 2026-04-11
---

# Phase 24 Plan 01: Pipeline Generalization (loupe.md) Summary

**loupe.md extended to 3-mode entry orchestrator routing Figma, prod-clone, and discuss-only sections through separate agent pipelines in the same dispatch wave**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-11T03:20:41Z
- **Completed:** 2026-04-11T03:23:22Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Added 3-mode Phase -1 entry with auto-detection (Figma URL, experience name, bare invocation) and AskUserQuestion prompt for bare invocations
- Added conditional codebase-map loading in Phase 0 for prod-clone and hybrid builds
- Extended Phase 1 to mode-branch between decomposer (figma) and surface-resolver (prod-clone) with hybrid section merge and optional screenshot prompt
- Extended Phase 2 with PIPE-02 backward compatibility guard and parallel source agent dispatch for prod-clone sections in the same dispatch wave as Figma agents
- Added prod-clone path resolution in Phase 3 and updated Constraints and Progress Reference table

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend loupe.md Inputs, Phase -1, and Phase 0 for multi-mode entry** - `fea58f1` (feat)
2. **Task 2: Extend loupe.md Phase 1, Phase 2, Phase 3 with prod-clone routing and screenshot prompt** - `d8d092d` (feat)

## Files Created/Modified
- `skills/core/skills/loupe.md` - Extended with 3-mode entry, conditional codebase-map loading, surface-resolver routing, prod-clone source agent dispatch, screenshot prompt, and path resolution

## Decisions Made
- Mode prompt lives in loupe.md Phase -1, not SKILL.md — preserves SKILL.md routing-only constraint (< 215 lines)
- discuss.md dispatched from Phase -1 "Describe what you want" branch only — documented as explicit exception to the existing "Never dispatch discuss.md" constraint, matching CONTEXT.md locked decision
- Screenshot prompt appears after surface-resolver returns, before Phase 2 dispatch; existing screenshot at .watson/screenshot.png is reused silently without prompting
- referenceType defaults to figma when absent — PIPE-02 backward compatibility guard ensures existing Figma-only builds never break
- All sections (figma + prod-clone) dispatch simultaneously in Phase 2 — mixed-mode builds use one dispatch wave

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- loupe.md is the complete multi-mode pipeline orchestrator; Phase 24 Plans 02 and 03 can now add discuss.md describeOnly mode and SKILL.md Tier 2 extensions
- All six PIPE requirements (PIPE-01 through PIPE-06) are satisfied
- Existing Figma pipeline (PIPE-04) is unchanged — only additive branches added

---
*Phase: 24-pipeline-generalization-discussion-only*
*Completed: 2026-04-11*
