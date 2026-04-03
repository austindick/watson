# Phase 10: 3-Agent Parallel Dispatch - Research

**Researched:** 2026-04-02
**Domain:** Watson pipeline orchestration — parallel agent dispatch in loupe.md + interaction agent refactor
**Confidence:** HIGH

## Summary

Phase 10 is a surgical two-file change: `skills/loupe.md` and `agents/interaction.md`. The goal is to move interaction agent dispatch from a sequential block (after layout + design complete) into the same parallel dispatch block as layout and design, making all three agents run simultaneously per Figma section.

The key enabler is removing the interaction agent's dependency on LAYOUT.md and DESIGN.md for component identification. Currently the agent reads those files to build the Tier 1 component list — which requires them to exist first, creating the sequential dependency. In Phase 10, the interaction agent fetches the Figma node directly via MCP (`nodeId` is already in its parameter contract) to identify DS components. This eliminates the layout/design prerequisite entirely.

The wait gate in loupe.md Phase 2 then expands from "all layout + design agents done" to "all three agent types done" before proceeding to Phase 3. All other pipeline mechanics (graceful null fallback, discuss-only skip, builder accepting null interactionPath) are unchanged and require no modification.

**Primary recommendation:** Implement in this order — (1) refactor `agents/interaction.md` to use direct Figma fetch instead of LAYOUT.md/DESIGN.md, (2) move interaction dispatch into the parallel block in `loupe.md`, (3) update the wait gate and progress messaging in `loupe.md`. This ensures the agent contract changes are proven before wiring up the dispatch change.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Component detection strategy**
- Interaction agent fetches the Figma node directly via MCP (using existing `nodeId` parameter) to identify DS components, instead of reading LAYOUT.md + DESIGN.md
- This removes the sequential dependency on layout + design agent output
- `layoutPath` and `designPath` parameters are removed from the interaction agent's dispatch signature in parallel mode
- Slight duplication of Figma fetch across agents is acceptable — cleanest parallel approach with no decomposer changes or new inter-agent contracts

**Dispatch mechanics**
- All three agents (layout, design, interaction) dispatched as background agents in the same step per Figma section — same pattern as current layout + design parallel dispatch, extended to include interaction
- Wait gate checks all three outputs across all sections before proceeding to Phase 3 (build + review)
- `crossSectionFlows` passed to interaction agent at dispatch time (already available from discuss return status)
- `interactionContext` per section passed from discuss sections[] array (same as Phase 9 sequential path)

**Progress messaging**
- Consolidated to a single progress message per section: "Mapping out the [section name]..." covers all three research agents running in parallel
- The separate "Detailing interaction states for the [section name]..." message is removed since interaction now runs simultaneously with layout + design
- All other progress messages unchanged (decomposer, builder, reviewer, complete)

**Graceful degradation (PARA-03)**
- Silent fallback — current pattern preserved: retry once, then set `interactionPath: null`
- No user-facing message on interaction failure — builder already handles null interactionPath gracefully
- Interaction failure is isolated — does not block layout or design agent output, does not block other sections

**Discuss-only skip (PARA-04)**
- Same skip rule as current: discuss-only sections skip all three research agents (layout, design, interaction) identically
- No change in skip logic — `referenceType = "discuss-only"` skips entire Phase 2

### Claude's Discretion

- How the interaction agent implements direct Figma fetch for component identification (internal parsing logic)
- Whether to keep `layoutPath`/`designPath` as optional params on the interaction agent for potential future use, or remove entirely
- Exact wait gate implementation (polling, promise-style, sequential checks)
- Whether the Phase 2 progress update text needs a minor wording tweak to better reflect 3-agent scope

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PARA-01 | loupe.md dispatches layout, design, and interaction agents simultaneously per Figma section | Move interaction dispatch into the existing parallel block; remove sequential post-wait-gate dispatch block |
| PARA-02 | loupe.md wait gate requires all three agent outputs before proceeding to builder | Extend existing "wait for all layout + design agents" check to include INTERACTION.md existence per section |
| PARA-03 | Interaction agent failure or empty output does not block the pipeline — falls back to interactionPath: null | Existing retry-once + null fallback contract already in loupe.md; check moves into the unified wait gate |
| PARA-04 | Discuss-only sections skip the interaction agent (same skip rule as layout and design) | `referenceType = "figma"` guard already wraps layout + design; interaction dispatch enters the same guard |
</phase_requirements>

