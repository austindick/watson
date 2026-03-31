---
phase: 04-discuss-subskill
plan: 01
subsystem: ui
tags: [watson, subskill, discuss, design-conversation, blueprint, library-grounding]

# Dependency graph
requires:
  - phase: 02-library-system
    provides: LIBRARY.md index with use_when metadata for book discovery routing
  - phase: 03-research-agents
    provides: agent architecture patterns and blueprint file structure understanding
provides:
  - "~/.claude/skills/watson/skills/discuss.md — full conversation engine with blueprint reading, library grounding, and watson-lite pattern ports"
affects:
  - 04-02-discuss-subskill (adds blueprint write logic and return status to this file)
  - 05-orchestration (SKILL.md orchestrator routes to discuss and reads its return status)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Subskill instruction set pattern: structured markdown Claude reads and follows in live session, no agent contract frontmatter"
    - "Phased conversation engine: library load → blueprint read → complexity scale → AskUserQuestion → core Qs → contextual Qs → research → summary → confirm"
    - "LIBRARY.md use_when routing: discuss reads index, checks use_when field per book, loads on-demand vs upfront"
    - "Template vs populated detection: blueprint files inspected for placeholder text vs real decisions before opening conversation"
    - "Hybrid intent detection: mid-build invocation infers intent from user message then surfaces escape hatch"

key-files:
  created:
    - "~/.claude/skills/watson/skills/discuss.md"
  modified: []

key-decisions:
  - "discuss.md goes in skills/ as a subskill instruction set, not in agents/ — confirmed by SKILL.md directory purpose table"
  - "Library loading is two-tier: playground-conventions upfront (always needed), design-system on-demand (only when components/tokens discussed)"
  - "No separate mid-build mode — same adaptive flow with blueprint state + built code reducing question count naturally"
  - "Blueprint write logic and return status JSON deferred to Plan 04-02 — clear placeholder comment marks boundary"
  - "All component names must come from loaded library books — improvised names prohibited by explicit constraint"

patterns-established:
  - "Subskill file structure: header section declares type and purpose, each phase labeled clearly, constraints section at bottom"
  - "Plan 04-02 placeholder pattern: HTML comment block at bottom of file marks deferred scope with itemized list of what will be added"

requirements-completed: [DISC-01, DISC-02, DISC-04, DISC-05]

# Metrics
duration: 15min
completed: 2026-03-31
---

# Phase 4 Plan 01: Discuss Subskill Summary

**watson-lite conversation engine ported to Watson architecture: AskUserQuestion discipline, complexity scaling, gentle challenges, pattern research, and blueprint-adaptive flow with library grounding via LIBRARY.md discovery**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-31T15:22:00Z
- **Completed:** 2026-03-31T15:37:35Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Created `~/.claude/skills/watson/skills/discuss.md` as a 326-line subskill instruction set (no agent contract)
- Ported all seven watson-lite UX patterns: AskUserQuestion, complexity scaling, gentle challenges, core questions, contextual questions, pattern research, summary + confirmation
- Added Watson-specific blueprint state reading logic for all four files (CONTEXT, LAYOUT, DESIGN, INTERACTION) with template vs populated detection
- Added LIBRARY.md-based book discovery: playground-conventions loaded upfront, design-system loaded on-demand, future books auto-discovered via use_when
- Added mid-build adaptive behavior with hybrid intent detection and amendment loop
- Marked Plan 04-02 scope boundary clearly with HTML comment placeholder for write logic and return status

## Task Commits

Each task was committed atomically:

1. **Task 1: Create discuss.md conversation core with blueprint reading and library grounding** - `73d94f5` (feat)
2. **Task 2: Verify discuss.md structural correctness and pattern coverage** - `3788eba` (chore — empty commit, verification only)

## Files Created/Modified

- `~/.claude/skills/watson/skills/discuss.md` — Discuss subskill conversation engine (326 lines); all watson-lite patterns adapted for Watson architecture; blueprint state reading; LIBRARY.md grounding; mid-build adaptive flow

## Decisions Made

- **discuss.md in skills/ not agents/:** Confirmed by SKILL.md directory purpose table — `skills/` is for subskill files, `agents/` for self-contained agent files. No cross-contamination.
- **Library loading is two-tier:** playground-conventions always loaded upfront (scaffolding rules pervade the whole conversation); design-system loaded on-demand when the conversation reaches component-level specifics. This is cheaper and avoids loading a large book before it's needed.
- **No separate mid-build mode:** Same conversation engine handles fresh-start and mid-build invocations — blueprint state and built code naturally reduce question count. Hybrid intent detection (infer → confirm) handles the UX difference cleanly.
- **Plan 04-02 scope boundary via HTML comment:** Blueprint write logic (amendment format, CONTEXT.md writes) and return status JSON belong in 04-02. Marking the boundary with a placeholder comment prevents scope creep and gives the next plan a clear extension point.

## Deviations from Plan

None — plan executed exactly as written. File structure, section content, and scope boundary all match the plan's action spec.

## Issues Encountered

None. The verification grep (Task 2 check 8) produced false positives for `Discuss Amendments` and `referenceType` — both were correctly inside an HTML comment placeholder. Verified by line-number inspection.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `discuss.md` conversation engine is complete and ready for Plan 04-02
- Plan 04-02 adds: blueprint write logic (`## Discuss Amendments` format, CONTEXT.md write timing), return status JSON schema (status, blueprintPath, sections[], referenceType, hasFullFrame), and discuss-only build path population of LAYOUT.md/DESIGN.md
- The HTML comment placeholder at the bottom of discuss.md gives Plan 04-02 a clear extension point

---
*Phase: 04-discuss-subskill*
*Completed: 2026-03-31*
