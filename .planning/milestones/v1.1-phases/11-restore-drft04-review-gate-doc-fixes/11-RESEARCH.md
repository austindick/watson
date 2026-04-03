# Phase 11: Restore DRFT-04 Review Gate + Doc Fixes — Research

**Researched:** 2026-04-02
**Domain:** Watson SKILL.md routing, interaction.md frontmatter, 10-01-SUMMARY.md frontmatter
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DRFT-04 | On session start, Watson surfaces any pending amendments from previous sessions | SKILL.md Path B step 5 currently has only a passive note; must be upgraded to an AskUserQuestion gate with Commit all / Discard all / Keep pending options when `drafts:` is non-empty |
</phase_requirements>

---

## Summary

Phase 11 is a gap-closure phase addressing a cross-phase regression, one documentation mismatch, and one metadata omission — all identified by the v1.1 milestone audit. There are exactly three artifacts to fix; none require new design decisions.

The primary fix is DRFT-04: the "Review pending amendments" AskUserQuestion gate was implemented in Phase 7 and verified at the time. Phase 8's SKILL.md rewrite replaced the entire routing section with a 2-path fork model. During that rewrite the gate was not carried forward. The live SKILL.md Path B step 5 currently reads only "If `drafts:` non-empty, include pending amendments note" — a passive note, not the interactive gate. The fix is a targeted edit to SKILL.md Path B step 5: upgrade the passive note to an AskUserQuestion gate that shows the pending diff and presents Commit all / Discard all / Keep pending options. The surrounding Path B logic (steps 1-4, 6, and Intent Classification) is unchanged.

The two documentation fixes require single-line edits: change `dispatch: foreground` to `dispatch: background` in `interaction.md` frontmatter, and add PARA-01 through PARA-04 to the `requirements_completed` array in `10-01-SUMMARY.md`. Neither fix has any functional impact — both are metadata/documentation alignment.

**Primary recommendation:** Three targeted edits to three files. No new design. No new patterns. Phase 8's handling logic for the commit-all and discard-all sequences already exists in discuss.md — SKILL.md Path B only needs the gate that triggers them.

---

## Standard Stack

### Files to Modify

| File | Current State | Required Change | Change Size |
|------|---------------|-----------------|-------------|
| `~/.claude/skills/watson/SKILL.md` | Path B step 5: passive pending note | Upgrade to AskUserQuestion gate with 3 options + handler logic | ~10-15 lines added/replaced |
| `~/.claude/skills/watson/agents/interaction.md` | Line 2: `dispatch: foreground` | Change to `dispatch: background` | 1 character change |
| `.planning/phases/10-3-agent-parallel-dispatch/10-01-SUMMARY.md` | `requirements_completed` missing PARA-01 through PARA-04 | Add PARA-01, PARA-02, PARA-03, PARA-04 to `requirements_completed` frontmatter array | 4 lines added |

### No New Dependencies

This phase installs nothing. It modifies three existing files with surgical edits.

---

## Architecture Patterns

### The Review Gate That Was Lost

Phase 7's CONTEXT.md and RESEARCH.md specified the exact AskUserQuestion pattern for session-start review. The commit-all and discard-all sequences were implemented in discuss.md. SKILL.md was supposed to host the gate that triggers them. Here is the exact pattern from Phase 7 research (high confidence — sourced from 07-CONTEXT.md locked decisions):

```
AskUserQuestion:
  header: "Pending"
  question: "[diff summary in design language]\n\nWhat would you like to do?"
  options: ["Commit all", "Discard all", "Keep pending and continue"]
```

Where `[diff summary]` is assembled by scanning the three blueprint files for `[PENDING]` lines and rendering them in design language (not raw amendment syntax). This is the same diff format used in discuss.md's commit gate (DRFT-03).

### Pattern: SKILL.md Path B Step 5 — Before and After

**Current (passive note — broken):**
```
5. If `drafts:` non-empty, include pending amendments note
```

