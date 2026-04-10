---
phase: 22-codebase-map-library-book
plan: 01
subsystem: library
tags: [watson, librarian, codebase-map, library-book, source-derived, faire-frontend]

# Dependency graph
requires: []
provides:
  - "skills/core/references/codebase-map-scanning.md — Librarian scanning instructions for codebase-map books"
  - "skills/core/library/codebase-map/BOOK.md — source-derived codebase-map book index with 3 chapters"
  - "skills/core/library/codebase-map/brand-portal/CHAPTER.md — Brand Portal seed surfaces (My Shop, Orders, Catalog)"
  - "skills/core/library/codebase-map/retailer/CHAPTER.md — Retailer seed surfaces (Browse, Cart, Orders)"
  - "skills/core/library/codebase-map/logged-out/CHAPTER.md — Logged Out seed surfaces (Home, Product, Category)"
  - "skills/core/library/LIBRARY.md updated — Codebase Map entry added, books_count 3"
affects:
  - "23-source-agents — source agents consume codebase-map chapters via libraryPaths[] to locate faire/frontend files"
  - "24-named-experience-menu — named experience menu reads BOOK.md chapters[] and CHAPTER.md section headings for 2-step browse"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "codebase-map-scanning.md pattern: parallel scanning reference alongside source-scanning.md, both referenced conditionally from librarian.md"
    - "Conditional Librarian dispatch: outputBookPath containing 'codebase-map' routes to codebase-map-scanning.md, all others to source-scanning.md"
    - "2-level seed book: BOOK.md + 3 CHAPTER.md with inline section-grouped tables, no PAGE.md files"
    - "5-column surface entry format: Name, Route, Description, File Path, Last Verified — fixed schema for downstream consumers"

key-files:
  created:
    - "skills/core/references/codebase-map-scanning.md"
    - "skills/core/library/codebase-map/BOOK.md"
    - "skills/core/library/codebase-map/brand-portal/CHAPTER.md"
    - "skills/core/library/codebase-map/retailer/CHAPTER.md"
    - "skills/core/library/codebase-map/logged-out/CHAPTER.md"
  modified:
    - "skills/core/agents/librarian.md"
    - "skills/core/library/LIBRARY.md"

key-decisions:
  - "codebase-map scanning is conditional on outputBookPath — existing source-scanning.md path for design-system books is preserved unchanged"
  - "2-level book structure locked (CHAPTER.md inline tables, no PAGE.md) to keep downstream consumers (Phase 23, Phase 24) simple"
  - "Chapter id 'logged-out' and title 'Logged Out' used everywhere; source path correctly shows @repo/packages/marketplace/ — these are distinct concerns"
  - "Seed files contain representative 2-3 entries per section so downstream can develop against valid parseable content before Librarian runs"
  - "last_verified documented as staleness hint not validity guarantee; runtime verification by source agents is RSLV-04 responsibility"

patterns-established:
  - "Parallel scanning reference: create a domain-specific scanning reference (codebase-map-scanning.md) rather than extending source-scanning.md with conditional logic"
  - "Conditional Librarian wiring: add conditional branches in Steps 2 and 3 keyed on outputBookPath substring — no structural changes to agent flow"
  - "Seed book pattern: valid parseable book with representative entries and markdown comments indicating seed status"

requirements-completed: [CBNV-01, CBNV-02, CBNV-03]

# Metrics
duration: 3min
completed: 2026-04-10
---

# Phase 22 Plan 01: Codebase-Map Library Book Summary

**New source-derived codebase-map library book with 3 app chapters (Brand Portal, Retailer, Logged Out) and a parallel codebase-map-scanning.md reference that wires the Librarian to scan faire/frontend surface files into 5-column section-grouped tables**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-10T15:44:06Z
- **Completed:** 2026-04-10T15:46:46Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Created `codebase-map-scanning.md` with all 7 required sections: source packages, sub-scan discovery, surface heuristic, entry format, chapter output format, book structure rules, and anti-patterns (188 lines)
- Updated `librarian.md` with 3 conditional references to codebase-map-scanning.md (References block, Step 2, Step 3) while preserving existing source-scanning.md path unchanged
- Created seed codebase-map book: `BOOK.md` + 3 `CHAPTER.md` files with representative section-grouped 5-column tables, ready for Phase 23 and Phase 24 development
- Updated `LIBRARY.md`: books_count 3, Codebase Map entry added, last_updated current

## Task Commits

Each task was committed atomically:

1. **Task 1: Create codebase-map scanning reference and update Librarian agent** - `2f9d717` (feat)
2. **Task 2: Create seed codebase-map book and update LIBRARY.md** - `0a5cebc` (feat)

## Files Created/Modified

- `skills/core/references/codebase-map-scanning.md` — New scanning reference with source packages, skip list, surface heuristic, 5-column entry format, chapter output format, book structure rules, anti-patterns
- `skills/core/agents/librarian.md` — Added codebase-map-scanning reference in 3 places (References block, Step 2, Step 3) with conditional dispatch logic
- `skills/core/library/codebase-map/BOOK.md` — Source-derived book index: 3 chapters (brand-portal, retailer, logged-out), all source_paths, use_when, seed source_hash
- `skills/core/library/codebase-map/brand-portal/CHAPTER.md` — Seed chapter: My Shop, Orders, Catalog sections with 2-3 representative entries each
- `skills/core/library/codebase-map/retailer/CHAPTER.md` — Seed chapter: Browse, Cart, Orders sections with 2-3 representative entries each
- `skills/core/library/codebase-map/logged-out/CHAPTER.md` — Seed chapter: Home, Product, Category sections with 2 representative entries each
- `skills/core/library/LIBRARY.md` — books_count 2→3, Codebase Map entry added, last_updated 2026-04-10

## Decisions Made

- Librarian wiring is conditional on `outputBookPath` containing `codebase-map` — no other books are affected
- Seed entries use representative plausible paths (not validated against faire/frontend since Watson repo is separate from faire/frontend) — Librarian generate run from within faire/frontend will overwrite with real data
- Chapter id `logged-out` used throughout; source path correctly retains `@repo/packages/marketplace/` — naming distinction documented in both codebase-map-scanning.md and BOOK.md

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 23 (source agents): codebase-map CHAPTER.md files are parseable 5-column tables; source agents can develop against them immediately. They should expect to receive chapter paths as `libraryPaths[]` and read File Path column to locate faire/frontend files.
- Phase 24 (named experience menu): BOOK.md `chapters[]` array + CHAPTER.md section headings (H2) + table rows support the 2-step browse pattern (pick app → see surfaces by section).
- Librarian generate run: when run from within faire/frontend, will overwrite seed entries with real surface data. The seed structure demonstrates the expected output format.

---
*Phase: 22-codebase-map-library-book*
*Completed: 2026-04-10*
