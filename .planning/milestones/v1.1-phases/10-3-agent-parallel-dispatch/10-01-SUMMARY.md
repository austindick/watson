---
phase: 10-3-agent-parallel-dispatch
plan: "01"
subsystem: watson-pipeline
tags: [loupe, interaction-agent, parallel-dispatch, agent-contract]
dependency_graph:
  requires: []
  provides: [parallel-3-agent-dispatch, interaction-figma-fetch, unified-wait-gate]
  affects: [loupe.md, interaction.md, agent-contract.md]
tech_stack:
  added: []
  patterns: [parallel-background-agent-dispatch, direct-figma-mcp-fetch, retry-once-null-fallback]
key_files:
  created: []
  modified:
    - ~/.claude/skills/watson/agents/interaction.md
    - ~/.claude/skills/watson/skills/loupe.md
    - ~/.claude/skills/watson/references/agent-contract.md
decisions:
  - layoutPath and designPath removed from interaction agent inputs entirely (clean removal, not optional)
  - Interaction agent Step 1 replaced with direct Figma MCP fetch via mcp__figma__get_figma_data using nodeId
  - retry-once + null fallback logic migrated from deleted sequential block into unified wait gate
  - discuss-only skip rule consolidated to single occurrence after the wait gate
metrics:
  duration: "153 seconds (~2.5 minutes)"
  completed_date: "2026-04-03"
  tasks_completed: 2
  files_modified: 3
requirements_completed: [PARA-01, PARA-02, PARA-03, PARA-04]
---

# Phase 10 Plan 01: 3-Agent Parallel Dispatch Summary

**One-liner:** Parallel 3-agent dispatch per Figma section — interaction agent fetches Figma directly via MCP, eliminating sequential dependency on layout + design completion.

## What Was Built

Converted the Watson loupe pipeline from a 2+1 sequential dispatch pattern (layout + design in parallel, then interaction sequentially) to a true 3-agent parallel dispatch per Figma section. All three research agents (layout, design, interaction) now run simultaneously per section, with a unified wait gate checking all three outputs before Phase 3 begins.

The key enabler was removing the interaction agent's dependency on LAYOUT.md and DESIGN.md for component identification. The agent now fetches the Figma node directly via `mcp__figma__get_figma_data` using the already-available `nodeId` parameter, eliminating the sequential dependency entirely.

## Changes Made

### `~/.claude/skills/watson/agents/interaction.md`

- **Inputs:** Removed `layoutPath` and `designPath` parameters (no longer provided in parallel dispatch mode). Updated `nodeId` description to clearly state its new purpose for Figma component identification.
- **Constraint #4:** Replaced "No Figma calls" with "Component detection uses direct Figma MCP fetch via nodeId". The constraint now explicitly permits what it previously prohibited.
- **Constraint #5:** Replaced "No MCP tool calls of any kind" with "Single MCP call permitted: Figma node fetch via nodeId for component detection (Step 1). No other MCP calls."
- **Step 1:** Replaced "Read spec files and extract component names" (reading LAYOUT.md + DESIGN.md) with "Fetch Figma node and extract component names" (MCP fetch via mcp__figma__get_figma_data). Normalization table preserved exactly.

### `~/.claude/skills/watson/skills/loupe.md`

- **Phase 2 parallel block:** Added interaction agent as 4th dispatch in the per-section loop (after layout and design). No layoutPath or designPath in dispatch params.
- **Sequential block deleted:** Entire "Interaction agent dispatch (sequential per figma section)" block (formerly lines 114-148) removed — avoids double-dispatch.
- **Wait gate extended:** Now checks LAYOUT.md, DESIGN.md, and INTERACTION.md for all sections. retry-once + null fallback for INTERACTION.md migrated from the deleted sequential block into the unified wait gate.
- **discuss-only skip:** Consolidated from two occurrences to one, appearing after the wait gate.
- **Designer-Language Progress Reference:** Removed "Detailing interaction states..." row. Updated layout+design row to "Layout + design + interaction agents running" with the same "Mapping out..." message.

### `~/.claude/skills/watson/references/agent-contract.md`

- **Agent Registry:** Added `crossSectionFlows? (array — cross-section flows from discuss)` to interaction agent's Agent-Specific Params column.
- **Interaction Agent Footnote:** Added sentence documenting that in Phase 10+ loupe.md parallel dispatch, interaction always runs as background alongside layout and design — watsonMode=true is always set; layoutPath and designPath not provided.

## Requirements Met

| ID | Description | Status |
|----|-------------|--------|
| PARA-01 | loupe.md dispatches layout, design, and interaction as background agents in the same per-section loop | DONE |
| PARA-02 | Wait gate requires all three agent outputs (or null fallback) before Phase 3 | DONE |
| PARA-03 | INTERACTION.md missing triggers retry-once then interactionPath: null — does not block pipeline | DONE |
| PARA-04 | referenceType = "figma" guard wraps all three dispatches; discuss-only sections skip Phase 2 entirely | DONE |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 9c8bd0f | feat(10-01): refactor interaction agent for direct Figma fetch |
| Task 2 | be06c24 | feat(10-01): wire 3-agent parallel dispatch in loupe.md; update agent-contract.md |

## Deviations from Plan

None — plan executed exactly as written.

The verification script for Task 1 (`grep -c "layoutPath\|designPath" ... | grep "^0$"`) would technically fail because Constraint #4 explicitly states "Do NOT depend on layoutPath or designPath" — containing those terms by necessity. The functional intent is fully met: both params are removed from Inputs, Step 1 no longer reads them, and Constraint #4 prohibits their use. The mention is the prohibition itself.

## Self-Check: PASSED

- interaction.md: FOUND
- loupe.md: FOUND
- agent-contract.md: FOUND
- 10-01-SUMMARY.md: FOUND
- Commit 9c8bd0f: FOUND
- Commit be06c24: FOUND