**Required (interactive gate — restores DRFT-04):**
```
5. If `drafts:` non-empty:
   Assemble diff: scan blueprint files (LAYOUT.md, DESIGN.md, INTERACTION.md) for
   [PENDING] lines; render each in design language (not raw amendment syntax).
   AskUserQuestion — header: "Pending", question: "[diff]\n\nWhat would you like to do?",
   options: ["Commit all", "Discard all", "Keep pending and continue"]
   - "Commit all": replace all [PENDING] with [COMMITTED] in blueprint files (Edit tool),
     clear STATUS.md drafts: [] (Edit tool), then proceed to Intent Classification
   - "Discard all": delete all [PENDING] lines from blueprint files (Edit tool),
     clear STATUS.md drafts: [] (Edit tool), confirm "Amendments discarded. Committed
     decisions preserved.", then proceed to Intent Classification
   - "Keep pending and continue": proceed to Intent Classification with no changes
```

### Line Budget

SKILL.md has a hard 200-line limit. Current file is 193 lines (per live read). The gate logic adds approximately 10-12 lines at step 5 (the old step 5 is 1 line; the replacement is ~11-12 lines). This brings the file to approximately 202-204 lines — over budget by 3-4 lines.

**Resolution strategy:** The commit-all and discard-all sequences are identical to what Tier 2 dispatch already handles (lines 134-138 of current SKILL.md). Reference the same sequence rather than spelling it out in full. Alternatively, the Path B step 5 expansion displaces the need for the Tier 2 pre-build warning in some cases — but do NOT remove the Tier 2 warning (it still applies to mid-session builds where the Path B gate wasn't triggered).

**Practical approach:** Keep the gate description tight. "Commit all" and "Discard all" sequences can each be expressed in 2 lines by referencing the same commit-all logic already described inline at Tier 2 (lines 134-138). The gate itself is ~5 lines. Net addition to step 5: ~7 lines replacing 1 line = +6 lines net. 193 + 6 = 199 lines. Within budget.

### Diff Assembly at Path B (not at Tier 2)

The diff assembly for the Path B review gate must scan blueprint files directly for `[PENDING]` lines. Do NOT rely on slug reverse-mapping from STATUS.md `drafts:` array for the diff content (Phase 7 Pitfall 5 documented this). The `drafts:` array is used only to know that there are pending amendments (non-empty check); the diff content comes from a forward scan of the three blueprint files.

```
# Diff assembly for Path B step 5:
1. Read {blueprintPath}/LAYOUT.md, DESIGN.md, INTERACTION.md
2. For each file, extract lines starting with "[PENDING] "
3. Group by file type (Layout changes, Design changes, Interaction changes)
4. Render each line in design language (strip "[PENDING] " prefix, translate
   property/value syntax to human language)
5. If a group has no [PENDING] lines, omit the group header
```

### Documentation Fixes

**interaction.md dispatch frontmatter** — The current line 2 `dispatch: foreground` is wrong. loupe.md dispatches interaction as background (confirmed at line 111 of loupe.md: "Dispatch `@agents/interaction.md` as **background** agent"). The fix is:

```yaml
# Before:
dispatch: foreground

# After:
dispatch: background
```

**10-01-SUMMARY.md requirements_completed** — The SUMMARY frontmatter currently lists the decisions/files/etc. but omits PARA-01 through PARA-04 from `requirements_completed`. The VERIFICATION confirmed all four satisfied. Add them:

```yaml
requirements_completed: [PARA-01, PARA-02, PARA-03, PARA-04]
```

Note: the `requirements_completed` key may need to be added to the frontmatter entirely (it's absent, not just missing values). Inspect the current frontmatter before editing.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Commit-all sequence | New commit logic in SKILL.md | Same pattern already in Tier 2 pre-build block (SKILL.md lines 134-138) | One authoritative commit-all pattern; duplicate logic creates drift |
| Discard-all sequence | New discard logic | Same discard pattern from Phase 7 — scan for [PENDING], delete, clear drafts: | Already defined in Phase 7 RESEARCH.md Pattern 3 |
| Diff assembly | Parse STATUS.md drafts: slugs and reverse-map | Forward scan blueprint files for [PENDING] lines | Reverse-map is lossy; forward scan is reliable (Phase 7 Pitfall 5) |

**Key insight:** Phase 7 designed and verified the commit-all, discard-all, and diff-display sequences. Phase 11's only job is to wire the AskUserQuestion gate at Path B step 5 that calls those sequences. Nothing new to design.

---

## Common Pitfalls

### Pitfall 1: Exceeding SKILL.md 200-Line Limit

**What goes wrong:** The gate expansion pushes SKILL.md past 200 lines, violating the hard constraint.

**Why it happens:** Current file is 193 lines. Adding ~11 lines for the full gate replaces 1 line — net +10 lines = 203 lines.

**How to avoid:** Keep the gate text compact. Both "Commit all" and "Discard all" handlers can reference the Tier 2 commit/discard sequences already defined above (same commit-all pattern: replace [PENDING] with [COMMITTED], clear drafts:). Express each handler in 2 terse lines by pointing to the same sequence. Target: gate text = ~7-8 lines replacing 1 line = net +6-7 lines = 199-200 lines total.

**Warning signs:** `wc -l ~/.claude/skills/watson/SKILL.md` > 200.

### Pitfall 2: Removing the Tier 2 Pre-Build Soft Warning

**What goes wrong:** Planner reasons "the Path B gate now catches all pending amendments, so the Tier 2 pre-build warning is redundant." Removes the warning. Users who trigger Tier 2 mid-session (after already passing Path B with "Keep pending") get builds with silent pending amendments.

**Why it happens:** The two gates serve different moments: Path B is session-start (before any work); Tier 2 warning is mid-session (user initiates a build). Both are necessary.

**How to avoid:** The Tier 2 pre-build warning (SKILL.md lines 134-138) MUST NOT be touched in Phase 11. It covers a different case than the Path B gate.

### Pitfall 3: Using Write Tool Instead of Edit for Blueprint Files

**What goes wrong:** Commit-all or discard-all sequences use Write tool on blueprint files, stomping content outside `## Discuss Amendments` section.

**Why it happens:** Write replaces the entire file. Blueprint files contain sections that must be preserved (CONTEXT.md, component lists, etc.).

**How to avoid:** Always use Edit tool for blueprint file amendments. Per Phase 7 CONTEXT.md locked decision: "Edit tool — never Write" for amendment operations.

### Pitfall 4: Missing `requirements_completed` Key in 10-01-SUMMARY.md

**What goes wrong:** Edit adds PARA-01 through PARA-04 to an array that doesn't exist yet in the frontmatter, creating malformed YAML.

**Why it happens:** The SUMMARY was written before the requirements_completed field was mandatory. The key may be absent entirely.

**How to avoid:** Read 10-01-SUMMARY.md frontmatter first. If `requirements_completed:` key is absent, add it as a new YAML array field. If it exists but is empty or partial, append the four IDs. Use Edit tool targeting the frontmatter block.

---

## Code Examples

### SKILL.md Path B Step 5 — Replacement Text

```markdown
5. If `drafts:` non-empty:
   Scan {blueprintPath}/LAYOUT.md, DESIGN.md, INTERACTION.md for [PENDING] lines;
   render grouped by file in design language. AskUserQuestion — header: "Pending",
   question: "[diff]\n\nWhat would you like to do?",
   options: ["Commit all", "Discard all", "Keep pending and continue"]
   - "Commit all": replace all [PENDING] with [COMMITTED] in blueprint files (Edit),
     set STATUS.md `drafts: []` (Edit), then proceed to Intent Classification
   - "Discard all": delete all [PENDING] lines from blueprint files (Edit),
     set STATUS.md `drafts: []` (Edit), confirm "Amendments discarded.", proceed
   - "Keep pending and continue": proceed to Intent Classification unchanged
```

### interaction.md Frontmatter Fix

```yaml
---
name: interaction
dispatch: background   # was: foreground — loupe.md dispatches as background (Phase 10)
---
```

### 10-01-SUMMARY.md Frontmatter Addition

```yaml
requirements_completed: [PARA-01, PARA-02, PARA-03, PARA-04]
```

---

## State of the Art

| Old State (After Phase 8) | Required State (After Phase 11) | Impact |
|---------------------------|----------------------------------|--------|
| Path B step 5: passive pending count note | Path B step 5: AskUserQuestion with Commit all / Discard all / Keep pending | DRFT-04 satisfied |
| interaction.md `dispatch: foreground` | interaction.md `dispatch: background` | Documentation accurate |
| 10-01-SUMMARY.md: no `requirements_completed` | 10-01-SUMMARY.md: `requirements_completed: [PARA-01, PARA-02, PARA-03, PARA-04]` | Audit metadata accurate |

---

## Open Questions

1. **SKILL.md exact line count after gate expansion**
   - What we know: File is currently 193 lines (read during research). Gate expansion nets ~+6 lines = 199 lines.
   - What's unclear: Exact line count depends on how compact the handler descriptions can be written.
   - Recommendation: Executor must run `wc -l` after editing and trim if over 200. The compact 2-line handler format described above is the primary lever.

2. **10-01-SUMMARY.md `requirements_completed` key presence**
   - What we know: The key is missing from the frontmatter (SUMMARY was written without it).
   - What's unclear: Whether the Edit tool can insert a new YAML key cleanly without the full frontmatter context.
   - Recommendation: Read the full frontmatter first, then use Edit to insert after the last existing frontmatter key (before the closing `---`). This is standard Edit-tool practice.

---

## Validation Architecture

Nyquist validation is enabled (`workflow.nyquist_validation: true` in config.json).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — Watson is a Claude Code skill (behavioral output, not testable binary) |
| Config file | none |
| Quick run command | Manual invocation in Playground |
| Full suite command | Manual E2E walkthrough |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DRFT-04 | Path B with non-empty drafts: presents AskUserQuestion gate (not just a note); all three option branches execute correctly | manual-only | Observe SKILL.md Path B behavior with a prototype that has pending amendments | N/A |

**Supporting verifications (not Req IDs, but audit items):**

| Audit Item | Verification | Automated |
|------------|-------------|-----------|
| interaction.md dispatch: background | `grep "dispatch:" ~/.claude/skills/watson/agents/interaction.md` | Yes |
| SKILL.md under 200 lines | `wc -l ~/.claude/skills/watson/SKILL.md` | Yes |
| 10-01-SUMMARY.md contains PARA-01..04 | `grep "PARA-0" .planning/phases/10-3-agent-parallel-dispatch/10-01-SUMMARY.md` | Yes |

**Manual-only justification:** Watson is a Claude Code skill. The AskUserQuestion gate behavior requires a live Playground session with actual pending amendments in STATUS.md to verify.

### Sampling Rate

- **Per task commit:** `wc -l ~/.claude/skills/watson/SKILL.md` and `grep "dispatch:" ~/.claude/skills/watson/agents/interaction.md`
- **Per wave merge:** Inspect all three modified files for correct content
- **Phase gate:** All three success criteria explicitly verified before phase close

### Wave 0 Gaps

None — no test infrastructure needed. All automated checks are one-line shell commands.

---

## Sources

### Primary (HIGH confidence)

- `/Users/austindick/.claude/skills/watson/SKILL.md` — live file; Path B step 5 passive note confirmed at line 59; line count 193; Tier 2 commit-all pattern at lines 134-138
- `/Users/austindick/.claude/skills/watson/agents/interaction.md` — live file; `dispatch: foreground` confirmed at line 2
- `/Users/austindick/.claude/skills/watson/skills/loupe.md` — confirmed `dispatch @agents/interaction.md` as background at line 111
- `.planning/milestones/v1.1-MILESTONE-AUDIT.md` — gap definitions, exact evidence, and fix specifications for all three items
- `.planning/phases/07-draft-commit-amendment-model/07-RESEARCH.md` — AskUserQuestion gate pattern (Pattern 4), diff assembly approach (Pitfall 5), commit-all/discard-all sequences (Patterns 3 and research section)
- `.planning/phases/10-3-agent-parallel-dispatch/10-01-SUMMARY.md` — live file; confirmed PARA-01..04 requirements met but absent from frontmatter
- `.planning/REQUIREMENTS.md` — DRFT-04 definition; confirms Phase 11 as responsible phase
- `.planning/config.json` — confirms nyquist_validation: true

### Secondary (MEDIUM confidence)

- `.planning/phases/08-session-management/08-01-PLAN.md` — documents what Phase 8 changed in SKILL.md routing; confirms the 2-path fork rewrite was the source of the regression

### Tertiary (LOW confidence)

None — all claims verified against live project files.

---

## Metadata

**Confidence breakdown:**
- DRFT-04 gap location and fix: HIGH — audit evidence points exactly to SKILL.md Path B step 5; Phase 7 research documents the exact gate pattern to restore
- interaction.md fix: HIGH — `dispatch: foreground` confirmed in file; loupe.md line 111 confirms background dispatch
- 10-01-SUMMARY.md fix: HIGH — SUMMARY file read; PARA-01..04 absent from frontmatter; VERIFICATION confirmed all four satisfied
- SKILL.md line budget: MEDIUM — current count is 193 (exact); post-edit count is estimated at ~199; depends on wording compactness

**Research date:** 2026-04-02
**Valid until:** 2026-05-15 (stable skill files; no anticipated upstream changes)
