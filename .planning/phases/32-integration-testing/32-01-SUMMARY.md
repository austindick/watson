---
phase: 32-integration-testing
plan: 01
subsystem: testing
tags: [validation, integration, plugin, branding, blueprint-contract]

# Dependency graph
requires:
  - phase: 31-save-skill
    provides: "Complete /save skill SKILL.md"
  - phase: 30-design-hardening
    provides: "Hardened /design SKILL.md with convergent loop and verification gate"
  - phase: 29-design-extraction
    provides: "/design SKILL.md extracted to standalone"
  - phase: 28-think-skill
    provides: "/think standalone skill with @references/ dispatch pattern"
  - phase: 27-play-skill
    provides: "/play standalone skill with session management"
  - phase: 26-plugin-scaffold
    provides: "Plugin manifest, shared/references, library structure"
provides:
  - "Static validation report for all cross-skill references, branding, blueprint contract, and agent availability"
  - "Documented findings: 3 non-blocking gaps identified for gap closure"
affects: [33-gap-closure, future-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Validation-only plan pattern: static checks, no file modifications, findings documented for gap closure"

key-files:
  created: [".planning/phases/32-integration-testing/32-01-SUMMARY.md"]
  modified: []

key-decisions:
  - "page-templates chapter gap: design/SKILL.md references playground-conventions/page-templates/ which does not exist on disk — flag for gap closure"
  - "Library path inconsistency: design/SKILL.md and think/SKILL.md reference skills/core/library/LIBRARY.md while save/SKILL.md correctly references library/LIBRARY.md at plugin root — flag for gap closure"
  - "Watson branding in skills/core/docs/ and skills/core/references/: legacy docs not swept in Phase 26; these are internal reference files not user-facing — acceptable as-is, flag for awareness"
  - "All 11 agents dispatched by design/SKILL.md confirmed to exist on disk; librarian.md is the 12th agent (not dispatched by design, used by library system)"
  - "skills/core/references/agent-contract.md still uses .watson/sections/ path (old) vs .dt/sections/ (new) — flag for gap closure"

patterns-established:
  - "Validation-before-live-testing pattern: static checks catch wiring bugs before they surface during live execution"

requirements-completed: []

# Metrics
duration: 2min
completed: 2026-04-14
---

# Phase 32 Plan 01: Static Validation Summary

**All 6 structural integrity checks and all 5 branding/compliance checks run; zero critical failures found, 3 non-blocking gaps documented for gap closure.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-14T15:44:53Z
- **Completed:** 2026-04-14T15:47:03Z
- **Tasks:** 2
- **Files modified:** 0 (validation-only)

## Accomplishments
- Confirmed plugin manifest registers exactly 4 commands all pointing to existing SKILL.md files
- Verified all @-references in 5 SKILL.md files resolve to files that exist on disk
- Confirmed library structure, blueprint contract, artifact schemas, and agent availability (12 agents)
- Confirmed all 4 redirect patterns are present and symmetric in core SKILL.md
- Confirmed zero Watson/Loupe branding violations in standalone user-facing skills
- Confirmed blueprint contract rules ([PENDING]/[COMMITTED], Edit-over-Write, lifecycle classification) consistently implemented across skills
- Confirmed suggest-not-dispatch pattern holds for all peer skill relationships
- Confirmed dt/ branch prefix used consistently in all standalone skills (no watson/ branch prefix)
- Identified 3 non-blocking gaps for future gap closure

## Task Commits

This was a validation-only plan — no files were created or modified during task execution.

1. **Task 1: Cross-skill reference and structural integrity validation** — all 6 checks PASS (with 2 gaps noted)
2. **Task 2: Branding compliance and blueprint contract consistency** — all 5 checks PASS (with 1 gap noted)

**Plan metadata:** (see final commit hash below)

## Validation Results

### Task 1: Structural Integrity

**Check 1 — Plugin manifest:** PASS
- 4 commands registered: `./skills/play/SKILL.md`, `./skills/think/SKILL.md`, `./skills/design/SKILL.md`, `./skills/save/SKILL.md`
- All 4 files exist on disk

**Check 2 — Cross-skill @-reference resolution:** PASS (with 2 gaps noted)
- `skills/core/SKILL.md`: `@skills/think/SKILL.md` and `@skills/design/SKILL.md` dispatch targets confirmed
- `skills/design/SKILL.md`: all 11 `@skills/core/agents/{name}.md` paths confirmed (builder, consolidator, decomposer, design, interaction, layout, reviewer, source-design, source-interaction, source-layout, surface-resolver)
- `skills/play/SKILL.md`: `@references/session-init.md` and `@references/resume.md` confirmed
- `skills/think/SKILL.md`: `@references/questioning-flow.md`, `@references/blueprint-writing.md`, `@references/mid-build.md` confirmed
- `skills/save/SKILL.md`: no @references/ dispatches; library path confirmed at `${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md`

GAP (non-blocking): `skills/design/SKILL.md` Phase 0 library resolution hardcodes `page-templates/CHAPTER.md` in `libraryPaths[]` (line 164), but `library/playground-conventions/page-templates/` does not exist on disk. This will cause a silent path miss at runtime.

GAP (non-blocking): `skills/design/SKILL.md` and `skills/think/SKILL.md` reference `${CLAUDE_PLUGIN_ROOT}/skills/core/library/LIBRARY.md` while `skills/save/SKILL.md` correctly references `${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md` (plugin root). The old path (`skills/core/library/LIBRARY.md`) also exists on disk, so both resolve — but the inconsistency should be cleaned up in gap closure.

**Check 3 — Library accessibility:** PASS
- `library/LIBRARY.md` — exists
- `library/design-system/BOOK.md` — exists
- `library/playground-conventions/BOOK.md` — exists
- `library/codebase-map/BOOK.md` — exists
- `shared/librarian.md` — exists

**Check 4 — Blueprint contract file validation:** PASS
- `shared/references/blueprint-contract.md` — exists
- All 5 artifact schema files exist: `CONTEXT.md`, `LAYOUT.md`, `DESIGN.md`, `INTERACTION.md`, `STATUS.md`
- Blueprint contract references all 5 schemas via `@shared/references/artifact-schemas/` entries

**Check 5 — Redirect symmetry:** PASS
- `/play` → "Session management is handled by /play directly. Just type /play." — PRESENT (line 9)
- `/think` → "Design thinking is handled by /think directly. Just type /think." — PRESENT (line 41)
- `/design` → "Building is handled by /design directly. Just type /design." — PRESENT (line 42)
- `/save` → "Checkpointing is handled by /save directly. Just type /save." — PRESENT (line 45)

**Check 6 — Agent availability:** PASS
- 12 agents in `skills/core/agents/`: builder, consolidator, decomposer, design, interaction, layout, librarian, reviewer, source-design, source-interaction, source-layout, surface-resolver
- 11 agents dispatched by `skills/design/SKILL.md` — all 11 confirmed on disk
- `librarian.md` is the 12th (present, used by library system, not dispatched by design pipeline)
- All 8 Figma pipeline agents confirmed (decomposer, layout, design, interaction, builder, reviewer, consolidator, source-layout)
- All 4 source agents confirmed (surface-resolver, source-design, source-interaction, source-layout)

### Task 2: Branding and Contract Compliance

**Check 1 — Watson branding:** PASS (with 1 gap noted)
- Zero Watson branding violations in `skills/play/SKILL.md`, `skills/think/SKILL.md`, `skills/design/SKILL.md`, `skills/save/SKILL.md`, `skills/core/SKILL.md`
- `library/` directory — zero violations
- `scripts/` directory — only approved watson-* filenames (watson-session-end.js, watson-session-start.js, watson-statusline.js)

GAP (informational): `skills/core/docs/` and `skills/core/references/agent-contract.md` and `skills/core/references/book-schema.md` contain legacy Watson branding. These are internal architecture/docs files, not user-facing skill output. Per Phase 26 decision, the branding sweep was scoped to SKILL.md files — docs files were deferred. Additionally, `skills/core/references/agent-contract.md` still references `.watson/sections/` (old path) instead of `.dt/sections/` (new path). Neither issue affects live skill execution today, but both are candidates for a future docs sweep.

**Check 2 — Loupe branding:** PASS
- `skills/play/SKILL.md` — zero "loupe" occurrences
- `skills/think/SKILL.md` — 1 occurrence: line 64: "- /think does NOT dispatch /design, loupe, or any agent" — acceptable (constraint description, not user-facing output)
- `skills/design/SKILL.md` — zero "loupe" occurrences
- `skills/save/SKILL.md` — zero "loupe" occurrences
- `skills/core/SKILL.md` — 1 occurrence: line 43: `/design:loupe` legacy colon-variant note — approved per plan spec

**Check 3 — Blueprint contract consistency:** PASS
- `shared/references/blueprint-contract.md`: [PENDING]/[COMMITTED] markers documented, Edit-over-Write protocol specified, lifecycle classification (overwrite, append-only, prepend-only, set-once) documented
- `skills/think/references/blueprint-writing.md`: [PENDING] prefix required on all amendments, confirmed
- `skills/save/SKILL.md`: [PENDING]->[COMMITTED] flip in Phase 0, confirmed
- `skills/core/agents/builder.md`: [PENDING] lines filtered out, only [COMMITTED] applied, confirmed

**Check 4 — Suggest-not-dispatch pattern:** PASS
- `skills/play/SKILL.md`: no `@skills/think/`, `@skills/design/`, or `@skills/save/` dispatch lines — PASS
- `skills/think/SKILL.md`: no `@skills/play/` or `@skills/save/` dispatch lines — PASS; no `@skills/design/` dispatch (the architectural exception for describe-only is in design/SKILL.md, not think/SKILL.md) — PASS
- `skills/save/SKILL.md`: no peer skill dispatches — PASS
- `skills/design/SKILL.md`: dispatches `@skills/think/SKILL.md` only in Phase -1 "Describe what you want" branch (locked architectural exception per Phase 29 decision) — PASS

**Check 5 — dt/ branch prefix:** PASS
- All standalone skills use `dt/*` branch prefix consistently
- No `watson/` branch prefix found in `skills/play/SKILL.md`, `skills/think/SKILL.md`, `skills/design/SKILL.md`, `skills/save/SKILL.md`, or `skills/core/SKILL.md`
- Legacy docs in `skills/core/docs/` reference `watson/{slug}` — acceptable as historical documentation, not live skill behavior

## Gaps for Gap Closure

Three non-blocking gaps identified. None cause immediate failures today, but all should be addressed in a gap closure pass:

1. **page-templates chapter missing** — `skills/design/SKILL.md` line 164 hardcodes `playground-conventions/page-templates/CHAPTER.md` in `libraryPaths[]`. The chapter does not exist at `library/playground-conventions/page-templates/`. Will cause a silent path miss when design pipeline runs in prod-clone or figma mode. Fix: either create the page-templates chapter or remove the path from libraryPaths[].

2. **Library path inconsistency** — `skills/design/SKILL.md` and `skills/think/SKILL.md` reference `${CLAUDE_PLUGIN_ROOT}/skills/core/library/LIBRARY.md`; `skills/save/SKILL.md` references `${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md` (plugin root). Both paths exist on disk so both resolve today, but the canonical location per Phase 26 architecture is `library/LIBRARY.md` at plugin root. Fix: update design and think SKILL.md to use plugin-root path.

3. **Legacy Watson branding in internal docs** — `skills/core/docs/` and `skills/core/references/agent-contract.md` contain Watson branding and `.watson/sections/` paths (old). No live skill execution affected, but a docs sweep would keep the codebase consistent. Fix: run a targeted docs sweep to update `watson/` -> `dt/` and `.watson/sections/` -> `.dt/sections/`.

## Deviations from Plan

None — plan executed exactly as written. No files created or modified during validation.

## Issues Encountered

None — all validation checks ran without errors.

## Next Phase Readiness

- Static validation complete: all critical cross-skill references resolve, plugin manifest is correct, blueprint contract is consistent
- 3 non-blocking gaps identified for gap closure (page-templates chapter, library path inconsistency, legacy docs)
- Ready for live skill execution testing (Task 2 of this phase was the final static check)
- Gap closure plan can be created from the 3 identified gaps above

## Self-Check

- [x] SUMMARY.md created at `.planning/phases/32-integration-testing/32-01-SUMMARY.md`
- [x] Zero files modified (validation-only plan)
- [x] All 11 check categories completed and documented

## Self-Check: PASSED

---
*Phase: 32-integration-testing*
*Completed: 2026-04-14*