---

## Standard Stack

This phase is pure markdown orchestration within the Watson skill system. No new libraries, packages, or files are introduced.

### Files Modified

| File | Current State | Required Change |
|------|--------------|-----------------|
| `skills/loupe.md` | Phase 2 has two blocks: (1) parallel layout+design dispatch, (2) sequential interaction dispatch after wait gate | Merge interaction into block (1); remove block (2); extend wait gate to check INTERACTION.md; remove "Detailing interaction states..." progress row |
| `agents/interaction.md` | Reads LAYOUT.md + DESIGN.md for component detection; has `layoutPath` and `designPath` as inputs | Replace Step 1 (read spec files) with direct Figma MCP fetch using `nodeId`; remove/deprecate `layoutPath`/`designPath` from inputs |

### Files Unchanged

| File | Why Unchanged |
|------|--------------|
| `agents/layout.md` | No changes — dispatch contract and behavior unchanged |
| `agents/design.md` | No changes — dispatch contract and behavior unchanged |
| `agents/builder.md` | Already accepts null interactionPath; no change needed |
| `agents/consolidator.md` | Consolidates INTERACTION.md already (Phase 9 added this); no change |
| `skills/discuss.md` | Return status schema unchanged; interactionContext already emitted per Phase 9 |
| `references/agent-contract.md` | May need a footnote update to reflect interaction agent's parallel dispatch mode and removal of layoutPath/designPath; optional cleanup |

---

## Architecture Patterns

### Current Phase 2 Structure (Phase 9 state)

```
For each figma section:
  1. Dispatch layout agent (background)          ─┐
  2. Dispatch design agent (background)           ─┤ parallel block
                                                  ─┘
Wait for ALL layout + design agents (all sections).

For each figma section (sequential):             ─┐
  3. "Detailing interaction states..."            │
  4. Dispatch interaction agent (background)      │ sequential block
  5. Wait for completion                          │ (POST-WAIT GATE)
  6. Resolve interactionPath (or null)            │
                                                  ─┘

Proceed to Phase 3.
```

### Target Phase 2 Structure (Phase 10)

```
For each figma section:
  1. "Mapping out the [section name]..."
  2. Dispatch layout agent (background)          ─┐
  3. Dispatch design agent (background)           ─┤ parallel block
  4. Dispatch interaction agent (background)      ─┘ (NEW: added here)

Wait for ALL three agent types across ALL sections:
  - Check LAYOUT.md exists per figma section
  - Check DESIGN.md exists per figma section
  - Check INTERACTION.md exists per figma section (or interactionPath = null)

Proceed to Phase 3.
```

### Interaction Agent — Component Detection Refactor

**Current (Phase 9):** Agent reads LAYOUT.md and DESIGN.md, extracts component names from the component tree and component mapping table, normalizes to kebab-case, looks up CHAPTER.md.

**Phase 10:** Agent fetches the Figma node via MCP using `nodeId`, inspects the node structure to identify DS component names, normalizes to kebab-case, looks up CHAPTER.md. Same normalization table applies; same CHAPTER.md lookup logic applies.

The Figma node fetch is the same MCP call that layout and design agents already perform. Slight duplication is intentional (accepted tradeoff per locked decisions).

### Wait Gate Extension

The current wait gate in loupe.md reads:

> "Wait for every layout and design agent across all sections to complete before proceeding to Phase 3."

Phase 10 extends this to three outputs. The check pattern for each figma section becomes:

