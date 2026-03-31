---
phase: 02-library-system
plan: 04
subsystem: library
tags: [watson, playground-conventions, book, foundational, plugin-manifest]

requires:
  - phase: 02-library-system
    plan: 01
    provides: Librarian agent, book-schema.md LIBRARY.md section

provides:
  - playground-conventions foundational book (7 chapters, agent-optimized reference)
  - Watson plugin manifest (.claude-plugin/plugin.json)
  - LIBRARY.md indexed with playground-conventions entry

affects:
  - Phase 3 agents (Builder, Design) read playground-conventions via libraryPaths
  - Watson distribution (plugin manifest enables Claude Code plugin install)

tech-stack:
  added: []
  patterns:
    - "Foundational book: manually authored, book_type guard prevents Librarian regeneration"
    - "2-level flat book: BOOK.md -> CHAPTER.md, no PAGE.md files"
    - "MUST/NEVER vs PREFER/SHOULD rule distinction throughout all chapters"
    - "Watson plugin manifest: .claude-plugin/plugin.json with skill_file entry point"

key-files:
  created:
    - "~/.claude/skills/watson/library/playground-conventions/BOOK.md"
    - "~/.claude/skills/watson/library/playground-conventions/project-structure/CHAPTER.md"
    - "~/.claude/skills/watson/library/playground-conventions/scaffolding/CHAPTER.md"
    - "~/.claude/skills/watson/library/playground-conventions/components/CHAPTER.md"
    - "~/.claude/skills/watson/library/playground-conventions/design-tokens/CHAPTER.md"
    - "~/.claude/skills/watson/library/playground-conventions/dev-workflow/CHAPTER.md"
    - "~/.claude/skills/watson/library/playground-conventions/multi-variant/CHAPTER.md"
    - "~/.claude/skills/watson/library/playground-conventions/contributor-registration/CHAPTER.md"
    - "~/.claude/skills/watson/.claude-plugin/plugin.json"
  modified:
    - "~/.claude/skills/watson/library/LIBRARY.md"

decisions:
  - "Scaffolding chapter includes full entity_db workflow and transitive import rules from CLAUDE.md — agents need this to set up data layer correctly"
  - "SlateTable reference data (full props + cell types table) placed in components chapter — not a separate book"
  - "LIBRARY.md starts with 1 book (playground-conventions only) — design-system book deferred to 02-03 which was not executed in this session"
  - "plugin.json placed at watson/.claude-plugin/plugin.json — standard Claude Code plugin spec location"

metrics:
  duration: "4min"
  completed: "2026-03-31"
  tasks: 2
  files_created: 9
  files_modified: 1
---

# Phase 2 Plan 04: Playground Conventions Book Summary

**Foundational 7-chapter playground-conventions book (BOOK.md + 7 CHAPTERs) consolidating 5 source docs into agent-optimized reference, registered in LIBRARY.md, with Watson plugin manifest**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-31T02:52:16Z
- **Completed:** 2026-03-31T02:56:40Z
- **Tasks:** 2
- **Files created:** 9
- **Files modified:** 1

## Accomplishments

- Created `library/playground-conventions/BOOK.md` — foundational type, 7-chapter manifest, use_when, source_paths list, chapters table
- Created 7 CHAPTER.md files (all 2-level flat, inline content, no pages field):
  - `project-structure/CHAPTER.md` — directory layout, React Router v5 pattern, data layer rules (entity_types, entity_db, get_entity.ts contract)
  - `scaffolding/CHAPTER.md` — 4-step checklist (page file, registry, data layer, thumbnail), entity_db import workflow, transitive import rule, validation commands
  - `components/CHAPTER.md` — FauxDS component list with import paths, VariantSwitcher props, BrandPortalLayout with navOverrides, SlateTable full reference (props, cell types, SlateTableActions props, customCellRenderer)
  - `design-tokens/CHAPTER.md` — Slate CSS variable convention, color/type/spacing tables, token vs raw value guidance
  - `dev-workflow/CHAPTER.md` — dev server, dependencies, thumbnails, commit rules (--no-verify), publishing workflow, shared code policy
  - `multi-variant/CHAPTER.md` — folder structure, CONCEPTS array pattern, variant isolation rules, adding-new-variant sequence
  - `contributor-registration/CHAPTER.md` — registration format, owner field matching, case-sensitivity rules
