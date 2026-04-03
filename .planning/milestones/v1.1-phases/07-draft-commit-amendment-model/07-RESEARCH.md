# Phase 7: Draft/Commit Amendment Model — Research

**Researched:** 2026-04-01
**Domain:** Watson skill amendment lifecycle, STATUS.md integration, discuss/builder coordination
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Pending state storage:**
- Inline `[PENDING]` / `[COMMITTED]` markers on each amendment line in blueprint files (LAYOUT.md, DESIGN.md, INTERACTION.md)
- Every new amendment starts as `[PENDING]` — no auto-commit, no exceptions
- CONTEXT.md is always committed — it's a conversation record, not a build instruction. Only blueprint amendment lines get the pending/committed lifecycle
- Builder reads only `[COMMITTED]` lines; skips `[PENDING]` entirely
- STATUS.md `drafts:` array tracks pending amendment IDs (enables session-start surfacing without parsing all blueprint files)
- Amendment IDs are property-based slugs derived from the amendment: `{section}/{property}` → `sidebar-width`, `header-layout`
- Same-property amendments update in place — one entry per property, always the latest decision

**Commit gate (extended "Ready?" gate):**
- The existing "Ready? / Let's build / Discuss more / Just save" gate is extended to show a pending diff before the build option
- Diff is grouped by target file (Layout, Design, Interactions) using design language, not raw amendment syntax
- "Let's build" commits ALL pending amendments then starts the build — all or nothing
- "Just save decisions" leaves amendments as `[PENDING]` — no build triggered
- No selective commit — to hold an amendment back, use "Discuss more" to remove it first

**Session-start surfacing:**
- Pending amendment count integrated into the existing returning-prototype context summary (2-3 lines: name, sections, pending count, last discussed)
- New action choice: "Review pending amendments" alongside "Continue building / Discuss changes / Start fresh"
- "Review pending amendments" shows the full diff (same format as commit gate) and offers: Commit all / Discard all / Keep pending and continue
- Soft warning (once per session) when user triggers a build with pending amendments: "N pending amendments won't be included. Commit and build / Build without pending"

**One-way lock semantics:**
- Committed amendments cannot revert to pending (one-way status transition)
- Values CAN evolve: user creates a new `[PENDING]` amendment for the same property, referencing the committed value as the "old" value. On commit, replaces the old committed line
- This preserves iterative design flow — the lock is on status, not on values

**Discard behavior:**
- All-or-nothing discard — no per-amendment surgical removal at the review screen
- "Discard all" deletes `[PENDING]` lines from blueprint files and clears STATUS.md `drafts:` array
- Committed lines are preserved through discard
- To remove a single amendment: discuss it away (conversational), don't use discard UI

**Expiry:**
- No expiry — pending amendments persist indefinitely until committed or discarded
- Watson surfaces them every session start until resolved

### Claude's Discretion

- Exact wording of the soft warning at build time
- How the diff-to-design-language translation works internally
- Whether the `## Discuss Amendments` section header needs updating for the marker format
- STATUS.md body markdown format for the pending amendments summary

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DRFT-01 | Blueprint amendments from discuss default to a pending state rather than immediately committed | discuss.md amendment write logic (lines ~334-369) adds `[PENDING]` prefix to every new amendment line; builder.md is updated to filter on `[COMMITTED]` only |
| DRFT-02 | User can explicitly commit pending amendments via the existing "Ready?" confirmation gate | discuss.md Phase 9 "Ready?" gate is extended — shows diff first, "Let's build" triggers commit-all then build |
| DRFT-03 | At commit gate, Watson shows a diff-style summary of which decisions will be locked in | Diff is assembled from STATUS.md `drafts:` array (IDs) + lookup in blueprint files; rendered in design language not amendment syntax |
| DRFT-04 | On session start, Watson surfaces any pending amendments from previous sessions | SKILL.md Routing section already parses STATUS.md YAML frontmatter; `drafts:` array non-empty triggers "Review pending amendments" choice |
</phase_requirements>

---

## Summary

Phase 7 adds a pending/committed lifecycle to blueprint amendments. The core mechanic is simple: every amendment written by discuss gets a `[PENDING]` marker prefix; the marker changes to `[COMMITTED]` only when the user explicitly confirms via the "Ready?" gate. Builder already reads blueprint files and applies amendments — the only change needed is a filter: read `[COMMITTED]` lines, skip `[PENDING]` lines.