```
After dispatching all agents:
  For each figma section:
    - LAYOUT.md present?   → Yes: layoutPath resolved. No: layoutPath = null (Phase 3 handles)
    - DESIGN.md present?   → Yes: designPath resolved. No: designPath = null (Phase 3 handles)
    - INTERACTION.md present? → Yes: interactionPath resolved.
                               No: retry interaction agent once (silent).
                               Still no: interactionPath = null. Continue.
```

The null fallback check for INTERACTION.md (retry-once pattern) is what currently exists in the sequential interaction block — it migrates into the wait gate.

### Interaction Agent Dispatch Params (Phase 10)

```
Dispatch @agents/interaction.md as **background** agent:
  nodeId: {section.nodeId}
  sectionName: {section.name}
  interactionContext: {section.interactionContext}   # from discuss sections[].interactionContext; null = fallback mode
  crossSectionFlows: {crossSectionFlows}             # top-level from discuss return status
  blueprintPath: {blueprintPath}
  libraryPaths: {libraryPaths}
  watsonMode: true
  # layoutPath and designPath: REMOVED (no longer needed)
```

### Progress Messaging Update

The Designer-Language Progress Reference table in loupe.md currently has two Phase 2 rows:

| Pipeline Stage | User-Facing Message |
|----------------|---------------------|
| Layout + design agents running | "Mapping out the [section name]..." |
| Interaction agent running | "Detailing interaction states for the [section name]..." |

Phase 10 collapses to one row:

| Pipeline Stage | User-Facing Message |
|----------------|---------------------|
| Layout + design + interaction agents running | "Mapping out the [section name]..." |

The "Detailing interaction states..." row is removed from the table and from the Phase 2 dispatch instructions.

### Anti-Patterns to Avoid

- **Keeping the sequential interaction dispatch block and also adding interaction to the parallel block:** Results in double dispatch. Remove the sequential block entirely.
- **Retaining `layoutPath`/`designPath` as required params in interaction agent:** These are no longer provided at dispatch time in the parallel path. Make them optional or remove. If kept as optional, agent must not error when absent.
- **Moving only the dispatch but not the wait gate check:** The retry-once + null fallback logic for interaction currently lives in the sequential block. It must migrate to the wait gate section; otherwise INTERACTION.md failures are never caught.
- **Updating the progress message in the dispatch loop but leaving the stale row in the Designer-Language Progress Reference table:** Creates an inconsistency that could confuse future planners. Remove the row from both places.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Parallel agent orchestration | Custom wait loop logic | Existing background agent dispatch pattern (same as layout + design) | Pattern is proven and Claude's background agent dispatch already handles parallel execution |
| Component detection from Figma | New MCP adapter or custom parser | Direct Figma MCP fetch using `nodeId` (same as layout + design agents already do) | Figma MCP is already the established data source; nodeId is already in the interaction agent's parameter contract |
| Null fallback signaling | New error type or status field | `interactionPath: null` (already handled by builder) | Builder already has null-path handling from Phase 9; no contract change needed |

---

## Common Pitfalls

### Pitfall 1: Double Dispatch of Interaction Agent

**What goes wrong:** The old sequential interaction dispatch block is not removed when the parallel dispatch is added — interaction agent fires twice per section.
**Why it happens:** The parallel addition is inserted at lines 96-111 of loupe.md, but the sequential block at lines 114-148 is not deleted.
**How to avoid:** The PLAN must explicitly mark lines 114-148 of the current loupe.md as deleted, not supplemented.
**Warning signs:** Two INTERACTION.md files written in sequence; second overwrites first; timing anomaly in pipeline execution.

### Pitfall 2: Retry Logic Left Stranded in the Deleted Block

