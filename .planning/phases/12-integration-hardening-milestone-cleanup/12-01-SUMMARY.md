---
phase: 12-integration-hardening-milestone-cleanup
plan: 01
subsystem: skills
tags: [watson, skill, skill-md, session-management, amendments, summary-frontmatter, requirements-traceability]

# Dependency graph
requires:
  - phase: 11-restore-drft04-review-gate-doc-fixes
    provides: DRFT-04 gate restored; SKILL.md at 198 lines
  - phase: 06-ambient-activation-status-md-schema
    provides: SKILL.md routing model with /watson off handler
  - phase: 07-draft-commit-amendment-model
    provides: Path B returning-prototype flow with pending amendment surfacing

provides:
  - "SKILL.md /watson off step 1c reads STATUS.md via git show {branch}:blueprint/STATUS.md instead of relative path"
  - "SKILL.md Path B step 5 documents inline blueprintPath derivation (slug/blueprint/ from watson/{slug} branch)"
  - "requirements_completed frontmatter in 06-02, 07-02, 08-02, 09-02 SUMMARY files"
  - "REQUIREMENTS.md Last updated line updated to Phase 12"

affects: [watson-skill, session-management, v1.1-milestone-audit]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "git show {branch}:path pattern for reading files from specific branches without checkout"
    - "blueprintPath derivation documented inline at point of use — slug/blueprint/ from branch name watson/{slug}"

key-files:
  created:
    - ".planning/phases/12-integration-hardening-milestone-cleanup/12-01-SUMMARY.md"
  modified:
    - "~/.claude/skills/watson/SKILL.md"
    - ".planning/phases/06-ambient-activation-status-md-schema/06-02-SUMMARY.md"
    - ".planning/phases/07-draft-commit-amendment-model/07-02-SUMMARY.md"
    - ".planning/phases/08-session-management/08-02-SUMMARY.md"
    - ".planning/phases/09-agent-3-interactions/09-02-SUMMARY.md"
    - ".planning/REQUIREMENTS.md"

key-decisions:
  - "Use git show {branch}:blueprint/STATUS.md in /watson off — matches the session recovery pattern already established on line 13"
  - "blueprintPath derivation documented inline in Path B step 5 — avoids adding net lines by folding into existing step text"
  - "requirements_completed uses underscore not hyphen — consistent with gsd tooling grep expectations"

patterns-established:
  - "All SUMMARY files use requirements_completed (underscore) for machine-readable requirement traceability"

requirements_completed: [DRFT-04, SESS-01, SESS-02]

# Metrics
duration: 2min
completed: 2026-04-03
---

# Phase 12 Plan 01: Integration Hardening + Milestone Cleanup Summary

**SKILL.md gaps closed (git show for STATUS.md read, blueprintPath inline derivation) and requirements_completed frontmatter backfilled across phases 06-09 SUMMARY files**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-03T03:33:27Z
- **Completed:** 2026-04-03T03:34:34Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Fixed SKILL.md /watson off step 1c: replaced relative `blueprint/STATUS.md` path with `git show {branch}:blueprint/STATUS.md` — consistent with session recovery pattern on line 13, robust across branch switches
- Fixed SKILL.md Path B step 5: added inline `blueprintPath = {slug}/blueprint/` derivation from checked-out branch `watson/{slug}` without adding net lines (198 lines, 2 under budget)
- Backfilled `requirements_completed` frontmatter (underscore format) in all four phase 06-09 SUMMARY files — enables machine-readable traceability grep
- Updated REQUIREMENTS.md Last updated line to reference Phase 12 cleanup

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix SKILL.md integration gaps** - `8af5d09` (fix) — watson skills repo
2. **Task 2: Backfill SUMMARY frontmatter + update REQUIREMENTS.md timestamp** - `c7f5549` (fix) — watson repo

## Files Created/Modified

- `~/.claude/skills/watson/SKILL.md` — /watson off step 1c updated to git show pattern; Path B step 5 inline blueprintPath derivation added
- `.planning/phases/06-ambient-activation-status-md-schema/06-02-SUMMARY.md` — `requirements-completed` renamed to `requirements_completed` (underscore)
- `.planning/phases/07-draft-commit-amendment-model/07-02-SUMMARY.md` — `requirements-completed` list converted to `requirements_completed: [DRFT-01, DRFT-02, DRFT-03]` inline format
- `.planning/phases/08-session-management/08-02-SUMMARY.md` — `requirements-completed` renamed to `requirements_completed` (underscore)
- `.planning/phases/09-agent-3-interactions/09-02-SUMMARY.md` — `requirements-completed` renamed to `requirements_completed` and expanded to all 5 INTR requirements
- `.planning/REQUIREMENTS.md` — Last updated line updated to Phase 12

## Decisions Made

- **git show pattern for /watson off**: The relative path `blueprint/STATUS.md` would fail if the user is on a different branch when running `/watson off`. Using `git show {branch}:blueprint/STATUS.md` reads from the specific Watson branch regardless of current HEAD, matching the already-established session recovery pattern on line 13.
- **Inline blueprintPath derivation**: Adding it as a parenthetical in the existing step 5 text avoids net line growth — SKILL.md stays at 198 lines vs. a separate derivation step that would consume a new line.
- **Underscore over hyphen for requirements_completed**: The gsd-tools grep uses `requirements_completed` (underscore). The prior phases used a hyphen (`requirements-completed`), causing the traceability check to miss them. Normalizing to underscore closes the gap.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 08-02-SUMMARY.md used hyphen not underscore for requirements key**
- **Found during:** Task 2 verification (grep returned FAIL: only 3/4 files updated)
- **Issue:** Plan said 08-02 needed to be updated, but actually it already had `requirements-completed` (hyphen). The verification grep counts `requirements_completed` (underscore) — so despite having a value, it failed the check.
- **Fix:** Changed `requirements-completed` to `requirements_completed` in 08-02-SUMMARY.md (same as the other three files)
- **Files modified:** `.planning/phases/08-session-management/08-02-SUMMARY.md`
- **Committed in:** `c7f5549`

---

**Total deviations:** 1 auto-fixed (1 bug — wrong key format discovered by verification)
**Impact on plan:** Fix was necessary for the verification grep to pass. All four files now consistently use the underscore format expected by tooling.

## Issues Encountered

None beyond the auto-fixed hyphen/underscore discrepancy above.

## User Setup Required

None — all changes are to skill files and planning documents. No external services or environment variables required.

## Next Phase Readiness

- All four v1.1 milestone audit success criteria are now met:
  1. SKILL.md Path B documents blueprintPath derivation before [PENDING] scan
  2. /watson off reads STATUS.md via git show
  3. REQUIREMENTS.md coverage summary matches traceability (Pending: 0, Last updated reflects Phase 12)
  4. SUMMARY frontmatter includes requirements_completed for phases 06-09
- SKILL.md at 198 lines (2 lines of buffer)
- v1.1 milestone audit is clean — milestone can be marked complete

---
*Phase: 12-integration-hardening-milestone-cleanup*
*Completed: 2026-04-03*

## Self-Check: PASSED

- FOUND: `.planning/phases/12-integration-hardening-milestone-cleanup/12-01-SUMMARY.md`
- FOUND: `8af5d09` (SKILL.md fix commit — watson skills repo)
- FOUND: `c7f5549` (SUMMARY backfill commit — watson repo)