The STATUS.md `drafts:` array (scaffolded as an empty stub in Phase 6) becomes the index of pending amendment IDs. This is the cross-session bridge — when SKILL.md's Routing section parses STATUS.md on returning-prototype activation, a non-empty `drafts:` array triggers the "Review pending amendments" action choice. No blueprint file parsing is needed at session start, which keeps the activation path lightweight.

The four files that require changes are: `discuss.md` (amendment write logic + Ready gate + mid-build flow), `SKILL.md` (returning-prototype flow: add "Review pending amendments" choice + soft build warning), `builder.md` (filter amendments by `[COMMITTED]` marker), and `watson-init.md` (no structural change needed — `drafts: []` stub is already in the STATUS.md template). The change surface is narrow and changes are additive everywhere except builder.md, which gains a filter rule.

**Primary recommendation:** Implement in three waves. Wave 1 (discuss.md): add `[PENDING]` prefix to all new amendments + write IDs to STATUS.md `drafts:`. Wave 2 (discuss.md + SKILL.md): the commit gate diff display + "Let's build" commit sequence + session-start surfacing. Wave 3 (builder.md): add `[COMMITTED]`-only filter.

---

## Standard Stack

### Core

| File | Current State | Phase 7 Change | Why This File |
|------|---------------|----------------|---------------|
| `discuss.md` | Writes bare amendments; "Ready?" gate lacks diff display | Add `[PENDING]` prefix; extend Ready gate; update STATUS.md `drafts:` | Amendment source + commit gate owner |
| `SKILL.md` | Returns-to-prototype shows name/sections/last-discussed + 3 choices | Add pending count to summary; add "Review pending amendments" choice; add soft build warning | Session-start routing owner |
| `builder.md` | Reads full `## Discuss Amendments` section | Filter: read only lines starting with `[COMMITTED]` | Amendment consumer |
| `watson-init.md` | Scaffolds `drafts: []` in STATUS.md | No change needed — stub already present | STATUS.md scaffold |

### Supporting

| File | Role | What Phase 7 Adds |
|------|------|-------------------|
| `blueprint/STATUS.md` (per-prototype) | Per-prototype state file | `drafts:` array populated with amendment ID slugs |
| `blueprint/LAYOUT.md`, `DESIGN.md`, `INTERACTION.md` | Amendment targets | Amendment lines gain `[PENDING]` / `[COMMITTED]` prefix |

### Alternatives Considered

| Instead of | Could Use | Why We Don't |
|------------|-----------|--------------|
| Inline markers in blueprint files | Separate DRAFT-LAYOUT.md files | Inverts agent contract (deterministic output paths); explicitly ruled Out of Scope in REQUIREMENTS.md |
| All-or-nothing commit | Per-amendment selective commit | Adds UI complexity; user can "discuss away" unwanted amendments instead |
| STATUS.md `drafts:` index | Parse blueprint files on every session start | Blueprint parsing is expensive and fragile; index is O(1) lookup |

**Installation:** No new dependencies. This phase modifies existing Watson skill files only.

---

## Architecture Patterns

### Amendment Line Format (Before and After)

**Current format** (discuss.md, lines ~334-369):
```
## Discuss Amendments

- header/layout: sticky -> fixed (user prefers fixed position)
- sidebar/width: not specified -> 280px (designer requested narrower sidebar)
```

**Phase 7 format:**
```
## Discuss Amendments

[PENDING] header/layout: sticky -> fixed (user prefers fixed position)
[PENDING] sidebar/width: not specified -> 280px (designer requested narrower sidebar)
```

After commit:
```
## Discuss Amendments

[COMMITTED] header/layout: sticky -> fixed (user prefers fixed position)
[COMMITTED] sidebar/width: not specified -> 280px (designer requested narrower sidebar)
```

**Key constraint:** The property-slug format for `drafts:` IDs derives from `{section}/{property}`:
- `header/layout: sticky -> fixed` → ID slug: `header-layout`
- `sidebar/width: not specified -> 280px` → ID slug: `sidebar-width`

Slugify: replace `/` with `-`, replace spaces with `-`, lowercase. The slug identifies the entry in STATUS.md `drafts:`.

