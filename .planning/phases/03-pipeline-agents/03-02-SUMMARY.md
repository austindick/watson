---
phase: 03-research-agents
plan: "02"
subsystem: watson-agents
tags: [figma, smoke-test, layout, design, libraryPaths, watson]

requires:
  - phase: 03-research-agents/03-01
    provides: "7 ported Watson agent files in watson/agents/"
provides:
  - "Validated LAYOUT.md and DESIGN.md artifacts from real Figma data"
  - "Confirmed libraryPaths[] consumption from watson/library/ books"
  - "Identified MCP tool name mismatch requiring agent updates"
affects: [04-builder, 05-subskills]

tech-stack:
  added: []
  patterns:
    - "Watson agent smoke test pattern: decompose → dispatch layout+design → validate"

key-files:
  created:
    - ".watson/sections/Product-List-Container/LAYOUT.md"
    - ".watson/sections/Product-List-Container/DESIGN.md"
  modified: []

key-decisions:
  - "MCP tool names need updating: agents reference get_design_context and get_metadata but actual tool is get_figma_data"
  - "Parallel dispatch not validated via background agents — MCP tools don't pass through to subagents"
  - "Used Product List Container section (3984:37123) from Catalog Connect adoption sprint for smoke test"

patterns-established:
  - "Watson staging path: .watson/sections/{sectionName}/LAYOUT.md and DESIGN.md"

requirements-completed: [LOUP-01, LOUP-02, LOUP-03, LOUP-05, LOUP-06]

duration: 15min
completed: 2026-03-31
---

# Plan 03-02: Integration Smoke Test Summary

**Watson layout and design agents produce schema-compliant artifacts from real Figma data using libraryPaths[] — MCP tool names need updating**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-31T04:30:00Z
- **Completed:** 2026-03-31T04:45:00Z
- **Tasks:** 2 (1 auto + 1 human checkpoint)
- **Files created:** 2

## Accomplishments
- Both agents produced schema-compliant output from a real Figma frame (Product List Container)
- libraryPaths[] consumption validated — tokens from global-theme CHAPTER.md correctly mapped
- Output correctly written to .watson/sections/ staging paths
- LAYOUT.md: 80 lines, 3 required sections, 13 token mappings using --slate-dimensions-* and --slate-radius-*
- DESIGN.md: 47 lines, 4 required sections, 9 component mappings, 9 color tokens, 1 unmapped value

## Task Commits

1. **Task 1: Dispatch agents against real Figma section** - `cfeafc0` (test)
2. **Task 2: Human verification** - approved by user

## Files Created/Modified
- `.watson/sections/Product-List-Container/LAYOUT.md` - Layout spec with token refs from library books
- `.watson/sections/Product-List-Container/DESIGN.md` - Design spec with component/token mapping

## Decisions Made
- Ran smoke test in orchestrator session (not subagent) because MCP tools don't pass through to spawned agents
- Used mcp__figma__get_figma_data as substitute for non-existent get_design_context/get_metadata

## Deviations from Plan

### Key Finding: MCP Tool Name Mismatch

All 3 ported agents (decomposer, layout, design) reference MCP tools that don't exist:
- `mcp__figma__get_design_context` → should be `mcp__figma__get_figma_data`
- `mcp__figma__get_metadata` → should be `mcp__figma__get_figma_data`

These tool names were carried over from the Loupe agents. The actual Figma MCP plugin provides `mcp__figma__get_figma_data` only. Agent files need updating before production use.

**Impact:** Agents would fail at Step 3 (Figma fetch) if dispatched as-is. Does not affect the port contract validation (libraryPaths[], output paths, staging) which was the primary smoke test goal.

## Issues Encountered
- Figma MCP tools not available in spawned subagents — had to run smoke test directly in main session
- Figma data for Product List Container exceeded 222K characters — required parsing globalVars section separately

## Next Phase Readiness
- Agent contract validated: libraryPaths[], .watson/sections/ output, blueprint path reads all work
- MCP tool names must be fixed before Phase 4 (builder) or Phase 5 (subskill dispatch)
- Parallel background dispatch untested — needs verification when MCP passthrough is available

---
*Phase: 03-research-agents*
*Completed: 2026-03-31*
