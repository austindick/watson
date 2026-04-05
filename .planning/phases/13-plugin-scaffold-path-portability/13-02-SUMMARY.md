---
phase: 13-plugin-scaffold-path-portability
plan: "02"
subsystem: infra
tags: [plugin, path-portability, claude-plugin-root, watson]

# Dependency graph
requires:
  - phase: 13-01
    provides: Plugin scaffold with plugin.json manifest and skills/watson/ layout

provides:
  - All hardcoded ~/.claude/skills/watson/ paths replaced with ${CLAUDE_PLUGIN_ROOT}/skills/watson/ across 6 files
  - Watson verified working end-to-end in --plugin-dir session with portable paths
  - Library books accessible to agents via ${CLAUDE_PLUGIN_ROOT} variable substitution
  - Discuss and loupe subskills both dispatch correctly in plugin context

affects: [phase 14, phase 15, plugin-distribution, watson-install-docs]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "${CLAUDE_PLUGIN_ROOT} variable substitution for all plugin-internal file references"
    - "~/.claude/rules/ paths preserved as-is (user personal config, not plugin-bundled)"

key-files:
  created: []
  modified:
    - skills/watson/skills/loupe.md
    - skills/watson/skills/discuss.md
    - skills/watson/references/agent-contract.md
    - skills/watson/docs/maintainer.md
    - skills/watson/docs/architecture.md
    - skills/watson/library/playground-conventions/BOOK.md

key-decisions:
  - "~/.claude/rules/watson-ambient.md preserved as-is — ambient rule lives in user's personal ~/.claude/rules/, not in the plugin bundle"
  - "@-dispatch references (@agents/builder.md etc.) resolve correctly in plugin context without explicit ${CLAUDE_PLUGIN_ROOT} prefixing — verified in live session"
  - "FauxDS vs real Slate in library books is a pre-existing content issue, not a path portability problem — deferred"

patterns-established:
  - "Plugin-internal paths: always use ${CLAUDE_PLUGIN_ROOT}/skills/watson/ prefix"
  - "User-personal config paths (~/.claude/rules/): always leave as-is, never replace"

requirements-completed: [PLUG-02, PLUG-04]

# Metrics
duration: ~20min
completed: 2026-04-05
---

# Phase 13 Plan 02: Path Portability + End-to-End Validation Summary

**All 19 hardcoded ~/.claude/skills/watson/ paths replaced with ${CLAUDE_PLUGIN_ROOT}/skills/watson/ across 6 files; Watson validated working end-to-end in --plugin-dir session with Figma prototype, agent dispatch, and library book reads all passing.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-05T05:13:45Z
- **Completed:** 2026-04-05
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Replaced ~19 hardcoded ~/.claude/skills/watson/ paths with ${CLAUDE_PLUGIN_ROOT}/skills/watson/ across loupe.md, discuss.md, agent-contract.md, maintainer.md, architecture.md, and BOOK.md
- Zero grep hits for `~/.claude/skills/watson` in the skills/ directory — path portability requirement satisfied
- Watson activated via `(watson)` plugin prefix from an external project directory (~/faire/frontend) with zero "file not found" errors
- Full Figma-to-prototype pipeline verified: 3 sections decomposed, agents dispatched, library books read, prototype built

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace all hardcoded paths with ${CLAUDE_PLUGIN_ROOT}** - `0885dc2` (chore)
2. **Task 2: Verify Watson works end-to-end as a plugin with portable paths** - human-verified (no code commit — checkpoint approval)

**Plan metadata:** (pending — created in this session)

## Files Created/Modified

- `skills/watson/skills/loupe.md` - 10 path replacements: LIBRARY.md read path + 9 libraryPaths array entries
- `skills/watson/skills/discuss.md` - 1 path replacement: LIBRARY.md read path
- `skills/watson/references/agent-contract.md` - 1 path replacement: libraryPaths table example
- `skills/watson/docs/maintainer.md` - 5 path replacements: Watson home, library location, outputBookPath, agents location, subskills location
- `skills/watson/docs/architecture.md` - 1 path replacement: directory tree header
- `skills/watson/library/playground-conventions/BOOK.md` - 1 path replacement: source reference (watson-lite legacy path updated)

## Decisions Made

- `~/.claude/rules/watson-ambient.md` preserved as-is — this path correctly targets the user's personal `~/.claude/rules/` directory. The ambient rule cannot be bundled in the plugin; it must live in each user's personal Claude config.
- @-dispatch references (@agents/builder.md, @skills/discuss.md, etc.) were NOT replaced with ${CLAUDE_PLUGIN_ROOT} prefixes — verified in live session that they resolve correctly in plugin context without explicit prefixing.
- FauxDS vs real Slate in library book content is a pre-existing issue, not a path portability problem — tracked as deferred (not this plan's scope).

## Deviations from Plan

None - plan executed exactly as written. The @-dispatch resolution concern flagged in STATE.md blockers was resolved by live verification: @references work as file-relative paths inside plugin context without needing ${CLAUDE_PLUGIN_ROOT} substitution.

## Issues Encountered

- Phase 13 research flag (STATE.md blocker) about @-dispatch references requiring explicit ${CLAUDE_PLUGIN_ROOT} prefix — confirmed NOT needed. @references resolve correctly in plugin context. Blocker resolved.
- Figma MCP required standard OAuth during testing — expected behavior for any user, not a Watson path issue.

## User Setup Required

None - no external service configuration required for path portability changes. Figma MCP OAuth is standard Figma plugin behavior, not Watson-specific.

## Next Phase Readiness

- Path portability complete — Watson fully installable as a portable plugin from any location
- PLUG-02 and PLUG-04 requirements satisfied
- Phase 14 (or next plugin distribution phase) can proceed: plugin is ready for packaging and distribution documentation
- Outstanding deferred: FauxDS vs real Slate token usage in library books (pre-existing content issue, not a blocker)

---
*Phase: 13-plugin-scaffold-path-portability*
*Completed: 2026-04-05*