### Pattern 1: Amendment Write (discuss.md)

**What:** Every new amendment gets `[PENDING]` prefix. After writing, derive the ID slug and append it to STATUS.md `drafts:` array.

**When to use:** Whenever discuss writes to the `## Discuss Amendments` section of LAYOUT.md, DESIGN.md, or INTERACTION.md.

**Same-property update in place:** Before writing a new amendment for a property, scan the existing `## Discuss Amendments` section for an existing entry with the same property slug. If found:
- Replace the existing line (regardless of its current `[PENDING]` or `[COMMITTED]` status) with a new `[PENDING]` line reflecting the new value
- Update STATUS.md `drafts:` — if the slug is not already present, add it; if present, it stays (still pending)

```
# Source: 07-CONTEXT.md decisions
# When writing amendment for property "sidebar/width":

1. Read blueprint file (LAYOUT.md, DESIGN.md, or INTERACTION.md)
2. Check ## Discuss Amendments section for existing line matching "sidebar/width:"
3a. If NOT found: append new line:
    [PENDING] sidebar/width: not specified -> 280px (reason)
    Add "sidebar-width" to STATUS.md drafts[] if not already present
3b. If found (any marker): replace the line with:
    [PENDING] sidebar/width: [old value] -> [new value] (reason)
    "sidebar-width" already in drafts[] (no change needed)
```

### Pattern 2: Commit Gate Diff Display (discuss.md)

**What:** Before "Let's build" fires, discuss reads `STATUS.md drafts:` to get pending IDs, then looks up each ID in blueprint files to assemble a diff rendered in design language.

**When to use:** When discuss's "Ready?" gate fires and `STATUS.md drafts:` is non-empty.

```
# Source: 07-CONTEXT.md decisions — diff is design language, not raw syntax
# Step 1: Read STATUS.md drafts: array → ["header-layout", "sidebar-width"]
# Step 2: For each ID, find matching line in blueprint files
# Step 3: Render in design language

Example output:
> Here's what will be locked in:
>
> **Layout changes:**
> - Header switches from sticky to fixed position
> - Sidebar narrows to 280px
>
> **Design changes:**
> (none)
```

The translation from amendment syntax to design language is Claude's discretion per CONTEXT.md.

### Pattern 3: Commit-All Sequence (discuss.md)

**What:** When user selects "Let's build" at the commit gate, execute commit sequence before dispatching build:

```
1. For each blueprint file (LAYOUT.md, DESIGN.md, INTERACTION.md):
   a. Read file
   b. Replace all "[PENDING] " prefixes with "[COMMITTED] " in ## Discuss Amendments section
   c. Write file (Edit tool — never Write)
2. Clear STATUS.md drafts: array → []
3. Proceed to build dispatch (return status: "ready_for_build")
```

**Important:** If "Just save decisions" is chosen, skip this sequence entirely. Amendments remain `[PENDING]`, `drafts:` array unchanged.

### Pattern 4: Session-Start Surfacing (SKILL.md Routing section)

**What:** SKILL.md's returning-prototype flow already reads STATUS.md and shows a summary. Phase 7 adds pending count to the summary and a new action choice.

**Current returning flow** (SKILL.md Routing section):
```
Exists -> Returning prototype. Parse YAML frontmatter. Display summary:
"[prototype_name] — [N] section(s) built ([list]). Last discussed: [last_discussed]."
Then offer choices: "Continue building / Discuss changes / Start fresh"
```

**Phase 7 returning flow:**
```
Exists -> Returning prototype. Parse YAML frontmatter.
If drafts: is non-empty (N > 0):
  Display summary:
  "[prototype_name] — [N] section(s) built ([list]). [M] pending amendment(s). Last discussed: [last_discussed]."
  Offer choices: "Continue building / Discuss changes / Review pending amendments / Start fresh"
Else (drafts: is empty):
  [current behavior unchanged]
```

"Review pending amendments" action: assembles the same diff display as the commit gate, then offers: "Commit all / Discard all / Keep pending and continue."

### Pattern 5: Soft Build Warning (SKILL.md)

**What:** When user triggers a build (Tier 2 path) and STATUS.md `drafts:` is non-empty, fire a soft warning once per session.

