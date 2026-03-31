---
phase: 04-discuss-subskill
plan: 02
subsystem: ui
tags: [watson, subskill, discuss, blueprint-write, amendments, handoff-contract, dedup]

# Dependency graph
requires:
  - phase: 04-discuss-subskill
    plan: 01
    provides: discuss.md conversation engine with blueprint reading, library grounding, and watson-lite patterns

provides:
  - "~/.claude/skills/watson/skills/discuss.md — complete subskill with blueprint write logic, surgical amendments, discuss-only build path, reference inventory, and loupe handoff contract"

affects:
  - 05-orchestration (SKILL.md reads discuss return status JSON to route build paths)
  - loupe-agents (CONTEXT.md dedup contract ensures loupe agents skip already-answered questions)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Blueprint write pattern: CONTEXT.md always written after summary confirmation; amendments to LAYOUT/DESIGN/INTERACTION are additive-only via ## Discuss Amendments section"
    - "Amendment format: [property]: [old value] -> [new value] (reason) — surgical key-value overlay, original content untouched"
    - "Discuss-only build path: conversation-derived LAYOUT.md + DESIGN.md (component names, section structure, token refs) when no Figma reference"
    - "Reference inventory: mental tracking of section name + referenceType (discuss-only | figma) throughout conversation"
    - "Dedup contract: CONTEXT.md as locked-decision source of truth; loupe agents read it before asking questions to avoid re-asking decided issues"
    - "Return status JSON: status + blueprintPath + sections[] + hasFullFrame + fullFrameUrl — orchestrator uses this to route each section to correct build path"

key-files:
  created: []
  modified:
    - "~/.claude/skills/watson/skills/discuss.md — extended from 326 lines (Plan 04-01) to 483 lines; added blueprint write, amendments, discuss-only path, reference inventory, ready-to-build detection, return status JSON, and dedup contract"

key-decisions:
  - "Write timing is Claude's discretion: natural write point is after summary confirmation before returning status; incremental mid-conversation writes allowed if rhythm permits"
  - "## Discuss Amendments is strictly additive: original agent-generated content above the section is never modified; prior amendments are preserved and new ones appended below"
  - "Discuss-only path uses conversation-derived detail level (component names, token refs, section structure) — not pixel measurements or CSS values; Builder fills in sensible defaults"
  - "Dedup contract is explicit: discuss locks decisions by writing to CONTEXT.md; loupe agents are required to honor the lock and skip those questions"
  - "Discuss never dispatches agents: returns status JSON to orchestrator only; orchestrator is responsible for routing to loupe/builder"

# Metrics
duration: ~2min
completed: 2026-03-31
---

# Phase 4 Plan 02: Discuss Subskill Blueprint Write and Handoff Contract Summary

**Blueprint write logic, surgical amendment format, discuss-only LAYOUT/DESIGN population, reference inventory tracking, and structured return status JSON completing the discuss subskill for Phase 5 orchestrator wiring**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-31T15:40:24Z
- **Completed:** 2026-03-31T15:42:52Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Extended `~/.claude/skills/watson/skills/discuss.md` from 326 lines (Plan 04-01) to 483 lines
- Added Blueprint Write: CONTEXT.md section — always written after summary confirmation, follows CONTEXT-EXAMPLE.md schema, write timing at Claude's discretion without disrupting conversation rhythm
- Added Blueprint Write: Surgical Amendments section — `## Discuss Amendments` appended at file end, never modifies original content, amendment format is `[property]: [old value] -> [new value] (reason)`, additive across sessions
- Added Discuss-Only Build Path section — conversation-derived LAYOUT.md + DESIGN.md population when no Figma reference; component names and token refs from library books; no pixel measurements
- Added Reference Inventory section — mental tracking of section name + referenceType throughout conversation; mid-session Figma URL association with disambiguation prompt; background pre-fetch pattern
- Added "Ready to Build?" Detection section — proactive surface when coverage indicators satisfied; "Just save decisions" path returns `discussion_only` status
- Added Loupe Handoff: Return Status section — complete JSON schema with status, blueprintPath, sections[], hasFullFrame, fullFrameUrl; explicit "NEVER invokes loupe, builder, or any agent" constraint
- Added Dedup Contract section — CONTEXT.md as source of truth; loupe agents honor locked decisions; mid-build rebuild prompt (rebuild now or save for later)
- Fixed two stale "Plan 04-02" forward references and removed duplicate separator (Task 2 cleanup)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add blueprint write logic, discuss-only path, and loupe handoff contract** — `fc82d2e` (feat)
2. **Task 2: Final validation — discuss.md completeness and requirement coverage** — `86349fe` (chore — stale ref cleanup + validation)

## Files Created/Modified

- `~/.claude/skills/watson/skills/discuss.md` — Extended to 483 lines; blueprint write logic, amendment format, discuss-only path, reference inventory, ready-to-build detection, return status JSON, dedup contract

## Decisions Made

- **Write timing is Claude's discretion:** Natural write point is after summary confirmation before returning status. Claude may batch-write or write incrementally as topic areas complete. The constraint is "never pause mid-question-sequence to write" — rhythm is protected.
- **`## Discuss Amendments` is strictly additive:** Original agent-generated content above the section is never touched. If the section already exists from a prior discuss session, new amendments are appended below — not replacing existing ones. This makes amendments durable across sessions.
- **Discuss-only path is conversation-derived, not Figma-derived:** LAYOUT.md and DESIGN.md are populated with component names, section structure, and design token references from library books — not pixel measurements or CSS values. Builder fills in sensible defaults. This keeps the discuss-only path at the right abstraction level.
- **Dedup contract is explicit and mandatory:** Discuss locks decisions by writing to CONTEXT.md. Loupe agents are required to read CONTEXT.md before asking questions and skip any question already answered there. This prevents redundant re-asking across discuss → loupe → build flow.
- **Discuss dispatches nothing:** Return status JSON goes to the orchestrator, which routes. Discuss never calls any agent. This clean separation keeps the subskill instruction set simple and the orchestrator responsible for routing logic.

## Deviations from Plan

None — plan executed exactly as written. All seven sections from the Task 1 action spec were implemented. Task 2 caught three minor cleanup items (two stale references, one duplicate separator) and fixed them inline.

## Issues Encountered

None. The 25 pattern matches on the Task 1 verification grep confirmed all key write/handoff patterns were present.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `discuss.md` is now a complete subskill instruction set (483 lines) covering all five DISC requirements
- Phase 5 orchestrator (SKILL.md) can wire discuss by reading its return status JSON: `status`, `blueprintPath`, `sections[]`, `hasFullFrame`, `fullFrameUrl`
- Loupe agents can implement the dedup contract by reading CONTEXT.md before opening their question sequences
- The `## Discuss Amendments` format is ready for Builder and consolidator to consume as an overlay on base blueprint content

---
*Phase: 04-discuss-subskill*
*Completed: 2026-03-31*