- Updated `library/LIBRARY.md` — playground-conventions entry with full metadata (path, book_type, use_when, chapter_count, last_run_summary)
- Created `watson/.claude-plugin/plugin.json` — Watson plugin manifest with name, version, description, skill_file, author, permissions

## Task Commits

1. **Task 1: Author playground conventions book (7 chapters)** — `2013b8c` (feat)
2. **Task 2: Update LIBRARY.md and create plugin manifest** — `fe21ab4` (feat)

## Files Created/Modified

- `~/.claude/skills/watson/library/playground-conventions/BOOK.md` — book index, foundational type, 7-chapter manifest
- `~/.claude/skills/watson/library/playground-conventions/project-structure/CHAPTER.md` — layout, tech stack, route pattern, data layer rules
- `~/.claude/skills/watson/library/playground-conventions/scaffolding/CHAPTER.md` — 4-step checklist, entity_db workflow, validation
- `~/.claude/skills/watson/library/playground-conventions/components/CHAPTER.md` — FauxDS list, VariantSwitcher, BrandPortal, SlateTable full reference
- `~/.claude/skills/watson/library/playground-conventions/design-tokens/CHAPTER.md` — Slate CSS vars, color/type/spacing conventions
- `~/.claude/skills/watson/library/playground-conventions/dev-workflow/CHAPTER.md` — dev server, thumbnails, publishing, shared code policy
- `~/.claude/skills/watson/library/playground-conventions/multi-variant/CHAPTER.md` — folder structure, CONCEPTS array, variant isolation
- `~/.claude/skills/watson/library/playground-conventions/contributor-registration/CHAPTER.md` — registration format, owner matching
- `~/.claude/skills/watson/.claude-plugin/plugin.json` — Watson plugin manifest
- `~/.claude/skills/watson/library/LIBRARY.md` — added playground-conventions entry

## Decisions Made

- **entity_db workflow in scaffolding:** The full CLI workflow (entity-db missing/upsert/validate), transitive import rule, and rate-limit handling from CLAUDE.md were included in the scaffolding chapter rather than being abbreviated — agents need the complete procedure to correctly set up data layers
- **SlateTable in components chapter:** Full props reference, cell types table, and SlateTableActions props placed in components chapter (not a separate book) per 02-CONTEXT.md decision
- **LIBRARY.md starts with 1 book:** design-system book (02-02/02-03) was not executed in this session, so LIBRARY.md starts with 1 entry. If 02-02/02-03 run later, they should upsert the design-system entry without overwriting playground-conventions

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

| Check | Result |
|-------|--------|
| `find playground-conventions -name "CHAPTER.md" \| wc -l` | 7 |
| `find playground-conventions -name "PAGE.md" \| wc -l` | 0 |
| `grep foundational BOOK.md` | PASS |
| LIBRARY.md -> BOOK.md navigation | PASS |
| BOOK.md -> chapter paths resolve | PASS |
| `grep -c "MUST\|NEVER\|PREFER\|SHOULD" scaffolding/CHAPTER.md` | 12 |
| `test -f .claude-plugin/plugin.json` | PASS |

## Self-Check: PASSED

Files verified:
- `/Users/austindick/.claude/skills/watson/library/playground-conventions/BOOK.md` — FOUND
- `/Users/austindick/.claude/skills/watson/library/playground-conventions/scaffolding/CHAPTER.md` — FOUND
- `/Users/austindick/.claude/skills/watson/library/LIBRARY.md` — FOUND (contains playground-conventions)
- `/Users/austindick/.claude/skills/watson/.claude-plugin/plugin.json` — FOUND

Commits verified:
- `2013b8c` — feat(02-04): author playground-conventions book (7 chapters)
- `fe21ab4` — feat(02-04): update LIBRARY.md and create Watson plugin manifest

---
*Phase: 02-library-system*
*Completed: 2026-03-31*