**Implementation note:** "Once per session" requires a session-local flag. The /tmp/watson-active.json state file (introduced in Phase 6) is the natural carrier for this flag.

```
# Before dispatching loupe.md, check:
if STATUS.md drafts: is non-empty AND /tmp/watson-active.json does not have "pendingWarningShown: true":
  Show AskUserQuestion:
    header: "Pending Changes"
    question: "[N] pending amendment(s) won't be included in the build."
    options: ["Commit and build", "Build without pending"]
  If "Commit and build": run commit-all sequence, then dispatch loupe
  If "Build without pending": add "pendingWarningShown: true" to /tmp/watson-active.json, dispatch loupe as-is
Else: dispatch loupe normally
```

The exact warning wording is Claude's discretion per CONTEXT.md.

### Pattern 6: Builder Amendment Filter (builder.md)

**What:** Builder currently reads the full `## Discuss Amendments` section. Phase 7 adds a filter: only apply lines marked `[COMMITTED]`.

**Where in builder.md:** Step 1 (Read spec files). After reading LAYOUT.md and DESIGN.md, filter the `## Discuss Amendments` section before using amendment data.

```
# Source: builder.md Step 1 — read spec files, then filter amendments
# After reading LAYOUT.md:
# - Identify ## Discuss Amendments section
# - Discard lines starting with "[PENDING] "
# - Apply only lines starting with "[COMMITTED] " (strip the prefix before applying)
# - Lines without a marker: treat as [COMMITTED] (backwards compatibility for pre-Phase-7 amendments)
```

The backwards-compatibility rule (unmarked lines treated as `[COMMITTED]`) is important: existing prototypes built before Phase 7 have amendments without markers. Builder must not ignore these.

### Anti-Patterns to Avoid

- **Auto-committing on conversational acknowledgment:** "That sounds good" mid-discussion is NOT a commit signal. Explicitly ruled Out of Scope in REQUIREMENTS.md.
- **Parsing blueprint files on every session start:** Use STATUS.md `drafts:` array as the index. Only parse blueprint files when the user chooses "Review pending amendments."
- **Writing STATUS.md with Write tool:** Always use Edit to update specific frontmatter fields (especially `drafts:`). Write stomps all other fields.
- **Selective commit UI at the review screen:** All-or-nothing is the design. The user uses "Discuss more" to remove individual amendments before committing.
- **Reverting COMMITTED to PENDING:** One-way transition. A new `[PENDING]` amendment for the same property replaces the value on commit, but the old `[COMMITTED]` line is never reverted in-place.
- **New `## Discuss Amendments` section per session:** The existing pattern is "append to existing section." Phase 7 continues this — one `## Discuss Amendments` section per blueprint file, new amendments appended below existing ones.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pending amendment index | Parse all blueprint files on session start | STATUS.md `drafts:` array | Per-file parsing is fragile and slow; the index is a purpose-built O(1) lookup already scaffolded in Phase 6 |
| Amendment ID generation | UUID or timestamp-based IDs | Property-slug (`{section}/{property}` → kebab) | Human-readable, stable across sessions, enables same-property in-place update |
| Diff-to-design-language rendering | Template engine or custom parser | Claude inline translation at gate display time | Claude is already in the loop at gate; the rendering is a prompt instruction, not code |
| State file for "once per session" warning | New file | Extend `/tmp/watson-active.json` | State file established in Phase 6; JSON allows arbitrary key additions |
| Commit gate flow | New UI flow | Extend existing "Ready?" AskUserQuestion | The gate exists; Phase 7 adds diff display before the gate fires |

---

## Common Pitfalls

### Pitfall 1: "Backwards Compatibility" — Pre-Phase-7 Amendments Have No Marker

**What goes wrong:** Builder applies the new `[COMMITTED]`-only filter and silently skips all amendments from prototypes built before Phase 7, because those amendments have no marker prefix.

**Why it happens:** The filter is written to require `[COMMITTED]` prefix. Pre-Phase-7 amendments are bare lines like `- sidebar/width: 280px (reason)`.

**How to avoid:** Builder's filter rule must have explicit backwards-compatibility handling: lines in `## Discuss Amendments` that have NO marker prefix are treated as `[COMMITTED]`. Document this in builder.md. Only lines with `[PENDING]` prefix are skipped.

**Warning signs:** Existing prototype builds ignore all amendments after Phase 7 ships.

