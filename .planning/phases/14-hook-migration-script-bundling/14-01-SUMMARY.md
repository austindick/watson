---
phase: 14-hook-migration-script-bundling
plan: "01"
subsystem: infra
tags: [hooks, plugin, lifecycle, session, statusline, node]

# Dependency graph
requires:
  - phase: 13-plugin-scaffold-path-portability
    provides: Plugin scaffold with .claude-plugin/plugin.json, skills/ directory, ${CLAUDE_PLUGIN_ROOT} path pattern
provides:
  - hooks/hooks.json with SessionStart + SessionEnd declarations using ${CLAUDE_PLUGIN_ROOT}
  - scripts/watson-session-start.js with recovery notification + first-run ambient copy + statusLine auto-write
  - scripts/watson-session-end.js port of inline Node one-liner to readable script
  - scripts/watson-statusline.js fork of share-proto-statusline.js without dev server block
  - skills/watson/references/watson-ambient.md bundled as source for first-run auto-copy
  - Author's ~/.claude/settings.json cleaned of Watson hooks, statusLine updated
affects: [teammate-onboarding, session-lifecycle, statusline, ambient-activation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "hooks.json at plugin root with nested hooks array schema (not inside .claude-plugin/)"
    - "Use __dirname inside plugin scripts — CLAUDE_PLUGIN_ROOT is substituted in command string only, not exported to process.env"
    - "First-run idempotency: check-before-act for ambient copy and statusLine auto-write"
    - "statusLine auto-write guards: skip if already watson-statusline; rewrite if share-proto-statusline; skip if other custom"
    - "settings.json mutation: SyntaxError abort vs ENOENT fresh-start distinction"

key-files:
  created:
    - hooks/hooks.json
    - scripts/watson-session-start.js
    - scripts/watson-session-end.js
    - scripts/watson-statusline.js
    - skills/watson/references/watson-ambient.md
  modified:
    - ~/.claude/settings.json (outside repo — Watson hooks removed, statusLine updated)

key-decisions:
  - "hooks/ and scripts/ directories are siblings of .claude-plugin/, not inside it — plugin root is the --plugin-dir target"
  - "Use __dirname for all intra-plugin path resolution inside scripts; CLAUDE_PLUGIN_ROOT is command-string substitution only"
  - "watson-statusline.js is a surgical fork: only the standalone dev server block (original lines 75-87) removed; everything else unchanged"
  - "StatusLine auto-write has three states: missing/share-proto-statusline (write), watson-statusline (skip idempotent), other custom (skip to not stomp)"

patterns-established:
  - "Pattern: Plugin hook scripts use __dirname to resolve sibling paths, not process.env.CLAUDE_PLUGIN_ROOT"
  - "Pattern: First-run setup in SessionStart hook — copy-if-absent for rules, conditional write for settings"

requirements-completed: [HOOK-01, HOOK-02, HOOK-03, HOOK-04]

# Metrics
duration: 3min
completed: 2026-04-05
---

# Phase 14 Plan 01: Hook Migration + Script Bundling Summary

**Plugin-owned SessionStart/SessionEnd hooks with bundled scripts, surgical statusline fork, and zero-touch author settings.json migration removing all Watson hooks**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-05T17:10:49Z
- **Completed:** 2026-04-05T17:13:12Z
- **Tasks:** 2 of 3 completed (Task 3 is a human-verify checkpoint)
- **Files modified:** 6

## Accomplishments
- Created `hooks/hooks.json` at plugin root declaring SessionStart (watson-session-start.js) and SessionEnd (watson-session-end.js) hooks using `${CLAUDE_PLUGIN_ROOT}` path substitution
- Wrote three lifecycle scripts: recovery notification + first-run setup (session-start), branch/actions preservation + cleanup (session-end), statusline rendering (watson-statusline)
- Forked `share-proto-statusline.js` into `watson-statusline.js` by surgically removing the standalone dev server block (original lines 75-87) while preserving all other logic including share-proto tunnel links and Watson active indicator
- Bundled `watson-ambient.md` from `~/.claude/rules/` into `skills/watson/references/` as the source for first-run auto-copy by `watson-session-start.js`
- Programmatically migrated author's `~/.claude/settings.json`: removed Watson SessionStart bash one-liner and Watson SessionEnd Node one-liner, preserved GSD hooks and PostToolUse, updated statusLine to point to plugin's `watson-statusline.js`, wrote backup to `.pre-watson-migration`

## Task Commits

Each task was committed atomically:

1. **Task 1: Create plugin hooks, lifecycle scripts, bundle ambient rule** - `46666bb` (feat)
2. **Task 2: Migrate author settings.json** - `3b59790` (chore — settings.json outside repo, empty commit documents migration)

**Plan metadata:** (pending final commit)

## Files Created/Modified
- `hooks/hooks.json` - Plugin hook declarations for SessionStart and SessionEnd
- `scripts/watson-session-start.js` - Recovery notification + first-run ambient copy + statusLine auto-write
- `scripts/watson-session-end.js` - Branch+actions preservation + watson-active.json cleanup
- `scripts/watson-statusline.js` - Forked statusline with share-proto links, no standalone dev server block
- `skills/watson/references/watson-ambient.md` - Source file for first-run ambient rule auto-copy
- `~/.claude/settings.json` (external) - Watson hooks removed, statusLine updated to watson-statusline.js
- `~/.claude/settings.json.pre-watson-migration` (external) - Backup before migration

## Decisions Made
- Used `__dirname` inside all plugin scripts for path resolution (not `process.env.CLAUDE_PLUGIN_ROOT` which is only substituted in the command string, not exported as a process env at runtime)
- `hooks/` and `scripts/` directories placed at plugin root (`/Users/austindick/watson/`), not inside `.claude-plugin/` — only `plugin.json` belongs there
- watson-statusline.js is a surgical fork: only removed the standalone dev server block (`if (!proto) { const devFile = /tmp/share-proto-dev-${process.ppid}.json ...}`), kept all other logic unchanged
- statusLine auto-write in watson-session-start.js guards against overwriting user's existing custom scripts: only writes if missing or currently points to share-proto-statusline.js

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — all scripts passed smoke tests on first attempt. watson-session-end.js correctly preserved branch+actions and cleaned up the active file. watson-statusline.js rendered correctly via stdin pipe test.

## Checkpoint: Task 3 Awaiting Human Verify

Task 3 requires starting a fresh Claude Code session to verify:
- SessionStart fires exactly once (no double-firing from both plugin hooks.json and settings.json)
- Statusline renders correctly
- Settings.json has no Watson hooks

Pre-checkpoint automated artifact checks all passed.

## Next Phase Readiness
- Plugin is self-contained: hooks fire from plugin, statusLine configured by first-run logic
- Teammates get hooks automatically on `--plugin-dir` install; ambient rule and statusLine auto-configured on first session
- After human-verify checkpoint passes, HOOK-01 through HOOK-04 are fully satisfied

---
*Phase: 14-hook-migration-script-bundling*
*Completed: 2026-04-05*
