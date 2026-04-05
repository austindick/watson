---
phase: 15-distribution-onboarding-validation
plan: 01
subsystem: distribution
tags: [plugin, marketplace, onboarding, readme, claude-plugin]

# Dependency graph
requires:
  - phase: 14-hook-migration-script-bundling
    provides: plugin bundle with hooks, scripts, and session-start first-run logic
provides:
  - marketplace.json enabling /plugin marketplace add austindick/watson
  - README.md with complete install flow, Figma MCP setup, versioning discipline, and troubleshooting
affects: [validation, beta-testers, teammate-onboarding]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - marketplace.json uses url-object source format (not string "." — fails claude plugin validate)

key-files:
  created:
    - .claude-plugin/marketplace.json
    - README.md
  modified: []

key-decisions:
  - "marketplace.json source field must be an object {source: url, url: ...} not a plain string — plain strings fail claude plugin validate even though research suggested source: '.'"
  - "README uses verified 3-step sequence (marketplace add, plugin install, reload-plugins) per 15-RESEARCH.md — CONTEXT.md one-command install does not exist in Claude Code CLI"
  - "marketplace.json root-level description field is rejected by validator — omitted despite warning about missing description"

patterns-established:
  - "marketplace.json: source object format {source: 'url', url: 'https://github.com/...git'} is the validated pattern for GitHub-hosted plugins"

requirements-completed: [DIST-01, DIST-02, DIST-03, DIST-04]

# Metrics
duration: 2min
completed: 2026-04-05
---

# Phase 15 Plan 01: Distribution Scaffold Summary

**marketplace.json catalog and onboarding README enabling 3-step install via `/plugin marketplace add austindick/watson` with Figma MCP setup, ambient rule copy, versioning discipline, and troubleshooting**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-05T18:04:57Z
- **Completed:** 2026-04-05T18:06:40Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `.claude-plugin/marketplace.json` that passes `claude plugin validate .` (validated against live claude CLI)
- Created `README.md` (63 lines) covering all 8 required sections: beta badge, one-sentence description, prerequisites, 3-step install + ambient rule copy, Figma MCP setup, auto-update, versioning note, troubleshooting
- All 11 automated README checks pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Create marketplace.json and validate plugin** - `eee1eba` (feat)
2. **Task 2: Write onboarding README** - `df6f987` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified

- `.claude-plugin/marketplace.json` - Marketplace catalog enabling `/plugin marketplace add austindick/watson`
- `README.md` - Onboarding document for designers and PMs; 63 lines; scannable

## Decisions Made

1. **marketplace.json source format:** Research specified `source: "."` but the live claude CLI rejects plain strings for the source field. The validated format is a source object `{source: "url", url: "https://github.com/austindick/watson.git"}`. Applied Rule 1 (auto-fix bug — the research finding was incorrect against the live validator).

2. **Root description field omitted:** The validator rejected `description` at the marketplace root level as an "unrecognized key" while simultaneously warning it's missing. The warning-only state means validation passes — the field was omitted.

3. **3-step install sequence confirmed:** CONTEXT.md's "one command: claude plugin add" does not exist. The README uses the verified 3-step sequence per 15-RESEARCH.md findings. The plan's `decision_revision` block explicitly approved this deviation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] marketplace.json source field format corrected from string to object**
- **Found during:** Task 1 (Create marketplace.json and validate plugin)
- **Issue:** Plan specified `"source": "."` (plain string) but `claude plugin validate` rejected it with "Invalid input" error. Tested multiple string formats (URL, relative path, npm prefix) — all rejected.
- **Fix:** Inspected live marketplace cache at `~/.claude/plugins/marketplaces/claude-plugins-official/.claude-plugin/marketplace.json` to find the validated format. Source is an object: `{"source": "url", "url": "https://github.com/austindick/watson.git"}`.
- **Files modified:** `.claude-plugin/marketplace.json`
- **Verification:** `claude plugin validate .` returns "Validation passed with warnings" (warning is about optional root description, not an error)
- **Committed in:** `eee1eba` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in research finding vs live validator)
**Impact on plan:** Essential fix — without it, the marketplace.json would fail validation. The spirit of the plan (valid marketplace catalog) is fully preserved.

## Issues Encountered

- `claude plugin validate` rejects `description` at marketplace root level as unrecognized key, while also warning it is missing. This is a validator inconsistency — field omitted, warning accepted as passing state.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- marketplace.json and README are the two distribution artifacts required before sharing the GitHub repo
- Next: 15-02 (Playground enabledPlugins entry) and 15-03 (validation checklist) — both depend on these artifacts being in place
- Watson GitHub repo (austindick/watson) must be made public before beta testers can run `/plugin marketplace add austindick/watson`

---
*Phase: 15-distribution-onboarding-validation*
*Completed: 2026-04-05*
