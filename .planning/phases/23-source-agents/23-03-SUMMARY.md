---
phase: 23-source-agents
plan: "03"
subsystem: agents
tags: [source-interaction, agent-contract, background-agent, slate-component-detection]
dependency_graph:
  requires: [23-01-PLAN, 23-02-PLAN]
  provides: [source-interaction-agent, agent-contract-registry]
  affects: [skills/core/agents/source-interaction.md, skills/core/references/agent-contract.md]
tech_stack:
  added: []
  patterns: [3-tier-confidence-annotation, kebab-case-normalization, background-agent-pattern]
key_files:
  created:
    - skills/core/agents/source-interaction.md
  modified:
    - skills/core/references/agent-contract.md
decisions:
  - source-interaction mirrors interaction.md structure but detects Slate components from TSX imports/JSX instead of Figma node fetch
  - confidence tally placed as HTML comment after heading (not inline), consistent with source-layout and source-design pattern
  - agent-contract.md appended-only; no existing rows modified; Source Pipeline Parameters added as distinct section
metrics:
  duration: "~2 minutes"
  completed: "2026-04-10"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 23 Plan 03: Source Interaction Agent + Agent Contract Registry Summary

## One-liner

Background source-interaction agent detecting Slate components from TSX imports with 3-tier confidence, plus agent-contract.md extended to 12 agents (8 existing + 4 new Phase 23 entries).

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Author source-interaction.md agent file | dd2947b | skills/core/agents/source-interaction.md (created) |
| 2 | Extend agent-contract.md with 4 new agent entries | a4f674d | skills/core/references/agent-contract.md (modified) |

## What Was Built

### Task 1: source-interaction.md

Created `skills/core/agents/source-interaction.md` — a background agent that:

- Detects Slate components from TSX `import` statements (`@faire/slate` named/default imports) and confirms JSX usage
- Builds `componentList[]` using the exact kebab-case normalization table copied from `interaction.md` (10 special cases + general rule)
- Reads `components/CHAPTER.md` from `libraryPaths` to resolve PAGE.md state data for each detected component
- Analyzes event handlers, `useState` patterns, CSS/Tailwind responsive classes, and animation libraries
- Outputs INTERACTION.md with Tier 1 (library states), Tier 2 (custom overrides, omitted if empty), Tier 3 (net-new, omitted if empty)
- Annotates all values with 3-tier confidence: `from code`, `inferred`, `estimated`
- Adds confidence summary HTML comment after heading
- Enforces 50-line budget via Notes trimming, table omission, and flow compaction
- No AskUserQuestion, no Figma MCP calls

### Task 2: agent-contract.md extension

Extended `skills/core/references/agent-contract.md` with:

- 4 new Agent Registry rows: surface-resolver (foreground), source-layout, source-design, source-interaction (all background)
- surface-resolver added to Foreground Agents dispatch notes
- Source agents added to Background Agents dispatch notes
- New "Source Pipeline Parameters" section with filePaths, sectionName, screenshotPath? parameters
- All existing 8 agent rows and sections left unchanged

## Decisions Made

1. **TSX detection over Figma fetch** — source-interaction replaces the Figma MCP `nodeId` fetch in interaction.md with static import/JSX scanning. This is the structural analogue for prod-clone reference type.

2. **confidence tally placement** — HTML comment goes immediately after the `# INTERACTION: {sectionName}` heading, before any content, consistent with the source-layout/source-design confidence pattern.

3. **Source Pipeline Parameters as separate section** — Did not modify the existing "Pipeline Parameters" section (which covers loupe agents). A new section avoids conflation of two different pipeline entry points.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All created files exist on disk. All commits verified in git log.
