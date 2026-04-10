---
phase: 23-source-agents
plan: "02"
subsystem: source-agents
tags: [agents, background-agents, source-agents, layout, design, confidence-annotations]
dependency_graph:
  requires: []
  provides: [source-layout-agent, source-design-agent]
  affects: [loupe, consolidator, builder, reviewer]
tech_stack:
  added: []
  patterns:
    - "3-tier confidence annotation system (from code / inferred / estimated)"
    - "Background agent file pattern with dispatch:background frontmatter"
    - "80-line budget enforcement with documented compression rules"
key_files:
  created:
    - skills/core/agents/source-layout.md
    - skills/core/agents/source-design.md
  modified: []
decisions:
  - "source-layout uses filePaths[] not nodeId; otherwise mirrors layout.md structure exactly"
  - "Confidence annotation comments in Annotated CSS replace Figma:Xpx comments from original layout.md"
  - "Color matching in source-design uses best-effort (Tailwind → nearest token) with confidence tier, unlike Figma design agent's exact-hex-only rule; unmapped fallback preserved"
  - "screenshotPath optional on both agents; structural reference only, never data extraction"
metrics:
  duration_minutes: 4
  completed_date: "2026-04-10"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 0
---

# Phase 23 Plan 02: Source Layout and Design Agents Summary

Two background agent files that read TSX source files and produce LAYOUT.md and DESIGN.md artifacts with 3-tier confidence annotations, conforming to the existing pipeline schemas consumed by builder and consolidator.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Author source-layout.md agent file | f9e9976 | skills/core/agents/source-layout.md |
| 2 | Author source-design.md agent file | 17fe3db | skills/core/agents/source-design.md |

## What Was Built

### source-layout.md

Background agent that reads TSX files for a section and produces LAYOUT.md. Key behaviors:

- Accepts `filePaths[]` (not `nodeId`) as the primary input — reads source files via the Read tool
- Follows imports to style files and shared internal non-Slate non-hook components; skips hooks and Slate DS
- Extracts spacing and radius values with 3-tier confidence: explicit inline styles = "from code", Tailwind classes = "inferred", gap-filled = "estimated -- from library default"
- Annotated CSS uses `/* from code: Xpx */`, `/* inferred from className 'gap-4' -- verify visually */`, and `/* estimated -- from library default */` comments (replaces the `/* Figma: Xpx */` pattern from the original layout.md)
- Confidence summary tally as HTML comment after heading: `<!-- Confidence: N from code, N inferred, N estimated -->`
- 80-line budget with documented compression rules (merge token rows, collapse tree leaves, drop duplicate annotations)
- Writes to `{protoDir}/.watson/sections/{sectionName}/LAYOUT.md`

### source-design.md

Background agent that reads TSX files for a section and produces DESIGN.md. Key behaviors:

- Same filePaths[] input contract and import-following rules as source-layout
- Component classification scans for Slate imports and JSX usage; non-Slate visual components go to Unmapped Values as custom
- Color extraction with confidence tiers: explicit hex = "from code" (exact match to library or Unmapped Values), CSS variable = "from code", Tailwind color class = "inferred" nearest match, absent = "estimated"
- Typography: matches font-size + font-weight pair to library presets; unmatched → Unmapped Values
- Unmapped Values section always present (constraint 4) — writes `_None_` if nothing is unmapped
- Confidence summary tally and 80-line budget with same pattern as source-layout
- Writes to `{protoDir}/.watson/sections/{sectionName}/DESIGN.md`

## Design Decisions

**Confidence annotation replaces Figma comment:** The original `layout.md` uses `/* Figma: Xpx */` to show the original Figma value. For source agents, this becomes a confidence annotation (`/* from code: Xpx */`, `/* inferred ... */`, `/* estimated ... */`) since the "source of truth" is the code itself, not a separate design tool. The annotation format is more informative and aligns with the 3-tier system.

**Color matching relaxed for source agent:** The Figma design agent requires exact hex matching (character-for-character). The source design agent uses confidence tiers for color — Tailwind classes map to nearest library token as "inferred" rather than always going to Unmapped Values. This is appropriate because Tailwind's color vocabulary is a defined mapping; the resulting value may not be exact-hex but is still a principled mapping. Unresolvable values still go to Unmapped Values.

**screenshotPath boosts confidence:** Both agents accept an optional `screenshotPath`. When a screenshot confirms an inferred value, the annotation upgrades to `/* from code + visual: Xpx */`. This allows the same artifact quality boost pattern established in the CONTEXT.md confidence design.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

Verifying files exist and commits are present.
