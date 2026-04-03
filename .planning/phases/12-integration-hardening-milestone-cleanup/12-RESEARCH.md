# Phase 12: Integration Hardening + Milestone Cleanup - Research

**Researched:** 2026-04-03
**Domain:** Documentation cleanup, SKILL.md integration gap closure, SUMMARY frontmatter backfill
**Confidence:** HIGH

## Summary

Phase 12 is a documentation and light integration fix phase with no new features. All four success criteria target existing files — SKILL.md, REQUIREMENTS.md, and a set of SUMMARY frontmatter files for phases 06-09. The work is mechanical: read audit findings, edit the precise lines, verify the edits, commit.

Two of the four success criteria address integration gaps identified in the v1.1 audit (blueprintPath derivation in Path B step 5, and relative path read in /watson off). The other two are pure doc cleanup: stale "Pending" text in REQUIREMENTS.md coverage summary, and missing `requirements_completed` fields in SUMMARY frontmatter for phases 06-09.

One subtlety: the audit flagged REQUIREMENTS.md as saying "Pending: 1 (DRFT-04)" but when reading the file today it shows "Pending: 0" — this may already be fixed by Phase 11. The planner should verify current state before treating this as outstanding work.

**Primary recommendation:** One plan is sufficient. All four success criteria are single-file edits (or at most two-file edits for the SUMMARY backfill). No new code, no new agents, no structural changes.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DRFT-04 | On session start, Watson surfaces any pending amendments from previous sessions | Gap: SKILL.md Path B step 5 uses `{blueprintPath}` but Path B never documents how that variable is derived. Fix: add explicit derivation statement before the scan in step 5. |
| SESS-01 | Watson creates a new git branch for a new prototype session with user confirmation | Gap: /watson off reads `blueprint/STATUS.md` as relative path. Fix: replace relative read with `git show {branch}:blueprint/STATUS.md` where branch comes from `/tmp/watson-active.json`. |
| SESS-02 | Watson switches to an existing prototype branch when returning, with user confirmation | Same gap and fix as SESS-01 — the relative path read in /watson off affects both SESS-01 and SESS-02 robustness. |
</phase_requirements>

---

## Gap Analysis

### Gap 1: blueprintPath Resolution in Path B Step 5 (DRFT-04, severity: medium)

**File:** `~/.claude/skills/watson/SKILL.md` line ~60
**Current state:**
```
5. If `drafts:` non-empty:
   Scan {blueprintPath}/LAYOUT.md, DESIGN.md, INTERACTION.md for [PENDING] lines; render grouped by file.
```
**Problem:** `{blueprintPath}` appears in step 5 but Path B never establishes how it is derived. In Path A, SKILL.md passes `targetFilePath` to watson-init which resolves the prototype directory and `blueprint/` subdirectory. In Path B, the user selects a branch — the prototype directory is the git working tree root (or derived from the branch name convention `watson/{slug}`). There is no explicit statement in Path B about how to compute `{blueprintPath}` before step 5 runs.

**Fix pattern:** Insert a derivation statement in Path B — before step 5, state that `blueprintPath` is derived from the checked-out branch: the prototype directory is the git root, so `blueprintPath = {git-root}/{prototype-name}/blueprint/` or more precisely `blueprint/` relative to the prototype directory in the working tree. The most accurate derivation is: after `git checkout watson/{slug}`, `blueprintPath` = `{prototype-directory}/blueprint/` where the prototype directory is the one containing the `blueprint/` subdirectory (discoverable via `find . -name "blueprint" -type d -maxdepth 2` or simply noted as convention: the prototype directory matches the slug).

**Recommended wording addition (before step 5):**
> After branch switch, derive blueprintPath: locate the `blueprint/` directory in the working tree — by convention it lives at `{prototype-slug}/blueprint/` relative to the repo root, where `{prototype-slug}` matches the branch name `watson/{prototype-slug}`. Set `blueprintPath = {prototype-slug}/blueprint/`.

**Confidence:** HIGH — gap is confirmed by audit, SKILL.md text is unambiguous about the missing derivation.

---

### Gap 2: /watson off Relative Path Read (SESS-01, SESS-02, severity: low)

**File:** `~/.claude/skills/watson/SKILL.md` line ~25
**Current state:**
```
c. Read `blueprint/STATUS.md` `sessions:` array from current branch
```
**Problem:** `blueprint/STATUS.md` is a relative path. If the user runs `/watson off` from a directory other than the prototype root, this read will fail silently. The audit recommends using `git show` for robustness.

