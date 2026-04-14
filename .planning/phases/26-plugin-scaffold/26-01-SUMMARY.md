---
phase: 26-plugin-scaffold
plan: "01"
subsystem: infra
tags: [plugin, library, librarian, design-toolkit, watson]

requires: []
provides:
  - ".claude-plugin/plugin.json — Design Toolkit manifest with 4 skill commands (play/think/design/save)"
  - "library/ at plugin root — 3 books (design-system, playground-conventions, codebase-map) accessible to all skills"
  - "shared/librarian.md — Librarian as plugin-level shared utility (name: librarian, quietMode param)"
  - "shared/references/ — 4 reference files (agent-contract, book-schema, source-scanning, codebase-map-scanning)"
affects:
  - 27-play-skill
  - 28-think-skill
  - 29-design-skill
  - 30-save-skill
  - 31-branding-sweep

tech-stack:
  added: []
  patterns:
    - "Plugin manifest pattern: plugin.json with skill commands registered before skills exist"
    - "Shared utility pattern: librarian.md lives in shared/ not inside any skill directory"
    - "Plugin-root library: all skills consume from library/ at plugin root, no per-skill duplication"

key-files:
  created:
    - library/LIBRARY.md
    - library/design-system/BOOK.md
    - library/playground-conventions/BOOK.md
    - library/codebase-map/BOOK.md
    - shared/librarian.md
    - shared/references/agent-contract.md
    - shared/references/book-schema.md
    - shared/references/source-scanning.md
    - shared/references/codebase-map-scanning.md
  modified:
    - .claude-plugin/plugin.json

key-decisions:
  - "Register 4 skill commands (play/think/design/save) in plugin.json before skill files exist — establishes contract for phases 27-30"
  - "Old Watson commands (status/resume/discuss/loupe/save-blueprint) removed from manifest — absorbed into 4 new skills"
  - "watsonMode renamed to quietMode in Librarian — drops Watson branding, same boolean behavior"
  - "watson:librarian renamed to librarian — no prefix needed at plugin level"
  - "skills/core/library/ and skills/core/agents/librarian.md NOT deleted yet — Plan 03 (branding sweep) handles cleanup after all references updated"

patterns-established:
  - "Library books are at plugin root (library/), not inside any skill directory"
  - "Shared utilities live in shared/ and are accessible via @shared/ path prefix from any skill"
  - "Reference files in shared/references/ are the canonical source for agent schemas and scanning rules"

requirements-completed:
  - INFRA-01
  - INFRA-02
  - INFRA-03

duration: 4min
completed: "2026-04-14"
---

# Phase 26 Plan 01: Plugin Scaffold Foundation Summary

**Design Toolkit plugin manifest created, library promoted to plugin root, Librarian promoted to shared utility with Watson branding removed**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-14T03:59:09Z
- **Completed:** 2026-04-14T04:03:18Z
- **Tasks:** 2
- **Files modified:** 10 (1 modified, 9 created)

## Accomplishments
- Rewrote plugin.json as the Design Toolkit manifest registering 4 skill commands (/play, /think, /design, /save)
- Promoted entire library tree (3 books, 46 files) from skills/core/library/ to library/ at plugin root
- Created shared/librarian.md with updated name (librarian), quietMode param, and Design Toolkit branding
- Created shared/references/ with all 4 reference files updated for Design Toolkit branding

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Design Toolkit manifest and promote library to plugin level** - `ab725b9` (feat)
2. **Task 2: Promote Librarian and references to plugin-level shared/ directory** - `2961a96` (feat)

**Plan metadata:** *(this SUMMARY.md commit)*

## Files Created/Modified
- `.claude-plugin/plugin.json` - Rewritten as Design Toolkit manifest; 4 skill commands registered
- `library/LIBRARY.md` - Promoted from skills/core/library/; title updated to "Design Toolkit Library"
- `library/design-system/BOOK.md` + 3 chapters + 29 component pages - Promoted from skills/core/library/
- `library/playground-conventions/BOOK.md` + 7 chapters - Promoted from skills/core/library/
- `library/codebase-map/BOOK.md` + 3 chapters - Promoted from skills/core/library/
- `shared/librarian.md` - New plugin-level Librarian; watson:librarian → librarian; watsonMode → quietMode
- `shared/references/agent-contract.md` - Updated; Watson → Design Toolkit branding; librarian path updated
- `shared/references/book-schema.md` - Updated; Watson Library → Design Toolkit Library in examples
- `shared/references/source-scanning.md` - Promoted; no Watson branding to update
- `shared/references/codebase-map-scanning.md` - Promoted; Phase 23/24 references → generic "downstream consumers"

## Decisions Made
- Register skill commands in plugin.json before SKILL.md files exist — the manifest establishes the contract; phases 27-30 create the actual skill files
- Old Watson commands intentionally removed from plugin.json (status, resume, discuss, loupe, save-blueprint) — their functionality is being absorbed into the 4 new standalone skills
- `watsonMode` renamed to `quietMode` — same boolean behavior (suppress interactive prompts), drops Watson branding
- Original files in skills/core/ left in place — Plan 03 branding sweep will handle deletion after all references are updated

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- Plugin manifest is in place; skills/play/SKILL.md, skills/think/SKILL.md, skills/design/SKILL.md, skills/save/SKILL.md can be created in phases 27-30
- library/ is at plugin root; any skill can reference library/LIBRARY.md using ${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md
- shared/librarian.md is accessible to all skills; dispatch using quietMode parameter
- Plan 02 (blueprint contract) and Plan 03 (branding sweep) are ready to proceed

---
*Phase: 26-plugin-scaffold*
*Completed: 2026-04-14*
