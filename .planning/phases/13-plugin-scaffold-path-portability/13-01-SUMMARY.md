---
phase: 13-plugin-scaffold-path-portability
plan: 01
subsystem: infra
tags: [claude-code-plugin, plugin-manifest, watson, plugin-structure]

# Dependency graph
requires: []
provides:
  - .claude-plugin/plugin.json manifest (name=watson, version=1.2.0)
  - skills/watson/ directory tree — complete copy of ~/.claude/skills/watson/ (70 files)
  - Plugin structure compatible with `claude --plugin-dir ~/watson`
affects: [13-02, 14-hook-migration, teammate-onboarding]

# Tech tracking
tech-stack:
  added: [claude-code-plugin-manifest]
  patterns: [plugin-root-layout — .claude-plugin/ for manifest only; skills/ at repo root for skill files]

key-files:
  created:
    - .claude-plugin/plugin.json
    - skills/watson/SKILL.md
    - skills/watson/agents/builder.md
    - skills/watson/agents/consolidator.md
    - skills/watson/agents/decomposer.md
    - skills/watson/agents/design.md
    - skills/watson/agents/interaction.md
    - skills/watson/agents/layout.md
    - skills/watson/agents/librarian.md
    - skills/watson/agents/reviewer.md
    - skills/watson/skills/discuss.md
    - skills/watson/skills/loupe.md
    - skills/watson/utilities/watson-init.md
    - skills/watson/references/agent-contract.md
    - skills/watson/library/LIBRARY.md
    - skills/watson/library/design-system/BOOK.md
    - skills/watson/library/playground-conventions/BOOK.md
    - skills/watson/docs/architecture.md
    - skills/watson/docs/maintainer.md
    - skills/watson/docs/roadmap.md
  modified: []

key-decisions:
  - "Plugin manifest at .claude-plugin/plugin.json with name=watson, version=1.2.0 per CONTEXT.md decision"
  - "All skill files nested under skills/watson/ preserving existing internal layout"
  - "No file content modified in this plan — path replacements deferred to Plan 13-02"

patterns-established:
  - "Plugin structure: only plugin.json in .claude-plugin/; all skill files at repo root under skills/"
  - "Skill placement at skills/watson/SKILL.md yields /watson:watson namespace per plugin name field"

requirements-completed: [PLUG-01, PLUG-03, PLUG-05]

# Metrics
duration: 8min
completed: 2026-04-05
---

# Phase 13 Plan 01: Plugin Scaffold Summary

**Plugin manifest + 70-file Watson skill tree copied into ~/watson for `claude --plugin-dir` loading as /watson:watson**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-05T04:56:52Z
- **Completed:** 2026-04-05T05:04:00Z
- **Tasks:** 1 of 2 complete (Task 2 is checkpoint:human-verify — awaiting user verification)
- **Files created:** 71 (1 manifest + 70 skill files)

## Accomplishments
- Created `.claude-plugin/plugin.json` with name=watson, version=1.2.0, description, author, repository
- Copied entire `~/.claude/skills/watson/` tree into `skills/watson/` (70 files, verified identical via diff)
- Plugin directory structure follows Claude Code spec: manifest in `.claude-plugin/`, skills at repo root
- File tree diff returned empty — source and destination are byte-for-byte equivalent directory structures

## Task Commits

Each task was committed atomically:

1. **Task 1: Create plugin.json manifest and copy skill files into plugin structure** - `c29d8d3` (feat)

**Plan metadata:** pending final commit after checkpoint verification

## Files Created/Modified
- `.claude-plugin/plugin.json` — Plugin manifest with name, version, description, author, repository
- `skills/watson/SKILL.md` — Main Watson skill entry point (copied, not modified)
- `skills/watson/agents/` — All 8 agents (builder, consolidator, decomposer, design, interaction, layout, librarian, reviewer)
- `skills/watson/skills/` — discuss.md and loupe.md subskills
- `skills/watson/utilities/watson-init.md` — Git init utility
- `skills/watson/references/` — agent-contract.md, artifact-schemas/, book-schema.md, source-scanning.md
- `skills/watson/library/` — LIBRARY.md, design-system book (22 components + 3 chapters), playground-conventions book (7 chapters)
- `skills/watson/docs/` — architecture.md, maintainer.md, roadmap.md, executive-summary.md, guide.md

## Decisions Made
- Used `cp -r` to copy directory recursively, preserving all subdirectories and hidden files (.gitkeep files included)
- No content changes in this plan — paths still point to ~/.claude/skills/watson/ (Plan 13-02 scope)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

**Task 2 requires human verification (checkpoint:human-verify):**
1. Run `claude --plugin-dir ~/watson` to start a test session
2. Verify `/watson:watson` is available as a slash command
3. Type `/watson:watson` and confirm Watson activates
4. Run `claude plugin validate` from ~/watson/ to confirm no structural errors
5. Report "approved" to continue to Plan 13-02

Note: Library book access will fail in the test session because paths still point to `~/.claude/skills/watson/`. This is expected — path migration is Plan 13-02.

## Next Phase Readiness
- Plugin scaffold complete, structure verified identical to source
- Plan 13-02 (path portability) is blocked on human verification of plugin loading
- After verification: Plan 13-02 will replace all `~/.claude/skills/watson/` occurrences with `${CLAUDE_PLUGIN_ROOT}/skills/watson/` across ~20 file instances

---
*Phase: 13-plugin-scaffold-path-portability*
*Completed: 2026-04-05*