**Fix pattern:** Replace with `git show {branch}:blueprint/STATUS.md` where `branch` is read from `/tmp/watson-active.json`. This is consistent with the session recovery pattern already used in SKILL.md:
```
find STATUS.md via `git show {branch}:blueprint/STATUS.md`
```
That exact pattern already appears in the Session Recovery section (line 13) — the fix is to apply the same pattern to the /watson off routing block.

**Confirmed pattern (already in SKILL.md session recovery):**
```
git show {branch}:blueprint/STATUS.md
```

**Confidence:** HIGH — the correct pattern is already used elsewhere in SKILL.md; this is a copy-and-apply fix.

---

### Gap 3: REQUIREMENTS.md Coverage Summary (no requirement ID — milestone-level cleanup)

**File:** `/Users/austindick/watson/.planning/REQUIREMENTS.md`
**Audit claim:** Coverage text said "Pending: 1 (DRFT-04)" but traceability table shows DRFT-04 Complete.
**Current state (verified by reading file today):** Coverage text already reads "Pending: 0". This may have been fixed during Phase 11.

**Planner action:** Verify current state of REQUIREMENTS.md before creating a task for this. If "Pending: 0" is already present, this item is already resolved and the task should note it as pre-fixed (no edit needed). Also update the `Last updated:` line to reflect Phase 12 cleanup date.

**Confidence:** HIGH — file read is authoritative; audit is from 2026-04-03 and Phase 11 completed on 2026-04-03.

---

### Gap 4: SUMMARY Frontmatter Missing requirements_completed (Phases 06-09)

**Files and missing fields:**

| Phase | SUMMARY Files | Missing requirements_completed |
|-------|---------------|-------------------------------|
| 06-ambient-activation-status-md-schema | 06-01-SUMMARY.md, 06-02-SUMMARY.md | AMBI-01, AMBI-02, AMBI-03 |
| 07-draft-commit-amendment-model | 07-01-SUMMARY.md, 07-02-SUMMARY.md | DRFT-01, DRFT-02, DRFT-03 |
| 08-session-management | 08-01-SUMMARY.md, 08-02-SUMMARY.md | SESS-01, SESS-02, SESS-03, SESS-04 |
| 09-agent-3-interactions | 09-01-SUMMARY.md, 09-02-SUMMARY.md | INTR-01, INTR-02, INTR-03, INTR-04, INTR-05 |

**Pattern to follow (from 10-01-SUMMARY.md, which Phase 11 fixed):**
```yaml
requirements_completed: [PARA-01, PARA-02, PARA-03, PARA-04]
```

**Distribution of requirements across plans:** The audit does not specify which requirements belong to plan 01 vs plan 02 within each phase. Convention from the project: the last plan in a phase carries the `requirements_completed` field for the whole phase, OR requirements are split by which plan's work satisfies them. Given Phase 11 fixed 10-01-SUMMARY.md with all PARA-* requirements, the consistent pattern is to put all requirements on the final SUMMARY of each phase or distribute them logically:

- Phase 06 plan 01 implements STATUS.md schema + activation section → AMBI-02 (new vs returning detection), AMBI-03 (context summary display) are in plan 01 scope; AMBI-01 (ambient activation) is in plan 02 scope. But for simplicity and consistency with how Phase 11 handled it, put all phase requirements on both summaries or consolidate on the last plan.
- The safest approach: add `requirements_completed` to the last plan's SUMMARY for each phase listing all requirements that phase owns. This matches the Phase 10/11 pattern.

**Recommended field placement (last plan of each phase):**
- 06-02-SUMMARY.md: `requirements_completed: [AMBI-01, AMBI-02, AMBI-03]`
- 07-02-SUMMARY.md: `requirements_completed: [DRFT-01, DRFT-02, DRFT-03]`
- 08-02-SUMMARY.md: `requirements_completed: [SESS-01, SESS-02, SESS-03, SESS-04]`
- 09-02-SUMMARY.md: `requirements_completed: [INTR-01, INTR-02, INTR-03, INTR-04, INTR-05]`

**Confidence:** HIGH — audit is explicit about which fields are missing; pattern is established.

---

## Standard Stack

### Core (what this phase touches)
| File | Purpose | Edit Type |
|------|---------|-----------|
| `~/.claude/skills/watson/SKILL.md` | Watson routing + Path B step 5 fix + /watson off fix | Edit (targeted line changes) |
| `.planning/REQUIREMENTS.md` | Coverage summary text | Verify state, edit if stale |
| `.planning/phases/06-*/06-02-SUMMARY.md` | Add requirements_completed frontmatter | Edit |
| `.planning/phases/07-*/07-02-SUMMARY.md` | Add requirements_completed frontmatter | Edit |
| `.planning/phases/08-*/08-02-SUMMARY.md` | Add requirements_completed frontmatter | Edit |
| `.planning/phases/09-*/09-02-SUMMARY.md` | Add requirements_completed frontmatter | Edit |

