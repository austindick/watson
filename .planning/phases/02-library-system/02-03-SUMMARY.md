---
phase: 02-library-system
plan: "03"
subsystem: library
tags: [librarian, book-schema, source_hash, update-mode, agent-instructions]

requires:
  - phase: 02-library-system/02-01
    provides: "Librarian agent with generate mode and Update Mode placeholder"

provides:
  - "Complete Librarian agent with surgical update mode — chapter-level diff via source_hash"
  - "Fast-path check: skip all writes when book-level source_hash is unchanged"
  - "Preview-then-confirm flow for manual invocation (watsonMode=false)"
  - "Watson 1.0 single-book scope constraint documented"
  - "LIBRARY.md auto-update step present and detailed in both modes"

affects:
  - 02-library-system/02-04
  - 03-agent-port

tech-stack:
  added: []
  patterns:
    - "source_hash fast-path: compute book-level hash first; if unchanged, skip chapter scan entirely"
    - "Chapter-level diff: classify each chapter as unchanged/modified/new/removed before writing"
    - "Surgical writes: unchanged chapters are never touched — only modified/new/removed"
    - "Preview-before-apply: show structured diff, require confirmation when watsonMode=false"

key-files:
  created: []
  modified:
    - "~/.claude/skills/watson/agents/librarian.md"

key-decisions:
  - "Update mode scoped to single-book per invocation for Watson 1.0 — multi-book batch deferred to 1.1"
  - "source_hash stored at both book level (BOOK.md) and chapter level (CHAPTER.md) to enable both fast-path and per-chapter diffing"
  - "Empty diff still proceeds to LIBRARY.md timestamp update — LIBRARY.md is always current after any Librarian run"
  - "Removed chapters are hard-deleted (not deprecated) — Watson differs from Loupe which marks [DEPRECATED] before cleanup"

patterns-established:
  - "Upsert-based LIBRARY.md updates: read-then-patch preserves all other entries regardless of mode"
  - "Both modes end with LIBRARY.md auto-update: this is a non-negotiable post-step for every Librarian operation"

requirements-completed: [LIB-06, LIB-07]

duration: 1min
completed: "2026-03-31"
---

# Phase 02 Plan 03: Librarian Update Mode Summary

**Surgical chapter-level update mode for Watson Librarian using source_hash diffing — unchanged chapters skipped entirely, preview-then-confirm for manual runs**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-31T02:51:54Z
- **Completed:** 2026-03-31T02:53:04Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Replaced the "See Plan 02-03" placeholder with a complete 7-step update mode workflow
- Chapter-level diff using source_hash gives the Librarian surgical precision — only changed chapters are rewritten
- Fast-path: book-level source_hash check can skip all writes in the common "no changes" case
- Watson 1.0 scope constraint (single-book per invocation) documented prominently at the top of the Update Mode section
- Both generate and update modes now clearly document the LIBRARY.md auto-update as a required final step

## Task Commits

Each task was committed atomically:

1. **Task 1: Add update mode instructions to librarian.md** - `0b66ca8` (feat)

**Plan metadata:** _(to be committed with this SUMMARY)_

## Files Created/Modified

- `~/.claude/skills/watson/agents/librarian.md` — Replaced Update Mode placeholder with complete 7-step instructions (138 lines added)

## Decisions Made

- **Removed chapters are hard-deleted** (not deprecated): Loupe marks removed entries as `[DEPRECATED]` before offering cleanup. Watson's book structure differs — chapters are directories with many files, so deprecation-in-place isn't practical. Hard delete with manifest update is the right model.
- **source_hash at both levels**: Book-level hash enables the fast-path skip; chapter-level hash enables surgical per-chapter diffing when the book-level hash changes.
- **Empty diff still runs LIBRARY.md update**: Ensures LIBRARY.md timestamps are always fresh even when source is unchanged. Consistent behavior across all Librarian invocations.

## Deviations from Plan

None — plan executed exactly as written. The Loupe librarian's update mode was adapted as specified, using chapter-level diffing instead of flat section diffing.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Librarian agent is now complete with both generate and update modes
- Plan 02-04 (book-schema.md update for chapter source_hash field) can proceed — chapter-level source_hash is referenced in update mode and needs the schema to reflect it
- Phase 03 agent port can reference the complete Librarian for design system book operations

---
*Phase: 02-library-system*
*Completed: 2026-03-31*
