---
phase: 28-think-skill
plan: "01"
subsystem: ui
tags: [skill, design-toolkit, discuss, blueprint, questioning, think]

requires:
  - phase: 27-play-skill
    provides: "@references/ scope pattern, suggest-not-dispatch pattern, core SKILL.md read-only state check"
  - phase: 26-plugin-scaffold
    provides: "Blueprint contract, blueprint file schemas, LIBRARY.md book loading protocol"

provides:
  - "/think SKILL.md — full standalone design discussion orchestration skill (68 lines)"
  - "skills/think/references/questioning-flow.md — AskUserQuestion discipline, gentle challenges, core/contextual questions, pattern research (187 lines)"
  - "skills/think/references/blueprint-writing.md — CONTEXT.md writes, surgical amendments, discuss-only build path, return status schema, standalone chain, dedup contract (328 lines)"
  - "skills/think/references/mid-build.md — mid-build adaptive behavior, summary/confirmation, suggest-not-dispatch handoff (68 lines)"

affects: [29-design-skill, 30-design-hardening, 31-save-skill]

tech-stack:
  added: []
  patterns:
    - "Reference file pattern: orchestration SKILL.md under 100 lines dispatches to @references/ files for detailed behavior"
    - "Suggest-not-dispatch: standalone skills suggest next skill, never dispatch it"
    - "Blueprint amendment lifecycle: [PENDING] → [COMMITTED] via commit-all sequence at Ready gate"

key-files:
  created:
    - skills/think/SKILL.md
    - skills/think/references/questioning-flow.md
    - skills/think/references/blueprint-writing.md
    - skills/think/references/mid-build.md
  modified: []

key-decisions:
  - "/think reference files are self-contained instruction sets, not agents — loaded by SKILL.md via @references/ paths"
  - "Standalone chain message updated to suggest /design (not loupe dispatch) — suggest-not-dispatch pattern consistent with /play"
  - "Return Status section renamed from 'Loupe Handoff: Return Status' — drops internal loupe branding"
  - "discuss.md Phases 3-7 (questioning engine) → questioning-flow.md with zero content changes"
  - "discuss.md blueprint write sections → blueprint-writing.md with minimal branding updates"
  - "discuss.md Phase 8-9 (mid-build/summary) → mid-build.md; 'Rebuild now' option uses suggest-not-dispatch"

patterns-established:
  - "SKILL.md orchestration pattern: phases in SKILL.md reference @references/ files for all detailed behavior, keeping SKILL.md under 100 lines"
  - "Reference file frontmatter: name, type: reference, description fields"

requirements-completed: [THINK-01, THINK-02, THINK-03, THINK-04, THINK-05, THINK-06]

duration: 6min
completed: "2026-04-14"
---

# Phase 28 Plan 01: /think Skill Summary

**713-line discuss.md extracted into 68-line /think SKILL.md plus 3 reference files (583 lines total) — standalone design discussion skill with library grounding, blueprint persistence, and suggest-not-dispatch handoff**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-14T13:18:29Z
- **Completed:** 2026-04-14T13:23:33Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created 3 reference files porting 713-line discuss.md content: questioning-flow (187 lines), blueprint-writing (328 lines), mid-build (68 lines)
- Replaced 12-line SKILL.md stub with full 68-line orchestration skill covering all 6 THINK requirements
- Preserved all library grounding rules, amendment protocol ([PENDING]/[COMMITTED]), and AskUserQuestion patterns from discuss.md
- Updated standalone chain to suggest-not-dispatch pattern: "Ready to build -- run /design to start." consistent with /play

## Task Commits

1. **Task 1: Create /think reference files from discuss.md** - `c035c45` (feat)
2. **Task 2: Write full /think SKILL.md replacing the stub** - `ccbe36e` (feat)

**Plan metadata:** _(added with this commit)_

## Files Created/Modified

- `skills/think/SKILL.md` — Full orchestration skill replacing stub: Phases -1 through 2, library loading, complexity scaling, reference dispatches, handoff
- `skills/think/references/questioning-flow.md` — Phases 3-7 from discuss.md: AskUserQuestion discipline, gentle challenges, core questions, contextual questions, pattern research
- `skills/think/references/blueprint-writing.md` — Blueprint write sections from discuss.md: CONTEXT.md writes, surgical amendments, discuss-only build path, reference inventory, ready-to-build detection, return status schema, standalone chain, dedup contract
- `skills/think/references/mid-build.md` — Phases 8-9 from discuss.md: mid-build adaptive behavior, summary/confirmation, suggest-not-dispatch for rebuild

## Decisions Made

- Reference files use `type: reference` frontmatter — not agents, not standalone skills; loaded inline by SKILL.md
- "Loupe Handoff: Return Status" renamed to "Return Status" — drops internal loupe branding without changing JSON schema
- Standalone chain updated from "run /design" dispatch to suggestion message per suggest-not-dispatch pattern established in Phase 27
- All questioning content ported verbatim from discuss.md — zero content changes to proven conversation patterns
- SKILL.md rewrite required: first draft was 142 lines (over limit); compressed to 68 lines by collapsing verbose phase descriptions into single-sentence dispatch instructions

## Deviations from Plan

None — plan executed exactly as written. The only issue was SKILL.md line count exceeding the 65-110 line verification window on first draft (142 lines), resolved by rewriting more concisely on the second pass.

## Issues Encountered

- SKILL.md first draft was 142 lines — over the `< 110` verification threshold. Rewrote by replacing multi-bullet phase descriptions with single-sentence dispatch instructions pointing to reference files. Final: 68 lines. No content was lost; verbose inline descriptions belong in reference files anyway.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- /think skill is fully operational as a standalone skill — users can run /think to explore design decisions grounded in library books with all decisions persisted to PRD
- Phase 29 (design-skill extraction) can proceed: /think reference files establish the @references/ pattern that /design will also use
- Phase 30 (design-hardening) unblocked: /think amendment protocol is the contract that hardening builds on

---
*Phase: 28-think-skill*
*Completed: 2026-04-14*
