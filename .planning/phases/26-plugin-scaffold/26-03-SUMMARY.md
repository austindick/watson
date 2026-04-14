---
phase: 26-plugin-scaffold
plan: 03
subsystem: infra
tags: [design-toolkit, branding, skill-stubs, CSO]

# Dependency graph
requires:
  - phase: 26-01
    provides: plugin.json manifest with 4 command stubs registered
  - phase: 26-02
    provides: shared/references/ blueprint contract files
provides:
  - "Zero Watson branding in user-facing outputs, branch prefixes, and status files"
  - "4 SKILL.md stubs at skills/{play,think,design,save}/SKILL.md with CSO-optimized frontmatter"
  - "All core skill files rebranded to Design Toolkit identity"
  - "Agent parameter watsonMode renamed to quietMode throughout"
  - "Staging dir .watson/sections replaced with .dt/sections"
affects: [phase-27, phase-28, phase-29, phase-31, core-skill-files]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSO-optimized SKILL.md frontmatter: name + 'Use when...' description"
    - "dt/ branch prefix for all prototype branches (replacing watson/)"
    - "quietMode boolean parameter replaces watsonMode in all agents"

key-files:
  created:
    - skills/play/SKILL.md
    - skills/think/SKILL.md
    - skills/design/SKILL.md
    - skills/save/SKILL.md
  modified:
    - skills/core/SKILL.md
    - skills/core/references/watson-banner.md
    - skills/core/references/watson-ambient.md
    - skills/core/utilities/watson-init.md
    - skills/core/skills/discuss.md
    - skills/core/skills/loupe.md
    - skills/core/skills/save-blueprint.md
    - skills/core/skills/resume.md
    - skills/core/skills/status.md
    - skills/core/agents/builder.md
    - skills/core/agents/consolidator.md
    - skills/core/agents/decomposer.md
    - skills/core/agents/design.md
    - skills/core/agents/interaction.md
    - skills/core/agents/layout.md
    - skills/core/agents/librarian.md
    - skills/core/agents/reviewer.md
    - skills/core/agents/source-design.md
    - skills/core/agents/source-interaction.md
    - skills/core/agents/source-layout.md
    - skills/core/agents/surface-resolver.md
    - scripts/watson-session-start.js
    - scripts/watson-session-end.js
    - scripts/watson-statusline.js

key-decisions:
  - "Filenames not renamed (watson-init.md, watson-banner.md, scripts) — content rebrand is sufficient; file renames deferred to later phases to avoid cross-reference breakage"
  - "watsonMode parameter renamed to quietMode in all agents — cleaner abstraction, no Watson coupling"
  - "Staging directory renamed from .watson/sections to .dt/sections throughout pipeline"
  - "CSO stub descriptions use 'Use when...' trigger pattern for Claude Code skill matching"

patterns-established:
  - "SKILL.md stub pattern: frontmatter-first with name, Use-when description, minimal body with pointer to current implementation"
  - "Rebrand-in-place: preserve filenames, update content — avoids breaking @references"

requirements-completed:
  - INFRA-05
  - INFRA-06

# Metrics
duration: 8min
completed: 2026-04-14
---

# Phase 26 Plan 03: Watson Rebrand and SKILL.md Stubs Summary

**Watson branding fully replaced with Design Toolkit across 28 files; 4 CSO-optimized /play, /think, /design, /save stubs created with plugin.json commands resolving to existing files**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-14T04:05:23Z
- **Completed:** 2026-04-14T04:13:00Z
- **Tasks:** 2
- **Files modified:** 28

## Accomplishments

- Systematically removed all capitalized "Watson" strings from user-facing skill output (SKILL.md, subskills, utilities, agents, scripts)
- Replaced branch prefix `watson/` → `dt/` and temp file paths `/tmp/watson-*` → `/tmp/dt-*` throughout all 28 files
- Created 4 stub SKILL.md files with CSO-optimized frontmatter ensuring plugin.json commands resolve immediately
- Renamed `watsonMode` → `quietMode` in all 12 agents for cleaner abstraction
- Renamed staging directory `.watson/sections` → `.dt/sections` in all pipeline agents

## Task Commits

1. **Task 1: Watson branding removal across all files** - `00a9519` (feat)
2. **Task 2: Create CSO-optimized SKILL.md stubs for /play, /think, /design, /save** - `d3adedc` (feat)

## Files Created/Modified

**Created:**
- `skills/play/SKILL.md` — /play session management stub (Phase 27)
- `skills/think/SKILL.md` — /think design discussion stub (Phase 28)
- `skills/design/SKILL.md` — /design build pipeline stub (Phase 29)
- `skills/save/SKILL.md` — /save checkpoint utility stub (Phase 31)

**Modified (28 files):**
- `skills/core/SKILL.md` — name: watson → design-toolkit, all /watson → /play, watson/ → dt/
- `skills/core/references/watson-banner.md` — replaced ASCII art with "Design Toolkit"
- `skills/core/references/watson-ambient.md` — updated content to reference Design Toolkit, dt-active.json
- `skills/core/utilities/watson-init.md` — branch prefix watson/ → dt/, commit prefixes, temp files
- `skills/core/skills/discuss.md` — headers, state file paths, branch prefix
- `skills/core/skills/loupe.md` — Build Pipeline Subskill, .dt/sections, quietMode
- `skills/core/skills/save-blueprint.md` — Save Blueprint Subskill, session terminology
- `skills/core/skills/resume.md` — Resume Subskill, dt-active.json, dt/ branches
- `skills/core/skills/status.md` — Status Subskill, dt/ branches, /play references
- `skills/core/agents/builder.md` + 11 other agents — .dt/sections, quietMode, plugin contract
- `scripts/watson-session-start.js` — Design Toolkit plugin, dt-declined.json, dt-active.json
- `scripts/watson-session-end.js` — Design Toolkit plugin, dt-active.json, dt-session-end.json
- `scripts/watson-statusline.js` — DT: ON, dt-active.json, dt/ branch strip

## Decisions Made

- **Filenames preserved:** watson-init.md, watson-banner.md, watson-ambient.md, and script files kept their names to avoid cross-reference breakage. Content rebrand is sufficient for this phase.
- **watsonMode → quietMode:** Renamed in all 12 agents. Cleaner parameter name without Watson coupling; all callers in loupe.md updated to pass `quietMode: true`.
- **staging dir .watson/ → .dt/:** The hidden staging directory renamed from `.watson/sections` to `.dt/sections` to match the new brand identity.

## Deviations from Plan

None — plan executed exactly as written. The file-by-file instructions in the plan were comprehensive and followed precisely.

## Issues Encountered

None.

## Next Phase Readiness

- Phase 27 (/play extraction): `skills/play/SKILL.md` stub ready; session management logic in `skills/core/SKILL.md` and `skills/core/utilities/watson-init.md` fully rebranded
- Phase 28 (/think extraction): `skills/think/SKILL.md` stub ready; discuss logic in `skills/core/skills/discuss.md` fully rebranded
- Phase 29 (/design extraction): `skills/design/SKILL.md` stub ready; pipeline in `skills/core/skills/loupe.md` fully rebranded
- Phase 31 (/save extraction): `skills/save/SKILL.md` stub ready; save logic in `skills/core/skills/save-blueprint.md` fully rebranded
- All plugin.json commands resolve to valid SKILL.md files

---
*Phase: 26-plugin-scaffold*
*Completed: 2026-04-14*