### No New Libraries
This phase adds no new dependencies. It is entirely a documentation and text-edit phase.

---

## Architecture Patterns

### Edit-Only Phase Pattern
All changes are targeted edits to existing files. The correct tool for all changes is Edit (not Write). Never overwrite SKILL.md or SUMMARY files — use Edit with precise find/replace.

### SKILL.md Line Budget
SKILL.md must stay under 200 lines (currently ~199 lines per file read). The blueprintPath derivation fix is an inline sentence addition — if adding text would push past 200 lines, the planner must identify a compensating compression (e.g., tighten an existing sentence). Audit the line count before and after.

**Current SKILL.md line count:** 199 lines (read shows 199 lines of content + blank lines). Adding a full sentence to Path B step 5 may push to 201-203. The planner should account for this and either compress nearby prose or integrate the derivation inline within the existing step 5 text rather than as a new bullet.

### Frontmatter requirements_completed Pattern
Already established in the project. Example from 10-01-SUMMARY.md (per Phase 11 fix):
```yaml
requirements_completed: [PARA-01, PARA-02, PARA-03, PARA-04]
```
Field goes in the YAML frontmatter block at the top of each SUMMARY file, after the existing frontmatter fields.

### /watson off Fix Pattern
The session recovery section (SKILL.md line 13) already reads STATUS.md via git show:
```
find STATUS.md via `git show {branch}:blueprint/STATUS.md`
```
Apply the same to the /watson off routing block step 1c:
```
Read `git show {branch}:blueprint/STATUS.md` `sessions:` array
```
The `{branch}` value comes from `/tmp/watson-active.json` which is already read in step 1 of the /watson off sequence.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| blueprintPath derivation | Custom discovery script or agent | Inline prose in SKILL.md step — one sentence |
| STATUS.md read robustness | A new utility function | `git show {branch}:blueprint/STATUS.md` (already used in session recovery) |
| requirements_completed population | Automated frontmatter generator | Manual Edit per file — only 4 files, pattern is simple |

---

## Common Pitfalls

### Pitfall 1: SKILL.md Line Count Overflow
**What goes wrong:** Adding prose to Path B step 5 pushes SKILL.md past 200 lines.
**Why it happens:** SKILL.md is already at the limit (~199 lines).
**How to avoid:** Count lines before and after the edit. If overflow occurs, rewrite the derivation as an inline parenthetical within the existing step 5 sentence rather than a new line.
**Warning signs:** Edit adds 3+ lines of new text to an already dense section.

### Pitfall 2: Writing requirements_completed to Wrong SUMMARY File
**What goes wrong:** requirements_completed added to plan 01 SUMMARY instead of the final plan's SUMMARY.
**Why it happens:** Phases 06-09 each have two plans; the convention should be consistent.
**How to avoid:** Follow the Phase 10/11 pattern — requirements_completed goes on the FINAL plan's SUMMARY for each phase (06-02, 07-02, 08-02, 09-02).

### Pitfall 3: Treating REQUIREMENTS.md as Already Broken
**What goes wrong:** Planner creates a task to fix REQUIREMENTS.md coverage text without verifying its current state.
**Why it happens:** Audit documented a gap that may have been fixed by Phase 11.
**How to avoid:** Read REQUIREMENTS.md first. If "Pending: 0" is present, the coverage fix is a no-op; update only the `Last updated:` line.

### Pitfall 4: Overwriting SKILL.md with Write Tool
**What goes wrong:** Using Write tool to save SKILL.md replaces carefully built content with potential errors.
**Why it happens:** Easy to reach for Write when making multiple changes to one file.
**How to avoid:** Always use Edit tool for targeted SKILL.md changes. Make two separate Edit calls — one for Path B step 5 fix, one for /watson off fix.

---

## Code Examples

### Path B step 5 — before (current state)
```
5. If `drafts:` non-empty:
   Scan {blueprintPath}/LAYOUT.md, DESIGN.md, INTERACTION.md for [PENDING] lines; render grouped by file.
```

### Path B step 5 — after (recommended fix)
```
5. If `drafts:` non-empty:
   Derive blueprintPath: convention is `watson/{slug}` branch → prototype directory `{slug}/`, so `blueprintPath = {slug}/blueprint/` relative to repo root (or `blueprint/` if already in prototype directory).
   Scan {blueprintPath}/LAYOUT.md, DESIGN.md, INTERACTION.md for [PENDING] lines; render grouped by file.
```

