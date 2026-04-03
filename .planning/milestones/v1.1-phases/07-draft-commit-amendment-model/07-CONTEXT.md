# Phase 7: Draft/Commit Amendment Model - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Blueprint amendments get a pending/committed lifecycle. No design decision from discuss is silently locked in — amendments default to pending, and the user explicitly commits them via the existing "Ready?" gate. Every session start surfaces unfinished work. This phase does NOT add new discuss capabilities, change builder behavior beyond reading markers, or implement session management (Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Pending state storage
- Inline `[PENDING]` / `[COMMITTED]` markers on each amendment line in blueprint files (LAYOUT.md, DESIGN.md, INTERACTION.md)
- Every new amendment starts as `[PENDING]` — no auto-commit, no exceptions
- CONTEXT.md is always committed — it's a conversation record, not a build instruction. Only blueprint amendment lines get the pending/committed lifecycle
- Builder reads only `[COMMITTED]` lines; skips `[PENDING]` entirely
- STATUS.md `drafts:` array tracks pending amendment IDs (enables session-start surfacing without parsing all blueprint files)
- Amendment IDs are property-based slugs derived from the amendment: `{section}/{property}` → `sidebar-width`, `header-layout`
- Same-property amendments update in place — one entry per property, always the latest decision

### Commit gate (extended "Ready?" gate)
- The existing "Ready? / Let's build / Discuss more / Just save" gate is extended to show a pending diff before the build option
- Diff is grouped by target file (Layout, Design, Interactions) using design language, not raw amendment syntax
- "Let's build" commits ALL pending amendments then starts the build — all or nothing
- "Just save decisions" leaves amendments as `[PENDING]` — no build triggered
- No selective commit — to hold an amendment back, use "Discuss more" to remove it first

### Session-start surfacing
- Pending amendment count integrated into the existing returning-prototype context summary (2-3 lines: name, sections, pending count, last discussed)
- New action choice: "Review pending amendments" alongside "Continue building / Discuss changes / Start fresh"
- "Review pending amendments" shows the full diff (same format as commit gate) and offers: Commit all / Discard all / Keep pending and continue
- Soft warning (once per session) when user triggers a build with pending amendments: "N pending amendments won't be included. Commit and build / Build without pending"

### One-way lock semantics
- Committed amendments cannot revert to pending (one-way status transition)
- Values CAN evolve: user creates a new `[PENDING]` amendment for the same property, referencing the committed value as the "old" value. On commit, replaces the old committed line
- This preserves iterative design flow — the lock is on status, not on values

### Discard behavior
- All-or-nothing discard — no per-amendment surgical removal at the review screen
- "Discard all" deletes `[PENDING]` lines from blueprint files and clears STATUS.md `drafts:` array
- Committed lines are preserved through discard
- To remove a single amendment: discuss it away (conversational), don't use discard UI

### Expiry
- No expiry — pending amendments persist indefinitely until committed or discarded
- Watson surfaces them every session start until resolved

### Claude's Discretion
- Exact wording of the soft warning at build time
- How the diff-to-design-language translation works internally
- Whether the `## Discuss Amendments` section header needs updating for the marker format
- STATUS.md body markdown format for the pending amendments summary

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `discuss.md` "Ready?" gate (line ~424): Already has "Let's build / Discuss more / Just save" — extend with diff display
- `discuss.md` amendment write logic (line ~334-369): Currently writes bare amendments — add `[PENDING]` marker prefix
- `STATUS-EXAMPLE.md`: Already has `drafts: []` stub in YAML frontmatter — populate with amendment IDs
- `discuss.md` mid-build amendment flow (line ~475-483): "Rebuild now / Save for later" — integrate with pending model

### Established Patterns
- Amendment format: `- [property]: [old value] -> [new value] (reason)` — add `[PENDING]` / `[COMMITTED]` prefix
- Blueprint dedup contract: CONTEXT.md is source of truth for decisions, agents honor the lock — pending/committed adds a second layer
- AskUserQuestion for gates with 2-4 options — reuse for review screen and soft warning

### Integration Points
- `discuss.md`: Amendment write logic, Ready gate, mid-build flow, return status
- `SKILL.md`: Returning-prototype flow (STATUS.md parsing, context summary, action choices)
- Builder agent: Must read `[COMMITTED]` only, skip `[PENDING]` — new filtering logic
- STATUS.md schema: `drafts:` array populated with amendment slugs
- `watson-init.md`: No changes needed — STATUS.md already has drafts stub

</code_context>

<specifics>
## Specific Ideas

- The diff at the commit gate should feel like a design review, not a code diff — "Sidebar narrows to 280px" not "sidebar/width: not specified -> 280px"
- One-way lock is about trust: once you've said "yes, lock this in," Watson won't let it slip back to uncertain. But you can always evolve forward with new amendments.
- The soft build warning fires once per session to avoid nagging — designer acknowledged it, Watson respects that

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-draft-commit-amendment-model*
*Context gathered: 2026-04-02*
