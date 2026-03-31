---
phase: 03-research-agents
plan: "03"
subsystem: agents
tags: [figma, mcp, watson, gap-closure]

# Dependency graph
requires:
  - phase: 03-research-agents
    provides: smoke test confirming mcp__figma__get_figma_data as the only valid Figma MCP tool (03-02-SUMMARY.md)
provides:
  - Corrected decomposer.md with all mcp__figma__get_metadata refs replaced by mcp__figma__get_figma_data
  - Corrected layout.md with all mcp__figma__get_design_context refs replaced by mcp__figma__get_figma_data
  - Corrected design.md with all mcp__figma__get_design_context refs replaced by mcp__figma__get_figma_data
  - Prohibition on mcp__figma__get_figma_data in decomposer.md removed — agents can now dispatch without Figma fetch failure
affects: [04-builder-and-reviewer, 05-orchestration-and-consolidator]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "All Figma MCP calls use mcp__figma__get_figma_data exclusively — no other Figma tool exists in the MCP server"
    - "Fallback on truncation/error: call mcp__figma__get_figma_data individually on each direct child nodeId"

key-files:
  created: []
  modified:
    - "~/.claude/skills/watson/agents/decomposer.md"
    - "~/.claude/skills/watson/agents/layout.md"
    - "~/.claude/skills/watson/agents/design.md"

key-decisions:
  - "mcp__figma__get_figma_data is the sole available Figma MCP tool — confirmed by smoke test 03-02; all agents now reflect this"
  - "Fallback strategy for large nodes is chunked calls to the same mcp__figma__get_figma_data tool, not a different tool"

patterns-established:
  - "Smoke-test-driven gap closure: run tool smoke test first, fix agent references second"

requirements-completed: [LOUP-01, LOUP-02, LOUP-03]

# Metrics
duration: 8min
completed: 2026-03-31
---

# Phase 03 Plan 03: MCP Tool Name Gap Closure Summary

**Replaced all nonexistent Figma MCP tool references in decomposer.md, layout.md, and design.md with the real tool mcp__figma__get_figma_data confirmed by the smoke test**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-31T04:45:00Z
- **Completed:** 2026-03-31T04:53:00Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments
- Fixed 6 occurrences of `mcp__figma__get_metadata` in decomposer.md — all replaced with `mcp__figma__get_figma_data`
- Removed the prohibition on `mcp__figma__get_figma_data` from decomposer.md line 16 (was blocking the only real tool)
- Fixed 3 occurrences of `mcp__figma__get_design_context` in layout.md — replaced with `mcp__figma__get_figma_data`
- Fixed 3 occurrences of `mcp__figma__get_design_context` in design.md — replaced with `mcp__figma__get_figma_data`
- Updated fallback instructions in layout.md and design.md to reference the real tool instead of a nonexistent one

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix MCP tool names in all three Figma-facing agents** - `313f684` (fix)

**Plan metadata:** _(pending final docs commit)_

## Files Created/Modified
- `~/.claude/skills/watson/agents/decomposer.md` - All mcp__figma__get_metadata refs corrected; prohibition on real tool removed
- `~/.claude/skills/watson/agents/layout.md` - All mcp__figma__get_design_context refs corrected; fallback updated
- `~/.claude/skills/watson/agents/design.md` - All mcp__figma__get_design_context refs corrected; fallback updated

## Decisions Made
- mcp__figma__get_figma_data is the sole Figma MCP tool — no fallback to a different tool exists; on truncation the same tool is called on smaller child nodes

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three Figma-facing agents (decomposer, layout, design) can now be dispatched without failing at the Figma fetch step
- Phase 04 (builder and reviewer agents) can proceed; Figma fetch tool is confirmed and consistent across all agents
- No blockers remaining in Phase 03

---
*Phase: 03-research-agents*
*Completed: 2026-03-31*