**What goes wrong:** The retry-once + null fallback logic for interaction currently lives inside the sequential dispatch block (lines 142-145 of loupe.md). If that block is deleted without migrating the retry logic, INTERACTION.md failures are silently ignored and interactionPath is never set.
**Why it happens:** The deletion removes the retry/fallback logic along with the sequential dispatch.
**How to avoid:** The retry logic must migrate to the wait gate section. Explicitly document in the plan: "move retry-once + null fallback for INTERACTION.md into the unified wait gate check."
**Warning signs:** Pipeline proceeds to Phase 3 with no interactionPath field set at all (not null, just absent).

### Pitfall 3: `layoutPath`/`designPath` Still Required in Interaction Agent

**What goes wrong:** Interaction agent still reads `layoutPath` and `designPath` in its constraint list or Step 1 execution — but these are no longer provided in parallel dispatch, causing agent failure.
**Why it happens:** Phase 9 agent reads layoutPath as a required input. Phase 10 removes it from dispatch but the agent body still expects it.
**How to avoid:** The plan must include removing `layoutPath` and `designPath` from the interaction agent's required inputs section AND replacing Step 1 (read spec files) with direct Figma fetch.
**Warning signs:** Interaction agent errors with "layoutPath not provided" or similar on every section.

### Pitfall 4: agent-contract.md Not Updated

**What goes wrong:** agent-contract.md still lists `layoutPath` and `designPath` as interaction agent params after they are removed.
**Why it happens:** The contract spec is a mirrored reference — agent frontmatter and contract must be kept in sync per the contract spec's own stated rule.
**How to avoid:** Update agent-contract.md interaction row to reflect removed params; note that interaction is now dispatched as background (parallel with layout + design) in the Dispatch Mode Notes section.
**Warning signs:** Future agents or planners pass stale params to interaction agent; contract diverges from implementation.

### Pitfall 5: Interaction Agent Constraint #4 Conflicts with Figma Fetch

**What goes wrong:** `agents/interaction.md` currently has Constraint #4: "No Figma calls — work entirely from LAYOUT.md, DESIGN.md, and library PAGE.md files." Phase 10 explicitly requires the opposite — a Figma MCP fetch. This constraint must be updated.
**Why it happens:** The constraint was correct for Phase 9 (no Figma fetch needed). Phase 10 changes the architecture.
**How to avoid:** Plan must include removing Constraint #4 from the interaction agent's Critical Constraints section and replacing it with the permitted Figma MCP fetch pattern.
**Warning signs:** Agent silently refuses to make Figma calls; Tier 1 component list is empty.

---

## Code Examples

### Current loupe.md Phase 2 — Sequential Interaction Block (to be replaced)

Current lines 114-148 in `skills/loupe.md`:

```
**Interaction agent dispatch (sequential per figma section):**

After ALL layout + design agents have completed, dispatch the interaction agent for each figma section sequentially:

For each section where `referenceType = "figma"`:

1. Resolve paths for the interaction agent:
   - layoutPath = `.watson/sections/{section.name}/LAYOUT.md`
   - designPath = `.watson/sections/{section.name}/DESIGN.md`
   - sectionInteractionContext = sections[i].interactionContext

2. Progress update: "Detailing interaction states for the [section.name]..."

3. Dispatch `@agents/interaction.md` as **background** agent:
   nodeId: {section.nodeId}
   sectionName: {section.name}
   interactionContext: {sectionInteractionContext}
   crossSectionFlows: {crossSectionFlows}
   blueprintPath: {blueprintPath}
   libraryPaths: {libraryPaths}
   watsonMode: true
   layoutPath: {layoutPath}
   designPath: {designPath}

4. Wait for completion.

5. Check `.watson/sections/{section.name}/INTERACTION.md` exists:
   - If yes: store interactionPath for this section
   - If no: retry once silently. On second failure: set interactionPath to null
```

This entire block is deleted in Phase 10. Interaction dispatch moves into the parallel block above.

### Target loupe.md Phase 2 — Parallel Block (after change)

