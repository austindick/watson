---
phase: 02-library-system
plan: 01
subsystem: library
tags: [watson, librarian, book-schema, agent-contract, library-system]

requires:
  - phase: 01-foundation-scaffold
    provides: book-schema.md, agent-contract.md, library/ directory skeleton, agents/ directory

provides:
  - Watson Librarian agent (agents/librarian.md) with complete generate mode instructions
  - Book-type guard preventing accidental regeneration of foundational books
  - agent-contract.md updated with libraryPaths (string[]) shared parameter
  - book-schema.md updated with LIBRARY.md Schema section

affects:
  - 02-02-update-mode (adds update mode instructions to agents/librarian.md)
  - 02-03-design-system-book (invokes Librarian generate mode to build design system book)
  - 02-04-playground-conventions-book (invokes Librarian generate mode for conventions book)
  - 03-agent-port (agents receive libraryPaths array parameter, not libraryPath)

tech-stack:
  added: []
  patterns:
    - "Book-type guard: check book_type frontmatter before any Librarian action; hard stop if foundational"
    - "LIBRARY.md upsert: always read-then-patch, never overwrite wholesale"
    - "@repo prefix convention for source paths relative to monorepo root"
    - "Background agent with no interactive tools — all inputs via parameters"

key-files:
  created:
    - "~/.claude/skills/watson/agents/librarian.md"
  modified:
    - "~/.claude/skills/watson/references/agent-contract.md"
    - "~/.claude/skills/watson/references/book-schema.md"

key-decisions:
  - "Update mode placeholder only in 02-01 — full update mode instructions deferred to Plan 02-03"
  - "libraryPath (string) renamed to libraryPaths (string[]) across the contract; routing responsibility moves to subskills"
  - "Librarian outputs LIBRARY.md as a read-then-upsert operation to support parallel plan runs in 02-03 and 02-04"
  - "source_hash computed as sha256 of concatenated source file contents in alphabetical order"

patterns-established:
  - "Pattern: agent frontmatter mirrors agent-contract.md registry row exactly — two are a mirrored pair"
  - "Pattern: book-type guard is first check before any scan — prevents overwriting manually-authored foundational books"
  - "Pattern: all Librarian LIBRARY.md updates are upsert-based, not overwrite-based"

requirements-completed: [LIB-05, LIB-08]

duration: 2min
completed: "2026-03-31"
---

# Phase 2 Plan 01: Librarian Agent (Generate Mode) Summary

**Background Librarian agent with 7-step generate mode, book-type guard, source-agnostic scan logic, and LIBRARY.md upsert — the foundation all other Phase 2 plans depend on**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-31T02:47:08Z
- **Completed:** 2026-03-31T02:49:00Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- Created `agents/librarian.md` with complete generate mode: 7-step scan → structure → write → index → LIBRARY.md → commit flow, book-type guard, error handling table, and overwrite behavior (watsonMode-aware)
- Updated `agent-contract.md`: shared parameter `libraryPath` (string) renamed to `libraryPaths` (string[]) with routing description; subskills are now responsible for selecting relevant books and passing them as an array
- Updated `book-schema.md`: added LIBRARY.md Schema section documenting the per-book entry format, frontmatter fields, a populated example, and the mandatory-entry-point rule

## Task Commits

1. **Task 1: Create librarian.md agent and update references** - `be732da` (feat)

## Files Created/Modified

- `~/.claude/skills/watson/agents/librarian.md` — Watson Librarian background agent: YAML frontmatter mirroring agent-contract row, book-type guard (foundational block), 7-step generate mode (validate, scan components/tokens/typography/icons, determine book structure, write chapter/page files, write BOOK.md index, auto-update LIBRARY.md, auto-commit), Update Mode placeholder, key behaviors, error handling
- `~/.claude/skills/watson/references/agent-contract.md` — Renamed shared param `libraryPath` to `libraryPaths` (string[]) with description of routing responsibility
- `~/.claude/skills/watson/references/book-schema.md` — Added LIBRARY.md Schema section: frontmatter spec, per-book entry format, populated example, and agent entry-point rules

## Decisions Made

- **Update mode as placeholder only:** Plan 02-01 is scoped to generate mode. The `## Update Mode` section in librarian.md contains a forward reference to Plan 02-03. This keeps 02-01 focused and unblocks 02-02 through 02-04 which only need generate mode.
- **libraryPaths routing responsibility:** The subskill (not the agent) is responsible for reading LIBRARY.md, selecting relevant books by use_when, and building the libraryPaths array. Agents receive only the paths they need, not the full library root.
- **LIBRARY.md upsert pattern:** Explicitly documented as read-modify-write that preserves existing entries. This mitigates the parallel-write pitfall documented in 02-RESEARCH.md when 02-03 and 02-04 run concurrently.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `agents/librarian.md` exists with complete generate mode instructions — unblocks 02-02, 02-03, and 02-04
- agent-contract.md is updated with libraryPaths; Phase 3 agent ports must use the new array parameter name
- book-schema.md LIBRARY.md section is the authoritative format reference for all Librarian LIBRARY.md writes
- Flag: Phase 3 pre-port audit should enumerate all parameter name changes (libraryPath → libraryPaths is now confirmed)

---
*Phase: 02-library-system*
*Completed: 2026-03-31*