If the line count is tight, integrate inline:
```
5. If `drafts:` non-empty (blueprintPath = `{slug}/blueprint/` — derived from checked-out branch name):
   Scan {blueprintPath}/LAYOUT.md, DESIGN.md, INTERACTION.md for [PENDING] lines; render grouped by file.
```

### /watson off — before (current state, step 1c)
```
c. Read `blueprint/STATUS.md` `sessions:` array from current branch
```

### /watson off — after (recommended fix)
```
c. Read `git show {branch}:blueprint/STATUS.md` `sessions:` array
```
(where `{branch}` = value of `branch` field from `/tmp/watson-active.json` read in step 1)

### SUMMARY frontmatter — before (example, 06-02-SUMMARY.md)
```yaml
---
phase: 06-ambient-activation-status-md-schema
plan: 02
subsystem: ui
tags: [watson, ambient-activation, ...]
```

### SUMMARY frontmatter — after
```yaml
---
phase: 06-ambient-activation-status-md-schema
plan: 02
subsystem: ui
tags: [watson, ambient-activation, ...]
requirements_completed: [AMBI-01, AMBI-02, AMBI-03]
```

---

## Validation Architecture

Nyquist validation is enabled (`nyquist_validation: true` in config.json).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — Watson is a Claude Code skill (prose/markdown); no automated test runner |
| Config file | none |
| Quick run command | Manual file read + line count verification |
| Full suite command | Manual: read SKILL.md, read all 8 SUMMARY files, read REQUIREMENTS.md |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Verification |
|--------|----------|-----------|-------------|
| DRFT-04 | Path B step 5 documents how blueprintPath is derived before [PENDING] scan | manual | Read SKILL.md Path B step 5; confirm derivation statement present |
| SESS-01 | /watson off reads STATUS.md via git show, not relative path | manual | Read SKILL.md /watson off block step 1c; confirm `git show {branch}:blueprint/STATUS.md` |
| SESS-02 | Same as SESS-01 | manual | Same verification |

### Phase Gate
All four success criteria verified by static file read before `/gsd:verify-work`.

### Wave 0 Gaps
None — this phase has no automated tests. All verification is static (read files, check content).

---

## Open Questions

1. **REQUIREMENTS.md coverage text**
   - What we know: Audit said "Pending: 1 (DRFT-04)"; current file read shows "Pending: 0"
   - What's unclear: Was this fixed in Phase 11 or was the audit wrong?
   - Recommendation: Planner reads REQUIREMENTS.md first; if "Pending: 0" already present, mark this success criterion as pre-satisfied and skip the edit (only update `Last updated:` line).

2. **SKILL.md line budget after Path B fix**
   - What we know: SKILL.md is currently 199 lines; adding derivation text may push to 201-203
   - What's unclear: Whether inline parenthetical is sufficient or a full sentence is needed for clarity
   - Recommendation: Planner uses inline parenthetical form (adds ~0 net lines if replacing part of existing step 5 text); if it must be a new line, find one word-savings elsewhere in the same section.

3. **Which SUMMARY file gets requirements_completed per phase**
   - What we know: Phase 11 put all PARA-* on 10-01-SUMMARY.md (only plan in phase 10)
   - What's unclear: For phases with 2 plans, should each plan SUMMARY list only the requirements it specifically satisfies, or does the final plan list all?
   - Recommendation: Put all phase requirements on the FINAL plan's SUMMARY (02 suffix) for phases 06-09. This is the simplest and most consistent pattern.

---

## Sources

### Primary (HIGH confidence)
- Direct file read of `~/.claude/skills/watson/SKILL.md` — confirmed current state of Path B step 5 and /watson off block
- Direct file read of `.planning/milestones/v1.1-MILESTONE-AUDIT.md` — authoritative gap list
- Direct file read of `.planning/REQUIREMENTS.md` — confirmed current coverage text state
- Direct file read of phases 06-09 SUMMARY files — confirmed missing `requirements_completed` fields

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — project context and decision history
- `.planning/ROADMAP.md` — phase definitions and success criteria

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Gap identification: HIGH — all gaps read directly from audit + live file verification
- Fix patterns: HIGH — patterns already established in the codebase (session recovery `git show`, Phase 11 `requirements_completed`)
- SKILL.md line count risk: MEDIUM — line count is tight; planner must verify before/after

**Research date:** 2026-04-03
**Valid until:** 2026-04-10 (stable docs, low volatility)