### Pitfall 2: STATUS.md `drafts:` Array Gets Out of Sync with Blueprint Files

**What goes wrong:** An amendment is written to a blueprint file with `[PENDING]` but its ID is not added to STATUS.md `drafts:`. Or, a commit sequence updates blueprint files but fails to clear `drafts:`. Now session-start shows "N pending amendments" but "Review pending amendments" finds no `[PENDING]` lines.

**Why it happens:** Two separate writes happen atomically in protocol but sequentially in execution — if the second write (STATUS.md) fails, the state is inconsistent.

**How to avoid:** Always write STATUS.md `drafts:` update immediately after each blueprint file amendment write. In the commit-all sequence, clear `drafts: []` LAST (after all blueprint files are updated). This way, if a blueprint file update fails mid-commit, the `drafts:` array still correctly reflects what's pending.

**Warning signs:** Session-start shows "2 pending amendments" but Review shows an empty diff.

### Pitfall 3: Mid-Build Discuss Amendments Not Surfaced at Commit Gate

**What goes wrong:** User is mid-build, discusses a change, saves for later (`[PENDING]`). Later triggers a fresh build via Tier 2 path (not from discuss's "Ready?" gate). The soft warning fires, but the diff display in "Commit and build" is missing the amendment because the mid-build flow wrote to `STATUS.md drafts:` using a different code path.

**Why it happens:** discuss.md has two amendment write paths: the main session conclusion (Phase 9 "Ready?" gate) and the mid-build adaptive behavior (Phase 8 "Next step" gate). Both paths must write `[PENDING]` markers and update STATUS.md `drafts:`. If only the main path is updated, mid-build amendments are invisible to the commit gate.

**How to avoid:** The single canonical amendment write routine in discuss.md must handle both paths. Extract the amendment write + ID slug + STATUS.md update logic to one place in discuss.md and reference it from both Phase 9 and Phase 8 flows.

**Warning signs:** Mid-build "Save for later" amendments vanish at session start or don't appear in the commit gate diff.

### Pitfall 4: Diff Display Fires When `drafts:` Is Empty

**What goes wrong:** The commit gate diff display fires even when there are no pending amendments, showing an empty diff or a confusing "nothing to commit" message before the build starts.

**Why it happens:** The diff display logic triggers on "Ready?" gate without checking `STATUS.md drafts:` count first.

**How to avoid:** The diff display and commit-all sequence are conditional on `drafts:` being non-empty. If `drafts:` is empty: proceed directly to build dispatch without showing any diff. Only show the diff when there's actually something to commit.

**Warning signs:** Users see an empty "Here's what will be locked in:" section before every build.

### Pitfall 5: "Review Pending Amendments" Parses Blueprint Files Incorrectly

**What goes wrong:** "Review pending amendments" attempts to display a diff by looking up IDs from `drafts:` in blueprint files. A slug like `sidebar-width` needs to be matched against the line `[PENDING] sidebar/width: ...` — requiring a reverse-slugification step.

**Why it happens:** Slug is derived from `{section}/{property}` by replacing `/` and spaces with `-`. Reverse lookup needs to handle partial matches, since the slug is a lossy transformation (spaces collapsed, `/` replaced).

**How to avoid:** Use the slug primarily as a dedup key and session-start indicator. For the diff display, scan all three blueprint files for `[PENDING]` lines directly rather than trying to reverse-map slugs. The `drafts:` array is for the count and dedup; the actual diff content comes from a forward scan of blueprint files filtered to `[PENDING]` lines.

**Warning signs:** "Review pending amendments" shows incorrect or missing amendments, or throws on slug lookup mismatches.

---

## Code Examples

Verified patterns from existing Watson skill files:

### Current Amendment Write (discuss.md, existing — lines ~334-369)

```markdown
## Discuss Amendments

- header/layout: sticky -> fixed (user prefers fixed position, sticky caused z-index issues)
- sidebar/width: not specified -> 280px (designer requested narrower sidebar)
```

### Phase 7 Amendment Write (discuss.md, updated)

```markdown
## Discuss Amendments

[COMMITTED] header/layout: sticky -> fixed (user prefers fixed position, sticky caused z-index issues)
[PENDING] sidebar/width: not specified -> 280px (designer requested narrower sidebar)
```

### STATUS.md `drafts:` Field Update (Edit tool — not Write)

```yaml
# Before commit:
drafts: ["header-layout", "sidebar-width"]

# After commit-all:
drafts: []
```

Edit tool targets the `drafts:` line in the YAML frontmatter. Never overwrite the full STATUS.md file.

### Builder Amendment Filter (builder.md Step 1, addition)

```
After reading LAYOUT.md (and DESIGN.md):
- Locate ## Discuss Amendments section
- For each amendment line:
  - Starts with "[PENDING] ": skip entirely
  - Starts with "[COMMITTED] ": apply (strip prefix first)
  - No prefix (pre-Phase-7 format): apply as-is (backwards compatibility)
```

### AskUserQuestion — "Review Pending Amendments" diff + action

```
# Source: 07-CONTEXT.md — "Review pending amendments" action choices
AskUserQuestion:
  header: "Pending"
  question: "[diff summary in design language]\n\nWhat would you like to do?"
  options: ["Commit all", "Discard all", "Keep pending and continue"]
```

### AskUserQuestion — Soft Build Warning

```
# Source: 07-CONTEXT.md — soft warning fires once per session
AskUserQuestion:
  header: "Pending Changes"
  question: "[N] pending amendment(s) won't be included in the build."
  options: ["Commit and build", "Build without pending"]
```

### Discard-All Sequence

```
1. For each blueprint file (LAYOUT.md, DESIGN.md, INTERACTION.md):
   a. Read file
   b. Delete all lines starting with "[PENDING] " in ## Discuss Amendments section
   c. Write file (Edit tool)
2. Set STATUS.md drafts: []
3. Confirmed message: "Pending amendments discarded. Committed decisions are preserved."
```

---

## State of the Art

| Old Approach | Phase 7 Approach | Impact |
|--------------|------------------|--------|
| All amendments immediately effective (no lifecycle) | `[PENDING]` / `[COMMITTED]` inline markers | Builder only applies committed decisions; pending decisions visible but excluded from build |
| "Ready?" gate → immediate build dispatch | "Ready?" gate → diff display → commit-all → build dispatch | User reviews exactly what gets locked in before it does |
| STATUS.md `drafts: []` stub (empty, Phase 6 placeholder) | STATUS.md `drafts:` populated with amendment ID slugs | Session-start surfacing without blueprint file parsing |
| Session-start shows 3 choices | Session-start shows 4 choices when `drafts:` non-empty | Unfinished work surfaces automatically every session |
| Builder reads all amendments | Builder reads `[COMMITTED]`-only (with backwards compat) | Pending decisions genuinely excluded from builds |

**No deprecations:** This phase is additive. The amendment format is extended (prefix added), not replaced.

---

## Open Questions

1. **STATUS.md `drafts:` update when loupe agents run (not discuss)**
   - What we know: builder and consolidator agents write/read blueprint files. If they touch the `## Discuss Amendments` section, they could inadvertently see `[PENDING]` lines.
   - What's unclear: Do loupe-path agents (layout.md, design.md) ever read or write the `## Discuss Amendments` section? Current research says layout.md and design.md write their own sections (e.g., `## Header Section`) and builder reads amendments. This is likely fine.
   - Recommendation: Confirm that layout.md, design.md, reviewer.md, and consolidator.md do not write to `## Discuss Amendments`. If any do, they need the same `[COMMITTED]`-only filter. LOW priority — these agents write new sections, not amendments.

2. **"Discuss more" amendment removal UX**
   - What we know: To remove a single pending amendment (rather than discard-all), the user is directed to "discuss it away" conversationally.
   - What's unclear: What exactly does "discuss it away" mean in practice? Does discuss delete the `[PENDING]` line when the user conversationally reverses a decision? Or does it simply not matter because the amendment won't be committed until the gate?
   - Recommendation: Define in discuss.md that if a user explicitly reverses a pending amendment decision during conversation, discuss deletes the `[PENDING]` line from the blueprint file and removes the ID from STATUS.md `drafts:`. This makes the pending state accurate. If not implemented, pending amendments that were verbally reversed still appear in the commit gate diff — confusing.

3. **SKILL.md line budget impact**
   - What we know: SKILL.md is currently at ~168 lines after Phase 6 changes. Limit is 200.
   - What's unclear: The session-start returning flow extension (pending count in summary + "Review pending amendments" choice) adds approximately 5-8 lines. The soft build warning adds 3-5 lines. Budget estimate: 168 + 13 = ~181 lines. Should be safe.
   - Recommendation: Count lines precisely after Phase 7 SKILL.md changes before finalizing. Target ≤195 lines to preserve buffer for Phase 8.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — Watson is a Claude Code skill (behavioral output, not testable binary) |
| Config file | none |
| Quick run command | Manual invocation test in Playground |
| Full suite command | Manual E2E walkthrough |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DRFT-01 | New amendment written by discuss has `[PENDING]` prefix; STATUS.md `drafts:` updated | manual-only | Invoke discuss, make a design decision, inspect blueprint file and STATUS.md | N/A |
| DRFT-02 | "Let's build" at commit gate runs commit-all and then builds; "Just save" leaves `[PENDING]` | manual-only | Run discuss to conclusion, observe gate options and status after each choice | N/A |
| DRFT-03 | Commit gate shows design-language diff of pending amendments grouped by file | manual-only | Have pending amendments, reach "Ready?" gate, verify diff appears before build choice | N/A |
| DRFT-04 | Session start with non-empty `drafts:` shows pending count in summary and "Review pending amendments" choice | manual-only | End session with pending amendments, start new session, observe SKILL.md routing output | N/A |

**Manual-only justification:** Watson is a Claude Code skill — behavioral output is Claude's response in conversation, not a testable binary artifact. Verification requires observing Claude's behavior in an actual Playground session.

### Sampling Rate

- **Per task commit:** Spot-check modified file (discuss.md amendment write, SKILL.md routing, builder.md filter) for marker presence/absence
- **Per wave merge:** E2E walkthrough covering one full pending-commit cycle and one pending-discard cycle
- **Phase gate:** All four DRFT requirements demonstrably true before `/gsd:verify-work`

### Wave 0 Gaps

None — no automated test infrastructure needed. Validation is entirely behavioral/observational.

---

## Sources

### Primary (HIGH confidence)

- `/Users/austindick/.claude/skills/watson/skills/discuss.md` — Amendment write logic (lines ~334-369), Ready gate (Phase 9), mid-build flow (Phase 8), return status schema
- `/Users/austindick/.claude/skills/watson/SKILL.md` — Returning-prototype flow, STATUS.md YAML parsing, action choices, Tier 2 build dispatch path
- `/Users/austindick/.claude/skills/watson/agents/builder.md` — Step 1 spec file reading, amendment application protocol
- `/Users/austindick/.claude/skills/watson/utilities/watson-init.md` — STATUS.md template with `drafts: []` stub, Edit-not-Write constraint documentation
- `.planning/phases/07-draft-commit-amendment-model/07-CONTEXT.md` — All locked decisions and implementation specifics
- `.planning/phases/06-ambient-activation-status-md-schema/06-RESEARCH.md` — STATUS.md schema design, `drafts:` field rationale, Edit-not-Write protocol
- `.planning/REQUIREMENTS.md` — DRFT-01 through DRFT-04 definitions, Out of Scope items (draft-as-separate-file, auto-commit-on-acknowledgment)

### Secondary (MEDIUM confidence)

- `.planning/phases/06-ambient-activation-status-md-schema/06-02-PLAN.md` — State file `/tmp/watson-active.json` protocol; confirms session-local flag carrier for soft warning

### Tertiary (LOW confidence)

- None — all claims verified against project files

---

## Metadata

**Confidence breakdown:**
- Amendment marker format: HIGH — directly from CONTEXT.md locked decisions
- STATUS.md `drafts:` integration: HIGH — field exists in watson-init.md template; schema documented in Phase 6 research
- Commit gate flow: HIGH — extends existing "Ready?" gate from discuss.md
- Builder filter: HIGH — backwards-compat rule is the only non-obvious element; verified against builder.md Step 1
- SKILL.md returning flow extension: HIGH — existing flow is known; addition is additive
- Soft build warning carrier (state file): MEDIUM — /tmp/watson-active.json confirmed in Phase 6; JSON extensibility is standard but not explicitly documented for this use

**Research date:** 2026-04-01
**Valid until:** 2026-06-01 (stable skill files, 60-day window)
