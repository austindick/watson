---
phase: 23-source-agents
plan: 01
subsystem: agents
tags: [surface-resolver, codebase-map, prod-clone, foreground-agent, jsx-parsing, section-contract]

# Dependency graph
requires:
  - phase: 22-codebase-map-library-book
    provides: "codebase-map CHAPTER.md files with Name/Route/Description/FilePath/LastVerified tables"
provides:
  - "surface-resolver foreground agent that reads codebase-map book and produces prod-clone section contracts"
  - "RSLV-01 through RSLV-04 requirements satisfied"
affects:
  - 23-source-agents (plans 02-04: source-layout, source-design, source-interaction consume surface-resolver output)
  - 24-pipeline-wiring (loupe.md prod-clone dispatch branch dispatches surface-resolver)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Foreground agent approval flow: AskUserQuestion with humanized names, no file paths exposed"
    - "RSLV-04 stale entry handling: list parent dir, find candidates, present top 3, fall back to repick"
    - "JSX section identification: filter wrappers/providers, auto-expand when <= 2 visual children"
    - "referenceType:prod-clone section contract shape with filePaths[] and sourceSurface"

key-files:
  created:
    - skills/core/agents/surface-resolver.md
  modified: []

key-decisions:
  - "Surface resolver reads @repo-prefixed file paths from codebase-map CHAPTER.md tables; resolves prefix from active workspace"
  - "Section identification uses JSX top-level children with provider/wrapper filter + auto-expand rule at <= 2 visual children"
  - "Approval list shows humanized PascalCase names and one-line descriptions only — file paths never shown to user"
  - "RSLV-04: on stale codebase-map entry, search nearby files, present top 3 candidates, fall back to Step 1 surface repick"
  - "filePaths[] includes associated style files (CSS/SCSS) but excludes hook files (useX.ts)"

patterns-established:
  - "surface-resolver agent file follows decomposer.md pattern exactly: YAML frontmatter, Role, Critical Constraints, Inputs/Outputs, Execution (numbered steps), Output Format"
  - "Section contract shape: {name, referenceType:'prod-clone', filePaths[], description, sourceSurface{name, route}}"

requirements-completed: [RSLV-01, RSLV-02, RSLV-03, RSLV-04]

# Metrics
duration: 1min
completed: 2026-04-10
---

# Phase 23 Plan 01: Surface Resolver Summary

**Foreground surface-resolver agent that reads codebase-map CHAPTER.md tables, identifies JSX visual sections from page components, and produces prod-clone section contracts with filePaths[] and sourceSurface**

## Performance

- **Duration:** 1 min
- **Started:** 2026-04-10T18:22:54Z
- **Completed:** 2026-04-10T18:24:14Z
- **Tasks:** 1 of 1
- **Files modified:** 1

## Accomplishments

- Authored `skills/core/agents/surface-resolver.md` as a complete foreground agent file mirroring the decomposer.md pattern
- Implemented RSLV-01 through RSLV-04: codebase-map lookup, JSX section identification, section list with filePaths, and stale entry verification with fallback
- Established the prod-clone section contract shape with `sourceSurface` carrying original codebase-map entry data for builder context

## Task Commits

Each task was committed atomically:

1. **Task 1: Author surface-resolver.md agent file** - `2e1c15e` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `skills/core/agents/surface-resolver.md` - Foreground agent that reads codebase-map book and produces prod-clone section contracts; 158 lines covering 7 execution steps, 6 critical constraints, and exact output format

## Decisions Made

- Surface resolver resolves `@repo/` file path prefix from the active workspace by traversing known paths — avoids hardcoding monorepo root
- Style files (CSS/SCSS) included in `filePaths[]` alongside TSX; hook files excluded (non-visual)
- Auto-expand rule triggers at `<= 2` visual children (not `< 2`) to handle the common case of a single root container wrapping all page content
- Approval list format mirrors decomposer's heuristic path UX — users get the same prompt shape regardless of Figma vs prod-clone path

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `surface-resolver.md` is ready for Phase 23 plans 02-04 (source-layout, source-design, source-interaction) to reference for the shared section contract shape
- `agent-contract.md` registry entry for surface-resolver is deferred to plan 04 (per CONTEXT.md: "All 4 agents added to agent-contract.md registry in Phase 23")
- Phase 24 pipeline wiring can now design the loupe.md prod-clone dispatch branch knowing the exact surface-resolver output shape

---
*Phase: 23-source-agents*
*Completed: 2026-04-10*
