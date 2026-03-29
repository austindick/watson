---
phase: 01-foundation-scaffold
plan: 03
subsystem: skill-architecture
tags: [watson, agent-contract, book-schema, watson-init, markdown-skill]

requires:
  - phase: 01-02
    provides: artifact schema examples (CONTEXT-EXAMPLE, LAYOUT-EXAMPLE, DESIGN-EXAMPLE, INTERACTION-EXAMPLE) whose section headings watson-init templates mirror

provides:
  - agent-contract.md: central spec for all 8 Watson agents (dispatch mode, shared/pipeline parameters, output path conventions, error contract)
  - book-schema.md: BOOK.md/CHAPTER.md/PAGE.md frontmatter schemas with typed fields, navigation pattern, and naming conventions
  - watson-init.md: blueprint/ initialization utility with single-file promotion and template scaffold

affects: [Phase 2 Librarian, Phase 3 agent ports, Phase 4 loupe subskill, Phase 5 SKILL.md orchestrator]

tech-stack:
  added: []
  patterns:
    - "Central contract spec + mirrored agent frontmatter: agent-contract.md is source of truth; each agent's YAML frontmatter mirrors its registry row exactly"
    - "Binary permanent dispatch classification: foreground/background set once in agent-contract.md and agent frontmatter; never dynamically reclassified"
    - "Edit-based blueprint writes: watson-init writes placeholder headings so agents can use Edit tool for section replacement rather than full overwrites"
    - "3-level library hierarchy: BOOK.md (index) -> CHAPTER.md (content or page index) -> PAGE.md (granular); agents navigate via LIBRARY.md entry point, never glob"

key-files:
  created:
    - ~/.claude/skills/watson/references/agent-contract.md
    - ~/.claude/skills/watson/references/book-schema.md
    - ~/.claude/skills/watson/utilities/watson-init.md
  modified: []

key-decisions:
  - "Interaction agent is foreground* with footnote: foreground when watsonMode=false AND no interactionContext provided; background otherwise"
  - "LAYOUT.md and DESIGN.md initialized minimal in watson-init (single placeholder line) because their section structure is built incrementally per-section by agents"
  - "CONTEXT.md and INTERACTION.md initialized with full section headings because they are written holistically (not per-section)"
  - "Book directory naming uses kebab-case (design-system/, playground-conventions/) consistent with playground source directory conventions"
  - "FauxDS references excluded from all schema files to maintain source-agnosticism (ARCH-05)"

patterns-established:
  - "Agent contract is mirrored pair: agent-contract.md (central) + each agent's YAML frontmatter. Never independently maintained."
  - "Library navigation always starts at LIBRARY.md — agents never glob through library/"
  - "Blueprint files colocated at src/pages/{Prototype}/blueprint/, not at skill or playground root"
  - "watson-init promotion: MyPage.tsx -> MyPage/index.tsx + MyPage/blueprint/ on first Watson invocation"

requirements-completed: [ARCH-01, ARCH-03, BLUE-04]

duration: 3min
completed: "2026-03-29"
---

# Phase 01 Plan 03: Agent Contract Spec, Book Schema, and watson-init Summary

**Watson agent contract, book/chapter/page library schemas, and blueprint initialization utility — locking all 8 agent dispatch contracts and library navigation patterns before Phase 2 and 3 build against them.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-29T04:51:38Z
- **Completed:** 2026-03-29T04:54:02Z
- **Tasks:** 2
- **Files modified:** 3 created

## Accomplishments

- agent-contract.md: central source of truth for all 8 agents — dispatch mode (foreground/background), shared parameters (blueprintPath, libraryPath, watsonMode), pipeline parameters (sectionName), per-agent parameters, output paths, error contract, and output path conventions (section-level vs consolidated blueprint)
- book-schema.md: complete BOOK.md/CHAPTER.md/PAGE.md frontmatter schemas with typed fields, required/optional markers, filled-in examples, navigation pattern, and naming conventions
- watson-init.md: blueprint/ initialization utility with single-file promotion logic (MyPage.tsx → MyPage/index.tsx) and all four template files with section headings and placeholder text

## Task Commits

Each task was committed atomically (to home git repo at ~/):

1. **Task 1: Create agent-contract.md and book-schema.md** - `b02b1f0` (feat)
2. **Task 2: Create watson-init.md utility** - `3cd7b92` (feat)

**Deviation fix:** `488b92f` (fix: remove FauxDS reference from book-schema.md example)

## Files Created/Modified

- `~/.claude/skills/watson/references/agent-contract.md` — Central agent contract spec: all 8 agents, dispatch modes, shared/pipeline/agent-specific params, output paths, error contract
- `~/.claude/skills/watson/references/book-schema.md` — BOOK.md/CHAPTER.md/PAGE.md frontmatter schemas with typed fields, navigation pattern, naming conventions
- `~/.claude/skills/watson/utilities/watson-init.md` — blueprint/ initialization utility with single-file promotion and four template files

## Decisions Made

- Interaction agent documented as `foreground*` with footnote — conservative default with explicit background conditions
- LAYOUT.md and DESIGN.md templates initialized minimal (one placeholder line) because section headings are built per-section by agents; full initialization would create false structure agents would pattern-match against
- Used kebab-case for book directory naming (design-system/, playground-conventions/) per Loupe convention and playground source structure

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Removed FauxDS-specific reference from book-schema.md**
- **Found during:** Post-task verification
- **Issue:** CHAPTER.md example body text contained "FauxDS component reference" — violates ARCH-05 (source-agnosticism) and the plan's explicit anti-pattern check
- **Fix:** Replaced "FauxDS component reference" with "Component library reference" — fully generic
- **Files modified:** `~/.claude/skills/watson/references/book-schema.md`
- **Verification:** `grep -ri "faux"` across all three files returns 0 matches
- **Committed in:** `488b92f`

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing critical: source-agnosticism)
**Impact on plan:** Fix ensures book-schema.md examples work for any design system, not FauxDS specifically. No scope creep.

## Issues Encountered

None — all files authored per spec, single source-agnosticism fix caught in post-task verification.

## User Setup Required

None — no external service configuration required. These are markdown skill files committed to the home git repo.

## Next Phase Readiness

Phase 1 foundation scaffold is complete. All three plans delivered:
- Plan 01: watson/ skill directory skeleton
- Plan 02: four artifact schema examples (CONTEXT, LAYOUT, DESIGN, INTERACTION)
- Plan 03: agent-contract.md, book-schema.md, watson-init.md

Phase 2 (Librarian + library books) can build immediately — BOOK.md/CHAPTER.md/PAGE.md schemas are locked.
Phase 3 (agent ports) can build immediately — agent-contract.md is the source of truth for all dispatch parameters.
Phase 4/5 (subskills, orchestrator) can build into the known directory skeleton and locked contracts.

No blockers for Phase 2 start.

---
*Phase: 01-foundation-scaffold*
*Completed: 2026-03-29*