```
For each section where `referenceType = "figma"`:

1. Progress update: "Mapping out the [section.name]..."
2. Dispatch `@agents/layout.md` as **background** agent:
   nodeId: {section.nodeId}
   sectionName: {section.name}
   blueprintPath: {blueprintPath}
   libraryPaths: {libraryPaths}
   watsonMode: true
3. Dispatch `@agents/design.md` as **background** agent in parallel:
   nodeId: {section.nodeId}
   sectionName: {section.name}
   blueprintPath: {blueprintPath}
   libraryPaths: {libraryPaths}
   watsonMode: true
4. Dispatch `@agents/interaction.md` as **background** agent in parallel:
   nodeId: {section.nodeId}
   sectionName: {section.name}
   interactionContext: {sections[i].interactionContext}
   crossSectionFlows: {crossSectionFlows}
   blueprintPath: {blueprintPath}
   libraryPaths: {libraryPaths}
   watsonMode: true

**After ALL sections have been dispatched:** Wait for every layout, design, and interaction agent across all sections to complete before proceeding to Phase 3. Verify each expected output file:
- LAYOUT.md missing → layoutPath: null (existing fallback rule)
- DESIGN.md missing → designPath: null (existing fallback rule)
- INTERACTION.md missing → retry interaction agent once silently. On second failure: interactionPath: null
```

### Current interaction.md Constraint #4 (to be replaced)

```
4. No Figma calls — work entirely from LAYOUT.md, DESIGN.md, and library PAGE.md files
```

Replacement:

```
4. Component detection uses direct Figma MCP fetch via `nodeId` — read the Figma node to identify DS components present in the section. Do NOT read layoutPath or designPath (these are not provided in parallel dispatch mode).
```

### Current interaction.md Step 1 (to be replaced)

```
### Step 1: Read spec files and extract component names

Read `layoutPath` (LAYOUT.md) and `designPath` (DESIGN.md) for this section.
[component extraction from LAYOUT.md component tree + DESIGN.md component mapping table]
```

Replacement:

```
### Step 1: Fetch Figma node and extract component names

Fetch the Figma node using `nodeId` via MCP. From the node structure, identify DS components present in the section by inspecting layer names and component types. Extract component names, normalize to kebab-case using the same normalization table as before. Proceed to Step 2 for CHAPTER.md lookup.
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Interaction agent reads LAYOUT.md + DESIGN.md | Interaction agent fetches Figma node directly | Phase 10 | Removes sequential dependency on layout + design completion |
| Sequential interaction dispatch (after layout + design wait gate) | Parallel 3-agent dispatch per section | Phase 10 | All three agents run simultaneously; no total time increase |
| Two Phase 2 progress messages per section ("Mapping..." + "Detailing...") | One progress message per section ("Mapping...") | Phase 10 | Cleaner UX; all three agents are invisible to user timing |
| Wait gate checks 2 agent types | Wait gate checks 3 agent types | Phase 10 | PARA-02: gate now requires all three outputs |

**Deprecated/outdated after Phase 10:**
- `layoutPath` and `designPath` params on interaction agent: removed from dispatch (may be kept as optional for future use — Claude's discretion)
- Interaction agent Constraint #4 ("No Figma calls"): inverted — Figma MCP fetch is now required
- "Detailing interaction states for the [section name]..." progress message row: removed from Designer-Language Progress Reference table

---

## Open Questions

1. **Whether to keep `layoutPath`/`designPath` as optional params on interaction agent**
   - What we know: These are no longer passed in parallel dispatch; the agent must not require them
   - What's unclear: Future maintenance value of keeping them as optional vs. clean removal
   - Recommendation: Claude's discretion per CONTEXT.md. Simplest approach: remove from inputs section entirely; they can be re-added in a future phase if needed. Removing avoids confusion where someone passes them expecting the agent to use them.

2. **Figma node MCP call specifics for component detection**
   - What we know: `nodeId` is already in the interaction agent's parameter contract; layout and design agents already use it for Figma MCP calls
   - What's unclear: Exact Figma MCP call structure and which node properties to inspect to identify DS component names
   - Recommendation: Follow the same Figma MCP fetch pattern as `agents/layout.md` and `agents/design.md`. The planner should read those agents' Figma fetch steps and replicate the pattern in the interaction agent's new Step 1.

3. **agent-contract.md dispatch mode note for interaction agent**
   - What we know: The contract currently says interaction is "foreground*" with a footnote explaining the background-when-watsonMode condition
   - What's unclear: Whether the footnote needs updating to reflect that interaction now runs in parallel with layout + design (purely a documentation question)
   - Recommendation: Update the footnote to add: "In Phase 10+ parallel dispatch, interaction always runs as background (watsonMode=true is always set in loupe.md dispatch)." This is documentation cleanup, not a behavior change.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — Watson is a markdown-only skill system |
| Config file | None |
| Quick run command | Manual: read modified loupe.md Phase 2 block, verify interaction dispatch is in parallel block and sequential block is removed |
| Full suite command | End-to-end: run full loupe pipeline on a test figma section, confirm LAYOUT.md + DESIGN.md + INTERACTION.md all present before Phase 3 begins |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PARA-01 | loupe.md dispatches all three agents in the same parallel block per section | manual | Read loupe.md Phase 2 — verify interaction dispatch appears inside the parallel-per-section loop, not after the wait gate | N/A |
| PARA-02 | Wait gate checks INTERACTION.md existence alongside LAYOUT.md and DESIGN.md | manual | Read loupe.md wait gate block — verify all three file checks present | N/A |
| PARA-03 | Interaction agent null fallback does not block pipeline | manual | Run pipeline with a nodeId that causes interaction agent to fail — confirm other sections proceed, interactionPath: null in builder dispatch | N/A |
| PARA-04 | discuss-only sections do not dispatch interaction agent | manual | Confirm `referenceType = "figma"` guard wraps all three agent dispatches; discuss-only sections skip Phase 2 entirely | N/A |

### Sampling Rate

- **Per task commit:** Read the modified file to confirm no orphaned sequential block remains and constraint #4 is updated
- **Per wave merge:** Full loupe pipeline test — dispatch on a multi-section build and verify all three agent outputs are present before Phase 3
- **Phase gate:** All four PARA requirements satisfied before `/gsd:verify-work`

### Wave 0 Gaps

None — existing test infrastructure (manual review) covers all phase requirements. No test scaffolding needed.

---

## Sources

### Primary (HIGH confidence)

- `/Users/austindick/.claude/skills/watson/skills/loupe.md` — current Phase 2 structure, dispatch patterns, wait gate, progress reference table, error handling contract
- `/Users/austindick/.claude/skills/watson/agents/interaction.md` — current inputs, constraints (Constraint #4), and Step 1 execution (the two sections that change)
- `/Users/austindick/.claude/skills/watson/references/agent-contract.md` — canonical dispatch modes, shared params, interaction agent footnote
- `/Users/austindick/watson/.planning/phases/10-3-agent-parallel-dispatch/10-CONTEXT.md` — all locked decisions and Claude's discretion areas
- `/Users/austindick/watson/.planning/REQUIREMENTS.md` — PARA-01 through PARA-04 definitions

### Secondary (MEDIUM confidence)

- `/Users/austindick/watson/.planning/phases/09-agent-3-interactions/09-RESEARCH.md` — Phase 9 interaction agent architecture, confirms sequential dispatch was the interim pattern and Phase 10 was always the planned parallel upgrade

### Tertiary (LOW confidence)

None — all findings grounded in existing project files.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — only two files change; both read directly; exact line ranges identified
- Architecture patterns: HIGH — Phase 9 established the patterns; Phase 10 is a mechanical extension
- Pitfalls: HIGH — derived from direct inspection of the files being changed; concrete line-level risks identified

**Research date:** 2026-04-02
**Valid until:** Stable — no external dependencies; internal markdown files only. Valid until loupe.md or interaction.md changes.
