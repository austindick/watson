---
phase: 03-research-agents
plan: "01"
subsystem: agents
tags: [agents, watson-contract, port, loupe, library-system]
dependency_graph:
  requires: [02-library-system]
  provides: [watson-agents/decomposer, watson-agents/layout, watson-agents/design, watson-agents/interaction, watson-agents/builder, watson-agents/reviewer, watson-agents/consolidator]
  affects: [03-02-subskills]
tech_stack:
  added: []
  patterns: [watson-agent-contract, libraryPaths-array, blueprintPath-vocabulary, watson-sections-staging]
key_files:
  created:
    - ~/.claude/skills/watson/agents/decomposer.md
    - ~/.claude/skills/watson/agents/layout.md
    - ~/.claude/skills/watson/agents/design.md
    - ~/.claude/skills/watson/agents/interaction.md
    - ~/.claude/skills/watson/agents/builder.md
    - ~/.claude/skills/watson/agents/reviewer.md
    - ~/.claude/skills/watson/agents/consolidator.md
  modified: []
decisions:
  - interaction agent is a documented 28-line placeholder — deferral notice plus contract stub with no execution steps
  - consolidator reads prior vocabulary from blueprintPath (not hardcoded .loupe/ paths) enabling portable blueprint directories
  - all pipeline agents accept libraryPaths[] but consolidator does not use it — accepted for contract uniformity
  - FauxDS token mapping logic preserved intact; only the load mechanism changed from hardcoded path to libraryPaths[] iteration
metrics:
  duration: "5 min"
  completed_date: "2026-03-31"
  tasks_completed: 2
  files_created: 7
  files_modified: 0
---

# Phase 03 Plan 01: Port Loupe Agents to Watson Contract Summary

Mechanical port of 7 Loupe pipeline agents to Watson contract: renamed files, libraryPaths[] array replacing libraryPath string, .watson/sections/ replacing .loupe/sections/, blueprintPath for vocabulary reads, and source-agnostic library book reading. All 8 contract compliance checks pass.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Port decomposer, layout, design agents | d0f9a6e | decomposer.md, layout.md, design.md |
| 2 | Port builder, reviewer, consolidator; create interaction placeholder | c125d9b | interaction.md, builder.md, reviewer.md, consolidator.md |

## What Was Built

**7 Watson-contract-compliant agent files** in `~/.claude/skills/watson/agents/`:

- **decomposer.md** — Figma frame decomposition into named sections. Accepts `libraryPaths[]` per contract but does not use it (decomposer reads only Figma metadata). `dispatch: foreground`.
- **layout.md** — Figma auto-layout to LAYOUT.md spec. Reads each path in `libraryPaths[]` directly to load spacing and radius tokens. Source-agnostic token mapping. `dispatch: background`.
- **design.md** — Figma visual styles to DESIGN.md spec. Reads components, color tokens, and typography presets from `libraryPaths[]`. Exact hex matching preserved. `dispatch: background`.
- **interaction.md** — Documented placeholder, 28 lines. Contains Watson contract stub (inputs/outputs) and deferral notice pointing to the `discuss` subskill. `dispatch: foreground`.
- **builder.md** — Spec-to-code builder. Reads library books from `libraryPaths[]` for component variant validation. Spec files at `.watson/sections/{sectionName}/`. `dispatch: background`.
- **reviewer.md** — Property-by-property audit and fix. Verifies staging files at `.watson/sections/{sectionScope}/`. 2-pass maximum. `dispatch: background`.
- **consolidator.md** — Merges section staging to `blueprint/LAYOUT.md` and `blueprint/DESIGN.md` via `blueprintPath`. Cleans `.watson/sections/` after gated verification. `dispatch: background`.

## Contract Compliance Results

All 8 checks passed:
1. All 7 files exist in watson/agents/
2. Zero `.loupe/` path references in any agent
3. Zero `libraryPath` singular parameter uses
4. Zero `fauxds-library.md` hardcoded path references
5. All pipeline agents (layout, design, builder, reviewer, consolidator) reference `.watson/sections/`
6. Consolidator references `blueprint/` for consolidated output
7. interaction.md contains "deferred" and is 28 lines (< 40)
8. All frontmatter includes `name:` and `dispatch:` matching Watson agent registry

## Deviations from Plan

None — plan executed exactly as written.

## Key Translation Changes Applied

| Loupe (before) | Watson (after) |
|----------------|----------------|
| `name: agent-NN-name` | `name: agentname` (no numeric prefix) |
| `libraryPath` (string) | `libraryPaths` (string[]) — iterate and read each |
| `.loupe/sections/[name]/` | `.watson/sections/{sectionName}/` |
| `existingLayoutPath` / `existingDesignPath` | reads from `{blueprintPath}/LAYOUT.md` / `{blueprintPath}/DESIGN.md` |
| `.loupe/LAYOUT.md`, `.loupe/DESIGN.md` (consolidator output) | `{blueprintPath}/LAYOUT.md`, `{blueprintPath}/DESIGN.md` |
| `<!-- Consolidated by Loupe Agent 06 -->` | `<!-- Consolidated by Watson Agent: Consolidator -->` |
| `rm -rf .loupe/sections/` (cleanup) | `rm -rf .watson/sections/` |
| FauxDS-specific load instructions | "read each file in libraryPaths[], load whatever tokens found" |

## Self-Check: PASSED

- All 7 agent files confirmed at `~/.claude/skills/watson/agents/`
- Commit d0f9a6e confirmed (Task 1: decomposer, layout, design)
- Commit c125d9b confirmed (Task 2: interaction, builder, reviewer, consolidator)
- SUMMARY.md confirmed at `.planning/milestones/v1.0-phases/03-research-agents/03-01-SUMMARY.md`
